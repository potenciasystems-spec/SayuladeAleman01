import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Directories
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DATA_DIR = path.join(__dirname, 'data');
const DOCUMENTS_FILE = path.join(DATA_DIR, 'documents.json');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

// Function to read documents
function getStoredDocuments() {
  try {
    if (fs.existsSync(DOCUMENTS_FILE)) {
      const data = fs.readFileSync(DOCUMENTS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error reading documents file:', e);
  }
  return null;
}

// Function to write documents
function saveStoredDocuments(docs: any[]) {
  try {
    fs.writeFileSync(DOCUMENTS_FILE, JSON.stringify(docs, null, 2), 'utf-8');
    return true;
  } catch (e) {
    console.error('Error saving documents file:', e);
    return false;
  }
}

// Serve uploaded files statically with correct headers
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
    }
  }
}));

// API: Get all documents
app.get('/api/documents', (req, res) => {
  const docs = getStoredDocuments();
  if (docs && Array.isArray(docs)) {
    return res.json(docs);
  }
  return res.json([]);
});

// API: Save or Update document
app.post('/api/documents', (req, res) => {
  const doc = req.body;
  if (!doc || !doc.id || !doc.title) {
    return res.status(400).json({ error: 'Document data invalid' });
  }

  let docs = getStoredDocuments() || [];
  const existingIdx = docs.findIndex((d: any) => d.id === doc.id);
  if (existingIdx >= 0) {
    docs[existingIdx] = doc;
  } else {
    docs.unshift(doc);
  }

  saveStoredDocuments(docs);
  return res.json({ success: true, document: doc });
});

// API: Bulk update documents
app.post('/api/documents/bulk', (req, res) => {
  const { documents } = req.body;
  if (Array.isArray(documents)) {
    saveStoredDocuments(documents);
    return res.json({ success: true, count: documents.length });
  }
  return res.status(400).json({ error: 'Invalid documents array' });
});

// API: Delete document
app.delete('/api/documents/:id', (req, res) => {
  const { id } = req.params;
  let docs = getStoredDocuments() || [];
  const initialLen = docs.length;
  docs = docs.filter((d: any) => d.id !== id);
  saveStoredDocuments(docs);
  return res.json({ success: true, deleted: docs.length < initialLen });
});

// API: Upload real file (PDF, ZIP, DOCX, XLSX)
app.post('/api/upload', (req, res) => {
  try {
    const { fileName, base64Data } = req.body;
    if (!fileName || !base64Data) {
      return res.status(400).json({ error: 'Missing fileName or file data' });
    }

    // Clean base64 string
    const base64PrefixMatch = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    const rawBase64 = base64PrefixMatch ? base64PrefixMatch[2] : base64Data;
    const buffer = Buffer.from(rawBase64, 'base64');

    // Safe sanitized unique filename
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const diskFileName = `${timestamp}-${sanitizedName}`;
    const filePath = path.join(UPLOADS_DIR, diskFileName);

    fs.writeFileSync(filePath, buffer);

    const sizeInMB = buffer.length / (1024 * 1024);
    const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.round(buffer.length / 1024)} KB`;

    return res.json({
      success: true,
      fileUrl: `/uploads/${diskFileName}`,
      fileName: fileName,
      diskFileName,
      fileSize: formattedSize
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    return res.status(500).json({ error: 'Failed to save file on server', details: err.message });
  }
});

// Mount Vite or serve static dist
const isProduction = process.env.NODE_ENV === 'production';

if (!isProduction) {
  const { createServer } = await import('vite');
  const vite = await createServer({
    server: { middlewareMode: true, hmr: process.env.DISABLE_HMR !== 'true' },
    appType: 'spa'
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
