import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, AdminRole } from '../types/user';
import { Competition, PropertyDetails } from '../types/auction';
import { Wallet } from '../types/wallet';
import { AuctionManagerService } from '../services/auctionManagerService';
import { AdminService } from '../services/adminService';
import { WalletLedgerService } from '../services/walletLedgerService';
import { PersistenceService } from '../services/persistence';
import { SupportedLanguage, translations, LANGUAGE_OPTIONS } from '../services/i18n';
import { db, auth } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  signInWithEmail: (email: string, phone?: string) => { success: boolean; user: User };
  updateUserProfile: (updates: Partial<User>) => void;
  registeredUsers: User[];
  updateUserInAdmin: (userId: string, updates: Partial<User>) => void;
  currentRoute: string;
  navigateTo: (route: string) => void;
  competitions: Competition[];
  refreshCompetitions: () => void;
  updateListingProperty: (compId: string, updates: Partial<PropertyDetails>) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  wallet: Wallet;
  refreshWallet: () => void;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  adminTapCount: number;
  handleLogoClick: () => void;
  isAdminAuthModalOpen: boolean;
  openAdminAuthModal: () => void;
  closeAdminAuthModal: () => void;
  loginAsAdmin: (email: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;
  // Aliases for compatibility
  auctions: Competition[];
  refreshAuctions: () => void;
}

const initialRegisteredUsers: User[] = [
  {
    id: 'usr_admin_brook',
    email: 'brookaklilu33@gmail.com',
    phone: '+251 91 123 4567',
    phoneNumber: '+251 91 123 4567',
    backupEmail: 'brook.backup@gmail.com',
    displayName: 'Brook Aklilu (Admin)',
    role: 'SUPERADMIN',
    isSuspended: false,
    createdAt: '2026-08-01T00:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    eligibility: {
      countryOfResidence: 'Ethiopia / Diaspora',
      isAgeVerified: true,
      isDiasporaCertified: true,
      identityStatus: 'VERIFIED'
    }
  },
  {
    id: 'usr_participant_default',
    email: 'participant@lowwin-diaspora.com',
    phone: '+1 (571) 482-9012',
    phoneNumber: '+1 (571) 482-9012',
    backupEmail: 'participant.backup@gmail.com',
    displayName: 'Diaspora Participant',
    role: 'PARTICIPANT',
    isSuspended: false,
    createdAt: '2026-08-10T12:00:00.000Z',
    lastLoginAt: new Date().toISOString(),
    eligibility: {
      countryOfResidence: 'United States',
      isAgeVerified: true,
      isDiasporaCertified: true,
      identityStatus: 'VERIFIED'
    }
  },
  {
    id: 'usr_samuel_bekele',
    email: 'samuel.bekele@diaspora-uk.co.uk',
    phone: '+44 7911 123456',
    phoneNumber: '+44 7911 123456',
    backupEmail: 'samuel.b.uk@outlook.com',
    displayName: 'Samuel Bekele',
    role: 'PARTICIPANT',
    isSuspended: false,
    createdAt: '2026-08-15T09:30:00.000Z',
    lastLoginAt: '2026-10-24T18:20:00.000Z',
    eligibility: {
      countryOfResidence: 'United Kingdom',
      isAgeVerified: true,
      isDiasporaCertified: true,
      identityStatus: 'VERIFIED'
    }
  },
  {
    id: 'usr_helen_tesfaye',
    email: 'helen.tesfaye@toronto-ethio.ca',
    phone: '+1 (416) 555-0199',
    phoneNumber: '+1 (416) 555-0199',
    backupEmail: 'helen.t.ca@gmail.com',
    displayName: 'Helen Tesfaye',
    role: 'PARTICIPANT',
    isSuspended: false,
    createdAt: '2026-08-20T14:15:00.000Z',
    lastLoginAt: '2026-10-25T11:45:00.000Z',
    eligibility: {
      countryOfResidence: 'Canada',
      isAgeVerified: true,
      isDiasporaCertified: true,
      identityStatus: 'VERIFIED'
    }
  },
  {
    id: 'usr_yared_alemu',
    email: 'yared.alemu@dubai-diaspora.ae',
    phone: '+971 50 123 4567',
    phoneNumber: '+971 50 123 4567',
    backupEmail: 'yared.uae@yahoo.com',
    displayName: 'Yared Alemu',
    role: 'PARTICIPANT',
    isSuspended: false,
    createdAt: '2026-09-01T10:00:00.000Z',
    lastLoginAt: '2026-10-26T04:10:00.000Z',
    eligibility: {
      countryOfResidence: 'United Arab Emirates',
      isAgeVerified: true,
      isDiasporaCertified: true,
      identityStatus: 'VERIFIED'
    }
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [registeredUsers, setRegisteredUsers] = useState<User[]>(() =>
    PersistenceService.get<User[]>('registered_users_db', initialRegisteredUsers)
  );

  const [currentUser, setCurrentUser] = useState<User>(() =>
    PersistenceService.get<User>('current_user', registeredUsers[0] || initialRegisteredUsers[0])
  );

  const [currentRoute, setCurrentRoute] = useState<string>(() => {
    const path = window.location.pathname;
    return path && path !== '/' ? path : '/';
  });

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = PersistenceService.get<boolean | null>('dark_mode', null);
    if (saved !== null && saved !== undefined) {
      return !!saved;
    }
    // Always open in light mode by default when users enter
    return false;
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() =>
    PersistenceService.get<SupportedLanguage>('app_language', 'en')
  );

  const setLanguage = (lang: SupportedLanguage) => {
    setLanguageState(lang);
    PersistenceService.set('app_language', lang);
  };

  const t = (key: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict && langDict[key]) {
      return langDict[key];
    }
    return translations.en[key] || key;
  };

  const [wallet, setWallet] = useState<Wallet>(() =>
    WalletLedgerService.getOrCreateWallet(currentUser.id)
  );

  const refreshWallet = () => {
    setWallet(WalletLedgerService.getOrCreateWallet(currentUser.id));
  };

  // Sign in or auto-create account using email
  const signInWithEmail = (email: string, phone?: string): { success: boolean; user: User } => {
    const trimmedEmail = email.trim().toLowerCase();
    const existing = registeredUsers.find((u) => u.email.toLowerCase() === trimmedEmail);

    if (existing) {
      const updated: User = {
        ...existing,
        phone: phone || existing.phone || existing.phoneNumber,
        phoneNumber: phone || existing.phoneNumber || existing.phone,
        lastLoginAt: new Date().toISOString()
      };
      const newUsers = registeredUsers.map((u) => (u.id === existing.id ? updated : u));
      setRegisteredUsers(newUsers);
      PersistenceService.set('registered_users_db', newUsers);
      setCurrentUser(updated);
      PersistenceService.set('current_user', updated);
      syncUserToFirestore(updated);
      refreshWallet();
      return { success: true, user: updated };
    }

    // Auto-create new diaspora account perfectly
    const newUser: User = {
      id: 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
      email: trimmedEmail,
      phone: phone || '',
      phoneNumber: phone || '',
      backupEmail: '',
      displayName: trimmedEmail.split('@')[0],
      role: trimmedEmail === 'brookaklilu33@gmail.com' ? 'SUPERADMIN' : 'PARTICIPANT',
      isSuspended: false,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      eligibility: {
        countryOfResidence: 'United States',
        isAgeVerified: true,
        isDiasporaCertified: true,
        identityStatus: 'VERIFIED'
      }
    };

    const newUsers = [newUser, ...registeredUsers];
    setRegisteredUsers(newUsers);
    PersistenceService.set('registered_users_db', newUsers);
    setCurrentUser(newUser);
    PersistenceService.set('current_user', newUser);
    syncUserToFirestore(newUser);
    refreshWallet();
    return { success: true, user: newUser };
  };

  // Helper to sync user records to live Firestore database
  const syncUserToFirestore = async (user: User) => {
    try {
      const userRef = doc(db, 'users', user.id);
      await setDoc(
        userRef,
        {
          id: user.id,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          phoneNumber: user.phoneNumber || user.phone || '',
          phone: user.phoneNumber || user.phone || '',
          backupEmail: user.backupEmail || '',
          role: user.role || 'PARTICIPANT',
          isSuspended: !!user.isSuspended,
          createdAt: user.createdAt || new Date().toISOString(),
          lastLoginAt: user.lastLoginAt || new Date().toISOString(),
          countryOfResidence: user.eligibility?.countryOfResidence || 'United States',
          identityStatus: user.eligibility?.identityStatus || 'VERIFIED'
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('[Firestore] Profile sync notice:', err);
    }
  };

  // Update profile for current user
  const updateUserProfile = (updates: Partial<User>) => {
    const updated: User = {
      ...currentUser,
      ...updates,
      phone: updates.phoneNumber || updates.phone || currentUser.phone || currentUser.phoneNumber,
      phoneNumber: updates.phoneNumber || updates.phone || currentUser.phoneNumber || currentUser.phone
    };
    setCurrentUser(updated);
    PersistenceService.set('current_user', updated);

    const newUsers = registeredUsers.map((u) => (u.id === updated.id ? updated : u));
    setRegisteredUsers(newUsers);
    PersistenceService.set('registered_users_db', newUsers);
    syncUserToFirestore(updated);
  };

  // Admin updates to user in user database
  const updateUserInAdmin = (userId: string, updates: Partial<User>) => {
    const newUsers = registeredUsers.map((u) => {
      if (u.id === userId) {
        const updatedUser = {
          ...u,
          ...updates,
          phone: updates.phoneNumber || updates.phone || u.phone || u.phoneNumber,
          phoneNumber: updates.phoneNumber || updates.phone || u.phoneNumber || u.phone
        };
        syncUserToFirestore(updatedUser);
        return updatedUser;
      }
      return u;
    });
    setRegisteredUsers(newUsers);
    PersistenceService.set('registered_users_db', newUsers);

    if (currentUser.id === userId) {
      const updated = newUsers.find((u) => u.id === userId);
      if (updated) {
        setCurrentUser(updated);
        PersistenceService.set('current_user', updated);
      }
    }
  };

  const [adminTapCount, setAdminTapCount] = useState<number>(0);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState<boolean>(false);
  const lastTapTimeRef = useRef<number>(0);

  const [competitions, setCompetitions] = useState<Competition[]>(() =>
    AuctionManagerService.getAllCompetitions()
  );

  // Update listing property (e.g. video upload, specs, images)
  const updateListingProperty = (compId: string, updates: Partial<PropertyDetails>) => {
    AuctionManagerService.updatePropertyDetails(compId, updates);
    setCompetitions(AuctionManagerService.getAllCompetitions());
  };

  // Sync dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
    PersistenceService.set('dark_mode', isDarkMode);

    // Keep mobile browser address bar / notch tint perfectly coordinated
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDarkMode ? '#0F172A' : '#F8FAFC');
    }
  }, [isDarkMode]);

  // Sync route
  const navigateTo = (route: string) => {
    setCurrentRoute(route);
    window.history.pushState({}, '', route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Listen to Firebase Authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase().trim();
        const existing = registeredUsers.find((u) => u.email.toLowerCase() === cleanEmail);
        if (existing) {
          const updated: User = {
            ...existing,
            lastLoginAt: new Date().toISOString()
          };
          setCurrentUser(updated);
          PersistenceService.set('current_user', updated);
        } else {
          const isSuper = cleanEmail === 'brookaklilu33@gmail.com';
          const newUser: User = {
            id: fbUser.uid,
            email: cleanEmail,
            displayName: fbUser.displayName || cleanEmail.split('@')[0],
            phone: fbUser.phoneNumber || '',
            phoneNumber: fbUser.phoneNumber || '',
            backupEmail: '',
            role: isSuper ? 'SUPERADMIN' : 'PARTICIPANT',
            isSuspended: false,
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            eligibility: {
              countryOfResidence: 'United States',
              isAgeVerified: true,
              isDiasporaCertified: true,
              identityStatus: 'VERIFIED'
            }
          };
          const newUsers = [newUser, ...registeredUsers];
          setRegisteredUsers(newUsers);
          PersistenceService.set('registered_users_db', newUsers);
          setCurrentUser(newUser);
          PersistenceService.set('current_user', newUser);
          syncUserToFirestore(newUser);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const refreshCompetitions = () => {
    setCompetitions(AuctionManagerService.getAllCompetitions());
  };

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  /**
   * Hidden admin shortcut: Exactly five deliberate clicks/taps on the Lowwin Diaspora logo
   * reveals the admin Google sign-in flow with debounce.
   */
  const handleLogoClick = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current > 3000) {
      setAdminTapCount(1);
      lastTapTimeRef.current = now;
      return;
    }
    lastTapTimeRef.current = now;

    setAdminTapCount((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        setIsAdminAuthModalOpen(true);
        return 0;
      }
      return next;
    });
  };

  const openAdminAuthModal = () => setIsAdminAuthModalOpen(true);
  const closeAdminAuthModal = () => {
    setIsAdminAuthModalOpen(false);
    setAdminTapCount(0);
  };

  const loginAsAdmin = (email: string): { success: boolean; error?: string } => {
    const admin = AdminService.getAdminByEmail(email);
    if (!admin) {
      return {
        success: false,
        error: 'Access Denied: This Google account is not registered as an authorized Lowwin Diaspora administrator.'
      };
    }
    if (admin.isSuspended) {
      return {
        success: false,
        error: 'Access Denied: Your administrative privileges have been suspended. Contact the Superadmin.'
      };
    }

    setCurrentUser(admin);
    PersistenceService.set('current_user', admin);
    setIsAdminAuthModalOpen(false);
    navigateTo('/admin');
    return { success: true };
  };

  const logoutAdmin = () => {
    const participant = registeredUsers[0] || initialRegisteredUsers[0];
    setCurrentUser(participant);
    PersistenceService.set('current_user', participant);
    navigateTo('/');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        signInWithEmail,
        updateUserProfile,
        registeredUsers,
        updateUserInAdmin,
        currentRoute,
        navigateTo,
        competitions,
        refreshCompetitions,
        updateListingProperty,
        auctions: competitions,
        refreshAuctions: refreshCompetitions,
        isDarkMode,
        toggleDarkMode,
        wallet,
        refreshWallet,
        language,
        setLanguage,
        t,
        adminTapCount,
        handleLogoClick,
        isAdminAuthModalOpen,
        openAdminAuthModal,
        closeAdminAuthModal,
        loginAsAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
