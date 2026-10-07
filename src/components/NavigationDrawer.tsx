import React, { useState } from 'react';
import { SectionId } from '../types';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (sectionId: SectionId) => void;
  onOpenAdmin?: (sectionId?: SectionId) => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onOpenAdmin
}) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleAccordion = (id: string) => {
    setActiveAccordion(prev => (prev === id ? null : id));
  };

  const handleLinkClick = (sectionId: SectionId) => {
    onNavigate(sectionId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[120] transition-all duration-500">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-[#111111]/80 backdrop-blur-sm transition-opacity"
      ></div>

      {/* Sliding menu panel */}
      <div
        className="absolute right-0 top-0 bottom-0 w-full sm:max-w-md bg-white border-l-2 shadow-2xl flex flex-col h-full animate-fade-in-scale"
        style={{ borderImage: 'linear-gradient(to bottom, #D4AF37, #F7EF8A, #B8860B) 1' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-[#111111] text-white">
          <div className="flex items-center gap-3">
            <img
              src="https://i.imgur.com/2YV4S9u.png"
              alt="Escudo Sayula"
              className="h-10 w-auto object-contain"
            />
            <div className="border-l border-[#D4AF37]/50 pl-3">
              <h4 className="font-institutional text-xs tracking-widest text-[#F7EF8A] uppercase font-bold">
                Transparencia
              </h4>
              <p className="text-[8px] text-gray-400 uppercase tracking-wider">
                Sayula de Alemán
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-[#D4AF37] transition-colors text-2xl p-2"
            aria-label="Cerrar Menú"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Accordions */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 text-xs">
          {/* Quick Link: Inicio */}
          <button
            onClick={() => handleLinkClick('inicio')}
            className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-3 border-b border-gray-100 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
          >
            <span>Inicio</span>
            <i className="fa-solid fa-house text-[10px] text-[#B8860B]"></i>
          </button>

          {/* 1. Obras Públicas */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleAccordion('acc-obras')}
              className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-2 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
            >
              <span>1. Obras Públicas</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-[#B8860B] transition-transform ${activeAccordion === 'acc-obras' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeAccordion === 'acc-obras' && (
              <div className="pl-4 space-y-2 mt-1 py-1">
                <button onClick={() => handleLinkClick('obras-publicas')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Programas de Inversión 2026
                </button>
                <button onClick={() => handleLinkClick('obras-publicas')} className="block text-left text-[10px] text-gray-500 hover:text-[#B8860B] pl-4 py-0.5">
                  - Fondo FAISMUNDF
                </button>
                <button onClick={() => handleLinkClick('obras-publicas')} className="block text-left text-[10px] text-gray-500 hover:text-[#B8860B] pl-4 py-0.5">
                  - Fondo FORTAMUNDF
                </button>
              </div>
            )}
          </div>

          {/* 2. Transparencia */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleAccordion('acc-transparencia')}
              className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-2 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
            >
              <span>2. Transparencia</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-[#B8860B] transition-transform ${activeAccordion === 'acc-transparencia' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeAccordion === 'acc-transparencia' && (
              <div className="pl-4 space-y-2 mt-1 py-1">
                <button onClick={() => handleLinkClick('transparencia')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Avisos de Privacidad
                </button>
                <button onClick={() => handleLinkClick('transparencia')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Obligaciones de Transparencia
                </button>
                <button onClick={() => handleLinkClick('transparencia')} className="block text-left text-[10px] text-gray-500 hover:text-[#B8860B] pl-4 py-0.5">
                  - Obligaciones Comunes
                </button>
                <button onClick={() => handleLinkClick('transparencia')} className="block text-left text-[10px] text-gray-500 hover:text-[#B8860B] pl-4 py-0.5">
                  - Obligaciones Específicas
                </button>
                <button onClick={() => handleLinkClick('transparencia')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Ley 250 de Transparencia
                </button>
              </div>
            )}
          </div>

          {/* 3. Ayuntamiento */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleAccordion('acc-ayuntamiento')}
              className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-2 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
            >
              <span>3. Ayuntamiento</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-[#B8860B] transition-transform ${activeAccordion === 'acc-ayuntamiento' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeAccordion === 'acc-ayuntamiento' && (
              <div className="pl-4 space-y-2 mt-1 py-1">
                <button onClick={() => handleLinkClick('ayuntamiento')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Cabildo
                </button>
                <button onClick={() => handleLinkClick('organigrama-view')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Organigrama
                </button>
                <button onClick={() => handleLinkClick('ayuntamiento')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Directorio Oficial
                </button>
                <button onClick={() => handleLinkClick('ayuntamiento')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • CV Directores de Área
                </button>
              </div>
            )}
          </div>

          {/* 4. Contraloría */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleAccordion('acc-contraloria')}
              className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-2 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
            >
              <span>4. Contraloría</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-[#B8860B] transition-transform ${activeAccordion === 'acc-contraloria' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeAccordion === 'acc-contraloria' && (
              <div className="pl-4 space-y-2 mt-1 py-1">
                <button onClick={() => handleLinkClick('contraloria')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Entrega - Recepción 2022-2026
                </button>
                <button onClick={() => handleLinkClick('contraloria')} className="block text-left text-[10px] text-gray-500 hover:text-[#B8860B] pl-4 py-0.5">
                  - Acta Circunstanciada
                </button>
                <button onClick={() => handleLinkClick('contraloria')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Marco Legal
                </button>
                <button onClick={() => handleLinkClick('contraloria')} className="block text-left text-[10px] text-gray-500 hover:text-[#B8860B] pl-4 py-0.5">
                  - Federal / Estatal / Municipal
                </button>
              </div>
            )}
          </div>

          {/* 5. Planes de Desarrollo */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleAccordion('acc-planes')}
              className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-2 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
            >
              <span>5. Planes de Desarrollo</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-[#B8860B] transition-transform ${activeAccordion === 'acc-planes' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeAccordion === 'acc-planes' && (
              <div className="pl-4 space-y-2 mt-1 py-1">
                <button onClick={() => handleLinkClick('planes-desarrollo')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Plan de Desarrollo 18-21
                </button>
                <button onClick={() => handleLinkClick('planes-desarrollo')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Plan de Desarrollo 22-25
                </button>
                <button onClick={() => handleLinkClick('planes-desarrollo')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Plan de Desarrollo 26-29
                </button>
              </div>
            )}
          </div>

          {/* 6. Cuentas Públicas */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleAccordion('acc-cuentas')}
              className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-2 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
            >
              <span>6. Cuentas Públicas</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-[#B8860B] transition-transform ${activeAccordion === 'acc-cuentas' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeAccordion === 'acc-cuentas' && (
              <div className="pl-4 space-y-2 mt-1 py-1">
                <button onClick={() => handleLinkClick('cuentas-publicas')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Ejercicios Fiscales 2022 a 2025
                </button>
              </div>
            )}
          </div>

          {/* 7. Presupuesto */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleAccordion('acc-presupuesto')}
              className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-2 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
            >
              <span>7. Presupuesto</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-[#B8860B] transition-transform ${activeAccordion === 'acc-presupuesto' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeAccordion === 'acc-presupuesto' && (
              <div className="pl-4 space-y-2 mt-1 py-1">
                <button onClick={() => handleLinkClick('ingresos-egresos')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Presupuestos Anuales 2022 - 2026
                </button>
              </div>
            )}
          </div>

          {/* 8. Finanzas */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleAccordion('acc-finanzas')}
              className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-2 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
            >
              <span>8. Finanzas / CONAC</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-[#B8860B] transition-transform ${activeAccordion === 'acc-finanzas' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeAccordion === 'acc-finanzas' && (
              <div className="pl-4 space-y-2 mt-1 py-1">
                <button onClick={() => handleLinkClick('informacion-financiera')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Estados Financieros 2022 a 2026
                </button>
              </div>
            )}
          </div>

          {/* 9. Disciplina Financiera */}
          <div className="border-b border-gray-100 pb-2">
            <button
              onClick={() => toggleAccordion('acc-ldf')}
              className="w-full text-left font-institutional font-bold text-xs uppercase tracking-widest py-2 text-brandDark hover:text-[#B8860B] transition-colors flex justify-between items-center"
            >
              <span>9. Disciplina Financiera (LDF)</span>
              <i className={`fa-solid fa-chevron-down text-[9px] text-[#B8860B] transition-transform ${activeAccordion === 'acc-ldf' ? 'rotate-180' : ''}`}></i>
            </button>
            {activeAccordion === 'acc-ldf' && (
              <div className="pl-4 space-y-2 mt-1 py-1">
                <button onClick={() => handleLinkClick('disciplina-financiera')} className="block text-left text-[11px] font-semibold text-gray-600 hover:text-brandDark transition-colors py-1">
                  • Título V - LDF (Trimestres 1 a 4)
                </button>
              </div>
            )}
          </div>

          {/* Privacy & Terms */}
          <div className="pt-4 space-y-2">
            <button
              onClick={() => handleLinkClick('terminos')}
              className="block w-full text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] transition-colors"
            >
              Términos y Condiciones
            </button>
            <button
              onClick={() => handleLinkClick('privacidad')}
              className="block w-full text-center text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#D4AF37] transition-colors"
            >
              Aviso de Privacidad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
