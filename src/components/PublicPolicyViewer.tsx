import React, { useState } from 'react';
import { SavedPolicyDoc } from '../types/policy';
import { 
  ShieldCheck, 
  FileText, 
  Printer, 
  Check, 
  ArrowLeft, 
  Download, 
  Copy, 
  ExternalLink,
  Calendar,
  Building,
  User as UserIcon,
  Globe,
  Share2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface PublicPolicyViewerProps {
  policy: SavedPolicyDoc;
  initialType?: 'privacy' | 'terms';
  onBack?: () => void;
  isStandalone?: boolean;
}

export const PublicPolicyViewer: React.FC<PublicPolicyViewerProps> = ({
  policy,
  initialType = 'privacy',
  onBack,
  isStandalone = false,
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>(initialType);
  const [copiedLink, setCopiedLink] = useState(false);

  const appTitle = policy.formData?.appName?.trim() || policy.title || 'Aplikasi';
  const company = policy.formData?.developerName?.trim() || appTitle;
  const currentTitle = activeTab === 'privacy' 
    ? `Privacy Policy ${appTitle}` 
    : `Terms and Services ${appTitle}`;

  const currentHtml = activeTab === 'privacy' ? policy.privacyHtml : policy.termsHtml;
  const currentMarkdown = activeTab === 'privacy' ? policy.privacyMarkdown : policy.termsMarkdown;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownloadHtml = () => {
    const filename = `${policy.formData?.appName?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'doc'}-${activeTab}.html`;
    const blob = new Blob([currentHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans print:bg-white print:text-black">
      
      {/* Top Bar for Web View (Hidden when printing) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
                title="Kembali ke Generator"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Generator</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {activeTab === 'privacy' ? <ShieldCheck className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
              </div>
              <div>
                <h1 className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                  {currentTitle}
                </h1>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Dokumen Resmi &bull; {policy.formData?.appName}
                </p>
              </div>
            </div>
          </div>

          {/* Document Tabs */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'terms'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terms & Services
            </button>
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'privacy'
                  ? 'bg-white text-blue-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Privacy Policy
            </button>
          </div>

          {/* Action buttons (Print PDF, Download HTML, Copy Link) */}
          <div className="flex items-center gap-2">
            
            {/* Print / Save as PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Cetak atau Simpan sebagai PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Simpan PDF</span>
            </button>

            {/* Download HTML */}
            <button
              onClick={handleDownloadHtml}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
              title="Unduh berkas .html"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Unduh HTML</span>
            </button>

            {/* Copy Link */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors"
              title="Salin Tautan Halaman Ini"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Document Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 print:p-0 print:max-w-none">
        
        {/* Document Metadata Card */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs mb-6 print:border-b print:border-slate-300 print:shadow-none print:rounded-none print:p-0 print:mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 print:border-none print:pb-2">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-bold mb-2 print:border print:border-slate-300">
                Dokumen Hukum Resmi
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {currentTitle}
              </h2>
              <p className="text-sm font-semibold text-slate-600 mt-1">
                Layanan / Aplikasi: <span className="text-slate-900 font-bold">{policy.formData?.appName}</span>
              </p>
            </div>

            <div className="text-xs text-slate-500 space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-100 print:bg-transparent print:border-none print:p-0">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Mulai Berlaku: <strong>{policy.formData?.effectiveDate || 'Hari ini'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>Yurisdiksi: <strong>{policy.formData?.governingCountry || 'Indonesia'}</strong></span>
              </div>
              {policy.formData?.contactEmail && (
                <div className="truncate">
                  Kontak: <a href={`mailto:${policy.formData?.contactEmail}`} className="text-blue-600 underline font-medium">{policy.formData?.contactEmail}</a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rendered Document Body */}
        <div className="bg-white p-6 sm:p-12 rounded-2xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0">
          <iframe
            title={currentTitle}
            srcDoc={currentHtml}
            className="w-full min-h-[800px] border-0 print:hidden"
            sandbox="allow-same-origin"
          />
          {/* Fallback printable direct container for window.print() */}
          <div 
            className="hidden print:block prose prose-slate max-w-none text-black text-sm"
            dangerouslySetInnerHTML={{ __html: currentHtml }}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400 print:hidden">
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} {company}. Semua hak dilindungi.</span>
          <span>Diterbitkan via Term & Privacy Policy Generator</span>
        </div>
      </footer>

    </div>
  );
};
