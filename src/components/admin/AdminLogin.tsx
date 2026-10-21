import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  Key, 
  ShieldCheck, 
  AlertCircle, 
  UserPlus, 
  LogIn, 
  Store,
  Info 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { OWNER_EMAIL } from '../../lib/firebase';
import { useAdminLanguage, AdminLanguageSelector } from '../../context/AdminLanguageContext';

interface AdminLoginProps {
  onBackToStore?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onBackToStore }) => {
  const { signIn, createAdminAccount, authError, clearAuthError } = useAuth();
  const { t, isRtl } = useAdminLanguage();
  
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState(OWNER_EMAIL);
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearAuthError();

    if (!email || !password) {
      setLocalError(t.loginRequiredFieldsError);
      return;
    }

    if (password.length < 6) {
      setLocalError(t.loginPasswordLengthError);
      return;
    }

    setSubmitting(true);
    try {
      if (isRegisterMode) {
        await createAdminAccount(email, password, displayName || 'Gérant DBC Workshop');
      } else {
        await signIn(email, password);
      }
    } catch {
      // Error handled in AuthContext
    } finally {
      setSubmitting(false);
    }
  };

  const errorMessage = localError || authError;

  return (
    <div 
      dir={isRtl ? 'rtl' : 'ltr'}
      className={`min-h-screen bg-[#191715] text-[#ECE7DF] flex flex-col justify-center items-center p-4 selection:bg-[#C9A96E] selection:text-black ${
        isRtl ? 'font-arabic' : ''
      }`}
    >
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#8C6D3B] blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#3D352E] blur-3xl" />
      </div>

      {/* Floating Language Switcher for Admin */}
      <div className="relative w-full max-w-md flex justify-end mb-4 z-10">
        <AdminLanguageSelector variant="dark" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-[#272320] border border-[#4A433B] text-[#C9A96E] mb-4 shadow-xl">
            <Lock className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl tracking-[0.15em] font-bold text-white uppercase">
            {t.loginTitle}
          </h1>
          <p className="font-mono text-xs text-[#A8A196] tracking-wider uppercase mt-1">
            {t.loginSubtitle}
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#24211E] border border-[#3D3730] rounded-xl shadow-2xl p-6 sm:p-8 backdrop-blur-md">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#36302A]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#C9A96E]" />
              <span className="font-mono text-xs uppercase tracking-wider text-white font-semibold">
                {isRegisterMode ? t.loginCreateAdmin : t.loginSecureAuth}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#332D27] text-[#C9A96E] border border-[#C9A96E]/20">
              Firebase Auth
            </span>
          </div>

          {errorMessage && (
            <div className="mb-5 p-3.5 bg-rose-950/60 border border-rose-800/80 rounded-lg text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{errorMessage}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-xs font-mono text-[#A8A196] uppercase mb-1.5">
                  {t.loginManagerNameLabel}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder={t.loginManagerNamePlaceholder}
                    className="w-full px-3 py-2.5 bg-[#191715] border border-[#423C35] rounded-lg text-sm text-white placeholder-[#6E6659] focus:outline-none focus:border-[#C9A96E] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-[#A8A196] uppercase mb-1.5 flex items-center justify-between">
                <span>{t.loginEmailLabel}</span>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#7C756B]`}>
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.loginEmailPlaceholder}
                  className={`w-full ${isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} py-2.5 bg-[#191715] border border-[#423C35] rounded-lg text-sm text-white placeholder-[#6E6659] focus:outline-none focus:border-[#C9A96E] transition-colors font-mono`}
                />
              </div>
              <p className="text-[11px] text-[#7C756B] mt-1 font-mono">
                {t.loginPrimaryOwnerNote} <span className="text-[#C9A96E]">{OWNER_EMAIL}</span>
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono text-[#A8A196] uppercase mb-1.5 flex items-center justify-between">
                <span>{t.loginPasswordLabel}</span>
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 ${isRtl ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none text-[#7C756B]`}>
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.loginPasswordPlaceholder}
                  className={`w-full ${isRtl ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} py-2.5 bg-[#191715] border border-[#423C35] rounded-lg text-sm text-white placeholder-[#6E6659] focus:outline-none focus:border-[#C9A96E] transition-colors font-mono`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              id="admin-login-submit-btn"
              className="w-full mt-2 py-3 bg-[#C9A96E] hover:bg-[#B89657] text-[#191715] font-mono text-xs uppercase tracking-wider font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span>{t.loginVerifying}</span>
              ) : isRegisterMode ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>{t.loginRegisterSubmitBtn}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{t.loginSubmitBtn}</span>
                </>
              )}
            </button>
          </form>

          {/* Setup / Bootstrap switch */}
          <div className="mt-6 pt-5 border-t border-[#36302A] text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(!isRegisterMode);
                setLocalError(null);
                clearAuthError();
              }}
              className="text-xs font-mono text-[#C9A96E] hover:underline cursor-pointer block w-full transition-colors"
            >
              {isRegisterMode
                ? t.loginSwitchToLogin
                : t.loginSwitchToRegister}
            </button>

            {onBackToStore && (
              <button
                type="button"
                onClick={onBackToStore}
                className="text-xs font-mono text-[#8C8377] hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
              >
                <Store className="w-3.5 h-3.5" />
                <span>{t.backToStore}</span>
              </button>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 p-4 rounded-lg bg-[#24211E]/70 border border-[#36302A] text-[11px] text-[#8C8377] font-mono leading-relaxed space-y-1">
          <div className="flex items-center gap-1.5 text-[#A8A196] font-semibold">
            <Info className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>{t.loginSecurityTitle}</span>
          </div>
          <p>
            {t.loginSecurityDesc}
          </p>
        </div>
      </div>
    </div>
  );
};
