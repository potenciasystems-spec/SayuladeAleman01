import React from 'react';
import { DocumentItem, SectionId } from '../types';
import { downloadDocument } from '../utils/documentStorage';

interface SectionViewsProps {
  activeSection: SectionId;
  documents: DocumentItem[];
  onNavigate: (sectionId: SectionId) => void;
  onOpenAdmin?: (sectionId?: SectionId) => void;
  onShowToast: (msg: string) => void;
}

export const SectionViews: React.FC<SectionViewsProps> = ({
  activeSection,
  documents,
  onNavigate,
  onOpenAdmin,
  onShowToast
}) => {
  const getDocsFor = (sectionId: SectionId, filterFn?: (doc: DocumentItem) => boolean) => {
    const safeList = Array.isArray(documents) ? documents : [];
    let list = safeList.filter(d => Boolean(d && d.sectionId === sectionId));
    if (filterFn) {
      list = list.filter(doc => {
        try {
          return filterFn(doc);
        } catch {
          return false;
        }
      });
    }
    return list;
  };

  const handleDownload = (doc: DocumentItem) => {
    onShowToast(`Iniciando la descarga oficial de: ${doc.title} (${doc.fileName})`);
    downloadDocument(doc);
  };

  return (
    <div className="w-full">
      {/* ================= SECTION: INICIO ================= */}
      {activeSection === 'inicio' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          {/* Row 1: Split Welcoming Info & Secondary Highlight Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
            {/* Welcome & Local Pride */}
            <div className="lg:col-span-8 space-y-8 w-full">
              <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
                <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark border-b border-brandBorder pb-4 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                    <i className="fa-solid fa-landmark"></i>
                  </span>
                  El Municipio de Sayula de Alemán, Veracruz
                </h3>
                <p className="text-gray-600 text-xs sm:text-sm leading-relaxed font-normal">
                  Situado estratégicamente en la zona sur del estado, el municipio de <strong>Sayula de Alemán</strong> es un pilar fundamental en la historia, cultura e impulso productivo veracruzano. Esta plataforma tiene la finalidad de transparentar y brindar acceso expedito a toda la información pública oficial, cumpliendo cabalmente con las normativas vigentes en materia fiscal y de disciplina administrativa para dar certeza a nuestra comunidad.
                </p>

                {/* ADJUSTMENT 3 APPLIED: Sustituye la imagen actual por: https://i.imgur.com/1wPlszs.jpeg */}
                <div className="relative overflow-hidden rounded-xl border border-brandBorder group shadow-sm aspect-[16/9] bg-gray-100 max-h-[350px]">
                  <img
                    src="https://i.imgur.com/1wPlszs.jpeg"
                    alt="Sayula de Alemán, Veracruz"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex items-end p-4 sm:p-6">
                    <div>
                      <span className="text-[9px] bg-gold-champagne text-brandDark px-2.5 py-1 rounded-md uppercase tracking-wider font-bold font-institutional shadow">
                        Patrimonio Público
                      </span>
                      <h4 className="text-white text-sm sm:text-base font-institutional font-bold mt-2">
                        Corazón urbano e identidad histórica de Sayula de Alemán
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Municipal Highlights Card */}
            <div className="lg:col-span-4 space-y-6 w-full">
              <div className="bg-white border border-brandBorder rounded-2xl p-4 shadow-sm relative overflow-hidden group">
                <div className="absolute top-3 left-3 bg-gold-champagne text-brandDark text-[9px] tracking-wider font-bold px-2.5 py-0.5 rounded-md z-10 uppercase font-institutional shadow">
                  MUNICIPIO
                </div>
                <div className="overflow-hidden rounded-xl border border-brandBorder aspect-[4/3] bg-gray-50 mb-4 relative">
                  <img
                    src="https://cronicadexalapa.com.mx/wp-content/uploads/2025/01/sayula.jpeg"
                    alt="Sayula Vista Municipal"
                    className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <h4 className="font-institutional font-bold text-xs uppercase tracking-wider text-brandDark">
                  Crecimiento Social Ordenado
                </h4>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  Enfocados en consolidar la infraestructura comunitaria bajo las más estrictas normativas y estándares de transparencia administrativa.
                </p>
              </div>

              {/* Quick Info Alert */}
              <div className="bg-gold-champagne text-brandDark border border-brandBorder rounded-2xl p-6 space-y-4 shadow-sm">
                <h4 className="font-institutional text-[9px] sm:text-[10px] tracking-widest text-brandDark uppercase font-bold flex items-center gap-2">
                  <i className="fa-solid fa-circle-info"></i> CONSULTA CIUDADANA INTELIGENTE
                </h4>
                <p className="text-xs text-brandDark leading-relaxed font-semibold">
                  En cumplimiento con las disposiciones de transparencia, ponemos a su disposición el <strong>Asistente Inteligente SARA</strong>. Puede utilizar el buscador flotante en pantalla para localizar con total facilidad los marcos reglamentarios y los estados contables del ayuntamiento.
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Real-time Municipal Stats Grid */}
          <div className="bg-brandDark text-white border-2 border-[#D4AF37] rounded-2xl p-6 md:p-8 space-y-6 shadow-gold-glow-strong relative overflow-hidden w-full">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="border-b border-white/10 pb-4">
              <h4 className="font-institutional font-bold text-xs sm:text-sm tracking-widest text-[#F7EF8A] uppercase">
                INDICADORES DE TRANSPARENCIA Y GESTIÓN
              </h4>
              <p className="text-[9px] text-gray-400 uppercase tracking-wider mt-1">
                Cumplimiento continuo auditado en tiempo real
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center w-full">
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl transition-all hover:border-[#F7EF8A]/50 duration-300">
                <div className="text-[#F7EF8A] text-2xl mb-2">
                  <i className="fa-solid fa-helmet-safety"></i>
                </div>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Obras Activas</p>
                <p className="text-3xl font-institutional font-extrabold text-white mt-1">42</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl transition-all hover:border-[#F7EF8A]/50 duration-300">
                <div className="text-[#F7EF8A] text-2xl mb-2">
                  <i className="fa-solid fa-users"></i>
                </div>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Habitantes</p>
                <p className="text-3xl font-institutional font-extrabold text-white mt-1">34,500</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl transition-all hover:border-[#F7EF8A]/50 duration-300">
                <div className="text-[#F7EF8A] text-2xl mb-2">
                  <i className="fa-solid fa-file-shield"></i>
                </div>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Documentos</p>
                <p className="text-3xl font-institutional font-extrabold text-white mt-1">{documents.length}</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-xl transition-all hover:border-[#F7EF8A]/50 duration-300">
                <div className="text-[#F7EF8A] text-2xl mb-2">
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Atendidos</p>
                <p className="text-3xl font-institutional font-extrabold text-white mt-1">98%</p>
              </div>
            </div>
          </div>

          {/* Row 3: Identity Quick Portal Dashboard grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div
              onClick={() => onNavigate('obras-publicas')}
              className="border border-brandBorder hover:border-[#D4AF37] p-6 rounded-xl cursor-pointer bg-white shadow-sm hover:shadow-gold-glow transition-all group duration-300 w-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-gold-champagne text-lg transition-transform duration-300 group-hover:translate-x-1">
                  <i className="fa-solid fa-helmet-safety"></i>
                </span>
                <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                  1. Obras Públicas 2026
                </h4>
              </div>
              <p className="text-xs text-gray-500">
                Consulte los Programas Generales de Inversión municipal de los fondos federales FAISMUNDF y FORTAMUNDF.
              </p>
            </div>
            <div
              onClick={() => onNavigate('transparencia')}
              className="border border-brandBorder hover:border-[#D4AF37] p-6 rounded-xl cursor-pointer bg-white shadow-sm hover:shadow-gold-glow transition-all group duration-300 w-full"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-gold-champagne text-lg transition-transform duration-300 group-hover:translate-x-1">
                  <i className="fa-solid fa-shield-halved"></i>
                </span>
                <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                  2. Avisos & Obligaciones
                </h4>
              </div>
              <p className="text-xs text-gray-500">
                Obligaciones comunes y específicas de la Ley 250 de Transparencia vigentes para el periodo 2026-2029.
              </p>
            </div>
          </div>

          {/* ADJUSTMENT 2 APPLIED: Sección PLATAFORMA CIUDADANA EXTERNA con fondo negro y alto contraste para resaltar */}
          <div className="mt-12 bg-[#0c0c0c] text-white border-2 border-[#D4AF37] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-black via-[#111111] to-[#1c1605] pointer-events-none"></div>
            {/* Subtle decorator inside the dark banner */}
            <img
              src="https://i.imgur.com/qJPht23.png"
              alt="Decoración Banner"
              className="absolute left-[-5%] top-1/2 -translate-y-1/2 w-48 opacity-[0.06] pointer-events-none mix-blend-screen z-0"
            />

            <div className="space-y-3 relative z-10 max-w-2xl text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gold-champagne text-brandDark rounded-full text-[9px] font-bold uppercase tracking-widest shadow-md">
                <i className="fa-solid fa-server animate-pulse"></i> PLATAFORMA CIUDADANA EXTERNA
              </span>
              <h4 className="font-institutional font-bold text-base sm:text-xl md:text-2xl text-white">
                Portal de Trámites, Servicios y Reportes
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed font-normal">
                ¿Desea realizar pagos de impuesto predial, reportar luminarias fallidas, solicitar servicios de recolección o realizar trámites administrativos directos? Ingrese de forma segura a nuestro portal de servicios interactivos externos.
              </p>
            </div>

            <div className="relative z-10 flex-shrink-0 w-full md:w-auto">
              <a
                href="https://portal-sayula-de-alem-n-238093242035.us-west1.run.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-gold-champagne text-brandDark hover:opacity-95 px-7 py-4 rounded-xl text-[10px] sm:text-[11px] font-institutional font-bold uppercase tracking-widest shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white/20 animate-pulse group-hover:shadow-gold-glow-strong"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Ir a Trámites y Servicios <i className="fa-solid fa-circle-arrow-right text-xs"></i>
                </span>
              </a>
            </div>
          </div>

          {/* Row 5: Anuncio Section with Futuristic Frame (Preserved as instructed) */}
          <div className="mt-12 bg-white border border-brandBorder rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-6 shadow-sm w-full animate-fade-in-scale">
            <div className="w-full border-b border-brandBorder pb-4 mb-2">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-bullhorn"></i>
                </span>
                Anuncio
              </h3>
            </div>

            <div className="futuristic-frame p-1.5 sm:p-2 rounded-2xl bg-brandDark max-w-4xl w-full overflow-hidden relative group shadow-gold-glow-strong">
              <div className="scanline-effect"></div>
              <div className="absolute inset-0 bg-gold-champagne opacity-10 blur-xl rounded-2xl animate-pulse-glow pointer-events-none z-0"></div>

              <div className="relative z-10 rounded-xl overflow-hidden border border-[#D4AF37]/30 bg-black">
                <img
                  src="https://i.imgur.com/HlvCGcs.jpeg"
                  alt="Anuncio Informativo Municipal"
                  className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-[1.02]"
                />
              </div>
            </div>
          </div>

          {/* ADJUSTMENT 1 APPLIED: El cajón de "Comunicado Oficial" ha sido ELIMINADO completamente */}
        </div>
      )}

      {/* ================= SECTION 1: OBRAS PÚBLICAS ================= */}
      {activeSection === 'obras-publicas' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full relative overflow-hidden">
            <img
              src="https://i.imgur.com/qJPht23.png"
              alt="Decoración Obras"
              className="absolute bottom-4 right-4 w-32 md:w-48 opacity-10 pointer-events-none mix-blend-multiply z-0"
            />

            <div className="border-b border-brandBorder pb-6 mb-6 relative z-10">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-helmet-safety"></i>
                </span>
                1. Obras Públicas - Programas Generales de Inversión 2026
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Información oficial sobre la distribución física y financiera de recursos de infraestructura del ejercicio fiscal 2026.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              {/* FAISMUNDF */}
              <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-brandBorder pb-3">
                  <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                    Fondo FAISMUNDF 2026
                  </h4>
                  <span className="text-[9px] bg-gold-champagne text-brandDark font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                    Aportación Federal
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  Fondo de Aportaciones para la Infraestructura Social Municipal y de las Demarcaciones Territoriales del Distrito Federal. Destinado a agua potable, urbanización, drenaje, electrificación y educación.
                </p>
                <div className="space-y-2">
                  {getDocsFor('obras-publicas', d => d.category.includes('FAISMUNDF')).map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-brandGray border border-brandBorder rounded-lg gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-brandDark block truncate">{doc.fileName}</span>
                        <span className="text-[10px] text-gray-400 block">{doc.fileSize} • {doc.uploadDate}</span>
                      </div>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="bg-gold-champagne text-brandDark text-[9px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider shadow hover:opacity-90 transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        <i className="fa-solid fa-file-pdf"></i> PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FORTAMUNDF */}
              <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-brandBorder pb-3">
                  <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                    Fondo FORTAMUNDF 2026
                  </h4>
                  <span className="text-[9px] bg-gold-champagne text-brandDark font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                    Fortalecimiento
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  Fondo de Aportaciones para el Fortalecimiento de los Municipios. Aplicado prioritariamente al cumplimiento de obligaciones financieras, seguridad pública municipal y saneamiento ambiental.
                </p>
                <div className="space-y-2">
                  {getDocsFor('obras-publicas', d => d.category.includes('FORTAMUNDF')).map(doc => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-brandGray border border-brandBorder rounded-lg gap-2"
                    >
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-brandDark block truncate">{doc.fileName}</span>
                        <span className="text-[10px] text-gray-400 block">{doc.fileSize} • {doc.uploadDate}</span>
                      </div>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="bg-gold-champagne text-brandDark text-[9px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider shadow hover:opacity-90 transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        <i className="fa-solid fa-file-pdf"></i> PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 2: TRANSPARENCIA ================= */}
      {activeSection === 'transparencia' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full relative">
            <div className="border-b border-brandBorder pb-6 mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-file-shield"></i>
                </span>
                2. Transparencia y Protección de Datos Personales
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Acceso pleno a la información pública obligatoria en apego a los lineamientos del Instituto Veracruzano de Acceso a la Información (IVAI).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Avisos de Privacidad */}
              <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                  Avisos de Privacidad Oficiales
                </h4>
                <p className="text-xs text-gray-500 font-normal">
                  Consulte los lineamientos que garantizan la privacidad de sus datos personales recopilados en las diferentes direcciones del ayuntamiento.
                </p>
                <ul className="space-y-2 text-xs">
                  {getDocsFor('transparencia', d => d.category.includes('Avisos')).map(doc => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 bg-brandGray border border-brandBorder rounded-lg gap-2"
                    >
                      <span className="truncate">{doc.fileName}</span>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="bg-gold-champagne text-brandDark font-bold px-2.5 py-1 text-[9px] rounded shadow uppercase tracking-wider flex-shrink-0"
                      >
                        Descargar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Obligaciones de Transparencia */}
              <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="font-institutional font-bold text-xs text-[#B8860B] uppercase tracking-wider">
                  Obligaciones de Transparencia 2026 - 2029
                </h4>
                <p className="text-xs text-gray-500 font-normal">
                  Contiene la información detallada que por ley el ayuntamiento de Sayula de Alemán debe publicar de forma continua.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {getDocsFor('transparencia', d => d.category.includes('Obligaciones')).map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 bg-brandGray border border-brandBorder rounded-lg flex flex-col justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-brandDark block truncate">{doc.title}</span>
                        <span className="text-[10px] text-gray-500">{doc.fileSize}</span>
                      </div>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="bg-gold-champagne text-brandDark text-[9px] font-bold px-2.5 py-1.5 rounded-md mt-2 uppercase tracking-wider shadow flex items-center justify-center gap-1"
                      >
                        <i className="fa-solid fa-box"></i> Carpeta / Archivo
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Ley 250 */}
            <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                  Ley 250 de Transparencia y Acceso a la Información Pública
                </h4>
                <p className="text-xs text-gray-500 font-normal">
                  Consulte la normatividad del Estado de Veracruz de Ignacio de la Llave en materia de transparencia proactiva.
                </p>
              </div>
              {getDocsFor('transparencia', d => d.category.includes('Ley 250')).map(doc => (
                <button
                  key={doc.id}
                  onClick={() => handleDownload(doc)}
                  className="bg-gold-champagne text-brandDark text-[10px] px-4 py-2.5 rounded-lg font-bold uppercase tracking-wider shadow hover:opacity-90 transition-all flex items-center gap-1.5 flex-shrink-0"
                >
                  <i className="fa-solid fa-gavel"></i> Descargar Ley Completa PDF
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3: AYUNTAMIENTO ================= */}
      {activeSection === 'ayuntamiento' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full">
            <div className="border-b border-brandBorder pb-6 mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-sitemap"></i>
                </span>
                3. Estructura Orgánica y Gobierno del Ayuntamiento
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Conozca la conformación del Cabildo de Sayula de Alemán, el directorio oficial y la trayectoria de los directores de área.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Cabildo y Sesiones */}
              <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                  Actas de Cabildo 2026
                </h4>
                <p className="text-xs text-gray-500 font-normal">
                  Descargue de forma directa las actas de las sesiones ordinarias, extraordinarias y solemnes que definen el rumbo del municipio.
                </p>
                <ul className="space-y-2 text-xs">
                  {getDocsFor('ayuntamiento', d => d.category.includes('Cabildo')).map(doc => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 bg-brandGray border border-brandBorder rounded-lg gap-2"
                    >
                      <span className="truncate">{doc.fileName}</span>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="bg-gold-champagne text-brandDark text-[9px] font-bold px-2.5 py-1 rounded shadow uppercase tracking-wider flex-shrink-0"
                      >
                        PDF
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Organigrama e Institucional */}
              <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                  Organigrama Oficial Autorizado
                </h4>
                <p className="text-xs text-gray-500 font-normal">
                  Visualice y descargue la jerarquía administrativa estructural que conforma las diferentes dependencias del gobierno.
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={() => onNavigate('organigrama-view')}
                    className="border border-[#D4AF37] hover:border-gold-champagne bg-brandGray text-brandDark text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider shadow flex items-center justify-center gap-1.5 transition-all"
                  >
                    <i className="fa-solid fa-circle-nodes text-[#D4AF37]"></i> Ver Estructura Interactiva
                  </button>
                  {getDocsFor('ayuntamiento', d => d.category.includes('Organigrama')).map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => handleDownload(doc)}
                      className="bg-gold-champagne text-brandDark text-[10px] font-bold py-2.5 rounded-lg uppercase tracking-wider shadow flex items-center justify-center gap-1.5"
                    >
                      <i className="fa-solid fa-download"></i> Descargar Versión PDF
                    </button>
                  ))}
                </div>
              </div>

              {/* Directorio & CV Directores */}
              <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm space-y-3">
                <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                  Directorio y Currículums (CV)
                </h4>
                <p className="text-xs text-gray-500 font-normal">
                  Cumpliendo con la transparencia activa, ponemos a su disposición el directorio telefónico municipal y las hojas de vida de los servidores públicos.
                </p>
                <ul className="space-y-2 text-xs">
                  {getDocsFor('ayuntamiento', d => d.category.includes('Directorio')).map(doc => (
                    <li
                      key={doc.id}
                      className="flex items-center justify-between p-2.5 bg-brandGray border border-brandBorder rounded-lg gap-2"
                    >
                      <span className="truncate">{doc.title}</span>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="bg-gold-champagne text-brandDark text-[9px] font-bold px-2.5 py-1 rounded shadow uppercase tracking-wider flex-shrink-0"
                      >
                        Consultar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 3.1: ORGANIGRAMA INTERACTIVO ================= */}
      {activeSection === 'organigrama-view' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full">
            <div className="border-b border-brandBorder pb-6 mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                  <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                    <i className="fa-solid fa-sitemap"></i>
                  </span>
                  Organigrama Estructural Municipal
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-normal">
                  Jerarquía de mando autorizada del H. Ayuntamiento de Sayula de Alemán para el ejercicio fiscal 2026.
                </p>
              </div>
              <button
                onClick={() => onNavigate('ayuntamiento')}
                className="bg-brandDark text-white hover:bg-black text-[10px] px-3.5 py-1.5 rounded-lg font-institutional font-bold uppercase tracking-wider transition-all"
              >
                <i className="fa-solid fa-arrow-left mr-1"></i> Volver
              </button>
            </div>

            <div className="flex flex-col items-center py-6 text-center space-y-6 w-full">
              {/* Level 1: Presidencia */}
              <div className="relative pb-6 w-full flex justify-center">
                <div
                  className="bg-brandDark text-white border-2 border-gold-champagne px-8 py-4 rounded-xl shadow-lg relative z-10 w-full max-w-xs transition-transform duration-300 hover:scale-105"
                  style={{ borderImage: 'linear-gradient(135deg, #D4AF37, #F7EF8A, #B8860B) 1' }}
                >
                  <span className="text-[9px] uppercase font-institutional tracking-widest text-[#F7EF8A] font-bold">
                    Presidencia Municipal
                  </span>
                  <p className="font-institutional font-bold text-xs mt-1">C. Presidenta Municipal Constitucional</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">Gestión y Dirección de Gobierno 2026-2029</p>
                </div>
                <div
                  className="absolute bottom-0 left-1/2 -translate-x-1/2"
                  style={{ width: '2px', height: '24px', background: 'linear-gradient(to bottom, #D4AF37, #B8860B)' }}
                ></div>
              </div>

              {/* Level 2: Regidurías / Contraloría / Tesorería */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl pt-4">
                <div className="bg-white border border-brandBorder hover:border-[#D4AF37] p-4 rounded-xl shadow-sm transition-all duration-300 text-center space-y-1 hover:scale-103 w-full">
                  <span className="text-[9px] uppercase font-institutional font-bold text-brandDark bg-gold-champagne px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                    Sindicatura Única
                  </span>
                  <p className="font-bold text-xs text-brandDark">Representación Legal y Jurídica</p>
                  <p className="text-[10px] text-gray-500">Vigilancia del patrimonio de Sayula de Alemán</p>
                </div>
                <div className="bg-white border border-brandBorder hover:border-[#D4AF37] p-4 rounded-xl shadow-sm transition-all duration-300 text-center space-y-1 hover:scale-103 w-full">
                  <span className="text-[9px] uppercase font-institutional font-bold text-brandDark bg-gold-champagne px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                    Órgano de Control Interno
                  </span>
                  <p className="font-bold text-xs text-brandDark">Contraloría Municipal</p>
                  <p className="text-[10px] text-gray-500">L.C. Edgar Martínez Castillo - Titular</p>
                </div>
                <div className="bg-white border border-brandBorder hover:border-[#D4AF37] p-4 rounded-xl shadow-sm transition-all duration-300 text-center space-y-1 hover:scale-103 w-full">
                  <span className="text-[9px] uppercase font-institutional font-bold text-brandDark bg-gold-champagne px-2.5 py-1 rounded-md tracking-wider shadow-sm">
                    Tesorería Municipal
                  </span>
                  <p className="font-bold text-xs text-brandDark">Hacienda y Finanzas Públicas</p>
                  <p className="text-[10px] text-gray-500">Administración financiera y contabilidad</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 4: CONTRALORÍA ================= */}
      {activeSection === 'contraloria' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full relative overflow-hidden">
            <img
              src="https://i.imgur.com/Uqy9h8C.png"
              alt="Decoración Contraloría"
              className="absolute bottom-4 right-4 w-32 md:w-48 opacity-10 pointer-events-none mix-blend-multiply z-0"
            />

            <div className="border-b border-brandBorder pb-6 mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-landmark-flag"></i>
                </span>
                4. Contraloría Municipal y Control Interno
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Supervisión, fiscalización del gasto público municipal, expedientes de Entrega-Recepción y base jurídica institucional.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              {/* Entrega-Recepción */}
              <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-brandBorder pb-3">
                  <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                    Entrega - Recepción 2022-2026
                  </h4>
                  <span className="text-[9px] bg-gold-champagne text-brandDark font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                    Expediente Legal
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  Documentación oficial que contiene los estados de fuerza, inventarios de bienes del municipio, archivos, obligaciones y obras públicas de la transición administrativa anterior.
                </p>
                <div className="space-y-2">
                  {getDocsFor('contraloria', d => d.category.includes('Entrega')).map(doc => (
                    <div
                      key={doc.id}
                      className="p-3 bg-brandGray border border-brandBorder rounded-lg flex items-center justify-between gap-2"
                    >
                      <span className="text-xs font-bold text-brandDark flex items-center gap-2 truncate">
                        <i className="fa-solid fa-file-invoice text-[#D4AF37]"></i> {doc.fileName}
                      </span>
                      <button
                        onClick={() => handleDownload(doc)}
                        className="bg-gold-champagne text-brandDark text-[9px] px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider shadow hover:opacity-90 transition-all flex items-center gap-1 flex-shrink-0"
                      >
                        <i className="fa-solid fa-file-pdf"></i> PDF
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Marco Legal */}
              <div className="bg-white border border-brandBorder rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-brandBorder pb-3">
                  <h4 className="font-institutional font-bold text-xs text-[#B8860B] uppercase tracking-wider font-bold">
                    Marco Legal de Actuación
                  </h4>
                  <span className="text-[9px] bg-brandDark text-white font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                    Normativa
                  </span>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-normal">
                  Leyes, decretos y códigos aplicables que rigen de forma directa las actividades, presupuesto y disciplina gubernamental del ayuntamiento.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {getDocsFor('contraloria', d => d.category.includes('Marco Legal')).map(doc => (
                    <button
                      key={doc.id}
                      onClick={() => handleDownload(doc)}
                      className="bg-gold-champagne text-brandDark text-[9px] font-bold p-2.5 rounded-lg uppercase tracking-wider shadow flex flex-col items-center justify-center gap-1 hover:opacity-90 transition-all"
                    >
                      <i className="fa-solid fa-scale-balanced text-sm"></i>
                      <span className="truncate">{doc.title.split(' ')[2] || 'Documento'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 5: PLANES DE DESARROLLO ================= */}
      {activeSection === 'planes-desarrollo' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full">
            <div className="border-b border-brandBorder pb-6 mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-route"></i>
                </span>
                5. Planes de Desarrollo Municipal
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Planificación estratégica, ejes rectores y metas fijadas para el progreso sostenible de Sayula de Alemán.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getDocsFor('planes-desarrollo').map((doc) => {
                const isCurrent = doc.year.includes('2026');
                return (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-xl p-5 flex flex-col justify-between relative shadow-sm ${
                      isCurrent ? 'border-2 border-[#D4AF37] shadow-gold-glow' : 'border border-brandBorder'
                    }`}
                  >
                    {isCurrent && (
                      <span className="absolute top-3 right-3 bg-gold-champagne text-brandDark text-[8px] font-bold px-2 py-0.5 rounded uppercase tracking-wider font-institutional shadow-sm">
                        ACTUAL
                      </span>
                    )}
                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-[#B8860B]">
                        {isCurrent ? 'GESTIÓN EN CURSO' : 'HISTÓRICO'}
                      </span>
                      <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider">
                        {doc.title}
                      </h4>
                      <p className="text-xs text-gray-500">{doc.description}</p>
                    </div>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="bg-gold-champagne text-brandDark text-[10px] font-bold py-2.5 rounded-lg w-full uppercase tracking-wider shadow mt-4 flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                    >
                      <i className="fa-solid fa-file-pdf"></i> Descargar PDM
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 6: CUENTAS PÚBLICAS ================= */}
      {activeSection === 'cuentas-publicas' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full">
            <div className="border-b border-brandBorder pb-6 mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-vault"></i>
                </span>
                6. Cuentas Públicas Municipales Consolidadas
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Informes de la gestión financiera municipal entregados en tiempo ante el Órgano de Fiscalización Superior (ORFIS) del Estado de Veracruz.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {getDocsFor('cuentas-publicas').map(doc => (
                <div
                  key={doc.id}
                  className="bg-white p-5 rounded-xl border border-brandBorder shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <span className="text-xl text-gold-champagne">
                      <i className="fa-solid fa-folder-open"></i>
                    </span>
                    <h4 className="font-institutional font-bold text-xs mt-3 text-brandDark uppercase tracking-wider">
                      {doc.category}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-1">{doc.description}</p>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="bg-gold-champagne text-brandDark text-[9px] font-bold py-2 rounded-lg mt-4 w-full uppercase tracking-wider shadow flex items-center justify-center gap-1.5 hover:opacity-90 transition-all"
                  >
                    <i className="fa-solid fa-download"></i> Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 7: PRESUPUESTO ================= */}
      {activeSection === 'ingresos-egresos' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full">
            <div className="border-b border-brandBorder pb-6 mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-chart-pie"></i>
                </span>
                7. Presupuesto de Ingresos y Egresos Municipal
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Información detallada sobre la asignación de recursos públicos, recaudación tributaria y Leyes de Ingresos anuales.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {getDocsFor('ingresos-egresos').map(doc => {
                const isCurrent = doc.year === '2026';
                return (
                  <div
                    key={doc.id}
                    className={`bg-white rounded-xl p-4 flex flex-col justify-between h-48 transition-all hover:scale-103 ${
                      isCurrent ? 'border-2 border-[#D4AF37] shadow-gold-glow' : 'border border-brandBorder'
                    }`}
                  >
                    <div>
                      <span className={`text-xs font-bold ${isCurrent ? 'text-[#B8860B]' : 'text-gray-400'}`}>
                        {isCurrent ? 'EJERCICIO VIGENTE' : `EJERCICIO ${doc.year}`}
                      </span>
                      <h4 className="font-institutional font-bold text-xs text-brandDark mt-1">{doc.title}</h4>
                    </div>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="bg-gold-champagne text-brandDark text-[9px] font-bold py-1.5 rounded-lg w-full uppercase tracking-wider shadow flex items-center justify-center gap-1 hover:opacity-90"
                    >
                      <i className="fa-solid fa-file-pdf"></i> Descargar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 8: FINANZAS / CONAC ================= */}
      {activeSection === 'informacion-financiera' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full relative overflow-hidden">
            <img
              src="https://i.imgur.com/qJPht23.png"
              alt="Decoración Finanzas"
              className="absolute bottom-4 right-4 w-32 md:w-48 opacity-10 pointer-events-none mix-blend-multiply z-0"
            />

            <div className="border-b border-brandBorder pb-6 mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-scale-balanced"></i>
                </span>
                8. Información Financiera y Estados Contables
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Armonización contable conforme a la Ley General de Contabilidad Gubernamental (LGCG) y lineamientos de CONAC.
              </p>
            </div>

            <div className="space-y-3 relative z-10">
              <div className="hidden sm:grid grid-cols-12 gap-4 px-4 text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                <div className="col-span-8">Documento Oficial / Ejercicio</div>
                <div className="col-span-2 text-center">Fase</div>
                <div className="col-span-2 text-right">Consulta</div>
              </div>

              {getDocsFor('informacion-financiera').map(doc => (
                <div
                  key={doc.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-4 p-4 bg-white border border-brandBorder rounded-xl items-center shadow-sm"
                >
                  <div className="col-span-1 sm:col-span-8">
                    <span className="text-[9px] bg-gold-champagne text-brandDark px-2 py-0.5 rounded uppercase font-bold tracking-wider font-institutional shadow-sm mr-2">
                      {doc.year}
                    </span>
                    <span className="text-xs font-bold text-brandDark">{doc.title}</span>
                  </div>
                  <div className="col-span-1 sm:col-span-2 text-left sm:text-center">
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] uppercase tracking-wider font-semibold ${
                      doc.status === 'Pre-auditado' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {doc.status}
                    </span>
                  </div>
                  <div className="col-span-1 sm:col-span-2 text-right">
                    <button
                      onClick={() => handleDownload(doc)}
                      className="bg-gold-champagne text-brandDark text-[9px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow w-full sm:w-auto hover:opacity-90"
                    >
                      Descargar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION 9: DISCIPLINA FINANCIERA (LDF) ================= */}
      {activeSection === 'disciplina-financiera' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 w-full relative overflow-hidden">
            <img
              src="https://i.imgur.com/Uqy9h8C.png"
              alt="Decoración LDF"
              className="absolute bottom-4 right-4 w-32 md:w-48 opacity-10 pointer-events-none mix-blend-multiply z-0"
            />

            <div className="border-b border-brandBorder pb-6 mb-6">
              <h3 className="text-base sm:text-lg md:text-xl font-institutional font-bold text-brandDark flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-gold-champagne flex items-center justify-center text-brandDark">
                  <i className="fa-solid fa-chart-line"></i>
                </span>
                9. Disciplina Financiera y Cumplimiento de la LDF (Título V)
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-normal">
                Informes de disciplina presupuestaria en cumplimiento del Título Quinto de la Ley de Disciplina Financiera de las Entidades Federativas y los Municipios.
              </p>
            </div>

            <div className="space-y-4 relative z-10">
              <h4 className="font-institutional font-bold text-xs text-brandDark uppercase tracking-wider border-b border-brandBorder pb-2">
                Informes Trimestrales del Ejercicio Fiscal 2026
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {getDocsFor('disciplina-financiera').map(doc => (
                  <div
                    key={doc.id}
                    className="bg-white border border-brandBorder rounded-xl p-4 flex flex-col justify-between h-40 transition-all hover:scale-103"
                  >
                    <div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        doc.status === 'Publicado'
                          ? 'bg-gold-champagne text-brandDark'
                          : 'bg-brandDark text-white'
                      }`}>
                        {doc.status}
                      </span>
                      <h5 className="font-institutional font-bold text-xs text-brandDark mt-2 truncate">
                        {doc.title}
                      </h5>
                    </div>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="bg-gold-champagne text-brandDark text-[9px] font-bold py-1.5 rounded-lg w-full uppercase tracking-wider shadow flex items-center justify-center gap-1 hover:opacity-90"
                    >
                      <i className="fa-solid fa-download"></i> Descargar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= SECTION: TÉRMINOS Y CONDICIONES ================= */}
      {activeSection === 'terminos' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 space-y-4 shadow-sm w-full">
            <h3 className="text-base font-institutional font-bold text-brandDark uppercase tracking-wider">
              Términos y Condiciones de Uso del Portal
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              Este portal tiene la finalidad de dar estricto cumplimiento a la transparencia proactiva gubernamental. La información aquí presentada se rige bajo los lineamientos estatales del Instituto Veracruzano de Acceso a la Información (IVAI) y la normativa de Datos Abiertos.
            </p>
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              Los logotipos oficiales e imágenes de identidad correspondientes a Sayula de Alemán, Veracruz, se encuentran protegidos legalmente y queda prohibido cualquier uso lucrativo o ajeno al derecho a la información ciudadana.
            </p>
          </div>
        </div>
      )}

      {/* ================= SECTION: AVISO DE PRIVACIDAD ================= */}
      {activeSection === 'privacidad' && (
        <div className="space-y-8 animate-fade-in-scale w-full">
          <div className="bg-brandGray border border-brandBorder rounded-2xl p-6 md:p-8 space-y-4 shadow-sm w-full">
            <h3 className="text-base font-institutional font-bold text-brandDark uppercase tracking-wider">
              Aviso Legal y de Privacidad
            </h3>
            <p className="text-gray-600 leading-relaxed font-normal text-xs">
              El H. Ayuntamiento de Sayula de Alemán, Veracruz, actúa como sujeto obligado garante de la información y la confidencialidad de los usuarios del sitio, apegándose estrictamente a la Ley de Protección de Datos Personales en Posesión de Sujetos Obligados para el Estado de Veracruz.
            </p>
            <p className="text-gray-600 leading-relaxed font-normal text-xs">
              Este portal se enfoca en la divulgación de documentos informativos de transparencia municipal. No recaba claves de identidad privada, no procesa transacciones bancarias ni recopila credenciales del público. La interacción generada en el módulo asistente inteligente SARA es temporal y con fines meramente orientativos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
