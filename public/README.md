# Public Directory

Folder ini digunakan untuk menyimpan berkas HTML statis hasil generate Terms and Services & Privacy Policy dengan format nama aplikasi atau website.

Contoh berkas yang tersimpan di folder ini:
- `[nama-aplikasi]-terms.html`
- `[nama-aplikasi]-privacy.html`
- `[nama-aplikasi].html`

Berkas-berkas di dalam folder `/public` ini dapat diakses langsung oleh pengguna melalui URL:
- `https://terms-privacy-generator.web.app/[nama-aplikasi]-terms.html`
- `https://terms-privacy-generator.web.app/[nama-aplikasi]-privacy.html`
- `https://terms-privacy-generator.web.app/public/[nama-aplikasi]-terms.html`
- `https://terms-privacy-generator.web.app/public/[nama-aplikasi]-privacy.html`

Ketika proyek di-build (`npm run build`) dan di-deploy ke Firebase Hosting atau GitHub, seluruh berkas di folder ini akan otomatis disalin ke folder `dist` dan siap diakses secara publik.
