import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App crashed:', error, errorInfo.componentStack);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="grid min-h-screen place-items-center px-5">
          <div className="w-full max-w-md rounded-[1.35rem] border border-[hsl(var(--card-border))] bg-[hsl(var(--card))] p-6 text-center shadow-[var(--shadow-soft)]">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#f9e4dc] text-[#9c4936]">
              <AlertCircle size={24} />
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-[-.03em]">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">
              The app hit an unexpected error. Your saved history is safe on this
              device.
            </p>
            <button
              type="button"
              onClick={this.handleReload}
              className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))]"
            >
              <RefreshCw size={16} />
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
