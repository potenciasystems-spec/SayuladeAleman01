import { DocumentItem } from '../types';
import { INITIAL_DOCUMENTS } from '../data/initialDocuments';
import { saveDocumentToCloud, deleteDocumentFromCloud } from './firestoreService';

const STORAGE_KEY = 'sayula_gob_documents_v1';
const ADMIN_AUTH_KEY = 'sayula_gob_admin_session';

export function sanitizeDocument(d: any): DocumentItem {
  if (!d || typeof d !== 'object') {
    return {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sectionId: 'obras-publicas',
      category: 'General',
      title: 'Documento Oficial',
      fileName: 'documento.pdf',
      fileType: 'pdf',
      fileSize: '1.0 MB',
      year: '2026',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Administración Municipal',
      department: 'Ayuntamiento',
      status: 'Publicado'
    };
  }

  return {
    id: String(d.id || `doc-${Date.now()}`),
    sectionId: d.sectionId || 'obras-publicas',
    category: String(d.category || 'General'),
    subCategory: d.subCategory ? String(d.subCategory) : undefined,
    title: String(d.title || 'Documento Oficial'),
    fileName: String(d.fileName || 'documento.pdf'),
    fileType: d.fileType || 'pdf',
    fileSize: String(d.fileSize || '1.0 MB'),
    year: String(d.year || '2026'),
    uploadDate: String(d.uploadDate || new Date().toISOString().split('T')[0]),
    uploadedBy: String(d.uploadedBy || 'Administración Municipal'),
    department: String(d.department || 'Ayuntamiento'),
    status: d.status || 'Publicado',
    fileUrl: d.fileUrl ? String(d.fileUrl) : undefined,
    fileDataUrl: d.fileDataUrl ? String(d.fileDataUrl) : undefined,
    description: d.description ? String(d.description) : undefined,
    isCustom: Boolean(d.isCustom)
  };
}

export function loadDocuments(): DocumentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(sanitizeDocument);
      }
    }
  } catch (e) {
    console.error('Error loading documents from localStorage:', e);
  }
  return INITIAL_DOCUMENTS.map(sanitizeDocument);
}

/**
 * Robust fetch that works on both Netlify static CDN and full-stack Express server
 */
export async function fetchServerDocuments(): Promise<DocumentItem[] | null> {
  // Try 1: Full-stack API endpoint
  try {
    const res = await fetch('/api/documents');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sanitized = data.map(sanitizeDocument);
        const local = loadDocuments();
        const merged = mergeDocuments(sanitized, local);
        saveDocuments(merged);
        return merged;
      }
    }
  } catch {
    // ignore
  }

  // Try 2: Static JSON file on Netlify / static CDN
  try {
    const res = await fetch('/data/documents.json');
    const contentType = res.headers.get('content-type') || '';
    if (res.ok && (contentType.includes('application/json') || contentType.includes('text/plain'))) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const sanitized = data.map(sanitizeDocument);
        const local = loadDocuments();
        const merged = mergeDocuments(sanitized, local);
        saveDocuments(merged);
        return merged;
      }
    }
  } catch {
    // ignore
  }

  return null;
}

function mergeDocuments(serverDocs: DocumentItem[], localDocs: DocumentItem[]): DocumentItem[] {
  const customLocal = localDocs.filter(d => d.isCustom);
  if (customLocal.length === 0) return serverDocs;

  const result = [...serverDocs];
  customLocal.forEach(customDoc => {
    const existingIndex = result.findIndex(d => d.id === customDoc.id);
    if (existingIndex >= 0) {
      result[existingIndex] = customDoc;
    } else {
      result.unshift(customDoc);
    }
  });
  return result;
}

export async function syncDocumentToServer(doc: DocumentItem): Promise<boolean> {
  const sanitized = sanitizeDocument(doc);
  const current = loadDocuments();
  const index = current.findIndex(d => d.id === sanitized.id);
  let updated: DocumentItem[];
  if (index >= 0) {
    updated = current.map(d => d.id === sanitized.id ? sanitized : d);
  } else {
    updated = [sanitized, ...current];
  }
  saveDocuments(updated);

  // Sync to Firestore Cloud Database in real-time
  saveDocumentToCloud(sanitized).catch(() => {});

  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sanitized)
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function syncBulkDocumentsToServer(docs: DocumentItem[]): Promise<boolean> {
  const sanitized = docs.map(sanitizeDocument);
  saveDocuments(sanitized);
  sanitized.forEach(d => {
    saveDocumentToCloud(d).catch(() => {});
  });
  try {
    const res = await fetch('/api/documents/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents: sanitized })
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteDocumentFromServer(id: string): Promise<boolean> {
  const current = loadDocuments();
  const updated = current.filter(d => d.id !== id);
  saveDocuments(updated);

  // Delete from Firestore Cloud Database in real-time
  deleteDocumentFromCloud(id).catch(() => {});

  try {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Handle file upload: sends to backend if available, or creates persistent ObjectURL
 */
export async function uploadRealFile(file: File): Promise<{ fileUrl: string; fileName: string; fileSize: string } | null> {
  const sizeInMB = file.size / (1024 * 1024);
  const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;

  // 1. Try uploading to backend server
  try {
    const reader = new FileReader();
    const base64Data: string = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: file.name,
        base64Data
      })
    });

    const contentType = response.headers.get('content-type') || '';
    if (response.ok && contentType.includes('application/json')) {
      const result = await response.json();
      if (result.success && result.fileUrl) {
        return {
          fileUrl: result.fileUrl,
          fileName: result.fileName,
          fileSize: result.fileSize
        };
      }
    }
  } catch {
    // ignore
  }

  // 2. Client-side fallback for static Netlify hosting:
  const blobUrl = URL.createObjectURL(file);
  return {
    fileUrl: blobUrl,
    fileName: file.name,
    fileSize: formattedSize
  };
}

export function saveDocuments(documents: DocumentItem[]): void {
  try {
    const sanitized = documents.map(d => {
      if (d.fileDataUrl && d.fileDataUrl.length > 50000) {
        const { fileDataUrl, ...rest } = d;
        return rest;
      }
      return d;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
  } catch (e) {
    console.error('Error saving documents to localStorage:', e);
  }
}

export function resetToInitialDocuments(): DocumentItem[] {
  const initial = INITIAL_DOCUMENTS.map(sanitizeDocument);
  saveDocuments(initial);
  syncBulkDocumentsToServer(initial);
  return initial;
}

export function getAdminSession(): boolean {
  try {
    return localStorage.getItem(ADMIN_AUTH_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(active: boolean): void {
  try {
    if (active) {
      localStorage.setItem(ADMIN_AUTH_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_AUTH_KEY);
    }
  } catch {
    // ignore
  }
}

/**
 * Downloads or views the document with support for Google Drive, server files and cloud links
 */
export function downloadDocument(doc: DocumentItem): void {
  const targetUrl = doc.fileUrl || doc.fileDataUrl;

  if (targetUrl) {
    if (targetUrl.startsWith('http://') || targetUrl.startsWith('https://')) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const link = document.createElement('a');
    link.href = targetUrl;
    link.download = doc.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Generate official structured PDF sample
  const content = `%PDF-1.4
1 0 obj
<< /Title (${doc.title})
   /Author (H. Ayuntamiento de Sayula de Aleman, Veracruz)
   /Subject (${doc.category})
   /Creator (Portal Oficial de Transparencia - Sayula de Aleman)
   /Producer (Gobierno Municipal 2026-2029)
   /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}Z)
>>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 6 0 R >> >> >>
endobj
5 0 obj
<< /Length 420 >>
stream
BT
/F1 16 Tf
50 720 Td
(H. AYUNTAMIENTO CONSTITUCIONAL DE SAYULA DE ALEMAN) Tj
0 -20 Td
/F1 12 Tf
(ESTADO DE VERACRUZ DE IGNACIO DE LA LLAVE) Tj
0 -30 Td
/F1 14 Tf
(${doc.title}) Tj
0 -25 Td
/F1 10 Tf
(Seccion: ${doc.sectionId.toUpperCase()}) Tj
0 -15 Td
(Categoria: ${doc.category}) Tj
0 -15 Td
(Departamento Responsable: ${doc.department}) Tj
0 -15 Td
(Ejercicio Fiscal: ${doc.year} | Estatus: ${doc.status}) Tj
0 -15 Td
(Fecha de Publicacion: ${doc.uploadDate} | Subido por: ${doc.uploadedBy}) Tj
0 -30 Td
(Documento oficial de transparencia y rendicion de cuentas conforme a la ley.) Tj
0 -15 Td
(Portal Oficial: "Juntos Mejoramos Mucho Mas") Tj
ET
endstream
endobj
6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 7
0000000000 65535 f 
0000000015 00000 n 
0000000300 00000 n 
0000000350 00000 n 
0000000412 00000 n 
0000000535 00000 n 
0000001010 00000 n 
trailer
<< /Size 7 /Root 2 0 R /Info 1 0 R >>
startxref
1095
%%EOF`;

  const blob = new Blob([content], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = doc.fileName.endsWith('.pdf') ? doc.fileName : `${doc.fileName}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
