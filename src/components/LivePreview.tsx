import React, { useState } from 'react';
import { 
  FileText, 
  Code2, 
  Eye, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Printer,
  Sparkles,
  Share2
} from 'lucide-react';
import { GeneratedLinksCard } from './GeneratedLinksCard';
import confetti from 'canvas-confetti';

interface LivePreviewProps {
  appName: string;
  companyName: string;
  privacyMarkdown: string;
  privacyHtml: string;
  termsMarkdown: string;
  termsHtml: string;
  onSaveToFirebase: () => Promise<string | undefined>;
  currentDocId: string | null;
  onOpenPublicView: (docId: string, docType: 'privacy' | 'terms') => void;
  hasGenerated: boolean;
  onGenerate: () => void;
  isFormComplete: boolean;
  activeDocMode?: 'terms' | 'privacy' | 'both';
}

export const LivePreview: React.FC<LivePreviewProps> = ({
  appName,
  companyName,
  privacyMarkdown,
  privacyHtml,
  termsMarkdown,
  termsHtml,
  onSaveToFirebase,
  currentDocId,
  onOpenPublicView,
  hasGenerated,
  onGenerate,
  isFormComplete,
  activeDocMode = 'both',
}) => {
  // If user selected 'terms', default to 'terms'; otherwise 'privacy'
  const [docType, setDocType] = useState<'privacy' | 'terms'>(() => {
    return activeDocMode === 'terms' ? 'terms' : 'privacy';
  });
  const [viewFormat, setViewFormat] = useState<'preview' | 'markdown' | 'html'>('preview');
  const [copied, setCopied] = useState(false);

  const currentMarkdown = docType === 'privacy' ? privacyMarkdown : termsMarkdown;
  const currentHtml = docType === 'privacy' ? privacyHtml : termsHtml;
  const company = companyName.trim() || appName.trim() || 'Perusahaan';

  const handleCopy = () => {
    const textToCopy = viewFormat === 'html' ? currentHtml : currentMarkdown;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const filename = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${docType}.html`;
    const blob = new Blob([currentHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    confetti({ particleCount: 30, spread: 60, origin: { y: 0.7 } });
  };

  const handleDownloadMarkdown = () => {
    const filename = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${docType}.md`;
    const blob = new Blob([currentMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintPdf = () => {
    // If docId exists, open public view and print, or print iframe
    const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement | null;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } else {
      window.print();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      
      {/* Top Header Toolbar */}
      <div className="border-b border-slate-200 bg-slate-50/90 p-3 sm:px-4 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Document Selector (Privacy vs Terms) */}
        <div className="flex bg-slate-200/80 p-0.5 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setDocType('terms')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              docType === 'terms'
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Terms & Services
          </button>
          <button
            onClick={() => setDocType('privacy')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              docType === 'privacy'
                ? 'bg-white text-blue-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Privacy Policy
          </button>
        </div>

        {/* View Format Switcher */}
        <div className="flex items-center gap-1 bg-white border border-slate-200 p-0.5 rounded-xl text-xs">
          <button
            onClick={() => setViewFormat('preview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewFormat === 'preview'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Pratinjau Halaman"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Pratinjau</span>
          </button>

          <button
            onClick={() => setViewFormat('markdown')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewFormat === 'markdown'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Format Markdown"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>.md</span>
          </button>

          <button
            onClick={() => setViewFormat('html')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all ${
              viewFormat === 'html'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Format HTML"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>.html</span>
          </button>
        </div>

        {/* Export & Save Actions (PDF, HTML, Copy, Open) */}
        <div className="flex items-center gap-1.5">
          {/* Print PDF */}
          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold transition-colors shadow-2xs"
            title="Simpan dokumen sebagai PDF / Cetak"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simpan PDF</span>
          </button>

          {/* Download HTML */}
          <button
            onClick={handleDownloadHtml}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
            title="Unduh berkas .html"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Unduh HTML</span>
          </button>

          {/* Copy Text */}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors shadow-2xs"
            title="Salin isi dokumen"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden lg:inline">{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Open Live Public Page */}
          {currentDocId && (
            <button
              onClick={() => onOpenPublicView(currentDocId, docType)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-blue-600 transition-colors shadow-2xs"
              title="Buka halaman publik yang siap dibaca oleh pengguna"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Buka Link</span>
            </button>
          )}
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
        
        {/* If Generated, show the requested Formatted Link Section */}
        {hasGenerated ? (
          <GeneratedLinksCard
            companyName={company}
            appName={appName}
            docId={currentDocId}
            onOpenPublicView={onOpenPublicView}
            onSaveIfNecessary={onSaveToFirebase}
            termsHtml={termsHtml}
            privacyHtml={privacyHtml}
          />
        ) : (
          <div className="mb-4 bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-800 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-amber-900">Dokumen Belum Di-generate</p>
              <p className="text-amber-700 mt-0.5">
                {isFormComplete 
                  ? 'Klik tombol "Generate Dokumen" untuk menerbitkan link dan file resmi.'
                  : 'Lengkapi data pada formulir di sebelah kiri untuk men-generate.'}
              </p>
            </div>
            {isFormComplete && (
              <button
                onClick={onGenerate}
                className="shrink-0 px-3 py-1.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate Sekarang</span>
              </button>
            )}
          </div>
        )}

        {/* Document Content View */}
        {viewFormat === 'preview' && (
          <div className="max-w-3xl mx-auto bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs text-slate-800 text-sm leading-relaxed">
            <iframe
              id="preview-iframe"
              title="Preview"
              srcDoc={currentHtml}
              className="w-full min-h-[550px] border-0 rounded-lg"
              sandbox="allow-same-origin allow-modals"
            />
          </div>
        )}

        {viewFormat === 'markdown' && (
          <div className="max-w-3xl mx-auto">
            <pre className="bg-slate-900 text-slate-100 p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-sm">
              {currentMarkdown}
            </pre>
          </div>
        )}

        {viewFormat === 'html' && (
          <div className="max-w-3xl mx-auto">
            <pre className="bg-slate-900 text-emerald-300 p-4 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed shadow-sm">
              {currentHtml}
            </pre>
          </div>
        )}

      </div>

    </div>
  );
};
