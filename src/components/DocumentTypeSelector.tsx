import React from 'react';
import { 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Layers, 
  CheckCircle2, 
  Sparkles,
  Scale,
  FolderHeart
} from 'lucide-react';

export type DocMode = 'terms' | 'privacy' | 'both';

interface DocumentTypeSelectorProps {
  onSelect: (mode: DocMode) => void;
  savedCount: number;
  onOpenSavedModal: () => void;
}

export const DocumentTypeSelector: React.FC<DocumentTypeSelectorProps> = ({
  onSelect,
  savedCount,
  onOpenSavedModal,
}) => {
  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      
      {/* Hero Title */}
      <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Generator Dokumen Hukum Digital</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
          Apa yang ingin Anda buat hari ini?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
          Pilih jenis dokumen hukum yang dibutuhkan untuk aplikasi atau website Anda. Dokumen dapat diunduh dalam format <strong>PDF</strong>, <strong>HTML</strong>, atau dibagikan melalui <strong>Link Publik</strong> resmi.
        </p>
      </div>

      {/* Choice Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        
        {/* CARD 1: Terms and Services */}
        <div 
          onClick={() => onSelect('terms')}
          className="group relative bg-white rounded-2xl border-2 border-slate-200/90 hover:border-indigo-500 p-6 sm:p-8 shadow-xs hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-xs">
              <Scale className="w-7 h-7" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-semibold mb-2">
              Aturan & Ketentuan Penggunaan
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              Terms and Services
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Mengatur syarat dan ketentuan resmi penggunaan aplikasi/website, tanggung jawab hukum pengguna, aturan akun, lisensi, hak cipta, dan mekanisme transaksi.
            </p>

            <ul className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Aturan pendaftaran & penghentian akun</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Ketentuan pembelian digital & langganan</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Batasan tanggung jawab & yurisdiksi hukum</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 group-hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Buat Terms and Services</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* CARD 2: Privacy Policy */}
        <div 
          onClick={() => onSelect('privacy')}
          className="group relative bg-white rounded-2xl border-2 border-slate-200/90 hover:border-blue-500 p-6 sm:p-8 shadow-xs hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="inline-block px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
              Perlindungan Data Pribadi
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
              Privacy Policy
            </h3>

            <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
              Menerangkan jenis data pribadi apa saja yang dikumpulkan, bagaimana data diproses, izin perangkat yang digunakan, dan hak privasi pengguna sesuai regulasi.
            </p>

            <ul className="mt-5 space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Daftar data pribadi & izin perangkat</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Pencantuman SDK & Layanan Pihak Ketiga</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Kepatuhan GDPR, CCPA, Cookie, & Perlindungan Anak</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100">
            <button
              type="button"
              className="w-full py-3 px-4 rounded-xl bg-blue-600 group-hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>Buat Privacy Policy</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* Alternative Options Footer */}
      <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-4">
        <button
          onClick={() => onSelect('both')}
          className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Ingin membuat keduanya sekaligus? <strong>Pilih Paket Lengkap</strong></span>
        </button>

        {savedCount > 0 && (
          <button
            onClick={onOpenSavedModal}
            className="text-xs text-slate-600 hover:text-slate-900 font-medium inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <FolderHeart className="w-3.5 h-3.5 text-rose-500" />
            <span>Buka Dokumen Tersimpan ({savedCount})</span>
          </button>
        )}
      </div>

    </div>
  );
};
