import React, { useState, useEffect } from 'react';
import { SectionId, DocumentItem } from './types';
import { loadDocuments, saveDocuments, getAdminSession, setAdminSession, fetchServerDocuments } from './utils/documentStorage';
import { NavigationDrawer } from './components/NavigationDrawer';
import { SaraAssistantModal } from './components/SaraAssistantModal';
import { SectionViews } from './components/SectionViews';
import { AdminPanelModal } from './components/AdminPanelModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { subscribeToDocuments } from './utils/firestoreService';

export default function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('inicio');
  const [isNavDrawerOpen, setIsNavDrawerOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [assistantInitialQuery, setAssistantInitialQuery] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(true);

  // Admin states
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminInitialSection, setAdminInitialSection] = useState<SectionId | 'all'>('all');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(false);

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hero search input state
  const [heroSearchText, setHeroSearchText] = useState('');

  useEffect(() => {
    const loaded = loadDocuments();
    setDocuments(loaded);

    // 1. Fetch up-to-date documents from static JSON/server for offline fallback
    fetchServerDocuments().then((serverDocs) => {
      if (serverDocs && serverDocs.length > 0) {
        setDocuments(serverDocs);
      }
    });

    // 2. Real-time subscription to Firestore Cloud Database
    const unsubscribeFirestore = subscribeToDocuments((cloudDocs) => {
      if (cloudDocs && cloudDocs.length > 0) {
        setDocuments(cloudDocs);
      }
    });

    const sessionActive = getAdminSession();
    setIsAdminAuthenticated(sessionActive);

    const syncFromHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash === 'admin' || window.location.search.includes('admin')) {
        if (getAdminSession()) {
          setIsAdminPanelOpen(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      } else if (hash && hash !== '') {
        const validSections: SectionId[] = [
          'inicio',
          'obras-publicas',
          'transparencia',
          'ayuntamiento',
          'organigrama-view',
          'contraloria',
          'planes-desarrollo',
          'cuentas-publicas',
          'ingresos-egresos',
          'informacion-financiera',
          'disciplina-financiera',
          'terminos',
          'privacidad'
        ];
        if (validSections.includes(hash as SectionId)) {
          setActiveSection(hash as SectionId);
        }
      } else {
        setActiveSection('inicio');
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);

    // Keyboard shortcut: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) || (e.altKey && (e.key === 'a' || e.key === 'A'))) {
        e.preventDefault();
        if (getAdminSession()) {
          setIsAdminPanelOpen(true);
        } else {
          setIsAdminLoginOpen(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('hashchange', syncFromHash);
      unsubscribeFirestore();
    };
  }, []);

  const handleDocumentsChange = (newDocs: DocumentItem[]) => {
    setDocuments(newDocs);
    saveDocuments(newDocs);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const navigateTo = (secId: SectionId) => {
    setActiveSection(secId);
    if (secId === 'inicio') {
      window.history.pushState(null, '', window.location.pathname);
    } else {
      window.location.hash = `#${secId}`;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (heroSearchText.trim()) {
      setAssistantInitialQuery(heroSearchText.trim());
      setIsAssistantOpen(true);
      setHeroSearchText('');
    }
  };

  const handleLoginSuccess = () => {
    setAdminSession(true);
    setIsAdminAuthenticated(true);
    setIsAdminLoginOpen(false);
    setIsAdminPanelOpen(true);
    showToast('Sesión de administrador autorizada.');
  };

  const handleOpenAdmin = (secId?: SectionId) => {
    setAdminInitialSection(secId || 'all');
    if (isAdminAuthenticated) {
      setIsAdminPanelOpen(true);
    } else {
      setIsAdminLoginOpen(true);
    }
  };

  const handleLogoutAdmin = () => {
    setAdminSession(false);
    setIsAdminAuthenticated(false);
    setIsAdminPanelOpen(false);
    showToast('Sesión de administración cerrada.');
  };

  return (
    <div className="bg-white text-brandDark font-sans selection:bg-[#D4AF37] selection:text-white relative overflow-x-hidden min-h-screen flex flex-col">
      {/* CONTENEDOR HERMÉTICO DE DECORADORES */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <img
          src="https://i.imgur.com/j1Vc4DM.png"
          alt="Identidad Sayula 1"
          className="absolute top-[8%] left-[-3%] w-56 md:w-80 opacity-10 pointer-events-none animate-float-slow select-none"
        />
        <img
          src="https://i.imgur.com/yXXeGPX.png"
          alt="Identidad Sayula 2"
          className="absolute top-[32%] right-[-3%] w-52 md:w-80 opacity-12 pointer-events-none animate-float-delayed select-none"
        />
        <img
          src="https://i.imgur.com/iyP7Umm.png"
          alt="Identidad Sayula 3"
          className="absolute bottom-[28%] left-[-2%] w-48 md:w-72 opacity-10 pointer-events-none animate-float-slow select-none"
        />
        <img
          src="https://i.imgur.com/8fzqfvF.png"
          alt="Identidad Sayula 4"
          className="absolute bottom-[4%] right-[-2%] w-52 md:w-80 opacity-12 pointer-events-none animate-float-delayed select-none"
        />
        <img
          src="https://i.imgur.com/nkyKMsw.png"
          alt="Símbolo Central Sayula"
          className="absolute top-[55%] left-[50%] -translate-x-1/2 w-72 md:w-[35rem] opacity-5 pointer-events-none animate-pulse-glow select-none"
        />
        <img
          src="https://i.imgur.com/qJPht23.png"
          alt="Decoración Premium Sayula 1"
          className="absolute top-[20%] left-[8%] w-40 md:w-56 opacity-5 pointer-events-none animate-float-delayed mix-blend-multiply select-none"
        />
        <img
          src="https://i.imgur.com/Uqy9h8C.png"
          alt="Decoración Premium Sayula 2"
          className="absolute bottom-[40%] right-[10%] w-48 md:w-64 opacity-5 pointer-events-none animate-float-slow mix-blend-multiply select-none"
        />
      </div>

      {/* TOP STATUS BAR: 100% IDENTICAL TO ORIGINAL DESIGN (Clean public view) */}
      <div className="relative z-50 text-[10px] tracking-widest uppercase py-3 border-b border-white/10 bg-gold-champagne">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex justify-between items-center text-brandDark font-medium">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-lock text-brandDark text-xs mr-1 animate-pulse"></i>
            <span className="font-bold tracking-widest text-[9px] sm:text-[10px]">CONEXIÓN SEGURA SSL</span>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="bg-brandDark text-brandLightGold px-2.5 py-0.5 rounded text-[8px] font-bold tracking-widest flex items-center gap-1 shadow-sm mr-1 cursor-pointer"
              >
                <i className="fa-solid fa-gear text-gold-champagne"></i> Panel Activo
              </button>
            )}
            <span className="bg-white text-[#B8860B] px-3 py-1 rounded text-[9px] font-extrabold tracking-widest shadow-sm">
              SITIO OFICIAL
            </span>
          </div>
        </div>
      </div>

      {/* HEADER: Clean public view with logo and Menu button */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brandBorder transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-3 flex justify-between items-center">
          <button
            onClick={() => navigateTo('inicio')}
            className="flex items-center group transition-transform duration-300 hover:scale-103 cursor-pointer text-left"
          >
            <img
              src="https://i.imgur.com/2YV4S9u.png"
              alt="Escudo Oficial Sayula de Alemán"
              className="h-12 sm:h-16 md:h-20 w-auto object-contain transition-all duration-300"
            />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsNavDrawerOpen(true)}
              className="flex items-center gap-3 bg-brandDark text-white border-2 border-[#D4AF37]/40 hover:border-[#D4AF37] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full shadow-gold-glow transition-all duration-300 group hover:scale-103 active:scale-97 cursor-pointer"
            >
              <span className="font-institutional font-bold uppercase tracking-widest text-[9px] sm:text-[11px] text-brandLightGold">
                Menú
              </span>
              <div className="flex flex-col gap-1 w-5">
                <span className="h-0.5 w-full bg-white rounded transition-transform group-hover:translate-y-[2px]"></span>
                <span className="h-0.5 w-full bg-[#D4AF37] rounded"></span>
                <span className="h-0.5 w-full bg-white rounded transition-transform group-hover:-translate-y-[2px]"></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* NAVIGATION DRAWER */}
      <NavigationDrawer
        isOpen={isNavDrawerOpen}
        onClose={() => setIsNavDrawerOpen(false)}
        onNavigate={navigateTo}
        onOpenAdmin={handleOpenAdmin}
      />

      {/* MAIN APP WRAPPER */}
      <main className="flex-grow relative z-10 flex flex-col w-full">
        {/* Hero Section (Visible strictly for Inicio) */}
        {activeSection === 'inicio' && (
          <section className="relative overflow-hidden py-12 md:py-20 border-b border-brandBorder bg-white transition-all duration-500 animate-fade-in-scale w-full">
            <img
              src="https://i.imgur.com/qJPht23.png"
              alt="Decoración Identidad Izquierda"
              className="absolute left-[-5%] top-1/2 -translate-y-1/2 w-72 md:w-[32rem] opacity-[0.07] pointer-events-none mix-blend-multiply z-0 select-none"
            />
            <img
              src="https://i.imgur.com/Uqy9h8C.png"
              alt="Decoración Identidad Derecha"
              className="absolute right-[5%] bottom-[-10%] w-64 md:w-[28rem] opacity-[0.06] pointer-events-none mix-blend-multiply z-0 select-none"
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
              {/* Core Hero Content */}
              <div className="lg:col-span-7 flex flex-col justify-center relative z-10 w-full">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-champagne text-brandDark rounded-full text-[11px] font-bold uppercase tracking-widest w-fit mb-6 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-brandDark animate-ping"></span>
                  ¡Bienvenid@!
                </span>

                <h2 className="text-2xl sm:text-3xl md:text-5xl font-institutional font-bold tracking-tight text-brandDark leading-tight mb-5 animate-text-focus">
                  Transparencia, Legalidad y{' '}
                  <span className="text-gold-champagne font-extrabold relative">
                    Rendición de Cuentas
                    <span className="absolute bottom-1 left-0 w-full h-[4px] bg-gold-champagne/15"></span>
                  </span>
                </h2>

                <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed mb-8 max-w-xl font-normal">
                  Plataforma oficial del H. Ayuntamiento de <strong>Sayula de Alemán, Veracruz</strong>. Este espacio está dedicado de forma exclusiva al acceso y consulta de la información pública oficial, cumpliendo con las normativas de transparencia y el ejercicio contable de la administración municipal.
                </p>

                {/* Instant Search Assistant Access Block */}
                <form
                  onSubmit={handleHeroSearch}
                  className="bg-white border border-brandBorder shadow-gold-glow rounded-xl p-2 flex flex-col sm:flex-row gap-2 max-w-lg mb-8 transition-all focus-within:border-[#D4AF37] focus-within:shadow-gold-glow-strong duration-300"
                >
                  <div className="flex items-center gap-3 px-3 flex-grow py-2">
                    <i className="fa-solid fa-magnifying-glass text-[#D4AF37] text-lg"></i>
                    <input
                      type="text"
                      value={heroSearchText}
                      onChange={(e) => setHeroSearchText(e.target.value)}
                      placeholder="Consulte a SARA: '¿Dónde está el plan de desarrollo?'"
                      className="bg-transparent outline-none text-xs text-brandDark w-full placeholder-gray-400 font-sans"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-gold-champagne text-brandDark hover:opacity-90 px-5 py-3 rounded-lg text-[10px] font-institutional font-bold tracking-wider uppercase transition-all duration-300 shadow-md hover:scale-102 cursor-pointer"
                  >
                    Consultar
                  </button>
                </form>

                {/* Municipal Slogan Ribbon */}
                <div className="flex items-center gap-3 border-l-2 border-[#B8860B] pl-4 py-1.5">
                  <span className="font-institutional text-[9px] sm:text-[10px] tracking-widest text-brandDark uppercase font-bold">
                    Gestión de Gobierno:
                  </span>
                  <span className="text-gold-champagne font-institutional italic font-bold text-xs">
                    "Juntos Mejoramos Mucho Más"
                  </span>
                </div>
              </div>

              {/* Cover Image Container */}
              <div className="lg:col-span-5 flex justify-center items-center w-full">
                <img
                  src="https://i.imgur.com/9ugQ23u.png"
                  alt="Presidencia Municipal de Sayula de Alemán"
                  className="w-full max-w-xl aspect-[16/9] object-contain rounded-xl shadow-md border border-brandBorder"
                />
              </div>
            </div>
          </section>
        )}

        {/* Dynamic Content Grid Sections */}
        <section className="py-12 relative z-10 flex-grow bg-white w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <SectionViews
              activeSection={activeSection}
              documents={documents}
              onNavigate={navigateTo}
              onOpenAdmin={handleOpenAdmin}
              onShowToast={showToast}
            />
          </div>
        </section>
      </main>

      {/* FLOATING SMART ASSISTANT TRIGGER BUTTON */}
      <button
        onClick={() => {
          setAssistantInitialQuery('');
          setIsAssistantOpen(true);
        }}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50 bg-gold-champagne text-brandDark p-3.5 sm:p-4 rounded-full shadow-gold-glow-strong flex items-center justify-center gap-2 border border-white/40 group transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Abrir Asistente Virtual SARA"
      >
        <div className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brandDark opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brandDark"></span>
        </div>
        <i className="fa-solid fa-magnifying-glass-chart text-brandDark text-base sm:text-lg"></i>
        <span className="font-institutional font-bold tracking-widest text-[10px] sm:text-[11px] pr-1.5 hidden md:inline">
          CONSULTA SARA
        </span>
      </button>

      {/* SARA ASSISTANT MODAL */}
      <SaraAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        initialQuery={assistantInitialQuery}
      />

      {/* INITIAL UPDATE NOTICE MODAL */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 bg-[#111111]/80 backdrop-blur-md z-[130] flex items-center justify-center p-4 transition-all duration-500 animate-fade-in-scale">
          <div
            className="bg-white border-2 border-gold-champagne w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ borderImage: 'linear-gradient(135deg, #D4AF37, #F7EF8A, #B8860B) 1' }}
          >
            <div className="bg-[#111111] text-white px-5 py-4 flex justify-between items-center border-b border-[#D4AF37]">
              <div className="flex items-center gap-3">
                <span className="text-gold-champagne text-lg animate-pulse">
                  <i className="fa-solid fa-circle-exclamation"></i>
                </span>
                <h3 className="font-institutional text-[11px] sm:text-xs tracking-widest text-brandLightGold uppercase font-bold">
                  Aviso Oficial
                </h3>
              </div>
              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="text-gray-400 hover:text-[#D4AF37] transition-colors text-xl p-1 cursor-pointer"
                aria-label="Cerrar modal"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <div className="p-8 text-center space-y-6">
              <div className="relative w-14 h-14 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
                <div
                  className="absolute inset-0 rounded-full border-4 border-[#D4AF37] border-t-transparent animate-spin"
                  style={{ animationDuration: '1.2s' }}
                ></div>
                <div className="absolute inset-3 rounded-full bg-gold-champagne animate-pulse opacity-80 shadow-gold-glow"></div>
              </div>

              <p className="text-brandDark font-semibold text-sm leading-relaxed">
                La información actualizada de esta plataforma estará disponible en breve. Estamos cargando los archivos e información actualizados.
              </p>

              <button
                onClick={() => setIsUpdateModalOpen(false)}
                className="mt-4 bg-gold-champagne text-brandDark hover:opacity-95 px-8 py-3 rounded-xl text-[10px] font-institutional font-bold uppercase tracking-wider transition-all shadow-md hover:scale-102 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADMIN LOGIN MODAL */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleLoginSuccess}
      />

      {/* ADMIN CONTROL PANEL MODAL FOR DOCUMENTS */}
      <ErrorBoundary fallbackTitle="Panel de Control de Archivos y Documentación">
        <AdminPanelModal
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
          documents={documents}
          onDocumentsChange={handleDocumentsChange}
          initialSectionFilter={adminInitialSection}
          onShowToast={showToast}
        />
      </ErrorBoundary>

      {/* CUSTOM FEEDBACK TOAST */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 bg-[#111111] text-white border border-[#D4AF37]/40 p-4 rounded-xl shadow-gold-glow max-w-xs sm:max-w-sm z-[160] animate-fade-in-scale">
          <div className="flex items-start gap-3">
            <span className="text-gold-champagne text-lg">
              <i className="fa-solid fa-circle-check"></i>
            </span>
            <div>
              <h4 className="font-institutional font-bold text-xs uppercase tracking-wider text-brandLightGold">
                Consulta de Documento
              </h4>
              <p className="text-[10px] sm:text-[11px] text-gray-300 mt-0.5 leading-relaxed">
                {toastMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* HIGH CONTRAST ELEVATED FOOTER: 100% IDENTICAL COLORS TO ORIGINAL DESIGN */}
      <footer
        className="bg-brandDark text-white border-t-2 mt-auto relative z-20 shadow-2xl w-full"
        style={{ borderImage: 'linear-gradient(135deg, #D4AF37, #F7EF8A, #B8860B) 1' }}
      >
        {/* Civic Badge row */}
        <div className="border-b border-white/5 py-8 bg-brandDark w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 w-full">
            <div className="flex items-center gap-5">
              <img
                src="https://i.imgur.com/0YjigVk.png"
                alt="Sayula Escudo Blanco"
                className="h-20 sm:h-24 w-auto object-contain transition-transform duration-300 hover:scale-105"
              />
              <div className="border-l border-[#D4AF37]/40 pl-5 py-1">
                <h4 className="font-institutional text-xs tracking-widest text-brandLightGold uppercase font-bold">
                  H. AYUNTAMIENTO CONSTITUCIONAL
                </h4>
                <p className="text-[9px] text-gray-400 uppercase mt-0.5 tracking-[0.2em]">
                  SAYULA DE ALEMÁN, VERACRUZ
                </p>
              </div>
            </div>
            {/* Slogan Block */}
            <div className="border-l-2 md:border-l-4 border-[#D4AF37] pl-4 py-1.5 text-center md:text-left">
              <span className="text-[9px] text-gray-400 block uppercase tracking-widest font-bold">
                ESLOGAN DE ADMINISTRACIÓN
              </span>
              <span className="text-gold-champagne font-institutional italic text-sm font-bold">
                "Juntos Mejoramos Mucho Más"
              </span>
            </div>
          </div>
        </div>

        {/* Main footer contents links */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
          <div className="space-y-4">
            <h5 className="text-[10px] uppercase font-institutional tracking-widest text-gold-champagne font-bold">
              Domicilio y Contacto
            </h5>
            <p className="text-xs text-gray-300 leading-relaxed font-normal">
              <i className="fa-solid fa-location-dot text-[#D4AF37] mr-2"></i> Palacio Municipal, Calle Principal S/N, Col. Centro, Sayula de Alemán, Veracruz, C.P. 96150.
            </p>
            <p className="text-xs text-gray-300 font-normal">
              <i className="fa-solid fa-envelope text-[#D4AF37] mr-2"></i> transparencia@sayuladealeman.gob.mx
            </p>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] uppercase font-institutional tracking-widest text-gold-champagne font-bold">
              Enlaces de Transparencia
            </h5>
            <ul className="space-y-2 text-xs text-gray-300 font-normal">
              <li>
                <button onClick={() => navigateTo('obras-publicas')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  1. Obras Públicas 2026
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('transparencia')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  2. Obligaciones y Privacidad
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('cuentas-publicas')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  6. Cuentas Públicas
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('ingresos-egresos')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  7. Ingresos y Egresos
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] uppercase font-institutional tracking-widest text-gold-champagne font-bold">
              Gobierno y Contraloría
            </h5>
            <ul className="space-y-2 text-xs text-gray-300 font-normal">
              <li>
                <button onClick={() => navigateTo('ayuntamiento')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  3. Cabildo y Directorio
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('contraloria')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  4. Contraloría e Internos
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('informacion-financiera')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  8. Información Financiera
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('disciplina-financiera')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  9. Disciplina Financiera (LDF)
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h5 className="text-[10px] uppercase font-institutional tracking-widest text-gold-champagne font-bold">
              Privacidad y Legalidad
            </h5>
            <ul className="space-y-2 text-xs text-gray-300 font-normal">
              <li>
                <button onClick={() => navigateTo('terminos')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  Términos y Condiciones
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('privacidad')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  Aviso de Privacidad Oficial
                </button>
              </li>
              <li>
                <button onClick={() => navigateTo('inicio')} className="hover:text-gold-champagne transition-colors cursor-pointer">
                  Página de Inicio
                </button>
              </li>
              {isAdminAuthenticated && (
                <li>
                  <button
                    onClick={handleLogoutAdmin}
                    className="text-red-400 hover:text-red-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer mt-1"
                  >
                    <i className="fa-solid fa-right-from-bracket text-[9px]"></i> Cerrar Sesión Admin
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Trademark bottom area: 100% IDENTICAL TO ORIGINAL DESIGN */}
        <div className="bg-brandDark/95 border-t border-white/5 py-6 text-center text-[10px] text-gray-500 tracking-widest font-normal w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            <p className="flex items-center justify-center gap-2">
              <span>&copy; 2026 H. Ayuntamiento de Sayula de Alemán, Veracruz. Todos los derechos reservados.</span>
              {/* Subtle discreet admin access point for government personnel */}
              <button
                onClick={() => handleOpenAdmin()}
                className="text-gray-700 hover:text-[#D4AF37] transition-colors p-1 cursor-pointer"
                title="Acceso Gubernamental (Ctrl+Shift+A o #admin)"
              >
                <i className="fa-solid fa-lock text-[8px]"></i>
              </button>
            </p>
            <p className="text-gold-champagne uppercase font-bold">
              <i className="fa-solid fa-circle-check text-[#D4AF37] mr-1"></i> Portal Gubernamental en Cumplimiento Normativo
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
