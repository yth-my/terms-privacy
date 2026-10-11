import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure public directory exists
const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));

// Helper to sanitize slug
function sanitizeSlug(name: string): string {
  if (!name || !name.trim()) return 'app';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'app';
}

// API: Save generated terms and privacy HTML files into /public folder
app.post('/api/save-public-html', (req: Request, res: Response) => {
  try {
    const { appName, termsHtml, privacyHtml } = req.body;

    if (!appName) {
      return res.status(400).json({ error: 'Nama aplikasi/website wajib diisi' });
    }

    const slug = sanitizeSlug(appName);
    const savedFiles: { [key: string]: string } = {};

    // 1. Save Terms HTML file
    if (termsHtml) {
      const termsFileName = `${slug}-terms.html`;
      const termsFilePath = path.join(publicDir, termsFileName);
      fs.writeFileSync(termsFilePath, termsHtml, 'utf8');
      savedFiles.terms = `/${termsFileName}`;
      savedFiles.publicTerms = `/public/${termsFileName}`;

      // If dist folder exists, copy there too so it's immediately live in dist
      const distTermsPath = path.join(__dirname, 'dist', termsFileName);
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        try { fs.writeFileSync(distTermsPath, termsHtml, 'utf8'); } catch {}
      }
    }

    // 2. Save Privacy Policy HTML file
    if (privacyHtml) {
      const privacyFileName = `${slug}-privacy.html`;
      const privacyFilePath = path.join(publicDir, privacyFileName);
      fs.writeFileSync(privacyFilePath, privacyHtml, 'utf8');
      savedFiles.privacy = `/${privacyFileName}`;
      savedFiles.publicPrivacy = `/public/${privacyFileName}`;

      // If dist folder exists, copy there too
      const distPrivacyPath = path.join(__dirname, 'dist', privacyFileName);
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        try { fs.writeFileSync(distPrivacyPath, privacyHtml, 'utf8'); } catch {}
      }
    }

    // 3. Save combined/default HTML file: ${slug}.html
    if (termsHtml || privacyHtml) {
      const defaultFileName = `${slug}.html`;
      const defaultContent = termsHtml || privacyHtml;
      const defaultFilePath = path.join(publicDir, defaultFileName);
      fs.writeFileSync(defaultFilePath, defaultContent, 'utf8');
      savedFiles.default = `/${defaultFileName}`;
      savedFiles.publicDefault = `/public/${defaultFileName}`;

      const distDefaultPath = path.join(__dirname, 'dist', defaultFileName);
      if (fs.existsSync(path.join(__dirname, 'dist'))) {
        try { fs.writeFileSync(distDefaultPath, defaultContent, 'utf8'); } catch {}
      }
    }

    return res.json({
      success: true,
      slug,
      message: `Berkas HTML berhasil disimpan ke folder /public dengan nama aplikasi ${appName}`,
      files: savedFiles,
    });
  } catch (error: any) {
    console.error('Error saving public HTML:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan berkas HTML ke folder public' });
  }
});

// API: List generated HTML files in /public
app.get('/api/public-files', (_req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(publicDir)
      .filter(file => file.endsWith('.html'))
      .map(file => ({
        name: file,
        url: `/${file}`,
        publicUrl: `/public/${file}`,
        size: fs.statSync(path.join(publicDir, file)).size,
        modifiedAt: fs.statSync(path.join(publicDir, file)).mtime,
      }));
    return res.json({ files });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Serve /public directly
app.use('/public', express.static(publicDir));

// Serve static HTML files from public directory at root if requested with .html
app.get('/*.html', (req: Request, res: Response, next) => {
  const fileName = path.basename(req.path);
  const filePath = path.join(publicDir, fileName);
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  next();
});

// Start server with Vite or static
async function startServer() {
  if (!isProduction) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
