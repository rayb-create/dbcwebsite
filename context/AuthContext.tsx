import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { auth, OWNER_EMAIL } from '../lib/firebase';
import { checkIsAdmin, registerAdminInDb, getAdminCount } from '../services/db';

interface AuthContextType {
  currentUser: User | null;
  isAdmin: boolean;
  loading: boolean;
  adminCount: number;
  signIn: (email: string, pass: string) => Promise<void>;
  createAdminAccount: (email: string, pass: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [adminCount, setAdminCount] = useState<number>(0);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Ensure persistent login across browser sessions / page refreshes
    setPersistence(auth, browserLocalPersistence).catch((err) => {
      console.warn('Could not set auth persistence:', err);
    });

    // Check count of existing admins to determine if bootstrap setup is available
    getAdminCount().then((count) => setAdminCount(count)).catch(() => {});

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setCurrentUser(user);
        try {
          const authorized = await checkIsAdmin(user.uid, user.email);
          setIsAdmin(authorized);
        } catch {
          setIsAdmin(user.email?.toLowerCase() === OWNER_EMAIL.toLowerCase());
        }
      } else {
        setCurrentUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signIn = async (email: string, pass: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const user = userCredential.user;
      const authorized = await checkIsAdmin(user.uid, user.email);
      
      if (!authorized && user.email?.toLowerCase() !== OWNER_EMAIL.toLowerCase()) {
        await signOut(auth);
        throw new Error("Accès refusé : Ce compte n'a pas les privilèges d'administrateur.");
      }
      setIsAdmin(true);
    } catch (err: any) {
      console.error('Sign in error:', err);
      let message = 'Échec de connexion. Vérifiez vos identifiants.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        message = 'Email ou mot de passe incorrect.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Trop de tentatives infructueuses. Veuillez patienter avant de réessayer.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const createAdminAccount = async (email: string, pass: string, name?: string) => {
    setAuthError(null);
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const user = cred.user;
      
      await registerAdminInDb({
        uid: user.uid,
        email: user.email || email.trim(),
        displayName: name || 'Gérant DBC Workshop',
        role: 'admin',
        createdAt: new Date().toISOString()
      });

      setIsAdmin(true);
      setAdminCount((prev) => prev + 1);
    } catch (err: any) {
      console.error('Registration error:', err);
      let message = 'Impossible de créer le compte administrateur.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'Cette adresse email est déjà enregistrée. Veuillez vous connecter.';
      } else if (err.code === 'auth/weak-password') {
        message = 'Le mot de passe doit contenir au moins 6 caractères.';
      } else if (err.message) {
        message = err.message;
      }
      setAuthError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setAuthError(null);
    await signOut(auth);
    setCurrentUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAdmin,
        loading,
        adminCount,
        signIn,
        createAdminAccount,
        logout,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
