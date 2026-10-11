import React from 'react';
import { 
  ShieldCheck, 
  FolderHeart, 
  LogIn, 
  LogOut, 
  Settings,
  User as UserIcon,
  Check
} from 'lucide-react';
import { User } from 'firebase/auth';
import { GitHubConfig } from '../types/policy';

interface HeaderProps {
  user: User | null;
  onGoogleSignIn: () => void;
  onLogout: () => void;
  savedCount: number;
  onOpenSavedModal: () => void;
  githubConfig: GitHubConfig;
  onOpenGithubSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onGoogleSignIn,
  onLogout,
  savedCount,
  onOpenSavedModal,
  githubConfig,
  onOpenGithubSettings,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white shrink-0">
            <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-base sm:text-lg leading-tight tracking-tight">
              Term & Privacy Generator
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 hidden sm:block">
              Generator Syarat Ketentuan & Kebijakan Privasi Resmi
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Saved Policies Button */}
          <button
            onClick={onOpenSavedModal}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
            title="Lihat riwayat dokumen yang telah dibuat"
          >
            <FolderHeart className="w-3.5 h-3.5 text-rose-300 shrink-0" />
            <span className="hidden sm:inline">Dokumen Saya</span>
            <span className="sm:hidden">Dokumen</span>
            {savedCount > 0 && (
              <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Discreet Settings (GitHub sync if needed) */}
          <button
            onClick={onOpenGithubSettings}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors"
            title={githubConfig.repo ? `GitHub Sync Aktif (${githubConfig.owner}/${githubConfig.repo})` : 'Pengaturan Tambahan (GitHub Sync)'}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Auth Section */}
          <div className="border-l border-slate-200 pl-2 sm:pl-3 flex items-center">
            {user ? (
              <div className="flex items-center gap-2">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
                    {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onGoogleSignIn}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 shadow-2xs transition-colors"
                title="Masuk dengan Google"
              >
                <LogIn className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Masuk</span>
              </button>
            )}
          </div>

        </div>

      </div>
    </header>
  );
};
