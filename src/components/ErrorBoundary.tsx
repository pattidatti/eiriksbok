import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
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
        console.error("Uncaught error:", error, errorInfo);

        // Check for chunk load error
        if (error.message.includes('Failed to fetch dynamically imported module') ||
            error.message.includes('Importing a module script failed')) {

            // Prevent infinite reload loops
            const storageKey = 'chunk_load_error_reload';
            const lastReload = sessionStorage.getItem(storageKey);

            if (!lastReload) {
                sessionStorage.setItem(storageKey, 'true');
                window.location.reload();
            }
        }
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="min-h-screen flex items-center justify-center bg-background p-4">
                    <div className="p-8 bg-card border border-border rounded-xl shadow-lg max-w-md w-full text-center">
                        <h2 className="text-xl font-bold mb-4 text-foreground">Noe gikk galt</h2>
                        <p className="text-muted-foreground mb-6">
                            Vi beklager, men det oppstod en feil. Prøv å laste siden på nytt.
                        </p>

                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('chunk_load_error_reload');
                                    window.location.reload();
                                }}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                            >
                                Last siden på nytt
                            </button>

                            <details className="text-left">
                                <summary className="text-xs text-muted-foreground cursor-pointer hover:underline">
                                    Teknisk detaljer
                                </summary>
                                <pre className="mt-2 bg-muted p-4 rounded text-xs font-mono overflow-auto max-h-40 text-muted-foreground">
                                    {this.state.error?.toString()}
                                </pre>
                            </details>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
