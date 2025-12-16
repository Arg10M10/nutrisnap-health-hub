import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
          <div className="mb-4 rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Algo salió mal</h1>
          <p className="mb-6 text-muted-foreground max-w-xs mx-auto">
            La aplicación ha encontrado un error inesperado.
          </p>
          <div className="bg-muted p-4 rounded-lg mb-6 text-left w-full max-w-xs overflow-auto max-h-40 text-xs font-mono">
            {this.state.error?.message}
          </div>
          <Button 
            size="lg" 
            onClick={() => {
                // Hard reload clearing cache might help
                window.location.reload();
            }}
            className="rounded-full"
          >
            <RefreshCw className="mr-2 h-4 w-4" /> Recargar Aplicación
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;