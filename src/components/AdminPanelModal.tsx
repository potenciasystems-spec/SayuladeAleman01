import React, { useState, useRef } from 'react';
import { DocumentItem, SectionId } from '../types';
import { OFFICIAL_SECTIONS } from '../data/initialDocuments';
import {
  downloadDocument,
  resetToInitialDocuments,
  uploadRealFile,
  syncDocumentToServer,
  deleteDocumentFromServer
} from '../utils/documentStorage';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  onDocumentsChange: (newDocs: DocumentItem[]) => void;
  initialSectionFilter?: SectionId | 'all';
  onShowToast: (msg: string) => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  documents,
  onDocumentsChange,
  initialSectionFilter = 'all',
  onShowToast
}) => {
  const [selectedSection, setSelectedSection] = useState<SectionId | 'all'>(initialSectionFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Upload / Edit Modal state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Form fields
  const [formSectionId, setFormSectionId] = useState<SectionId>('obras-publicas');
  const [formCategory, setFormCategory] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formYear, setFormYear] = useState('2026');
  const [formDepartment, setFormDepartment] = useState('Dirección de Obras Públicas');
  const [formStatus, setFormStatus] = useState<DocumentItem['status']>('Publicado');
  const [formUploadedBy, setFormUploadedBy] = useState('Administración Municipal');
  const [formFileName, setFormFileName] = useState('');
  const [formFileSize, setFormFileSize] = useState('');
  const [formFileUrl, setFormFileUrl] = useState<string | undefined>(undefined);
  const [formFileType, setFormFileType] = useState<DocumentItem['fileType']>('pdf');
  const [formExternalUrl, setFormExternalUrl] = useState('');

  // Quick file replace input
  const fileReplaceInputRef = useRef<HTMLInputElement>(null);
  const [targetReplaceDocId, setTargetReplaceDocId] = useState<string | null>(null);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSectionChangeInForm = (secId: SectionId) => {
    setFormSectionId(secId);
    const sec = OFFICIAL_SECTIONS.find(s => s.id === secId);
    if (sec && sec.categories.length > 0) {
      setFormCategory(sec.categories[0].name);
      setFormDepartment(sec.categories[0].defaultDepartment);
    }
  };

  const openNewDocModal = (presetSection?: SectionId) => {
    const secId = presetSection || (selectedSection !== 'all' ? selectedSection : 'obras-publicas');
    setFormSectionId(secId);
    const sec = OFFICIAL_SECTIONS.find(s => s.id === secId);
    setFormCategory(sec?.categories[0]?.name || 'Documentación General');
    setFormDepartment(sec?.categories[0]?.defaultDepartment || 'Secretaría del H. Ayuntamiento');
    setFormTitle('');
    setFormDescription('');
    setFormYear('2026');
    setFormStatus('Publicado');
    setFormUploadedBy('Administración Municipal');
    setFormFileName('');
    setFormFileSize('');
    setFormFileUrl(undefined);
    setFormFileType('pdf');
    setFormExternalUrl('');
    setEditingDoc(null);
    setIsEditorOpen(true);
  };

  const openEditDocModal = (doc: DocumentItem) => {
    setEditingDoc(doc);
    setFormSectionId(doc.sectionId);
    setFormCategory(doc.category);
    setFormTitle(doc.title);
    setFormDescription(doc.description || '');
    setFormYear(doc.year);
    setFormDepartment(doc.department);
    setFormStatus(doc.status);
    setFormUploadedBy(doc.uploadedBy);
    setFormFileName(doc.fileName);
    setFormFileSize(doc.fileSize);
    setFormFileUrl(doc.fileUrl || doc.fileDataUrl);
    setFormFileType(doc.fileType);
    setFormExternalUrl(doc.fileUrl && doc.fileUrl.startsWith('http') ? doc.fileUrl : '');
    setIsEditorOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const extension = file.name.split('.').pop()?.toLowerCase();
    let type: DocumentItem['fileType'] = 'pdf';
    if (extension === 'zip' || extension === 'rar') type = 'zip';
    else if (extension === 'doc' || extension === 'docx') type = 'doc';
    else if (extension === 'xls' || extension === 'xlsx') type = 'xlsx';

    setFormFileType(type);
    setFormFileName(file.name);
    if (!formTitle) {
      setFormTitle(file.name.replace(/\.[^/.]+$/, ""));
    }

    // Upload to real server
    const uploadResult = await uploadRealFile(file);
    if (uploadResult) {
      setFormFileUrl(uploadResult.fileUrl);
      setFormFileName(uploadResult.fileName);
      setFormFileSize(uploadResult.fileSize);
      onShowToast(`Archivo cargado exitosamente en el servidor: ${file.name}`);
    } else {
      onShowToast(`No se pudo cargar el archivo.`);
    }
    setIsUploading(false);
  };

  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('Por favor ingrese el título del documento.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const finalFileUrl = formExternalUrl.trim() || formFileUrl;

    if (editingDoc) {
      const updatedDoc: DocumentItem = {
        ...editingDoc,
        sectionId: formSectionId,
        category: formCategory,
        title: formTitle.trim(),
        description: formDescription.trim(),
        year: formYear,
        department: formDepartment,
        status: formStatus,
        uploadedBy: formUploadedBy,
        fileName: formFileName || editingDoc.fileName,
        fileSize: formFileSize || editingDoc.fileSize,
        fileType: formFileType || editingDoc.fileType,
        fileUrl: finalFileUrl,
        uploadDate: todayStr,
        isCustom: true
      };

      const updatedList = documents.map(d => d.id === editingDoc.id ? updatedDoc : d);
      onDocumentsChange(updatedList);
      await syncDocumentToServer(updatedDoc);
      onShowToast(`Documento "${formTitle}" guardado en el servidor.`);
    } else {
      const newDoc: DocumentItem = {
        id: `doc-srv-${Date.now()}`,
        sectionId: formSectionId,
        category: formCategory || 'General',
        title: formTitle.trim(),
        description: formDescription.trim(),
        year: formYear,
        department: formDepartment,
        status: formStatus,
        uploadedBy: formUploadedBy,
        fileName: formFileName || `${formTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`,
        fileSize: formFileSize || '1.5 MB',
        fileType: formFileType,
        fileUrl: finalFileUrl,
        uploadDate: todayStr,
        isCustom: true
      };

      const updatedList = [newDoc, ...documents];
      onDocumentsChange(updatedList);
      await syncDocumentToServer(newDoc);
      onShowToast(`Nuevo archivo "${newDoc.title}" publicado en línea.`);
    }

    setIsEditorOpen(false);
  };

  const handleDeleteDoc = async (id: string, title: string) => {
    if (confirm(`¿Está seguro de eliminar el archivo "${title}" del portal?`)) {
      const updated = documents.filter(d => d.id !== id);
      onDocumentsChange(updated);
      await deleteDocumentFromServer(id);
      onShowToast(`Archivo "${title}" eliminado.`);
    }
  };

  const handleTriggerQuickReplace = (docId: string) => {
    setTargetReplaceDocId(docId);
    fileReplaceInputRef.current?.click();
  };

  const handleQuickFileReplaced = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !targetReplaceDocId) return;

    onShowToast(`Cargando ${file.name} al servidor...`);
    const uploadResult = await uploadRealFile(file);
    if (!uploadResult) {
      onShowToast('Error al reemplazar el archivo.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    let type: DocumentItem['fileType'] = 'pdf';
    if (extension === 'zip') type = 'zip';
    else if (extension === 'doc' || extension === 'docx') type = 'doc';
    else if (extension === 'xls' || extension === 'xlsx') type = 'xlsx';

    let replacedDoc: DocumentItem | null = null;
    const updated = documents.map(d => {
      if (d.id === targetReplaceDocId) {
        replacedDoc = {
          ...d,
          fileName: file.name,
          fileSize: uploadResult.fileSize,
          fileType: type,
          fileUrl: uploadResult.fileUrl,
          uploadDate: todayStr,
          isCustom: true
        };
        return replacedDoc;
      }
      return d;
    });

    onDocumentsChange(updated);
    if (replacedDoc) {
      await syncDocumentToServer(replacedDoc);
    }
    onShowToast(`Archivo reemplazado en el servidor con: ${file.name}`);
    setTargetReplaceDocId(null);
    if (fileReplaceInputRef.current) fileReplaceInputRef.current.value = '';
  };

  const handleResetDefaults = () => {
    const initial = resetToInitialDocuments();
    onDocumentsChange(initial);
    setShowResetConfirm(false);
    onShowToast('Se han restaurado los archivos y la estructura oficial original.');
  };

  const handleExportJson = () => {
    const jsonString = JSON.stringify(documents, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sayula_documentacion_oficial_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onShowToast('Copia de seguridad descargada.');
  };

  // Filtered documents
  const filteredDocs = documents.filter(doc => {
    if (selectedSection !== 'all' && doc.sectionId !== selectedSection) return false;
    if (filterYear !== 'all' && !doc.year.includes(filterYear)) return false;
    if (filterStatus !== 'all' && doc.status !== filterStatus) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = doc.title.toLowerCase().includes(q);
      const matchFile = doc.fileName.toLowerCase().includes(q);
      const matchCat = doc.category.toLowerCase().includes(q);
      const matchDep = doc.department.toLowerCase().includes(q);
      if (!matchTitle && !matchFile && !matchCat && !matchDep) return false;
    }
    return true;
  });

  const customDocsCount = documents.filter(d => d.fileUrl || d.isCustom).length;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in-scale">
      {/* Hidden file input for quick replace */}
      <input
        type="file"
        ref={fileReplaceInputRef}
        onChange={handleQuickFileReplaced}
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
      />

      <div
        className="bg-white border-2 border-gold-champagne w-full max-w-6xl max-h-[92vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col relative"
        style={{ borderImage: 'linear-gradient(135deg, #D4AF37, #F7EF8A, #B8860B) 1' }}
      >
        {/* Top Header */}
        <div className="bg-[#111111] text-white px-5 sm:px-7 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]">
          <div className="flex items-center gap-3">
            <img
              src="https://i.imgur.com/2YV4S9u.png"
              alt="Escudo Sayula de Alemán"
              className="h-10 w-auto object-contain"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-gold-champagne text-brandDark font-institutional font-bold text-[9px] px-2 py-0.5 rounded shadow">
                  GOBIERNO MUNICIPAL
                </span>
                <span className="text-[10px] text-gray-400 font-mono">SAYOIC/2026-2029</span>
                <span className="text-[9px] bg-emerald-900/60 text-emerald-300 border border-emerald-500/50 px-2 py-0.2 rounded font-mono">
                  ● Servidor Activo
                </span>
              </div>
              <h2 className="font-institutional font-bold text-sm sm:text-base text-brandLightGold tracking-wider mt-0.5">
                Panel de Control de Archivos y Documentación
              </h2>
              <p className="text-[10px] text-gray-300">
                Los archivos que subas aquí se guardan en el servidor y quedan visibles y descargables para toda la ciudadanía en línea.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openNewDocModal()}
              className="bg-gold-champagne text-brandDark hover:opacity-90 px-4 py-2 rounded-xl text-[10px] sm:text-[11px] font-institutional font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 hover:scale-105 active:scale-95 cursor-pointer"
            >
              <i className="fa-solid fa-cloud-arrow-up text-xs"></i>
              <span>Subir Archivo al Servidor</span>
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-[#D4AF37] transition-colors p-2 text-xl cursor-pointer"
              aria-label="Cerrar panel de control"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        </div>

        {/* Live Metrics Row */}
        <div className="bg-brandGray border-b border-brandBorder px-5 sm:px-7 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-gold-champagne text-brandDark flex items-center justify-center font-bold text-sm shadow-sm">
              <i className="fa-solid fa-folder-open"></i>
            </span>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Total Documentos</p>
              <p className="font-institutional font-bold text-sm text-brandDark">{documents.length} Archivos</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm shadow-sm">
              <i className="fa-solid fa-server"></i>
            </span>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Archivos en Servidor</p>
              <p className="font-institutional font-bold text-sm text-emerald-700">{customDocsCount} Guardados</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shadow-sm">
              <i className="fa-solid fa-layer-group"></i>
            </span>
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Secciones Oficiales</p>
              <p className="font-institutional font-bold text-sm text-brandDark">9 Secciones Activas</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={handleExportJson}
              title="Descargar copia de seguridad en JSON"
              className="text-[9px] bg-white border border-brandBorder hover:border-[#D4AF37] px-2.5 py-1.5 rounded-lg text-gray-700 font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-file-export text-[#D4AF37]"></i> Respaldo
            </button>
            <button
              onClick={() => setShowResetConfirm(true)}
              title="Restablecer a la lista de documentos oficial"
              className="text-[9px] bg-white border border-brandBorder hover:border-red-400 px-2.5 py-1.5 rounded-lg text-gray-700 hover:text-red-600 font-semibold shadow-sm transition-all flex items-center gap-1 cursor-pointer"
            >
              <i className="fa-solid fa-rotate-left text-gray-400"></i> Restablecer
            </button>
          </div>
        </div>

        {/* Section Tabs Navigator */}
        <div className="bg-white border-b border-brandBorder px-4 sm:px-6 py-2 overflow-x-auto flex items-center gap-1.5 text-xs no-scrollbar">
          <button
            onClick={() => setSelectedSection('all')}
            className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-institutional font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedSection === 'all'
                ? 'bg-brandDark text-brandLightGold border border-[#D4AF37]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Todas las Secciones
          </button>
          {OFFICIAL_SECTIONS.map((sec) => {
            const count = documents.filter(d => d.sectionId === sec.id).length;
            const isSelected = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-institutional font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-brandDark text-brandLightGold border border-[#D4AF37]'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span>{sec.menuNumber}. {sec.name}</span>
                <span className={`text-[9px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-gold-champagne text-brandDark' : 'bg-gray-200 text-gray-700'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Filters and Search Bar */}
        <div className="p-4 sm:p-5 bg-gray-50 border-b border-brandBorder flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 bg-white border border-brandBorder rounded-xl px-3 py-2 flex-grow focus-within:border-[#D4AF37] shadow-sm">
            <i className="fa-solid fa-magnifying-glass text-gray-400"></i>
            <input
              type="text"
              placeholder="Buscar por título, nombre de archivo o área..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="outline-none bg-transparent w-full text-xs text-brandDark"
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="text-gray-400 hover:text-gray-600">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="bg-white border border-brandBorder rounded-xl px-3 py-2 text-xs text-brandDark outline-none focus:border-[#D4AF37] shadow-sm"
            >
              <option value="all">Año: Todos</option>
              <option value="2026">2026 (Actual)</option>
              <option value="2025">2025</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-white border border-brandBorder rounded-xl px-3 py-2 text-xs text-brandDark outline-none focus:border-[#D4AF37] shadow-sm"
            >
              <option value="all">Estatus: Todos</option>
              <option value="Publicado">Publicado</option>
              <option value="Vigente">Vigente</option>
              <option value="Pre-auditado">Pre-auditado</option>
              <option value="Integrado">Integrado</option>
              <option value="En Integración">En Integración</option>
            </select>
          </div>
        </div>

        {/* Documents Table / Card List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredDocs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300 space-y-3">
              <i className="fa-solid fa-folder-open text-4xl text-gray-300"></i>
              <p className="text-sm font-semibold text-gray-500">No se encontraron archivos con los filtros seleccionados.</p>
              <button
                onClick={() => openNewDocModal()}
                className="bg-gold-champagne text-brandDark text-xs font-institutional font-bold px-4 py-2 rounded-lg uppercase tracking-wider cursor-pointer"
              >
                Subir nuevo archivo aquí
              </button>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const secDef = OFFICIAL_SECTIONS.find(s => s.id === doc.sectionId);
              return (
                <div
                  key={doc.id}
                  className="bg-white border border-brandBorder hover:border-[#D4AF37] rounded-xl p-4 shadow-sm transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
                >
                  {/* Left: Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gold-champagne/15 border border-[#D4AF37]/30 text-[#B8860B] flex items-center justify-center flex-shrink-0 text-lg">
                      {doc.fileType === 'zip' ? (
                        <i className="fa-solid fa-file-zipper"></i>
                      ) : (
                        <i className="fa-solid fa-file-pdf"></i>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[9px] font-institutional font-bold bg-brandDark text-brandLightGold px-2 py-0.5 rounded uppercase">
                          {secDef ? `${secDef.menuNumber}. ${secDef.name}` : doc.sectionId}
                        </span>
                        <span className="text-[9px] bg-gold-champagne/30 text-brandDark font-semibold px-2 py-0.5 rounded">
                          {doc.category}
                        </span>
                        <span className="text-[9px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                          {doc.year}
                        </span>
                        {doc.fileUrl && (
                          <span className="text-[8px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                            <i className="fa-solid fa-cloud-check text-[9px]"></i> Servidor
                          </span>
                        )}
                        <span className={`text-[9px] px-2 py-0.5 rounded font-semibold ${
                          doc.status === 'Publicado' || doc.status === 'Vigente'
                            ? 'bg-green-100 text-green-700'
                            : doc.status === 'Pre-auditado'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {doc.status}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs sm:text-sm text-brandDark truncate">
                        {doc.title}
                      </h4>

                      <p className="text-[11px] text-gray-500 font-mono mt-0.5 truncate">
                        <i className="fa-solid fa-paperclip mr-1 text-gray-400"></i>
                        {doc.fileName} • <span className="font-sans">{doc.fileSize}</span> • <i className="fa-solid fa-building-columns ml-1 text-gray-400"></i> {doc.department}
                      </p>

                      {doc.description && (
                        <p className="text-[11px] text-gray-600 mt-1 line-clamp-1 italic">
                          {doc.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-gray-100 flex-shrink-0">
                    <button
                      onClick={() => downloadDocument(doc)}
                      title="Descargar o previsualizar archivo"
                      className="bg-gold-champagne text-brandDark hover:opacity-90 px-3 py-1.5 rounded-lg text-[10px] font-institutional font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <i className="fa-solid fa-download"></i>
                      <span>Descargar</span>
                    </button>

                    <button
                      onClick={() => handleTriggerQuickReplace(doc.id)}
                      title="Reemplazar archivo PDF directamente en el servidor"
                      className="bg-white border border-brandBorder hover:border-[#D4AF37] text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all shadow-sm cursor-pointer"
                    >
                      <i className="fa-solid fa-arrows-rotate text-[#D4AF37]"></i>
                      <span className="hidden sm:inline">Sustituir</span>
                    </button>

                    <button
                      onClick={() => openEditDocModal(doc)}
                      title="Editar metadatos e información"
                      className="bg-white border border-brandBorder hover:border-gray-400 text-gray-600 p-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>

                    <button
                      onClick={() => handleDeleteDoc(doc.id, doc.title)}
                      title="Eliminar archivo del portal"
                      className="bg-white border border-brandBorder hover:border-red-400 hover:text-red-600 text-gray-400 p-2 rounded-lg text-xs transition-all shadow-sm cursor-pointer"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info bar */}
        <div className="bg-[#111111] text-gray-400 px-5 sm:px-7 py-3 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[10px] gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-gray-300 font-mono">Sincronizado con almacenamiento en el servidor de Sayula de Alemán.</span>
          </div>
          <p className="text-brandLightGold font-institutional font-bold">
            "Juntos Mejoramos Mucho Más" — H. Ayuntamiento de Sayula de Alemán
          </p>
        </div>
      </div>

      {/* SUB-MODAL: Form to Upload or Edit Document */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in-scale">
          <div className="bg-white border-2 border-gold-champagne w-full max-w-xl rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-[#111111] text-white px-6 py-4 flex items-center justify-between border-b border-[#D4AF37]">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne text-brandDark flex items-center justify-center font-bold">
                  <i className="fa-solid fa-file-arrow-up"></i>
                </span>
                <div>
                  <h3 className="font-institutional font-bold text-sm text-brandLightGold uppercase">
                    {editingDoc ? 'Editar Documento Oficial' : 'Subir Nuevo Archivo al Servidor'}
                  </h3>
                  <p className="text-[10px] text-gray-400">Portal de Transparencia de Sayula de Alemán</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-gray-400 hover:text-white text-lg p-1 cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              {/* Target Section */}
              <div>
                <label className="block text-gray-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Sección del Portal donde se publicará:
                </label>
                <select
                  value={formSectionId}
                  onChange={(e) => handleSectionChangeInForm(e.target.value as SectionId)}
                  className="w-full bg-brandGray border border-brandBorder rounded-xl p-2.5 text-xs text-brandDark outline-none focus:border-[#D4AF37]"
                >
                  {OFFICIAL_SECTIONS.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.menuNumber}. {sec.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category / Subsección */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Categoría / Fondo:
                  </label>
                  <input
                    type="text"
                    required
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="Ej. Fondo FAISMUNDF 2026"
                    className="w-full bg-brandGray border border-brandBorder rounded-xl p-2.5 text-xs text-brandDark outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Ejercicio / Año Fiscal:
                  </label>
                  <input
                    type="text"
                    required
                    value={formYear}
                    onChange={(e) => setFormYear(e.target.value)}
                    placeholder="Ej. 2026 o 2026-2029"
                    className="w-full bg-brandGray border border-brandBorder rounded-xl p-2.5 text-xs text-brandDark outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-gray-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Título del Documento:
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej. Programa General de Inversión FAISMUNDF 2026"
                  className="w-full bg-brandGray border border-brandBorder rounded-xl p-2.5 text-xs text-brandDark outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Department & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Departamento Responsable:
                  </label>
                  <input
                    type="text"
                    required
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder="Ej. Tesorería Municipal / Obras Públicas"
                    className="w-full bg-brandGray border border-brandBorder rounded-xl p-2.5 text-xs text-brandDark outline-none focus:border-[#D4AF37]"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                    Estatus de Publicación:
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as DocumentItem['status'])}
                    className="w-full bg-brandGray border border-brandBorder rounded-xl p-2.5 text-xs text-brandDark outline-none focus:border-[#D4AF37]"
                  >
                    <option value="Publicado">Publicado</option>
                    <option value="Vigente">Vigente</option>
                    <option value="Pre-auditado">Pre-auditado</option>
                    <option value="Integrado">Integrado</option>
                    <option value="En Integración">En Integración</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-bold mb-1 uppercase tracking-wider text-[10px]">
                  Descripción breve (opcional):
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Detalles sobre el contenido del documento o validez legal..."
                  className="w-full bg-brandGray border border-brandBorder rounded-xl p-2.5 text-xs text-brandDark outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Method 1: File Dropzone (Direct to Server) */}
              <div className="border-2 border-dashed border-[#D4AF37]/60 hover:border-[#D4AF37] bg-gold-champagne/5 rounded-2xl p-4 text-center cursor-pointer relative group">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
                  disabled={isUploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-1 pointer-events-none">
                  <div className="w-10 h-10 mx-auto rounded-full bg-gold-champagne text-brandDark flex items-center justify-center text-lg shadow-sm">
                    {isUploading ? (
                      <i className="fa-solid fa-spinner animate-spin"></i>
                    ) : (
                      <i className="fa-solid fa-cloud-arrow-up"></i>
                    )}
                  </div>
                  <p className="font-bold text-xs text-brandDark">
                    {isUploading ? 'Subiendo archivo al servidor...' : 'Haga clic para seleccionar o arrastre el archivo PDF'}
                  </p>
                  <p className="text-[10px] text-gray-500">
                    Se guarda directamente en el servidor oficial para acceso en línea (PDF, ZIP, DOCX, XLSX)
                  </p>
                </div>

                {formFileName && (
                  <div className="mt-3 p-2.5 bg-white border border-brandBorder rounded-xl inline-flex items-center gap-2 text-xs font-semibold text-brandDark shadow-sm">
                    <i className="fa-solid fa-circle-check text-emerald-600"></i>
                    <span>Archivo cargado: <strong>{formFileName}</strong> ({formFileSize})</span>
                  </div>
                )}
              </div>

              {/* Method 2: External Link / Google Drive / ORFIS URL */}
              <div className="bg-gray-50 border border-brandBorder rounded-xl p-3 space-y-1">
                <label className="block text-gray-700 font-bold uppercase tracking-wider text-[9px]">
                  O Enlace Directo / URL de la nube (Opcional):
                </label>
                <div className="flex items-center gap-2 bg-white border border-brandBorder rounded-lg px-2.5 py-1.5">
                  <i className="fa-solid fa-link text-gray-400"></i>
                  <input
                    type="url"
                    value={formExternalUrl}
                    onChange={(e) => setFormExternalUrl(e.target.value)}
                    placeholder="https://drive.google.com/... o https://orfis.gob.mx/..."
                    className="w-full text-xs text-brandDark outline-none"
                  />
                </div>
                <p className="text-[9px] text-gray-400">
                  Si el documento ya está alojado en Google Drive, portal del ORFIS o repositorio estatal, puede pegar aquí su enlace.
                </p>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="bg-gold-champagne text-brandDark px-6 py-2.5 rounded-xl font-institutional font-bold text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isUploading ? 'Subiendo...' : editingDoc ? 'Guardar Cambios' : 'Publicar Documento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-[170] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="bg-white border-2 border-red-500 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center text-xl">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h4 className="font-institutional font-bold text-sm text-brandDark">
              ¿Restablecer Documentos Oficiales?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Esta acción revertirá la lista al conjunto de documentos oficiales iniciales configurados para el H. Ayuntamiento de Sayula de Alemán.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs text-gray-600 hover:bg-gray-100 font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleResetDefaults}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow cursor-pointer"
              >
                Sí, Restablecer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
