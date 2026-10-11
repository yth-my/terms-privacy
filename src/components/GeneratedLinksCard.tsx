import React, { useState, useEffect } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  FileText, 
  Shield, 
  FolderCheck, 
  Download, 
  Code, 
  RefreshCw,
  Globe
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateAppSlug } from '../lib/slug';
import { saveHtmlToPublicFolder } from '../lib/publicStorage';

interface GeneratedLinksCardProps {
  companyName: string;
  appName: string;
  docId: string | null;
  onOpenPublicView: (docId: string, docType: 'privacy' | 'terms') => void;
  onSaveIfNecessary: () => Promise<string | undefined>;
  termsHtml?: string;
  privacyHtml?: string;
}

export const GeneratedLinksCard: React.FC<GeneratedLinksCardProps> = ({
  companyName,
  appName,
  docId,
  onOpenPublicView,
  onSaveIfNecessary,
  termsHtml = '',
  privacyHtml = '',
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isSavedToPublic, setIsSavedToPublic] = useState(false);
  const [isSavingPublic, setIsSavingPublic] = useState(false);

  // Fallback target names
  const targetAppName = appName.trim() || 'Aplikasi';
  const slug = generateAppSlug(targetAppName);

  // Official production URL domain (guarantees https://terms-privacy-generator.web.app)
  const getHttpsBaseUrl = () => {
    if (typeof window === 'undefined') return 'https://terms-privacy-generator.web.app';
    const host = window.location.host;
    if (host.includes('run.app') || host.includes('localhost') || host.includes('127.0.0.1')) {
      return 'https://terms-privacy-generator.web.app';
    }
    return `https://${host}`;
  };

  const baseUrl = getHttpsBaseUrl();

  // 1. Dynamic Public Viewer URLs (App routing)
  const termsLabel = `Terms and Services ${targetAppName}`;
  const privacyLabel = `Privacy Policy ${targetAppName}`;
  const termsAppUrl = `${baseUrl}/?app=${slug}&view=terms`;
  const privacyAppUrl = `${baseUrl}/?app=${slug}&view=privacy`;

  // 2. Direct Static HTML filenames in /public folder
  const termsHtmlFileName = `${slug}-terms.html`;
  const privacyHtmlFileName = `${slug}-privacy.html`;
  const defaultHtmlFileName = `${slug}.html`;

  // Direct URLs to files in /public folder
  const directTermsHtmlUrl = `${baseUrl}/${termsHtmlFileName}`;
  const directPrivacyHtmlUrl = `${baseUrl}/${privacyHtmlFileName}`;
  const publicFolderTermsUrl = `${baseUrl}/public/${termsHtmlFileName}`;
  const publicFolderPrivacyUrl = `${baseUrl}/public/${privacyHtmlFileName}`;

  // Automatically save to /public folder when data is available
  useEffect(() => {
    if (targetAppName && (termsHtml || privacyHtml)) {
      setIsSavingPublic(true);
      saveHtmlToPublicFolder(targetAppName, termsHtml, privacyHtml)
        .then(res => {
          if (res && res.success) {
            setIsSavedToPublic(true);
          }
        })
        .finally(() => {
          setIsSavingPublic(false);
        });
    }
  }, [targetAppName, termsHtml, privacyHtml]);

  const handleManualSaveToPublic = async () => {
    setIsSavingPublic(true);
    const res = await saveHtmlToPublicFolder(targetAppName, termsHtml, privacyHtml);
    setIsSavingPublic(false);
    if (res && res.success) {
      setIsSavedToPublic(true);
      confetti({ particleCount: 35, spread: 60, origin: { y: 0.8 } });
      setTimeout(() => setIsSavedToPublic(false), 4000);
    }
  };

  const copyToClipboard = async (type: string, text: string) => {
    if (!docId) {
      await onSaveIfNecessary();
    }
    await navigator.clipboard.writeText(text);
    setCopiedType(type);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopiedType(null), 2500);
  };

  const downloadHtmlFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  return (
    <div className="space-y-4 mb-6">

      {/* SECTION 1: PUBLIC FOLDER STATIC HTML FILES (NEW - REQUESTED) */}
      <div className="bg-gradient-to-br from-emerald-50/90 via-teal-50/80 to-white border-2 border-emerald-300/80 rounded-2xl p-4 sm:p-5 shadow-xs">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-emerald-200/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <FolderCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                  Penyimpanan Berkas .HTML di Folder <span className="font-mono bg-emerald-100/90 text-emerald-800 px-1.5 py-0.5 rounded text-xs">/public</span>
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Berkas HTML statis tersimpan dengan nama aplikasi: <strong className="text-emerald-800">{targetAppName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleManualSaveToPublic}
              disabled={isSavingPublic}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors disabled:opacity-50"
              title="Perbarui file di folder /public"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSavingPublic ? 'animate-spin' : ''}`} />
              <span>{isSavingPublic ? 'Menyimpan...' : 'Simpan ke /public'}</span>
            </button>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Siap Dipanggil</span>
            </span>
          </div>
        </div>

        {/* 2 Cards for static HTML in /public */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* CARD A: [nama-aplikasi]-terms.html */}
          <div className="bg-white rounded-xl p-4 border border-emerald-200/90 shadow-2xs hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{termsHtmlFileName}</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  HTML Statis
                </span>
              </div>

              {/* Path & URL */}
              <div className="space-y-1.5 mb-3">
                <div className="text-[11px] text-slate-500 font-medium">URL Pemanggilan:</div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-[11px] text-slate-800 break-all select-all font-semibold">
                  {directTermsHtmlUrl}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Path alternatif: <span className="text-emerald-700 select-all">{publicFolderTermsUrl}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              {/* Buka file HTML */}
              <a
                href={`/${termsHtmlFileName}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[90px] flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs text-center"
              >
                <span>Buka .HTML</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Unduh file HTML */}
              <button
                onClick={() => downloadHtmlFile(termsHtmlFileName, termsHtml)}
                className="flex items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                title="Unduh berkas .html ke komputer Anda"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh</span>
              </button>

              {/* Salin URL */}
              <button
                onClick={() => copyToClipboard('direct-terms', directTermsHtmlUrl)}
                className="flex items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                title="Salin URL berkas .html"
              >
                {copiedType === 'direct-terms' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedType === 'direct-terms' ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </div>
          </div>

          {/* CARD B: [nama-aplikasi]-privacy.html */}
          <div className="bg-white rounded-xl p-4 border border-emerald-200/90 shadow-2xs hover:border-emerald-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{privacyHtmlFileName}</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  HTML Statis
                </span>
              </div>

              {/* Path & URL */}
              <div className="space-y-1.5 mb-3">
                <div className="text-[11px] text-slate-500 font-medium">URL Pemanggilan:</div>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-[11px] text-slate-800 break-all select-all font-semibold">
                  {directPrivacyHtmlUrl}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Path alternatif: <span className="text-emerald-700 select-all">{publicFolderPrivacyUrl}</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
              {/* Buka file HTML */}
              <a
                href={`/${privacyHtmlFileName}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 min-w-[90px] flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-2xs text-center"
              >
                <span>Buka .HTML</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              {/* Unduh file HTML */}
              <button
                onClick={() => downloadHtmlFile(privacyHtmlFileName, privacyHtml)}
                className="flex items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                title="Unduh berkas .html ke komputer Anda"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Unduh</span>
              </button>

              {/* Salin URL */}
              <button
                onClick={() => copyToClipboard('direct-privacy', directPrivacyHtmlUrl)}
                className="flex items-center gap-1 text-xs font-semibold py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
                title="Salin URL berkas .html"
              >
                {copiedType === 'direct-privacy' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{copiedType === 'direct-privacy' ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* SECTION 2: TAUTAN RESMI APLIKASI WEB LIVE */}
      <div className="bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-slate-50 border-2 border-blue-200/90 rounded-2xl p-4 sm:p-5 shadow-xs">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 pb-3 border-b border-blue-200/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight">
                Tautan Halaman Pembaca Resmi ({targetAppName})
              </h3>
              <p className="text-xs text-slate-500">
                Tautan tampilan resmi lengkap dengan navigasi tab dan tombol cetak PDF
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 w-fit">
            <Globe className="w-3 h-3 text-blue-500" />
            <span>HTTPS Live Viewer</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card: Terms Live Viewer */}
          <div className="bg-white rounded-xl p-3.5 border border-indigo-200 shadow-2xs hover:border-indigo-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                  <FileText className="w-3.5 h-3.5" />
                  {termsLabel}
                </span>
                <button
                  onClick={() => onOpenPublicView(slug, 'terms')}
                  className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md hover:bg-indigo-50 transition-colors"
                  title="Buka tampilan dokumen yang telah tergenerate"
                >
                  <span>Buka Viewer</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-[11px] text-slate-800 break-all select-all mb-2.5">
                {termsAppUrl}
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
              <button
                onClick={() => copyToClipboard('terms-url', termsAppUrl)}
                className="flex-1 flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              >
                {copiedType === 'terms-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'terms-url' ? 'Tersalin' : 'Salin Link'}</span>
              </button>
              <button
                onClick={() => copyToClipboard('terms-full', `${termsLabel}: ${termsAppUrl}`)}
                className="text-[11px] font-semibold py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                title="Salin judul + link"
              >
                Format Teks
              </button>
            </div>
          </div>

          {/* Card: Privacy Live Viewer */}
          <div className="bg-white rounded-xl p-3.5 border border-blue-200 shadow-2xs hover:border-blue-400 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
                  <Shield className="w-3.5 h-3.5" />
                  {privacyLabel}
                </span>
                <button
                  onClick={() => onOpenPublicView(slug, 'privacy')}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-semibold px-2 py-0.5 rounded-md hover:bg-blue-50 transition-colors"
                  title="Buka tampilan dokumen yang telah tergenerate"
                >
                  <span>Buka Viewer</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono text-[11px] text-slate-800 break-all select-all mb-2.5">
                {privacyAppUrl}
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-1 border-t border-slate-100">
              <button
                onClick={() => copyToClipboard('privacy-url', privacyAppUrl)}
                className="flex-1 flex items-center justify-center gap-1 text-xs font-bold py-1.5 px-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                {copiedType === 'privacy-url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedType === 'privacy-url' ? 'Tersalin' : 'Salin Link'}</span>
              </button>
              <button
                onClick={() => copyToClipboard('privacy-full', `${privacyLabel}: ${privacyAppUrl}`)}
                className="text-[11px] font-semibold py-1.5 px-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
                title="Salin judul + link"
              >
                Format Teks
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
