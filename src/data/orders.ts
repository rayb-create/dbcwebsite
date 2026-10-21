import { Order } from '../types';
import { PRODUCTS } from './products';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord_dbc_001',
    orderNumber: 'DBC-DZ-89421',
    date: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    items: [
      {
        cartItemId: 'item_1',
        productId: PRODUCTS[0]?.id || 'heavy-oversized-hoodie-420',
        product: PRODUCTS[0],
        size: 'L',
        color: PRODUCTS[0]?.colors[0] || { name: 'Noir Profond', hex: '#1A1A1A' },
        quantity: 2,
        isMadeToMeasure: false,
        pricePerUnit: PRODUCTS[0]?.price || 6800,
      }
    ],
    subtotal: 13600,
    shipping: 600,
    discount: 0,
    tax: 0,
    total: 14200,
    currency: 'DZD',
    customer: {
      fullName: 'Karim Benali',
      email: 'karim.benali@gmail.com',
      phone: '0550 12 34 56',
      address: '14 Rue des Pins, Résidence Les Oliviers',
      city: 'Hydra',
      wilayaCode: '16',
      wilayaName: 'Alger',
      notes: 'Appeler avant de passer en matinée svp.'
    },
    deliveryType: 'home',
    paymentMethod: 'cod',
    status: 'Expédié / En Livraison',
    trackingNumber: 'YAL-ALG-984321',
    carrierName: 'Yalidine Express',
    estimatedDelivery: '24-48h'
  },
  {
    id: 'ord_dbc_002',
    orderNumber: 'DBC-DZ-89422',
    date: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    items: [
      {
        cartItemId: 'item_2',
        productId: PRODUCTS[1]?.id || 'heavy-oversized-hoodie-420',
        product: PRODUCTS[1] || PRODUCTS[0],
        size: 'M',
        color: PRODUCTS[1]?.colors[0] || { name: 'Noir Profond', hex: '#1A1A1A' },
        quantity: 1,
        isMadeToMeasure: false,
        pricePerUnit: (PRODUCTS[1] || PRODUCTS[0]).price,
      }
    ],
    subtotal: (PRODUCTS[1] || PRODUCTS[0]).price,
    shipping: 700,
    discount: 0,
    tax: 0,
    total: (PRODUCTS[1] || PRODUCTS[0]).price + 700,
    currency: 'DZD',
    customer: {
      fullName: 'Amine Meziane',
      email: 'amine.m@yahoo.com',
      phone: '0661 98 76 54',
      address: 'Quartier Akid Lotfi',
      city: 'Oran',
      wilayaCode: '31',
      wilayaName: 'Oran'
    },
    deliveryType: 'home',
    paymentMethod: 'baridimob',
    status: 'En Préparation / Atelier',
    trackingNumber: 'ZR-ORN-128490',
    carrierName: 'ZR Express',
    estimatedDelivery: '48h'
  }
];
