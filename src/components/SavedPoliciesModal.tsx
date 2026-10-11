import React from 'react';
import { SavedPolicyDoc } from '../types/policy';
import { 
  X, 
  Clock, 
  FolderHeart, 
  Trash2, 
  Edit3, 
  Link as LinkIcon, 
  ExternalLink, 
  Github, 
  Database,
  Smartphone,
  Check
} from 'lucide-react';

interface SavedPoliciesModalProps {
  isOpen: boolean;
  onClose: () => void;
  policies: SavedPolicyDoc[];
  onLoadPolicy: (policy: SavedPolicyDoc) => void;
  onDeletePolicy: (policyId: string) => Promise<void>;
  onOpenPublicView: (docId: string, docType: 'privacy' | 'terms') => void;
  currentDocId: string | null;
}

export const SavedPoliciesModal: React.FC<SavedPoliciesModalProps> = ({
  isOpen,
  onClose,
  policies,
  onLoadPolicy,
  onDeletePolicy,
  onOpenPublicView,
  currentDocId,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyLink = (policyId: string) => {
    const base = window.location.origin + window.location.pathname;
    const url = `${base}?doc=${policyId}&view=privacy`;
    navigator.clipboard.writeText(url);
    setCopiedId(policyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-slate-900">Dokumen Kebijakan Tersimpan</h2>
            <span className="text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {policies.length} Dokumen
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Policies List */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
          {policies.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Database className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="font-semibold text-sm text-slate-700">Belum ada dokumen tersimpan di Firebase</p>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan tombol "Simpan ke Firebase" di panel pratinjau untuk menyimpan dokumen kebijakan Anda.
              </p>
            </div>
          ) : (
            policies.map(item => {
              const isCurrent = item.id === currentDocId;
              const dateStr = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'Baru saja';

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">
                          {item.formData?.appName || item.title || 'Untitled Policy'}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-md">
                            Sedang Diedit
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500">
                        {item.formData?.developerName} • {item.formData?.platform} ({item.formData?.appType})
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <Clock className="w-3 h-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {/* Badges & Meta */}
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 mt-2">
                    {item.lastGithubPush && (
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Github className="w-3 h-3" />
                        <span>GitHub: {item.lastGithubPush.repo}</span>
                      </span>
                    )}

                    <div className="ml-auto flex items-center gap-1.5">
                      {/* Copy Public Link */}
                      <button
                        onClick={() => item.id && handleCopyLink(item.id)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1"
                        title="Salin Tautan Publik"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <LinkIcon className="w-3.5 h-3.5" />}
                        <span className="text-[11px]">{copiedId === item.id ? 'Tersalin' : 'Link'}</span>
                      </button>

                      {/* View Link */}
                      <button
                        onClick={() => item.id && onOpenPublicView(item.id, 'privacy')}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs flex items-center gap-1"
                        title="Lihat Tampilan Publik"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Lihat</span>
                      </button>

                      {/* Load to editor */}
                      <button
                        onClick={() => {
                          onLoadPolicy(item);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-xs font-semibold flex items-center gap-1"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Buka</span>
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => item.id && onDeletePolicy(item.id)}
                        className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs"
                        title="Hapus Dokumen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-xl"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>
  );
};
