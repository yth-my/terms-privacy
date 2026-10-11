import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { 
  auth, 
  signInWithGoogle, 
  logout, 
  savePolicyToFirestore, 
  getUserPolicies, 
  getPolicyById, 
  deletePolicyFromFirestore,
  saveUserSettings,
  getUserSettings
} from './lib/firebase';
import { INITIAL_FORM_DATA, generatePrivacyPolicyMarkdown, generateTermsMarkdown, convertMarkdownToHtml } from './lib/generator';
import { generateAppSlug } from './lib/slug';
import { saveHtmlToPublicFolder } from './lib/publicStorage';
import { PolicyFormData, GitHubConfig, SavedPolicyDoc } from './types/policy';
import { Header } from './components/Header';
import { DocumentTypeSelector, DocMode } from './components/DocumentTypeSelector';
import { PolicyForm } from './components/PolicyForm';
import { LivePreview } from './components/LivePreview';
import { SavedPoliciesModal } from './components/SavedPoliciesModal';
import { GitHubSettingsModal } from './components/GitHubSettingsModal';
import { PublicPolicyViewer } from './components/PublicPolicyViewer';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  Sparkles, 
  FileText,
  Eye,
  Edit3,
  ArrowLeft
} from 'lucide-react';

interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  actionUrl?: string;
  actionText?: string;
}

const DEFAULT_GITHUB_CONFIG: GitHubConfig = {
  token: '',
  owner: '',
  repo: '',
  branch: 'main',
  privacyPath: 'PRIVACY_POLICY.md',
  termsPath: 'TERMS.md',
  autoPushOnSave: false,
};

export default function App() {
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Initial screen selection: 'terms' | 'privacy' | 'both' | null
  const [docMode, setDocMode] = useState<DocMode | null>(() => {
    // If returning user or stored preference
    const savedMode = localStorage.getItem('app_doc_mode');
    if (savedMode === 'terms' || savedMode === 'privacy' || savedMode === 'both') {
      return savedMode;
    }
    return null; // Show selection screen by default
  });

  // Form & generated document state
  const [formData, setFormData] = useState<PolicyFormData>(() => {
    const saved = localStorage.getItem('app_policy_form');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return INITIAL_FORM_DATA;
  });

  // Has generated state
  const [hasGenerated, setHasGenerated] = useState<boolean>(() => {
    return Boolean(localStorage.getItem('app_has_generated') === 'true');
  });

  // Mobile active tab view ('form' or 'preview')
  const [activeMobileTab, setActiveMobileTab] = useState<'form' | 'preview'>('form');

  // Current loaded doc ID in Firebase / Local
  const [currentDocId, setCurrentDocId] = useState<string | null>(() => {
    return localStorage.getItem('app_current_doc_id');
  });

  // Saved policies list
  const [savedPolicies, setSavedPolicies] = useState<SavedPolicyDoc[]>([]);

  // GitHub configuration
  const [githubConfig, setGithubConfig] = useState<GitHubConfig>(() => {
    const saved = localStorage.getItem('app_github_config');
    if (saved) {
      try { return JSON.parse(saved); } catch {}
    }
    return DEFAULT_GITHUB_CONFIG;
  });

  // Modals state
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);

  // Public Viewer standalone state
  const [publicDoc, setPublicDoc] = useState<SavedPolicyDoc | null>(null);
  const [publicDocLoading, setPublicDocLoading] = useState(false);
  const [publicDocType, setPublicDocType] = useState<'privacy' | 'terms'>('privacy');

  // Async action states
  const [isSaving, setIsSaving] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string, actionUrl?: string, actionText?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, type, message, actionUrl, actionText }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Generate markdown and html in real time
  const privacyMarkdown = useMemo(() => {
    return generatePrivacyPolicyMarkdown(formData);
  }, [formData]);

  const privacyHtml = useMemo(() => {
    return convertMarkdownToHtml(privacyMarkdown, `Kebijakan Privasi - ${formData.appName}`);
  }, [privacyMarkdown, formData.appName]);

  const termsMarkdown = useMemo(() => {
    return generateTermsMarkdown(formData);
  }, [formData]);

  const termsHtml = useMemo(() => {
    return convertMarkdownToHtml(termsMarkdown, `Syarat & Ketentuan - ${formData.appName}`);
  }, [termsMarkdown, formData.appName]);

  // Check if form has all required fields
  const isFormComplete = useMemo(() => {
    return (
      Boolean(formData.appName.trim()) &&
      Boolean(formData.developerName.trim()) &&
      Boolean(formData.contactEmail.trim())
    );
  }, [formData.appName, formData.developerName, formData.contactEmail]);

  // Persist form data & mode to localStorage
  useEffect(() => {
    localStorage.setItem('app_policy_form', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (docMode) {
      localStorage.setItem('app_doc_mode', docMode);
    } else {
      localStorage.removeItem('app_doc_mode');
    }
  }, [docMode]);

  useEffect(() => {
    localStorage.setItem('app_has_generated', String(hasGenerated));
  }, [hasGenerated]);

  useEffect(() => {
    if (currentDocId) {
      localStorage.setItem('app_current_doc_id', currentDocId);
    } else {
      localStorage.removeItem('app_current_doc_id');
    }
  }, [currentDocId]);

  // Check URL query parameters and paths for public view mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    let docParam = params.get('app') || params.get('doc') || params.get('id') || params.get('p');
    let viewParam = params.get('view');

    // 1. Support .html file URLs: e.g. /my-app-terms.html, /public/my-app-privacy.html, /my-app.html
    const pathname = window.location.pathname;
    const cleanPath = pathname.replace(/^\/public/, '');
    const htmlMatch = cleanPath.match(/^\/([a-zA-Z0-9_-]+?)(?:-(terms|privacy))?\.html$/i);
    if (htmlMatch) {
      docParam = htmlMatch[1];
      viewParam = (htmlMatch[2] as 'terms' | 'privacy') || 'terms';
    }

    // 2. Also support path-based URLs: e.g. /terms/super-notes or /privacy/super-notes
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (!docParam && pathParts.length >= 2 && (pathParts[0] === 'terms' || pathParts[0] === 'privacy')) {
      viewParam = pathParts[0];
      docParam = pathParts[1];
    } else if (!docParam && pathParts.length === 1 && (pathParts[0] === 'terms' || pathParts[0] === 'privacy')) {
      viewParam = pathParts[0];
    }

    if (viewParam === 'terms' || viewParam === 'privacy') {
      setPublicDocType(viewParam);
    }

    if (docParam) {
      setPublicDocLoading(true);
      getPolicyById(docParam)
        .then(doc => {
          if (doc) {
            setPublicDoc(doc);
          } else {
            // Check local fallback
            const raw = localStorage.getItem('app_local_saved_policies');
            if (raw) {
              try {
                const list = JSON.parse(raw);
                const localFound = list.find((p: SavedPolicyDoc) => 
                  p.id === docParam || 
                  p.slug === docParam || 
                  generateAppSlug(p.formData?.appName || p.title) === docParam
                );
                if (localFound) {
                  setPublicDoc(localFound);
                  return;
                }
              } catch {}
            }
            addToast('error', 'Dokumen kebijakan tidak ditemukan atau telah dihapus.');
          }
        })
        .catch(err => {
          console.error(err);
          addToast('error', 'Gagal memuat dokumen publik.');
        })
        .finally(() => {
          setPublicDocLoading(false);
        });
    }
  }, []);

  // Load local policies from localStorage
  const loadLocalPolicies = useCallback((): SavedPolicyDoc[] => {
    try {
      const raw = localStorage.getItem('app_local_saved_policies');
      if (raw) {
        const parsed = JSON.parse(raw);
        setSavedPolicies(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse local policies', e);
    }
    setSavedPolicies([]);
    return [];
  }, []);

  const saveLocalPolicy = useCallback((docId: string): SavedPolicyDoc => {
    const raw = localStorage.getItem('app_local_saved_policies');
    let list: SavedPolicyDoc[] = [];
    try {
      if (raw) list = JSON.parse(raw);
    } catch {}

    const now = Date.now();
    const existingIndex = list.findIndex(p => p.id === docId);
    const newDoc: SavedPolicyDoc = {
      id: docId,
      userId: user?.uid || 'guest',
      title: formData.appName,
      formData,
      privacyMarkdown,
      privacyHtml,
      termsMarkdown,
      termsHtml,
      isPublic: true,
      createdAt: existingIndex >= 0 ? (list[existingIndex].createdAt || now) : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      list[existingIndex] = newDoc;
    } else {
      list.unshift(newDoc);
    }

    localStorage.setItem('app_local_saved_policies', JSON.stringify(list));
    setSavedPolicies(list);
    return newDoc;
  }, [formData, privacyMarkdown, privacyHtml, termsMarkdown, termsHtml, user]);

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setAuthLoading(false);
      if (currentUser) {
        setUser(currentUser);
        loadSavedPolicies(currentUser.uid);
        try {
          const settings = await getUserSettings(currentUser.uid);
          if (settings?.github) {
            setGithubConfig(prev => ({ ...prev, ...settings.github }));
          }
        } catch (e) {
          console.warn('Could not load user settings:', e);
        }
      } else {
        setUser(null);
        loadLocalPolicies();
      }
    });

    return () => unsubscribe();
  }, [loadLocalPolicies]);

  const loadSavedPolicies = async (uid: string) => {
    try {
      const policies = await getUserPolicies(uid);
      setSavedPolicies(policies);
    } catch (err) {
      console.warn('Failed to load user policies from cloud, falling back to local:', err);
      loadLocalPolicies();
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const signedInUser = await signInWithGoogle();
      setUser(signedInUser);
      loadSavedPolicies(signedInUser.uid);
      addToast('success', `Berhasil masuk sebagai ${signedInUser.displayName || signedInUser.email}!`);
    } catch (err: any) {
      console.error(err);
      addToast('error', err.message || 'Gagal masuk dengan Google.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      loadLocalPolicies();
      addToast('info', 'Anda telah keluar.');
    } catch (err: any) {
      console.error(err);
    }
  };

  // Save to Firebase Firestore / Local handler
  const handleSaveToFirebase = async (): Promise<string | undefined> => {
    const targetDocId = currentDocId || `doc-${Date.now().toString(36)}`;
    
    // Always update local storage first so user never loses progress
    saveLocalPolicy(targetDocId);
    setCurrentDocId(targetDocId);

    if (!user) {
      return targetDocId;
    }

    setIsSaving(true);
    try {
      const firestoreTarget = targetDocId.startsWith('doc-') ? null : targetDocId;
      const docId = await savePolicyToFirestore(user.uid, firestoreTarget, {
        title: formData.appName,
        formData,
        privacyMarkdown,
        privacyHtml,
        termsMarkdown,
        termsHtml,
        isPublic: true,
      });

      setCurrentDocId(docId);
      await loadSavedPolicies(user.uid);
      return docId;
    } catch (err: any) {
      console.warn('Saved locally, firestore sync note:', err);
      return targetDocId;
    } finally {
      setIsSaving(false);
    }
  };

  // Generate Action handler
  const handleGenerate = async () => {
    if (!isFormComplete) {
      addToast('error', 'Harap lengkapi Nama Aplikasi, Perusahaan/Pengembang, dan Email Kontak.');
      return;
    }

    setHasGenerated(true);
    confetti({ particleCount: 60, spread: 75, origin: { y: 0.6 } });

    // Always attempt cloud save so the generated link is accessible from any device globally
    const effectiveUserId = user ? user.uid : 'guest';
    const targetCloudId = currentDocId && !currentDocId.startsWith('doc-') ? currentDocId : null;

    try {
      const cloudId = await savePolicyToFirestore(effectiveUserId, targetCloudId, {
        title: formData.appName,
        formData,
        privacyMarkdown,
        privacyHtml,
        termsMarkdown,
        termsHtml,
        isPublic: true,
      });
      setCurrentDocId(cloudId);
      saveLocalPolicy(cloudId);
      if (user) {
        loadSavedPolicies(user.uid);
      }
    } catch (err) {
      console.warn('Firestore cloud save fallback:', err);
      const fallbackId = currentDocId || `doc-${Date.now().toString(36)}`;
      setCurrentDocId(fallbackId);
      saveLocalPolicy(fallbackId);
    }

    // Automatically save .html files to /public folder
    saveHtmlToPublicFolder(formData.appName, termsHtml, privacyHtml).catch(e => {
      console.warn('Auto-save to /public note:', e);
    });

    // Switch to preview tab on mobile so user immediately views the links and documents
    setActiveMobileTab('preview');
    const targetAppName = formData.appName.trim() || formData.developerName.trim();
    addToast('success', `Dokumen & link resmi untuk ${targetAppName} berhasil di-generate!`);
  };

  const handleSelectMode = (mode: DocMode) => {
    setDocMode(mode);
    // If terms mode, auto switch to form view
    setActiveMobileTab('form');
  };

  const handleLoadPolicy = (policy: SavedPolicyDoc) => {
    if (policy.formData) {
      setFormData(policy.formData);
    }
    if (policy.id) {
      setCurrentDocId(policy.id);
    }
    setHasGenerated(true);
    setDocMode('both');
    addToast('info', `Memuat dokumen: ${policy.formData?.appName || policy.title}`);
  };

  const handleDeletePolicy = async (policyId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini?')) return;
    try {
      if (user && !policyId.startsWith('doc-')) {
        await deletePolicyFromFirestore(policyId);
        await loadSavedPolicies(user.uid);
      } else {
        const raw = localStorage.getItem('app_local_saved_policies');
        if (raw) {
          const list = JSON.parse(raw).filter((p: SavedPolicyDoc) => p.id !== policyId);
          localStorage.setItem('app_local_saved_policies', JSON.stringify(list));
          setSavedPolicies(list);
        }
      }
      if (currentDocId === policyId) {
        setCurrentDocId(null);
      }
      addToast('success', 'Dokumen berhasil dihapus.');
    } catch (err: any) {
      console.error(err);
      addToast('error', err.message || 'Gagal menghapus dokumen.');
    }
  };

  const handleOpenPublicView = (identifier: string, docType: 'privacy' | 'terms') => {
    const slug = generateAppSlug(identifier || formData.appName || 'app');
    const url = `${window.location.origin}${window.location.pathname}?app=${slug}&view=${docType}`;
    window.open(url, '_blank');
  };

  const handleSaveGithubConfig = async (config: GitHubConfig) => {
    setGithubConfig(config);
    if (user) {
      await saveUserSettings(user.uid, { github: config });
    }
    addToast('success', 'Pengaturan GitHub berhasil disimpan!');
  };

  // If viewing standalone public policy page directly via link
  if (publicDoc) {
    return (
      <PublicPolicyViewer
        policy={publicDoc}
        initialType={publicDocType}
        onBack={() => {
          setPublicDoc(null);
          window.history.pushState({}, '', window.location.pathname);
        }}
        isStandalone={true}
      />
    );
  }

  const company = formData.developerName.trim() || formData.appName.trim() || 'Perusahaan';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans">
      
      {/* Clean Navbar Header */}
      <Header
        user={user}
        onGoogleSignIn={handleGoogleSignIn}
        onLogout={handleLogout}
        savedCount={savedPolicies.length}
        onOpenSavedModal={() => setIsSavedModalOpen(true)}
        githubConfig={githubConfig}
        onOpenGithubSettings={() => setIsGithubModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-6 flex flex-col">
        
        {/* FIRST SCREEN: CHOICE BETWEEN TERMS AND PRIVACY POLICY */}
        {!docMode ? (
          <DocumentTypeSelector
            onSelect={handleSelectMode}
            savedCount={savedPolicies.length}
            onOpenSavedModal={() => setIsSavedModalOpen(true)}
          />
        ) : (
          /* WORKSPACE (AFTER SELECTION) */
          <>
            {/* Mobile View Toggle Switcher (Hidden on lg+ screens) */}
            <div className="lg:hidden flex bg-white border border-slate-200 p-1 rounded-xl mb-3 shadow-2xs">
              <button
                onClick={() => setActiveMobileTab('form')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMobileTab === 'form'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Formulir Data</span>
              </button>

              <button
                onClick={() => setActiveMobileTab('preview')}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-lg transition-all ${
                  activeMobileTab === 'preview'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Hasil & Tautan Link</span>
                {hasGenerated && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>
            </div>

            {/* 2-Column Responsive Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch min-h-0">
              
              {/* Left Column: Generator Form (5 Cols on Large) */}
              <div className={`lg:col-span-5 h-[calc(100vh-140px)] min-h-[580px] ${activeMobileTab === 'form' ? 'block' : 'hidden lg:block'}`}>
                <PolicyForm
                  formData={formData}
                  onChange={setFormData}
                  onGenerate={handleGenerate}
                  isFormComplete={isFormComplete}
                  hasGenerated={hasGenerated}
                  docMode={docMode}
                  onBackToSelector={() => setDocMode(null)}
                />
              </div>

              {/* Right Column: Live Document Preview, PDF/HTML Save & Links (7 Cols on Large) */}
              <div className={`lg:col-span-7 h-[calc(100vh-140px)] min-h-[580px] ${activeMobileTab === 'preview' ? 'block' : 'hidden lg:block'}`}>
                <LivePreview
                  appName={formData.appName}
                  companyName={company}
                  privacyMarkdown={privacyMarkdown}
                  privacyHtml={privacyHtml}
                  termsMarkdown={termsMarkdown}
                  termsHtml={termsHtml}
                  onSaveToFirebase={handleSaveToFirebase}
                  currentDocId={currentDocId}
                  onOpenPublicView={handleOpenPublicView}
                  hasGenerated={hasGenerated}
                  onGenerate={handleGenerate}
                  isFormComplete={isFormComplete}
                  activeDocMode={docMode}
                />
              </div>

            </div>
          </>
        )}

      </main>

      {/* Saved Policies Modal Drawer */}
      <SavedPoliciesModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        policies={savedPolicies}
        onLoadPolicy={handleLoadPolicy}
        onDeletePolicy={handleDeletePolicy}
        onOpenPublicView={handleOpenPublicView}
        currentDocId={currentDocId}
      />

      {/* GitHub Settings Modal */}
      <GitHubSettingsModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        config={githubConfig}
        onSave={handleSaveGithubConfig}
      />

      {/* Toast Notifications */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${
              toast.type === 'success'
                ? 'bg-slate-900/95 text-white border-slate-700'
                : toast.type === 'error'
                ? 'bg-rose-900/95 text-white border-rose-700'
                : 'bg-slate-900/95 text-white border-slate-700'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />}
              <div className="text-xs leading-relaxed">
                <p>{toast.message}</p>
                {toast.actionUrl && (
                  <a
                    href={toast.actionUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-1 text-emerald-300 underline font-semibold"
                  >
                    {toast.actionText || 'Buka Tautan'} &rarr;
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-0.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
