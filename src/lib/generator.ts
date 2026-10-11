import { PolicyFormData, ThirdPartyService } from '../types/policy';

export const DEFAULT_THIRD_PARTIES: ThirdPartyService[] = [
  {
    id: 'google-play-services',
    name: 'Google Play Services',
    category: 'backend',
    privacyUrl: 'https://policies.google.com/privacy',
    selected: true,
  },
  {
    id: 'admob',
    name: 'Google AdMob',
    category: 'ads',
    privacyUrl: 'https://support.google.com/admob/answer/6128543?hl=en',
    selected: false,
  },
  {
    id: 'firebase-analytics',
    name: 'Google Analytics for Firebase',
    category: 'analytics',
    privacyUrl: 'https://firebase.google.com/policies/analytics',
    selected: true,
  },
  {
    id: 'firebase-crashlytics',
    name: 'Firebase Crashlytics',
    category: 'monitoring',
    privacyUrl: 'https://firebase.google.com/support/privacy/',
    selected: false,
  },
  {
    id: 'meta-audience',
    name: 'Meta Audience Network (Facebook)',
    category: 'ads',
    privacyUrl: 'https://www.facebook.com/about/privacy/update/printable',
    selected: false,
  },
  {
    id: 'unity-ads',
    name: 'Unity Ads',
    category: 'ads',
    privacyUrl: 'https://unity.com/legal/game-player-and-app-user-privacy-policy',
    selected: false,
  },
  {
    id: 'onesignal',
    name: 'OneSignal (Push Notifications)',
    category: 'other',
    privacyUrl: 'https://onesignal.com/privacy_policy',
    selected: false,
  },
  {
    id: 'appsflyer',
    name: 'AppsFlyer',
    category: 'analytics',
    privacyUrl: 'https://www.appsflyer.com/legal/privacy-policy/',
    selected: false,
  },
  {
    id: 'stripe',
    name: 'Stripe (Payments)',
    category: 'payment',
    privacyUrl: 'https://stripe.com/privacy',
    selected: false,
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'backend',
    privacyUrl: 'https://supabase.com/privacy',
    selected: false,
  },
  {
    id: 'sentry',
    name: 'Sentry (Error Tracking)',
    category: 'monitoring',
    privacyUrl: 'https://sentry.io/privacy/',
    selected: false,
  },
  {
    id: 'mapbox',
    name: 'Mapbox',
    category: 'other',
    privacyUrl: 'https://www.mapbox.com/legal/privacy',
    selected: false,
  },
];

export const INITIAL_FORM_DATA: PolicyFormData = {
  appName: 'My Awesome App',
  developerName: 'Developer Name',
  entityType: 'Individual',
  contactEmail: 'support@example.com',
  websiteUrl: 'https://example.com',
  appType: 'Free',
  platform: 'Android',
  effectiveDate: new Date().toISOString().split('T')[0],
  governingCountry: 'Indonesia',

  collectsPersonalData: true,
  collectedDataTypes: {
    name: false,
    email: true,
    phone: false,
    address: false,
    location: false,
    camera: false,
    storage: false,
    contacts: false,
    deviceId: true,
    ipAddress: true,
    financial: false,
  },
  customDataCollected: '',

  thirdPartyServices: DEFAULT_THIRD_PARTIES,
  customThirdParties: [],

  gdprCompliant: true,
  ccpaCompliant: true,
  coppaCompliant: true,
  targetMinAge: 13,
  hasCookies: false,
  hasInAppPurchases: false,
  hasSubscription: false,
  usesAI: false,
  aiDataUsageDescription: '',

  userAccountsAllowed: true,
  accountTerminationClause: true,
  arbitrationClause: false,
};

/**
 * Helper to build list of collected personal data
 */
function getCollectedDataList(data: PolicyFormData): string[] {
  const items: string[] = [];
  if (data.collectedDataTypes.name) items.push('Nama Pengguna / Profil (Name)');
  if (data.collectedDataTypes.email) items.push('Alamat Email (Email address)');
  if (data.collectedDataTypes.phone) items.push('Nomor Telepon (Phone number)');
  if (data.collectedDataTypes.address) items.push('Alamat Fisik (Physical address)');
  if (data.collectedDataTypes.location) items.push('Informasi Lokasi Geografis (GPS & Geolocation data)');
  if (data.collectedDataTypes.camera) items.push('Kamera / Foto (Camera & Photos for uploading avatar or scanning)');
  if (data.collectedDataTypes.storage) items.push('Akses Penyimpanan File (Device Storage)');
  if (data.collectedDataTypes.contacts) items.push('Daftar Kontak (Address Book / Contacts)');
  if (data.collectedDataTypes.deviceId) items.push('Informasi Perangkat & Pengidentifikasi Unik (Device model, OS version, Unique Device IDs)');
  if (data.collectedDataTypes.ipAddress) items.push('Alamat Protokol Internet (IP Address & Log Data)');
  if (data.collectedDataTypes.financial) items.push('Informasi Pembayaran & Transaksi (Payment processing details)');

  if (data.customDataCollected && data.customDataCollected.trim()) {
    const customList = data.customDataCollected.split(',').map(s => s.trim()).filter(Boolean);
    items.push(...customList);
  }

  return items;
}

/**
 * Generate Privacy Policy in Markdown
 */
export function generatePrivacyPolicyMarkdown(data: PolicyFormData): string {
  const selectedThirdParties = [
    ...data.thirdPartyServices.filter(s => s.selected),
    ...data.customThirdParties.map(c => ({
      id: c.name.toLowerCase().replace(/\s+/g, '-'),
      name: c.name,
      category: 'other' as const,
      privacyUrl: c.privacyUrl,
      selected: true,
    }))
  ];

  const collectedData = getCollectedDataList(data);
  const developerDesc = data.entityType === 'Company' 
    ? `oleh **${data.developerName}** (sebagai Perusahaan)` 
    : `oleh **${data.developerName}** (sebagai Pengembang Perorangan)`;

  let md = `# Kebijakan Privasi (Privacy Policy) untuk ${data.appName}\n\n`;
  md += `**Tanggal Berlaku:** ${data.effectiveDate}\n\n`;
  md += `Kebijakan Privasi ini menjelaskan bagaimana aplikasi **${data.appName}** ("Aplikasi", "Layanan", atau "Kami"), yang dikembangkan ${developerDesc}, mengumpulkan, menggunakan, dan melindungi informasi pribadi pengguna ("Pengguna" atau "Anda").\n\n`;
  md += `Dengan mengunduh, mengakses, atau menggunakan Aplikasi ini, Anda menyetujui pengumpulan dan penggunaan informasi sebagaimana diatur dalam Kebijakan Privasi ini. Jika Anda tidak menyetujui ketentuan ini, mohon untuk tidak menggunakan Layanan Kami.\n\n`;

  // 1. Informasi yang Dikumpulkan
  md += `## 1. Informasi yang Kami Kumpulkan\n\n`;
  if (!data.collectsPersonalData && collectedData.length === 0) {
    md += `Aplikasi ini tidak secara langsung meminta atau menyimpan data pribadi Anda di server kami. Namun, data diagnostik dan teknis standar mungkin diproses melalui sistem operasi perangkat atau layanan pihak ketiga yang digunakan.\n\n`;
  } else {
    md += `Untuk memberikan pengalaman yang optimal, Aplikasi dapat mengumpulkan jenis informasi berikut saat Anda menggunakan Layanan kami:\n\n`;
    collectedData.forEach(item => {
      md += `- ${item}\n`;
    });
    md += `\nInformasi yang kami minta akan disimpan di perangkat Anda atau server aman kami dan digunakan sebagaimana dijelaskan dalam kebijakan ini.\n\n`;
  }

  // Log data
  md += `### Data Log & Teknis\n`;
  md += `Setiap kali Anda menggunakan Layanan kami, jika terjadi kesalahan pada aplikasi, kami dapat mengumpulkan data dan informasi (melalui produk pihak ketiga) di ponsel Anda yang disebut Log Data. Data Log ini dapat mencakup informasi seperti alamat Protokol Internet ("IP") perangkat Anda, nama perangkat, versi sistem operasi, konfigurasi aplikasi saat menggunakan Layanan kami, waktu dan tanggal penggunaan Layanan oleh Anda, serta statistik lainnya.\n\n`;

  // Cookies
  if (data.hasCookies) {
    md += `## 2. Cookies dan Teknologi Pelacakan\n\n`;
    md += `Cookies adalah berkas dengan sejumlah kecil data yang umumnya digunakan sebagai pengidentifikasi unik anonim. Berkas ini dikirim ke peramban Anda dari situs web yang Anda kunjungi dan disimpan di memori internal perangkat Anda.\n\n`;
    md += `Layanan ini secara eksplisit dapat menggunakan "cookies" ini untuk menyimpan sesi login dan preferensi Anda. Anda memiliki opsi untuk menerima atau menolak cookies ini dan mengetahui kapan cookie dikirim ke perangkat Anda.\n\n`;
  }

  // 3. Layanan Pihak Ketiga
  md += `## ${data.hasCookies ? '3' : '2'}. Penyedia Layanan Pihak Ketiga\n\n`;
  if (selectedThirdParties.length === 0) {
    md += `Aplikasi ini tidak menggunakan layanan pihak ketiga yang mengumpulkan informasi pengenal pribadi pengguna.\n\n`;
  } else {
    md += `Kami dapat mempekerjakan perusahaan dan individu pihak ketiga karena alasan berikut:\n`;
    md += `- Memfasilitasi Layanan kami;\n`;
    md += `- Menyediakan Layanan atas nama kami;\n`;
    md += `- Melakukan layanan terkait Layanan (seperti analitik, jaringan iklan, atau pemrosesan pembayaran); atau\n`;
    md += `- Membantu kami dalam menganalisis bagaimana Layanan kami digunakan.\n\n`;
    md += `Pihak ketiga ini memiliki akses ke Informasi Pribadi Anda hanya untuk melakukan tugas yang diberikan kepada mereka atas nama kami dan diwajibkan untuk tidak mengungkapkan atau menggunakannya untuk tujuan lain.\n\n`;
    md += `Tautan ke kebijakan privasi penyedia layanan pihak ketiga yang digunakan oleh aplikasi:\n\n`;
    selectedThirdParties.forEach(tp => {
      md += `- [${tp.name}](${tp.privacyUrl})\n`;
    });
    md += `\n`;
  }

  // AI disclosure
  if (data.usesAI) {
    md += `## Fitur Kecerdasan Buatan (Artificial Intelligence / AI)\n\n`;
    md += `Aplikasi ini mengintegrasikan teknologi Kecerdasan Buatan (AI) atau Pembelajaran Mesin untuk memproses permintaan pengguna. ${data.aiDataUsageDescription || 'Data atau input teks/media yang Anda masukkan untuk fitur AI dapat diproses secara real-time dan tidak digunakan untuk melatih model publik tanpa izin eksplisit dari Anda.'}\n\n`;
  }

  // Security
  const secNum = data.hasCookies ? '4' : '3';
  md += `## ${secNum}. Keamanan Data\n\n`;
  md += `Kami sangat menghargai kepercayaan Anda dalam memberikan Informasi Pribadi Anda kepada kami, oleh karena itu kami berusaha untuk menggunakan cara yang dapat diterima secara komersial untuk melindunginya. Namun ingat bahwa tidak ada metode transmisi melalui internet atau metode penyimpanan elektronik yang 100% aman dan andal, dan kami tidak dapat menjamin keamanan mutlaknya.\n\n`;

  // Minors / COPPA
  if (data.coppaCompliant) {
    md += `## Privasi Anak-Anak (Children's Privacy)\n\n`;
    md += `Layanan ini tidak ditujukan untuk siapa pun yang berusia di bawah ${data.targetMinAge} tahun. Kami tidak secara sengaja mengumpulkan informasi pengenal pribadi dari anak-anak di bawah ${data.targetMinAge} tahun. Jika kami mengetahui bahwa seorang anak di bawah ${data.targetMinAge} tahun telah memberi kami informasi pribadi, kami akan segera menghapusnya dari server kami. Jika Anda adalah orang tua atau wali dan Anda mengetahui bahwa anak Anda telah memberikan informasi pribadi kepada kami, silakan hubungi kami agar kami dapat mengambil tindakan yang diperlukan.\n\n`;
  }

  // GDPR & CCPA
  if (data.gdprCompliant || data.ccpaCompliant) {
    md += `## Hak Privasi Pengguna (GDPR & CCPA Rights)\n\n`;
    if (data.gdprCompliant) {
      md += `Berdasarkan Peraturan Perlindungan Data Umum (GDPR Uni Eropa), pengguna berhak untuk:\n`;
      md += `- Meminta akses ke data pribadi yang kami miliki tentang Anda.\n`;
      md += `- Meminta koreksi atas data yang tidak akurat atau tidak lengkap.\n`;
      md += `- Meminta penghapusan data pribadi Anda ("Hak untuk Dilupakan").\n`;
      md += `- Membatasi atau menolak pemrosesan data pribadi Anda.\n`;
      md += `- Meminta portabilitas data ke penyedia layanan lain.\n\n`;
    }
    if (data.ccpaCompliant) {
      md += `Berdasarkan California Consumer Privacy Act (CCPA), konsumen California berhak mengetahui kategori data pribadi yang kami kumpulkan dan meminta agar data tersebut tidak dijual ("Do Not Sell My Personal Information"). Kami menegaskan bahwa kami **tidak menjual** data pribadi Anda kepada pihak mana pun.\n\n`;
    }
  }

  // Changes
  md += `## Perubahan pada Kebijakan Privasi Ini\n\n`;
  md += `Kami dapat memperbarui Kebijakan Privasi kami dari waktu ke waktu. Oleh karena itu, Anda disarankan untuk meninjau halaman ini secara berkala untuk mengetahui setiap perubahan. Kami akan memberi tahu Anda tentang perubahan apa pun dengan memposting Kebijakan Privasi baru di halaman ini. Perubahan ini efektif segera setelah diposting.\n\n`;

  // Contact
  md += `## Hubungi Kami\n\n`;
  md += `Jika Anda memiliki pertanyaan atau saran tentang Kebijakan Privasi kami, jangan ragu untuk menghubungi kami di:\n\n`;
  md += `- **Email:** [${data.contactEmail}](mailto:${data.contactEmail})\n`;
  if (data.websiteUrl) {
    md += `- **Situs Web:** [${data.websiteUrl}](${data.websiteUrl})\n`;
  }
  md += `- **Pengembang:** ${data.developerName}\n`;
  md += `- **Yurisdiksi Hukum:** ${data.governingCountry}\n`;

  return md;
}

/**
 * Generate Terms & Conditions in Markdown
 */
export function generateTermsMarkdown(data: PolicyFormData): string {
  let md = `# Syarat dan Ketentuan (Terms & Conditions) untuk ${data.appName}\n\n`;
  md += `**Tanggal Berlaku:** ${data.effectiveDate}\n\n`;
  md += `Selamat datang di **${data.appName}** ("Aplikasi", "Layanan"). Syarat dan Ketentuan ini ("Ketentuan") merupakan perjanjian yang mengikat secara hukum antara Anda ("Pengguna" atau "Anda") dan **${data.developerName}** ("Pengembang", "Kami").\n\n`;
  md += `Dengan mengunduh, menginstal, mengakses, atau menggunakan Aplikasi ini, Anda menyatakan telah membaca, memahami, dan menyetujui untuk terikat oleh Ketentuan ini secara penuh. Jika Anda tidak menyetujui Ketentuan ini, Anda tidak diperkenankan untuk menggunakan Aplikasi ini.\n\n`;

  // 1. Lisensi Penggunaan
  md += `## 1. Lisensi Penggunaan (License to Use)\n\n`;
  if (data.appType === 'Open Source') {
    md += `Aplikasi ini disediakan sebagai perangkat lunak Sumber Terbuka (Open Source). Ketentuan lisensi open-source terkait (seperti MIT, Apache 2.0, atau GPL) berlaku untuk kode sumber, sementara nama merek, aset visual, dan layanan backend tetap dilindungi oleh hak cipta yang berlaku.\n\n`;
  } else {
    md += `Kami memberi Anda lisensi terbatas, non-eksklusif, tidak dapat dipindahtangankan, dan dapat dibatalkan untuk mengunduh, menginstal, dan menggunakan Aplikasi semata-mata untuk keperluan pribadi atau operasional internal Anda yang sah, sesuai dengan Ketentuan ini.\n\n`;
    md += `Anda dilarang untuk:\n`;
    md += `- Menyalin, memodifikasi, mendistribusikan kembali, atau membuat karya turunan dari Aplikasi;\n`;
    md += `- Melakukan rekayasa balik (reverse engineer), membongkar, atau mendekompilasi bagian mana pun dari Aplikasi;\n`;
    md += `- Menyewakan, meminjamkan, atau mengeksploitasi Aplikasi secara komersial tanpa izin tertulis dari Kami.\n\n`;
  }

  // 2. Akun Pengguna
  if (data.userAccountsAllowed) {
    md += `## 2. Akun Pengguna & Keamanan\n\n`;
    md += `Saat membuat akun di Aplikasi kami, Anda harus memberikan informasi yang akurat, lengkap, dan terkini. Anda bertanggung jawab penuh untuk menjaga kerahasiaan kata sandi dan kredensial akun Anda serta segala aktivitas yang terjadi di bawah akun Anda.\n\n`;
    if (data.accountTerminationClause) {
      md += `Kami berhak untuk menangguhkan atau mengakhiri akun Anda kapan saja tanpa pemberitahuan sebelumnya jika Anda melanggar salah satu ketentuan dalam perjanjian ini atau terlibat dalam perilaku yang merugikan pengguna lain atau sistem kami.\n\n`;
    }
  }

  // 3. Pembelian & Langganan
  if (data.hasInAppPurchases || data.hasSubscription) {
    md += `## 3. Pembelian Dalam Aplikasi & Langganan\n\n`;
    if (data.hasInAppPurchases) {
      md += `- **Pembelian Dalam Aplikasi:** Beberapa item digital atau fitur premium dapat dibeli melalui toko aplikasi resmi (Google Play Store atau Apple App Store). Semua transaksi tunduk pada syarat pembayaran toko aplikasi terkait.\n`;
    }
    if (data.hasSubscription) {
      md += `- **Langganan Otomatis:** Layanan langganan akan diperbarui secara otomatis kecuali dibatalkan setidaknya 24 jam sebelum akhir periode berjalan melalui pengaturan akun toko aplikasi Anda.\n`;
    }
    md += `- **Kebijakan Pengembalian Dana:** Pengembalian dana (refund) diproses sesuai dengan kebijakan pengembalian dana resmi dari platform toko aplikasi terkait (Google Play atau Apple App Store).\n\n`;
  }

  // 4. Hak Kekayaan Intelektual
  md += `## 4. Hak Kekayaan Intelektual (Intellectual Property)\n\n`;
  md += `Seluruh hak cipta, merek dagang, logo, desain, kode sumber, dan konten dalam Aplikasi ini (kecuali konten buatan pengguna yang Anda miliki) adalah milik eksklusif **${data.developerName}** atau pemberi lisensinya dan dilindungi oleh undang-undang hak cipta internasional.\n\n`;

  // 5. Penafian Jaminan ("AS IS")
  md += `## 5. Penafian Jaminan (Disclaimer of Warranties)\n\n`;
  md += `Aplikasi ini disediakan berdasarkan asas **"SEBAGAIMANA ADANYA" (AS IS)** dan **"SEBAGAIMANA TERSEDIA" (AS AVAILABLE)** tanpa jaminan dalam bentuk apa pun, baik tersurat maupun tersirat, termasuk namun tidak terbatas pada jaminan tersirat tentang kelayakan untuk diperdagangkan, kesesuaian untuk tujuan tertentu, dan non-pelanggaran.\n\n`;
  md += `Kami tidak menjamin bahwa Aplikasi akan bebas dari kesalahan, gangguan, atau virus berbahaya, atau bahwa setiap cacat akan segera diperbaiki.\n\n`;

  // 6. Batasan Tanggung Jawab
  md += `## 6. Batasan Tanggung Jawab (Limitation of Liability)\n\n`;
  md += `Sejauh diizinkan oleh hukum yang berlaku, dalam keadaan apa pun **${data.developerName}** tidak bertanggung jawab atas kerugian langsung, tidak langsung, insidental, khusus, atau konsekuensial yang timbul dari atau sehubungan dengan penggunaan atau ketidakmampuan untuk menggunakan Aplikasi ini, bahkan jika kami telah diberitahu tentang kemungkinan kerugian tersebut.\n\n`;

  // 7. Hukum yang Berlaku
  md += `## 7. Hukum yang Mengatur (Governing Law)\n\n`;
  md += `Ketentuan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di **${data.governingCountry}**, tanpa memperhatikan pertentangan prinsip-prinsip hukum.\n\n`;

  // 8. Perubahan Ketentuan
  md += `## 8. Perubahan Syarat dan Ketentuan\n\n`;
  md += `Kami berhak, atas kebijakan kami sendiri, untuk mengubah atau mengganti Ketentuan ini setiap saat. Kami akan mempublikasikan versi yang diperbarui di Aplikasi ini. Penggunaan berkelanjutan Anda atas Aplikasi setelah perubahan tersebut merupakan bentuk persetujuan Anda terhadap Ketentuan baru.\n\n`;

  // 9. Kontak
  md += `## 9. Kontak Kami\n\n`;
  md += `Jika Anda memiliki pertanyaan tentang Syarat dan Ketentuan ini, silakan hubungi kami melalui email: [${data.contactEmail}](mailto:${data.contactEmail}).\n`;

  return md;
}

/**
 * Convert Markdown string to clean Semantic HTML with standalone responsive styling
 */
export function convertMarkdownToHtml(markdown: string, title: string): string {
  // Simple & clean markdown converter for standard headers, lists, links, paragraphs, and bold text
  let body = markdown
    // Escape basic html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^\s*-\s+(.*$)/gim, '<li>$1</li>');

  // Wrap lists
  body = body.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
  // Clean double ul tags
  body = body.replace(/<\/ul>\s*<ul>/g, '');

  // Wrap paragraphs (lines separated by double newlines that aren't tags)
  const blocks = body.split(/\n\s*\n/);
  const formattedBlocks = blocks.map(block => {
    const trimmed = block.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3') || trimmed.startsWith('<ul')) {
      return trimmed;
    }
    return `<p>${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  const fullContent = formattedBlocks.filter(Boolean).join('\n\n');

  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #1f2937;
      --heading: #111827;
      --primary: #2563eb;
      --border: #e5e7eb;
      --card-bg: #f9fafb;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #0f172a;
        --text: #cbd5e1;
        --heading: #f8fafc;
        --primary: #38bdf8;
        --border: #334155;
        --card-bg: #1e293b;
      }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.7;
      color: var(--text);
      background-color: var(--bg);
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 24px;
    }
    h1 {
      color: var(--heading);
      font-size: 2rem;
      border-bottom: 2px solid var(--border);
      padding-bottom: 12px;
      margin-bottom: 24px;
    }
    h2 {
      color: var(--heading);
      font-size: 1.4rem;
      margin-top: 32px;
      margin-bottom: 16px;
    }
    h3 {
      color: var(--heading);
      font-size: 1.15rem;
      margin-top: 24px;
      margin-bottom: 12px;
    }
    p {
      margin-bottom: 16px;
    }
    ul {
      padding-left: 24px;
      margin-bottom: 20px;
    }
    li {
      margin-bottom: 8px;
    }
    a {
      color: var(--primary);
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    a:hover {
      opacity: 0.85;
    }
    .footer {
      margin-top: 48px;
      padding-top: 24px;
      border-top: 1px solid var(--border);
      font-size: 0.875rem;
      color: #64748b;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    ${fullContent}
    <div class="footer">
      Dokumen ini dibuat menggunakan Term & Privacy Policy Generator.
    </div>
  </div>
</body>
</html>`;
}
