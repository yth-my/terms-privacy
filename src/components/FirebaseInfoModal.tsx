import React, { useState } from 'react';
import { 
  X, 
  Database, 
  ExternalLink, 
  Check, 
  Copy, 
  ShieldCheck, 
  AlertCircle,
  Sparkles
} from 'lucide-react';
import firebaseConfig from '../../firebase-applet-config.json';

interface FirebaseInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FirebaseInfoModal: React.FC<FirebaseInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedRule, setCopiedRule] = useState(false);
  const [copiedDomain, setCopiedDomain] = useState(false);

  if (!isOpen) return null;

  const currentHostname = window.location.hostname;

  const sampleRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /policies/{policyId} {
      allow read: if true; // Tautan publik untuk Play Store / App Store
      allow create, update, delete: if true; // Atau gunakan request.auth != null
    }
    match /users/{userId} {
      allow read, write: if true;
    }
  }
}`;

  const handleCopyRules = () => {
    navigator.clipboard.writeText(sampleRules);
    setCopiedRule(true);
    setTimeout(() => setCopiedRule(false), 2000);
  };

  const handleCopyDomain = () => {
    navigator.clipboard.writeText(currentHostname);
    setCopiedDomain(true);
    setTimeout(() => setCopiedDomain(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-amber-50/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Konfigurasi Firebase Terhubung</h2>
              <p className="text-[11px] text-slate-500">Project: <span className="font-mono font-semibold text-slate-800">{firebaseConfig.projectId}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-700">
          
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold block mb-0.5">Konfigurasi Firebase Berhasil Dimuat!</span>
              Kode aplikasi Anda sudah menggunakan project <strong>{firebaseConfig.projectId}</strong> secara otomatis.
            </div>
          </div>

          {/* Quick config details */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 font-mono text-[11px] space-y-1">
            <div><span className="text-slate-400">Project ID:</span> {firebaseConfig.projectId}</div>
            <div><span className="text-slate-400">Auth Domain:</span> {firebaseConfig.authDomain}</div>
            <div><span className="text-slate-400">App ID:</span> {firebaseConfig.appId}</div>
          </div>

          {/* Steps checklist in Firebase console */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Langkah Penting di Firebase Console ({firebaseConfig.projectId}):
            </h3>

            {/* Step 1: Firestore */}
            <div className="p-3 rounded-xl border border-slate-200 space-y-1.5 bg-white">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>1. Aktifkan Cloud Firestore</span>
                <a
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Buka Firestore Console</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-500 text-[11px]">
                Pastikan database Firestore sudah dibuat di project Anda (pilih lokasi terdekat seperti <code>asia-southeast1</code>).
              </p>
            </div>

            {/* Step 2: Authorized Domain */}
            <div className="p-3 rounded-xl border border-slate-200 space-y-2 bg-white">
              <div className="font-semibold text-slate-900 flex items-center justify-between">
                <span>2. Tambahkan Authorized Domain (Untuk Google Sign-In)</span>
                <a
                  href={`https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]"
                >
                  <span>Buka Auth Settings</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-500 text-[11px]">
                Di Firebase Console &rarr; Authentication &rarr; Settings &rarr; <strong>Authorized Domains</strong>, tambahkan domain aplikasi:
              </p>
              <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg font-mono text-[11px] text-slate-800">
                <span className="truncate flex-1">{currentHostname}</span>
                <button
                  onClick={handleCopyDomain}
                  className="px-2 py-1 bg-white border border-slate-300 rounded hover:bg-slate-50 flex items-center gap-1 text-[10px] font-sans font-medium"
                >
                  {copiedDomain ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedDomain ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
            </div>

            {/* Step 3: Rules snippet */}
            <div className="p-3 rounded-xl border border-slate-200 space-y-2 bg-white">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900">3. Aturan Keamanan (Firestore Rules)</span>
                <button
                  onClick={handleCopyRules}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 text-[10px] font-medium flex items-center gap-1"
                >
                  {copiedRule ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedRule ? 'Tersalin' : 'Salin Rules'}</span>
                </button>
              </div>
              <pre className="bg-slate-900 text-slate-200 p-2.5 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed">
                {sampleRules}
              </pre>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
