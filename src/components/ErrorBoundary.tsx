import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <div className="text-center p-6">
            <h1 className="mb-2 text-2xl font-bold text-card-foreground">Ha ocurrido un error</h1>
            <p className="text-muted-foreground mb-4">Intenta recargar la página o volver más tarde.</p>
            <a href="/" className="text-primary underline">Volver al inicio</a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

