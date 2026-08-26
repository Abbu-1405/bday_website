import React, { ErrorInfo, ReactNode } from 'react';
import { RotateCw, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[STARRY CRASH SHIELD] Uncaught error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#070b14] text-[#f5ede3] flex items-center justify-center p-6 select-none font-serif relative overflow-hidden">
          {/* Subtle starry background ambiance */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(216,184,106,0.08)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 max-w-lg w-full bg-[#0d1424]/90 border border-[#d8b86a]/30 rounded-2xl p-8 text-center shadow-2xl backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-[#d8b86a]/15 text-[#d8b86a] mx-auto flex items-center justify-center mb-6 shadow-inner border border-[#d8b86a]/20">
              <Sparkles className="w-8 h-8 animate-pulse" />
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-medium text-[#faebd7] tracking-wide mb-3">
              A Moment of Quiet Starlight
            </h1>

            <p className="text-sm sm:text-base text-[#c9c1b5] leading-relaxed mb-6 font-sans">
              Something momentarily interrupted the harmony of this sanctuary. Please refresh the page to restore your constellation.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#d8b86a] text-[#070b14] font-sans font-semibold text-sm hover:bg-[#ebd59b] transition-colors shadow-lg cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
