export type SectionId =
  | 'inicio'
  | 'obras-publicas'
  | 'transparencia'
  | 'ayuntamiento'
  | 'organigrama-view'
  | 'contraloria'
  | 'planes-desarrollo'
  | 'cuentas-publicas'
  | 'ingresos-egresos'
  | 'informacion-financiera'
  | 'disciplina-financiera'
  | 'terminos'
  | 'privacidad';

export interface DocumentItem {
  id: string;
  sectionId: SectionId;
  category: string;
  subCategory?: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'zip' | 'doc' | 'xlsx' | 'other';
  fileSize: string;
  year: string;
  uploadDate: string;
  uploadedBy: string;
  department: string;
  status: 'Publicado' | 'Pre-auditado' | 'Integrado' | 'En Integración' | 'Vigente';
  fileDataUrl?: string; // base64 DataURL fallback
  fileUrl?: string; // real server or cloud URL (e.g. /uploads/filename.pdf or external link)
  description?: string;
  isCustom?: boolean;
}

export interface SectionCategoryDef {
  id: string;
  name: string;
  defaultDepartment: string;
}

export interface SectionDef {
  id: SectionId;
  menuNumber: string;
  name: string;
  categories: SectionCategoryDef[];
}
