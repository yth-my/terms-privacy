import React, { useState } from 'react';
import { 
  PolicyFormData, 
  ThirdPartyService, 
  AppType, 
  Platform, 
  EntityType
} from '../types/policy';
import { 
  Smartphone, 
  Shield, 
  Layers, 
  Scale, 
  Check, 
  Plus, 
  Trash2, 
  Sparkles,
  AlertCircle,
  ArrowLeft,
  FileText,
  CreditCard,
  UserCheck
} from 'lucide-react';
import { DocMode } from './DocumentTypeSelector';

interface PolicyFormProps {
  formData: PolicyFormData;
  onChange: (data: PolicyFormData) => void;
  onGenerate: () => void;
  isFormComplete: boolean;
  hasGenerated: boolean;
  docMode: DocMode;
  onBackToSelector: () => void;
}

export const PolicyForm: React.FC<PolicyFormProps> = ({
  formData,
  onChange,
  onGenerate,
  isFormComplete,
  hasGenerated,
  docMode,
  onBackToSelector,
}) => {
  // Determine initial tab based on docMode
  const [activeTab, setActiveTab] = useState<string>('app');
  const [customThirdPartyName, setCustomThirdPartyName] = useState('');
  const [customThirdPartyUrl, setCustomThirdPartyUrl] = useState('');

  // Field updater
  const updateField = <K extends keyof PolicyFormData>(key: K, value: PolicyFormData[K]) => {
    onChange({
      ...formData,
      [key]: value,
    });
  };

  const updateCollectedData = (key: keyof PolicyFormData['collectedDataTypes'], checked: boolean) => {
    onChange({
      ...formData,
      collectedDataTypes: {
        ...formData.collectedDataTypes,
        [key]: checked,
      },
    });
  };

  const toggleThirdParty = (id: string) => {
    const updated = formData.thirdPartyServices.map(service => 
      service.id === id ? { ...service, selected: !service.selected } : service
    );
    onChange({
      ...formData,
      thirdPartyServices: updated,
    });
  };

  const addCustomThirdParty = () => {
    if (!customThirdPartyName.trim() || !customThirdPartyUrl.trim()) return;
    onChange({
      ...formData,
      customThirdParties: [
        ...formData.customThirdParties,
        {
          name: customThirdPartyName.trim(),
          privacyUrl: customThirdPartyUrl.trim(),
        },
      ],
    });
    setCustomThirdPartyName('');
    setCustomThirdPartyUrl('');
  };

  const removeCustomThirdParty = (index: number) => {
    const updated = [...formData.customThirdParties];
    updated.splice(index, 1);
    onChange({
      ...formData,
      customThirdParties: updated,
    });
  };

  const appTypes: AppType[] = ['Free', 'Ad-Supported', 'Freemium', 'Commercial', 'Open Source'];
  const platforms: Platform[] = ['Android', 'iOS', 'Web', 'Desktop', 'Cross-platform'];

  // Missing fields calculation
  const missingFields: string[] = [];
  if (!formData.appName.trim()) missingFields.push('Nama Aplikasi/Website');
  if (!formData.developerName.trim()) missingFields.push('Nama Perusahaan/Pengembang');
  if (!formData.contactEmail.trim()) missingFields.push('Email Kontak');

  const company = formData.developerName.trim() || formData.appName.trim() || 'Perusahaan';
  const modeTitle = docMode === 'terms' 
    ? 'Terms and Services' 
    : docMode === 'privacy' 
    ? 'Privacy Policy' 
    : 'Terms & Privacy Policy';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      
      {/* Top Document Mode Banner with Switch Option */}
      <div className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onBackToSelector}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-300 hover:text-white transition-colors flex items-center gap-1"
            title="Ganti jenis dokumen"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="text-[11px]">Ganti Dokumen</span>
          </button>
          <span className="text-slate-500">|</span>
          <span className="font-semibold text-slate-200">
            Membuat: <span className="text-emerald-400 font-bold">{modeTitle}</span>
          </span>
        </div>

        <span className="text-[11px] text-slate-400 hidden sm:inline">
          {company}
        </span>
      </div>

      {/* Tab Navigation tailored to DocMode */}
      <div className="flex border-b border-slate-200 bg-slate-50/80 px-2 pt-2 overflow-x-auto no-scrollbar">
        
        {/* Tab 1: App Info (Always visible) */}
        <button
          onClick={() => setActiveTab('app')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'app'
              ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Informasi Dasar</span>
        </button>

        {/* If Privacy or Both: Data & Izin */}
        {(docMode === 'privacy' || docMode === 'both') && (
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === 'data'
                ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Data & Izin</span>
          </button>
        )}

        {/* If Privacy or Both: Third Parties */}
        {(docMode === 'privacy' || docMode === 'both') && (
          <button
            onClick={() => setActiveTab('thirdparty')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === 'thirdparty'
                ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Pihak Ketiga</span>
          </button>
        )}

        {/* If Terms: Rules & Accounts */}
        {(docMode === 'terms' || docMode === 'both') && (
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-white text-indigo-600 border-t-2 border-t-indigo-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Aturan Akun & Pakai</span>
          </button>
        )}

        {/* Compliance / Legal Tab */}
        <button
          onClick={() => setActiveTab('compliance')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-xl transition-all whitespace-nowrap ${
            activeTab === 'compliance'
              ? 'bg-white text-blue-600 border-t-2 border-t-blue-600 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>Kepatuhan Hukum</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-1 text-slate-800 space-y-6">

        {/* TAB 1: INFORMASI DASAR */}
        {activeTab === 'app' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Detail Aplikasi & Pengembang</h3>
              <p className="text-xs text-slate-500">
                Data resmi ini akan tercantum di dokumen {modeTitle}.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Aplikasi / Website <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.appName}
                  onChange={e => updateField('appName', e.target.value)}
                  placeholder="Contoh: MyFintech App"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nama Perusahaan / Pengembang <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.developerName}
                  onChange={e => updateField('developerName', e.target.value)}
                  placeholder="Contoh: PT Solusi Digital Indonesia"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email Kontak Bantuan <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => updateField('contactEmail', e.target.value)}
                  placeholder="legal@domainanda.com"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipe Entitas Hukum
                </label>
                <select
                  value={formData.entityType}
                  onChange={e => updateField('entityType', e.target.value as EntityType)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Company">Perusahaan / Badan Usaha (PT / CV / Firma)</option>
                  <option value="Individual">Pengembang Perorangan (Individu)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Situs Web Resmi (Opsional)
                </label>
                <input
                  type="url"
                  value={formData.websiteUrl || ''}
                  onChange={e => updateField('websiteUrl', e.target.value)}
                  placeholder="https://domainanda.com"
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tanggal Berlaku
                </label>
                <input
                  type="date"
                  value={formData.effectiveDate}
                  onChange={e => updateField('effectiveDate', e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200">
              <label className="block text-xs font-medium text-slate-700 mb-2">Model Layanan</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {appTypes.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateField('appType', type)}
                    className={`py-1.5 px-2 text-xs rounded-xl font-medium border text-center transition-all ${
                      formData.appType === type
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-2xs font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-2">Platform Sistem</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {platforms.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => updateField('platform', p)}
                    className={`py-1.5 px-2 text-xs rounded-xl font-medium border text-center transition-all ${
                      formData.platform === p
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-2xs font-semibold'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Yurisdiksi Wilayah Hukum
              </label>
              <input
                type="text"
                value={formData.governingCountry}
                onChange={e => updateField('governingCountry', e.target.value)}
                placeholder="Indonesia"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* TAB 2: DATA & IZIN (PRIVACY) */}
        {activeTab === 'data' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Data Pengguna & Izin Akses</h3>
              <p className="text-xs text-slate-500">Pilih jenis data pribadi apa saja yang diakses atau disimpan oleh layanan Anda.</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.collectsPersonalData}
                  onChange={e => updateField('collectsPersonalData', e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-xs font-medium text-slate-800">
                  Layanan mengumpulkan / memproses data pribadi pengguna
                </span>
              </label>
            </div>

            {formData.collectsPersonalData && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-800">Pilih Data yang Diambil:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { key: 'name', label: 'Nama Lengkap / Akun' },
                    { key: 'email', label: 'Alamat Email' },
                    { key: 'phone', label: 'Nomor Telepon' },
                    { key: 'address', label: 'Alamat Domisili' },
                    { key: 'location', label: 'Lokasi Geografis (GPS)' },
                    { key: 'camera', label: 'Akses Kamera & Foto' },
                    { key: 'storage', label: 'Penyimpanan File / Dokumen' },
                    { key: 'contacts', label: 'Buku Kontak Telepon' },
                    { key: 'deviceId', label: 'ID Perangkat / Device UUID' },
                    { key: 'ipAddress', label: 'Alamat IP & Riwayat Log' },
                    { key: 'financial', label: 'Data Finansial / Pembayaran' },
                  ].map(item => (
                    <label
                      key={item.key}
                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                        formData.collectedDataTypes[item.key as keyof PolicyFormData['collectedDataTypes']]
                          ? 'border-blue-500 bg-blue-50/70 text-blue-900 font-medium'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.collectedDataTypes[item.key as keyof PolicyFormData['collectedDataTypes']]}
                        onChange={e => updateCollectedData(item.key as keyof PolicyFormData['collectedDataTypes'], e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PIHAK KETIGA (PRIVACY) */}
        {activeTab === 'thirdparty' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Integrasi Layanan Pihak Ketiga (SDK & API)</h3>
              <p className="text-xs text-slate-500">Pilih layanan eksternal yang diintegrasikan ke dalam sistem Anda.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {formData.thirdPartyServices.map(service => (
                <div
                  key={service.id}
                  onClick={() => toggleThirdParty(service.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                    service.selected
                      ? 'border-blue-600 bg-blue-50/70 text-blue-950 font-medium shadow-2xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={service.selected}
                      onChange={() => {}}
                      className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5 shrink-0"
                    />
                    <div>
                      <div className="font-semibold text-slate-900">{service.name}</div>
                      <div className="text-[10px] text-slate-500 capitalize">{service.category}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Custom Third Parties */}
            <div className="pt-2 border-t border-slate-200 space-y-2">
              <label className="block text-xs font-semibold text-slate-800">
                Tambah Layanan Tambahan Lainnya:
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Nama Layanan (Contoh: Midtrans)"
                  value={customThirdPartyName}
                  onChange={e => setCustomThirdPartyName(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300"
                />
                <input
                  type="url"
                  placeholder="URL Kebijakan Privasi"
                  value={customThirdPartyUrl}
                  onChange={e => setCustomThirdPartyUrl(e.target.value)}
                  className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300"
                />
                <button
                  type="button"
                  onClick={addCustomThirdParty}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 shrink-0"
                >
                  Tambah
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB: ATURAN AKUN & PAKAI (TERMS) */}
        {activeTab === 'rules' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Ketentuan Akun & Transaksi Pengguna</h3>
              <p className="text-xs text-slate-500">Atur batasan pendaftaran, keamanan kata sandi, dan transaksi digital.</p>
            </div>

            <div className="space-y-2.5">
              {[
                { 
                  key: 'userAccountsAllowed', 
                  title: 'Pendaftaran Akun Pengguna', 
                  desc: 'Pengguna dapat mendaftar akun dan wajib menjaga kerahasiaan kata sandi mereka.' 
                },
                { 
                  key: 'accountTerminationClause', 
                  title: 'Hak Penghentian / Pemblokiran Akun', 
                  desc: 'Pengembang berhak membekukan akun yang menyalahgunakan sistem atau melanggar aturan.' 
                },
                { 
                  key: 'hasInAppPurchases', 
                  title: 'Pembelian Item / Fitur Digital', 
                  desc: 'Menjelaskan ketentuan pembayaran resmi, konfirmasi tagihan, dan kebijakan non-refundable.' 
                },
                { 
                  key: 'hasSubscription', 
                  title: 'Layanan Berlangganan (Subscription)', 
                  desc: 'Pengguna dikenakan biaya berulang secara otomatis sampai langganan dibatalkan.' 
                },
                { 
                  key: 'arbitrationClause', 
                  title: 'Klausul Penyelesaian Sengketa & Arbitrase', 
                  desc: 'Perselisihan diselesaikan terlebih dahulu secara musyawarah sebelum proses hukum formal.' 
                },
              ].map(item => (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    formData[item.key as keyof PolicyFormData]
                      ? 'border-indigo-500 bg-indigo-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(formData[item.key as keyof PolicyFormData])}
                    onChange={e => updateField(item.key as keyof PolicyFormData, e.target.checked as any)}
                    className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 shrink-0"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* TAB: KEPATUHAN HUKUM (BOTH) */}
        {activeTab === 'compliance' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1">Standar Kepatuhan Hukum Global</h3>
              <p className="text-xs text-slate-500">Klausul perlindungan hak cipta dan kepatuhan standar internasional.</p>
            </div>

            <div className="space-y-2.5">
              {[
                { key: 'gdprCompliant', title: 'Kepatuhan Regulasi GDPR (Eropa)', desc: 'Menjamin hak akses, koreksi, dan penghapusan data pengguna.' },
                { key: 'ccpaCompliant', title: 'Kepatuhan CCPA / CPRA', desc: 'Hak pengguna untuk menolak penjualan informasi pribadi.' },
                { key: 'coppaCompliant', title: 'Perlindungan Anak di Bawah Umur (COPPA)', desc: 'Layanan tidak ditujukan secara sengaja untuk anak di bawah 13 tahun tanpa wali.' },
                { key: 'hasCookies', title: 'Kebijakan Penggunaan Cookie', desc: 'Memberitahukan penggunaan cookie sesi dan preferensi pelacak.' },
                { key: 'usesAI', title: 'Klausul Fitur Kecerdasan Buatan (AI)', desc: 'Transparansi pemrosesan input pengguna oleh model kecerdasan buatan.' },
              ].map(item => (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    formData[item.key as keyof PolicyFormData]
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(formData[item.key as keyof PolicyFormData])}
                    onChange={e => updateField(item.key as keyof PolicyFormData, e.target.checked as any)}
                    className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5 shrink-0"
                  />
                  <div>
                    <div className="font-semibold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Persistent Bottom Action Bar with Generate Button */}
      <div className="border-t border-slate-200 bg-slate-50 p-3 sm:p-4">
        {isFormComplete ? (
          <button
            type="button"
            onClick={onGenerate}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold text-xs sm:text-sm hover:from-blue-700 hover:to-indigo-800 transition-all shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transform active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>
              {hasGenerated 
                ? `Perbarui Dokumen & Tautan (${company})` 
                : `Generate ${modeTitle} (${company})`}
            </span>
          </button>
        ) : (
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              Lengkapi <strong>{missingFields.join(', ')}</strong> untuk mengaktifkan tombol Generate.
            </span>
          </div>
        )}
      </div>

    </div>
  );
};
