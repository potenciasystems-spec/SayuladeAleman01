import { DocumentItem } from '../types';
import { INITIAL_DOCUMENTS } from '../data/initialDocuments';

const STORAGE_KEY = 'sayula_gob_documents_v1';
const ADMIN_AUTH_KEY = 'sayula_gob_admin_session';

export function loadDocuments(): DocumentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    saveDocuments(INITIAL_DOCUMENTS);
    return INITIAL_DOCUMENTS;
  } catch (e) {
    console.error('Error loading documents from storage:', e);
    return INITIAL_DOCUMENTS;
  }
}

export async function fetchServerDocuments(): Promise<DocumentItem[] | null> {
  try {
    const res = await fetch('/api/documents');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        saveDocuments(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('API /api/documents not reached, using local documents:', err);
  }
  return null;
}

export async function syncDocumentToServer(doc: DocumentItem): Promise<boolean> {
  try {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(doc)
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to sync document to server:', err);
    return false;
  }
}

export async function syncBulkDocumentsToServer(docs: DocumentItem[]): Promise<boolean> {
  try {
    const res = await fetch('/api/documents/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documents: docs })
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to sync bulk documents to server:', err);
    return false;
  }
}

export async function deleteDocumentFromServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/documents/${id}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete document from server:', err);
    return false;
  }
}

export async function uploadRealFile(file: File): Promise<{ fileUrl: string; fileName: string; fileSize: string } | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            base64Data
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.fileUrl) {
            resolve({
              fileUrl: result.fileUrl,
              fileName: result.fileName,
              fileSize: result.fileSize
            });
            return;
          }
        }
      } catch (err) {
        console.error('Network error uploading file to server:', err);
      }

      // Fallback: in-memory base64 if server upload endpoint failed
      const sizeInMB = file.size / (1024 * 1024);
      const formattedSize = sizeInMB >= 1 ? `${sizeInMB.toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`;
      resolve({
        fileUrl: base64Data,
        fileName: file.name,
        fileSize: formattedSize
      });
    };
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });
}

export function saveDocuments(documents: DocumentItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
  } catch (e) {
    console.error('Error saving documents to storage:', e);
  }
}

export function resetToInitialDocuments(): DocumentItem[] {
  saveDocuments(INITIAL_DOCUMENTS);
  syncBulkDocumentsToServer(INITIAL_DOCUMENTS);
  return INITIAL_DOCUMENTS;
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
 * Downloads or views the real uploaded PDF or generates an official PDF blob.
 */
export function downloadDocument(doc: DocumentItem): void {
  // 1. If hosted on server or external URL
  if (doc.fileUrl) {
    const link = document.createElement('a');
    link.href = doc.fileUrl;
    link.download = doc.fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 2. If uploaded as data URL fallback
  if (doc.fileDataUrl) {
    const link = document.createElement('a');
    link.href = doc.fileDataUrl;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // 3. Generate official structured PDF sample
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
