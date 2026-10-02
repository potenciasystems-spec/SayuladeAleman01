import React, { useState, useRef, useEffect } from 'react';

interface SaraMessage {
  id: string;
  sender: 'user' | 'sara';
  text: string;
}

interface SaraAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
}

export const SaraAssistantModal: React.FC<SaraAssistantModalProps> = ({
  isOpen,
  onClose,
  initialQuery
}) => {
  const [messages, setMessages] = useState<SaraMessage[]>([
    {
      id: 'welcome',
      sender: 'sara',
      text: 'Saludos. Soy SARA (Sayula Alemán Respuestas Asistidas), el sistema inteligente de búsqueda e información oficial de Sayula de Alemán. Le orientaré para que localice fácilmente toda la documentación fiscal, legal y de desarrollo municipal que necesite.'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const consoleBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSend(initialQuery);
    }
  }, [isOpen, initialQuery]);

  useEffect(() => {
    consoleBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  if (!isOpen) return null;

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const userMsg: SaraMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    const lower = trimmed.toLowerCase();
    let reply = "Disculpe el inconveniente, estoy consultando las bases de datos del Órgano Interno de Control. Bajo nuestro eslogan 'Juntos Mejoramos Mucho Más', puede consultar esta información abriendo el Menú de Transparencia superior.";

    if (lower.includes("obra") || lower.includes("faismundf") || lower.includes("fortamundf")) {
      reply = "📍 Para consultar los Programas Generales de Inversión y fondos federales FAISMUNDF y FORTAMUNDF 2026, por favor abra el Menú de Transparencia y seleccione '1. Obras Públicas'. Ahí podrá descargar las cédulas y programas autorizados. ¡Juntos Mejoramos Mucho Más!";
    } else if (lower.includes("transparencia") || lower.includes("obligacion") || lower.includes("ley 250") || lower.includes("privacidad")) {
      reply = "📍 Las Obligaciones de Transparencia comunes y específicas (2026-2029) y los Avisos de Privacidad se encuentran en la sección '2. Transparencia'. También puede consultar la Ley 250 completa en formato PDF.";
    } else if (lower.includes("cabildo") || lower.includes("organigrama") || lower.includes("directorio") || lower.includes("cv") || lower.includes("director")) {
      reply = "📍 Encontrará las actas de sesiones de Cabildo 2026, organigrama interactivo, directorio y currículums (CV) de directores de área ingresando a '3. Ayuntamiento'.";
    } else if (lower.includes("entrega") || lower.includes("recepcion") || lower.includes("contraloria") || lower.includes("acta circunstanciada") || lower.includes("ley")) {
      reply = "📍 El expediente oficial de Entrega-Recepción (2022-2026), Acta Circunstanciada y el Marco Legal Federal, Estatal y Municipal están publicados en '4. Contraloría'.";
    } else if (lower.includes("desarrollo") || lower.includes("plan")) {
      reply = "📍 Los Planes de Desarrollo Municipal (2018-2021, 2022-2025 y el Plan Vigente 2026-2029) se ubican en la sección '5. Planes de Desarrollo'.";
    } else if (lower.includes("cuenta") || lower.includes("publica") || lower.includes("orfis")) {
      reply = "📍 Las Cuentas Públicas de los ejercicios fiscales 2022, 2023, 2024 y 2025 entregadas ante el ORFIS están disponibles en '6. Cuentas Públicas'.";
    } else if (lower.includes("presupuesto") || lower.includes("ingreso") || lower.includes("egreso")) {
      reply = "📍 Para consultar los Presupuestos Anuales de Ingresos y Egresos (2022 a 2026), diríjase a '7. Presupuesto'.";
    } else if (lower.includes("finanzas") || lower.includes("estado") || lower.includes("contable") || lower.includes("conac")) {
      reply = "📍 Los Estados Financieros armonizados con CONAC y cuentas contables se consultan en '8. Finanzas'.";
    } else if (lower.includes("disciplina") || lower.includes("ldf") || lower.includes("trimestre")) {
      reply = "📍 Los Informes Trimestrales de la Ley de Disciplina Financiera (Título V) correspondientes al ejercicio 2026 están en '9. Disciplina Financiera (LDF)'.";
    } else if (lower.includes("tramite") || lower.includes("predial") || lower.includes("servicio") || lower.includes("reporte")) {
      reply = "📍 Para realizar pagos de predial, reportes ciudadanos o trámites administrativos, acceda a la sección 'PLATAFORMA CIUDADANA EXTERNA' en la página de inicio para redirigirse al portal de servicios interactivo.";
    }

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `sara-${Date.now()}`,
          sender: 'sara',
          text: reply
        }
      ]);
      setIsLoading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-[#111111]/80 backdrop-blur-md z-[110] flex items-center justify-center p-2 sm:p-4 animate-fade-in-scale">
      <div
        className="bg-white border-2 border-gold-champagne w-full sm:max-w-2xl h-full sm:h-auto sm:max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col"
        style={{ borderImage: 'linear-gradient(135deg, #D4AF37, #F7EF8A, #B8860B) 1' }}
      >
        {/* Terminal Header */}
        <div className="bg-[#111111] text-white px-5 sm:px-6 py-4 flex justify-between items-center border-b border-[#D4AF37]">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center text-[#D4AF37] animate-pulse">
              <i className="fa-solid fa-scale-balanced"></i>
            </span>
            <div>
              <h3 className="font-institutional text-[11px] sm:text-xs tracking-widest text-[#F7EF8A] uppercase font-bold">
                Asistente Virtual SARA
              </h3>
              <p className="text-[8px] sm:text-[9px] uppercase tracking-wider text-gray-400">
                Plataforma de Transparencia de Sayula de Alemán
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#D4AF37] transition-colors text-xl p-1"
            aria-label="Cerrar modal"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Console conversation */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-gray-50/50 font-sans text-xs text-brandDark">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'sara' && (
                <div className="bg-gold-champagne text-brandDark p-2 rounded-lg text-[9px] font-institutional font-bold shadow-md flex-shrink-0">
                  SARA
                </div>
              )}
              <div
                className={`p-3.5 rounded-xl max-w-[85%] shadow-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-brandDark text-white rounded-tr-none'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'
                }`}
              >
                {m.sender === 'sara' && (
                  <p className="font-institutional font-bold text-xs bg-gold-champagne text-brandDark p-1 px-2 rounded mb-2 uppercase tracking-wider shadow-sm text-center">
                    Portal de Transparencia Sayula de Alemán
                  </p>
                )}
                <p>{m.text}</p>
              </div>
              {m.sender === 'user' && (
                <div className="bg-[#111111] text-white p-2 rounded-lg text-[9px] flex-shrink-0">
                  <i className="fa-solid fa-user"></i>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="bg-gold-champagne text-brandDark p-2 rounded-lg text-[9px] font-institutional font-bold shadow">
                SARA
              </div>
              <div className="bg-white border border-gray-200 p-3 rounded-xl max-w-[85%] shadow-sm text-gray-500 flex items-center gap-2">
                <i className="fa-solid fa-spinner animate-spin text-[#D4AF37]"></i>
                <span>Consultando la base documental de transparencia...</span>
              </div>
            </div>
          )}

          <div ref={consoleBottomRef} />
        </div>

        {/* Quick query chips */}
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex flex-wrap gap-1.5 text-[10px]">
          <span className="text-gray-500 font-semibold mr-1 py-0.5">Sugerencias:</span>
          <button
            onClick={() => handleSend('Ver presupuesto de ingresos y egresos 2026')}
            className="bg-gold-champagne text-brandDark px-2.5 py-1 rounded-full font-bold shadow-sm hover:opacity-90 transition-all"
          >
            Presupuesto 2026
          </button>
          <button
            onClick={() => handleSend('Consultar obras publicas del fondo FAISMUNDF 2026')}
            className="bg-gold-champagne text-brandDark px-2.5 py-1 rounded-full font-bold shadow-sm hover:opacity-90 transition-all"
          >
            Obras FAISMUNDF
          </button>
          <button
            onClick={() => handleSend('Estructura del Organigrama y Cabildo')}
            className="bg-gold-champagne text-brandDark px-2.5 py-1 rounded-full font-bold shadow-sm hover:opacity-90 transition-all"
          >
            Ayuntamiento
          </button>
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-3 sm:p-4 bg-white flex items-center gap-2 sm:gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend(inputText)}
            placeholder="Escriba su consulta a SARA..."
            className="flex-grow bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs outline-none focus:border-[#D4AF37] font-sans text-brandDark transition-all"
          />
          <button
            onClick={() => handleSend(inputText)}
            className="bg-gold-champagne text-brandDark hover:opacity-95 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[10px] font-institutional font-bold uppercase tracking-wider transition-all flex items-center gap-2 shadow-md hover:scale-102"
          >
            <span>Buscar</span>
            <i className="fa-solid fa-paper-plane animate-pulse"></i>
          </button>
        </div>
      </div>
    </div>
  );
};
