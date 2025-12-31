import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} />;
    }

    return this.props.children;
  }
}

const DefaultErrorFallback: React.FC<{ error?: Error }> = ({ error }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-[40px] p-12 shadow-xl max-w-lg text-center">
      <div className="text-6xl mb-6">⚠️</div>
      <h2 className="text-3xl font-black text-slate-800 mb-4">Oops! Something went wrong</h2>
      <p className="text-slate-500 mb-8 leading-relaxed">
        We're sorry, but something unexpected happened. Please try refreshing the page.
      </p>
      <button 
        onClick={() => window.location.reload()}
        className="bg-slate-900 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-[24px] transition-all shadow-lg"
      >
        Refresh Page
      </button>
      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-6 text-left">
          <summary className="cursor-pointer text-slate-400 text-sm">Error Details</summary>
          <pre className="mt-2 p-4 bg-slate-100 rounded text-xs overflow-auto">
            {error.toString()}
          </pre>
        </details>
      )}
    </div>
  </div>
);

export default ErrorBoundary;
