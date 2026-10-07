import { DocumentItem, SectionId } from '../types';

/**
 * Maps Decap CMS categories to institutional portal sections
 */
function mapCategoryToSection(category: string): SectionId {
  const cat = (category || '').toLowerCase();
  if (cat.includes('plan')) return 'planes-desarrollo';
  if (cat.includes('cuenta')) return 'cuentas-publicas';
  if (cat.includes('ingreso') || cat.includes('egreso') || cat.includes('presupuesto')) return 'ingresos-egresos';
  if (cat.includes('financier') || cat.includes('disciplina')) return 'informacion-financiera';
  if (cat.includes('obra')) return 'obras-publicas';
  if (cat.includes('contraloria') || cat.includes('contraloría') || cat.includes('auditor')) return 'contraloria';
  if (cat.includes('organigrama') || cat.includes('directorio')) return 'organigrama-view';
  if (cat.includes('ayuntamiento') || cat.includes('cabildo') || cat.includes('acta')) return 'ayuntamiento';
  return 'transparencia';
}

/**
 * Simple parser for frontmatter in markdown files without external dependencies
 */
function parseFrontmatter(content: string): Record<string, any> {
  const result: Record<string, any> = {};
  if (!content.startsWith('---')) return result;

  const endIdx = content.indexOf('---', 3);
  if (endIdx === -1) return result;

  const fmBlock = content.substring(3, endIdx).trim();
  const lines = fmBlock.split('\n');

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0) {
      const key = line.substring(0, colonIdx).trim();
      let value = line.substring(colonIdx + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.substring(1, value.length - 1);
      }
      result[key] = value;
    }
  }

  return result;
}

/**
 * Loads all documents saved via Decap CMS into content/documentos/
 */
export function loadDecapDocuments(): DocumentItem[] {
  const documents: DocumentItem[] = [];

  try {
    // Eagerly import all markdown and json files in content/documentos
    const modules = import.meta.glob('/content/documentos/*.{md,markdown,json}', {
      eager: true,
      query: '?raw',
      import: 'default'
    });

    for (const [path, rawContent] of Object.entries(modules)) {
      if (typeof rawContent !== 'string') continue;

      const filename = path.split('/').pop() || '';
      const slug = filename.replace(/\.(md|markdown|json)$/, '');
      if (slug.startsWith('.')) continue; // ignore hidden files like .gitkeep

      const data = parseFrontmatter(rawContent);
      if (!data.title && !data.pdf) continue;

      const pdfUrl = data.pdf || '';
      const pdfName = pdfUrl.split('/').pop() || `${slug}.pdf`;
      const category = data.categoria || 'Transparencia';
      const year = String(data.anio || '2026');
      const sectionId = (data.seccion as SectionId) || mapCategoryToSection(category);

      documents.push({
        id: `decap-${slug}`,
        sectionId,
        category,
        title: data.title || 'Documento Oficial',
        fileName: pdfName,
        fileType: 'pdf',
        fileSize: 'PDF Oficial',
        year,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Comunicación Social / Transparencia',
        department: 'H. Ayuntamiento de Sayula de Alemán',
        status: 'Publicado',
        fileUrl: pdfUrl,
        description: data.descripcion || undefined,
        isCustom: true
      });
    }
  } catch (err) {
    console.warn('Decap CMS documents loader info:', err);
  }

  return documents;
}
