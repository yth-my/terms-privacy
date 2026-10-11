import React, { useState } from 'react';
import { GitHubConfig } from '../types/policy';
import { 
  X, 
  Github, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  HelpCircle, 
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { verifyGitHubToken, fetchUserRepos, GitHubRepo } from '../lib/github';

interface GitHubSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: GitHubConfig;
  onSave: (config: GitHubConfig) => void;
}

export const GitHubSettingsModal: React.FC<GitHubSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [localConfig, setLocalConfig] = useState<GitHubConfig>(config);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState<{ success: boolean; message: string; username?: string } | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleTestToken = async () => {
    if (!localConfig.token.trim()) return;
    setTesting(true);
    setStatus(null);
    try {
      const user = await verifyGitHubToken(localConfig.token);
      setStatus({
        success: true,
        username: user.login,
        message: `Koneksi berhasil! Terautentikasi sebagai @${user.login}`,
      });
      const updated = {
        ...localConfig,
        owner: localConfig.owner || user.login,
      };
      setLocalConfig(updated);

      setLoadingRepos(true);
      try {
        const repoList = await fetchUserRepos(localConfig.token);
        setRepos(repoList);
      } catch (e) {
        console.warn('Could not fetch repos automatically:', e);
      } finally {
        setLoadingRepos(false);
      }
    } catch (err: any) {
      setStatus({
        success: false,
        message: err.message || 'Token tidak valid',
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:px-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
              <Github className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Pengaturan Integrasi GitHub</h2>
              <p className="text-[11px] text-slate-500">Simpan otomatis dokumen langsung ke repositori kode Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          
          {/* Info note */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-start gap-2.5">
            <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold block mb-0.5">Membutuhkan GitHub Personal Access Token (PAT)</span>
              Token digunakan langsung dari peramban Anda untuk melakukan commit dan push dokumen secara aman.
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=Term+Privacy+Generator"
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 font-semibold text-blue-700 underline"
              >
                <span>Buat Token di GitHub (Scope 'repo')</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Token field */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Personal Access Token (PAT)
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={localConfig.token}
                onChange={e => setLocalConfig({ ...localConfig, token: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
              <button
                type="button"
                onClick={handleTestToken}
                disabled={!localConfig.token.trim() || testing}
                className="px-3 py-2 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5 shrink-0"
              >
                {testing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>{testing ? 'Uji...' : 'Verifikasi'}</span>
              </button>
            </div>

            {status && (
              <div className={`mt-2 p-2 rounded-lg flex items-center gap-1.5 ${
                status.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {status.success ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />}
                <span>{status.message}</span>
              </div>
            )}
          </div>

          {/* Owner & Repo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Owner (User / Org)
              </label>
              <input
                type="text"
                value={localConfig.owner}
                onChange={e => setLocalConfig({ ...localConfig, owner: e.target.value })}
                placeholder="misal: abdurrohman"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Nama Repositori
              </label>
              {repos.length > 0 ? (
                <select
                  value={localConfig.repo}
                  onChange={e => setLocalConfig({ ...localConfig, repo: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">-- Pilih Repo --</option>
                  {repos.map(r => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={localConfig.repo}
                  onChange={e => setLocalConfig({ ...localConfig, repo: e.target.value })}
                  placeholder="misal: my-app"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              )}
            </div>
          </div>

          {/* Branch & Paths */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                value={localConfig.branch}
                onChange={e => setLocalConfig({ ...localConfig, branch: e.target.value })}
                placeholder="main"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="col-span-2">
              <label className="block font-medium text-slate-700 mb-1">
                Path Kebijakan Privasi
              </label>
              <input
                type="text"
                value={localConfig.privacyPath}
                onChange={e => setLocalConfig({ ...localConfig, privacyPath: e.target.value })}
                placeholder="PRIVACY_POLICY.md"
                className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Path Syarat & Ketentuan
            </label>
            <input
              type="text"
              value={localConfig.termsPath}
              onChange={e => setLocalConfig({ ...localConfig, termsPath: e.target.value })}
              placeholder="TERMS.md"
              className="w-full font-mono px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Auto Push checkbox */}
          <label className="flex items-center gap-2 p-2.5 rounded-lg border border-slate-200 bg-slate-50 cursor-pointer">
            <input
              type="checkbox"
              checked={localConfig.autoPushOnSave}
              onChange={e => setLocalConfig({ ...localConfig, autoPushOnSave: e.target.checked })}
              className="rounded text-slate-900 focus:ring-slate-900 h-4 w-4"
            />
            <span className="font-medium text-slate-800">
              Otomatis push commit ke GitHub setiap kali menyimpan di Firebase
            </span>
          </label>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-xl"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl shadow-xs"
          >
            Simpan Konfigurasi
          </button>
        </div>

      </div>
    </div>
  );
};
