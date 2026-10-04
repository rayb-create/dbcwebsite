
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorMessage: string | null;
  errorStack: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorMessage: null,
    errorStack: null,
  };

  public static getDerivedStateFromError(error: unknown): State {
    const isErr = error instanceof Error;
    return { 
      hasError: true, 
      error: isErr ? error : null,
      errorMessage: isErr ? error.message : String(error || 'Erreur inattendue'),
      errorStack: isErr && typeof error.stack === 'string' ? error.stack : null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[DBC ErrorBoundary] Uncaught runtime exception:', error, errorInfo);
    this.setState({
      hasError: true,
      error,
      errorMessage: error?.message || String(error),
      errorStack: error?.stack || null,
    });
  }

  componentDidMount() {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private handleWindowError = (event: ErrorEvent) => {
    // Only intercept fatal runtime exceptions
    if (event.error) {
      console.warn('[DBC ErrorBoundary] Intercepted window runtime error:', event.error);
    }
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.warn('[DBC ErrorBoundary] Intercepted unhandled promise rejection:', event.reason);
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleBackToStore = () => {
    window.location.hash = '';
    const basePath = window.location.pathname.includes('/dbcwebsite') ? '/dbcwebsite/' : '/';
    window.history.pushState({}, '', basePath);
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#191715] text-[#ECE7DF] flex flex-col items-center justify-center p-4">
          <div className="max-w-lg w-full bg-[#24211E] border border-[#3D3730] rounded-xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-rose-950/80 border border-rose-800 text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-white">
                {this.props.fallbackTitle || 'Une exception a été interceptée'}
              </h2>
              <p className="font-mono text-xs text-[#A8A196] leading-relaxed">
                L’interface a rencontré une anomalie d’exécution. Vos données d’atelier sont en sécurité dans Cloud Firestore.
              </p>
            </div>

            {this.state.errorMessage && (
              <div className="p-3 bg-[#161412] border border-[#36302A] rounded text-left overflow-x-auto text-[11px] font-mono text-rose-300 max-h-36">
                <p className="font-bold">{this.state.errorMessage}</p>
                {typeof this.state.errorStack === 'string' && (
                  <pre className="text-[10px] text-[#7C756B] mt-1 whitespace-pre-wrap">
                    {this.state.errorStack.split('\n').slice(0, 4).join('\n')}
                  </pre>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#C9A96E] hover:bg-[#B39358] text-[#191715] font-mono text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer shadow-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recharger la page</span>
              </button>
              <button
                type="button"
                onClick={this.handleBackToStore}
                className="w-full sm:w-auto px-5 py-2.5 bg-[#2B2723] hover:bg-[#3D3730] text-[#ECE7DF] border border-[#4A433B] font-mono text-xs rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Retour au Magasin</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
