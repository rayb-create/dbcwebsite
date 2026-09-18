import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocFromServer,
  writeBatch
} from 'firebase/firestore';
import { db, auth, OWNER_EMAIL } from '../lib/firebase';
import { Product, StoreSettings, Order, MediaAsset, AdminUser } from '../types';
import { PRODUCTS } from '../data/products';
import { DEFAULT_STORE_SETTINGS } from '../data/storeSettings';
import { INITIAL_ORDERS } from '../data/orders';
import { compressBase64Image } from '../utils/imageCompressor';

// ============================================================================
// FIRESTORE ERROR HANDLING (STANDARDIZED ABAC DIAGNOSTICS)
// ============================================================================

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection health-check on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    } else {
      console.info('[Firestore] Working with persistent local store (network sync standby).');
    }
  }
}

testConnection();

// ============================================================================
// PRODUCTS FIRESTORE SYNCHRONIZATION
// ============================================================================

export function subscribeProducts(
  onUpdate: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const productsRef = collection(db, 'products');
  
  return onSnapshot(
    productsRef,
    (snapshot) => {
      if (snapshot.empty) {
        // Clean start: return empty products list when database is empty
        onUpdate([]);
        return;
      }

      const productsList: Product[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Product;
        productsList.push({
          ...data,
          id: d.id,
          inStock: data.inStock ?? true,
          stock: data.stock ?? 0,
          isPublished: data.isPublished ?? true,
        });
      });

      onUpdate(productsList);
    },
    (error) => {
      console.warn('[Firestore] Products subscription notice:', error);
      onUpdate([]);
      if (onError) onError(error);
    }
  );
}

export async function seedDefaultProducts(): Promise<void> {
  if (!auth.currentUser) {
    throw new Error('Vous devez être connecté en tant qu’administrateur pour initialiser le catalogue.');
  }
  const isAuthorized = await checkIsAdmin(auth.currentUser.uid, auth.currentUser.email);
  if (!isAuthorized) {
    throw new Error('Privilèges administrateur requis.');
  }

  try {
    const batch = writeBatch(db);
    for (const prod of PRODUCTS) {
      const docRef = doc(db, 'products', prod.id);
      const enriched: Product = {
        ...prod,
        inStock: prod.inStock ?? true,
        stock: prod.stock ?? 50,
        isPublished: prod.isPublished ?? true,
        updatedAt: new Date().toISOString(),
      };
      batch.set(docRef, enriched);
    }
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'products');
  }
}

/**
 * Recursively strips undefined keys and properties from Firestore payloads.
 * Firebase JS SDK strictly throws errors if any field is undefined.
 */
export function sanitizeFirestorePayload<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeFirestorePayload(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        sanitized[key] = sanitizeFirestorePayload(value);
      }
    }
    return sanitized as T;
  }
  return data;
}

export async function saveProductToDb(product: Product): Promise<void> {
  // 1. Optimize and compress any base64 images in product.images
  // This ensures the document remains well below Firestore's 1MB limit
  const optimizedImages: string[] = [];
  if (Array.isArray(product.images) && product.images.length > 0) {
    for (const img of product.images) {
      if (typeof img === 'string' && img.startsWith('data:image/')) {
        try {
          const compressed = await compressBase64Image(img, 1200, 0.78, 160 * 1024);
          optimizedImages.push(compressed);
        } catch (err) {
          console.warn('[Firestore] Notice: Image compression skipped, using original:', err);
          optimizedImages.push(img);
        }
      } else if (typeof img === 'string' && img.trim().length > 0) {
        optimizedImages.push(img.trim());
      }
    }
  }

  const rawCleanProduct = {
    ...product,
    images: optimizedImages.length > 0 ? optimizedImages : (product.images || []),
    inStock: product.inStock !== false,
    stock: typeof product.stock === 'number' ? Math.max(0, product.stock) : 50,
    isPublished: product.isPublished !== false,
    updatedAt: new Date().toISOString()
  };

  const cleanProduct = sanitizeFirestorePayload(rawCleanProduct);
  const path = `products/${product.id}`;
  try {
    const docRef = doc(db, 'products', product.id);
    await setDoc(docRef, cleanProduct, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFromDb(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    const docRef = doc(db, 'products', productId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// STORE SETTINGS & WEBSITE CONTENT FIRESTORE SYNCHRONIZATION
// ============================================================================

export function subscribeStoreSettings(
  onUpdate: (settings: StoreSettings) => void,
  onError?: (err: Error) => void
) {
  const settingsDocRef = doc(db, 'settings', 'general');

  return onSnapshot(
    settingsDocRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        onUpdate(DEFAULT_STORE_SETTINGS);

        // Only authenticated managers may persist default settings into Firestore
        if (auth.currentUser) {
          try {
            const isAuthorized = await checkIsAdmin(auth.currentUser.uid, auth.currentUser.email);
            if (isAuthorized) {
              await setDoc(settingsDocRef, DEFAULT_STORE_SETTINGS);
              console.log('[Firestore] Settings doc initialized by manager.');
            }
          } catch (err) {
            console.warn('[Firestore] Settings init skipped:', err);
          }
        }
        return;
      }

      const data = snapshot.data() as StoreSettings;
      onUpdate({ ...DEFAULT_STORE_SETTINGS, ...data });
    },
    (error) => {
      console.warn('[Firestore] Settings subscription fallback to defaults:', error);
      onUpdate(DEFAULT_STORE_SETTINGS);
      if (onError) onError(error);
    }
  );
}

export async function saveStoreSettingsToDb(settings: StoreSettings): Promise<void> {
  const path = 'settings/general';
  try {
    const payload: StoreSettings = { ...settings };

    // Compress heroImage if it is a base64 data URL to prevent exceeding Firestore's 1MB document limit
    if (payload.heroImage && payload.heroImage.startsWith('data:image/')) {
      try {
        payload.heroImage = await compressBase64Image(payload.heroImage, 1400, 0.82, 350 * 1024);
      } catch (err) {
        console.warn('[Firestore] Notice: heroImage compression failed, using fallback:', err);
      }
    }

    // Sanitize heroImages array so it doesn't duplicate large payloads
    if (payload.heroImages && payload.heroImages.length > 0) {
      payload.heroImages = payload.heroImage ? [payload.heroImage] : [];
    }

    const sanitizedPayload = sanitizeFirestorePayload(payload);
    const docRef = doc(db, 'settings', 'general');
    await setDoc(docRef, sanitizedPayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ============================================================================
// ORDERS & CUSTOMER INQUIRIES (PROTECTED)
// ============================================================================

export function subscribeOrders(
  onUpdate: (orders: Order[]) => void,
  onError?: (err: Error) => void
) {
  // Only authenticated admins are allowed to listen to /orders
  if (!auth.currentUser) {
    onUpdate([]);
    return () => {};
  }

  const ordersRef = collection(db, 'orders');

  return onSnapshot(
    ordersRef,
    (snapshot) => {
      if (snapshot.empty) {
        onUpdate([]);
        return;
      }

      const ordersList: Order[] = [];
      snapshot.forEach((d) => {
        ordersList.push(d.data() as Order);
      });

      // Sort newest first
      ordersList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onUpdate(ordersList);
    },
    (error) => {
      console.warn('[Firestore] Orders subscription notice:', error);
      onUpdate([]);
      if (onError) onError(error);
    }
  );
}

export async function saveOrderToDb(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const docRef = doc(db, 'orders', order.id);
    const sanitizedOrder = sanitizeFirestorePayload(order);
    await setDoc(docRef, sanitizedOrder, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteOrderFromDb(orderId: string): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const docRef = doc(db, 'orders', orderId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// MEDIA ASSETS LIBRARY (PERSISTENT CLOUD STORAGE)
// ============================================================================

export function subscribeMedia(
  onUpdate: (media: MediaAsset[]) => void,
  onError?: (err: Error) => void
) {
  const mediaRef = collection(db, 'media');

  return onSnapshot(
    mediaRef,
    (snapshot) => {
      const mediaList: MediaAsset[] = [];
      snapshot.forEach((d) => {
        mediaList.push(d.data() as MediaAsset);
      });
      mediaList.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
      onUpdate(mediaList);
    },
    (error) => {
      console.warn('[Firestore] Media subscription notice:', error);
      onUpdate([]);
      if (onError) onError(error);
    }
  );
}

export async function saveMediaToDb(asset: MediaAsset): Promise<void> {
  const path = `media/${asset.id}`;
  try {
    const payload: MediaAsset = { ...asset };
    if (payload.url && payload.url.startsWith('data:image/')) {
      try {
        payload.url = await compressBase64Image(payload.url, 1400, 0.82, 350 * 1024);
      } catch (err) {
        console.warn('[Firestore] Notice: media image compression failed:', err);
      }
    }
    const docRef = doc(db, 'media', asset.id);
    const sanitizedMedia = sanitizeFirestorePayload(payload);
    await setDoc(docRef, sanitizedMedia, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteMediaFromDb(mediaId: string): Promise<void> {
  const path = `media/${mediaId}`;
  try {
    const docRef = doc(db, 'media', mediaId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// ADMINISTRATORS MANAGEMENT & AUTHORIZATION
// ============================================================================

export async function checkIsAdmin(uid: string, email?: string | null): Promise<boolean> {
  if (!uid) return false;
  if (email && email.toLowerCase() === OWNER_EMAIL.toLowerCase()) return true;

  try {
    const adminDocRef = doc(db, 'admins', uid);
    const snap = await getDoc(adminDocRef);
    if (snap.exists()) {
      const role = snap.data()?.role;
      return role === 'admin' || role === 'owner';
    }
    return false;
  } catch (err) {
    console.warn('[Auth] Error checking admin permissions:', err);
    return false;
  }
}

export async function registerAdminInDb(admin: AdminUser): Promise<void> {
  const path = `admins/${admin.uid}`;
  try {
    const docRef = doc(db, 'admins', admin.uid);
    const sanitizedAdmin = sanitizeFirestorePayload(admin);
    await setDoc(docRef, sanitizedAdmin, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function getAdminCount(): Promise<number> {
  try {
    const snap = await getDocs(collection(db, 'admins'));
    return snap.size;
  } catch {
    return 0;
  }
}

// ============================================================================
// PURGE ALL DEMO / FAKE DATA FROM FIRESTORE
// ============================================================================

export async function purgeAllDemoDataFromFirestore(): Promise<{ deletedProducts: number; deletedOrders: number; deletedMedia: number }> {
  if (!auth.currentUser) {
    throw new Error('Vous devez être connecté en tant qu’administrateur pour vider les données.');
  }

  const isAuthorized = await checkIsAdmin(auth.currentUser.uid, auth.currentUser.email);
  if (!isAuthorized) {
    throw new Error('Action non autorisée. Seul le gestionnaire de l’atelier peut vider les données.');
  }

  let deletedProducts = 0;
  let deletedOrders = 0;
  let deletedMedia = 0;

  // 1. Delete all documents in /products
  try {
    const productsSnap = await getDocs(collection(db, 'products'));
    if (!productsSnap.empty) {
      const batch = writeBatch(db);
      productsSnap.forEach((d) => {
        batch.delete(d.ref);
        deletedProducts++;
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('[Firestore] Error purging products:', err);
  }

  // 2. Delete all documents in /orders
  try {
    const ordersSnap = await getDocs(collection(db, 'orders'));
    if (!ordersSnap.empty) {
      const batch = writeBatch(db);
      ordersSnap.forEach((d) => {
        batch.delete(d.ref);
        deletedOrders++;
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('[Firestore] Error purging orders:', err);
  }

  // 3. Delete all documents in /media
  try {
    const mediaSnap = await getDocs(collection(db, 'media'));
    if (!mediaSnap.empty) {
      const batch = writeBatch(db);
      mediaSnap.forEach((d) => {
        batch.delete(d.ref);
        deletedMedia++;
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('[Firestore] Error purging media:', err);
  }

  return { deletedProducts, deletedOrders, deletedMedia };
}

/**
 * Initializes store settings if not already present.
 * Does NOT re-seed fake products or fake orders so that the database remains clean.
 */
export async function initializeWorkshopDatabase(): Promise<void> {
  // Respect user choice for empty database: no automatic seeding of fake products or fake orders.
  return Promise.resolve();
}

