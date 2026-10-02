import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary atrapó un error no controlado:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('sayula_gob_documents_v1');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="bg-white border-2 border-[#D4AF37] max-w-lg w-full rounded-2xl p-6 sm:p-8 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-amber-100 text-[#B8860B] mx-auto flex items-center justify-center text-2xl shadow-sm">
              <i className="fa-solid fa-triangle-exclamation"></i>
            </div>
            <h3 className="font-institutional font-bold text-base sm:text-lg text-brandDark uppercase tracking-wider">
              {this.props.fallbackTitle || 'Se detectó una discrepancia en los datos del panel'}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed font-normal">
              Para garantizar la estabilidad del portal, se puede restablecer la memoria caché local de documentos para cargar la versión oficial limpia.
            </p>
            {this.state.error && (
              <div className="bg-gray-100 p-2.5 rounded-lg text-left text-[10px] text-gray-700 font-mono overflow-x-auto max-h-24 border border-gray-200">
                {this.state.error.message}
              </div>
            )}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto bg-gold-champagne text-brandDark px-5 py-2.5 rounded-xl font-institutional font-bold text-xs uppercase tracking-wider shadow-md hover:opacity-90 transition-all cursor-pointer"
              >
                <i className="fa-solid fa-rotate-left mr-1"></i> Restablecer datos y reabrir
              </button>
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                Volver al Portal
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
