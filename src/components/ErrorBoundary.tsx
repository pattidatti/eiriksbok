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

                <div style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8fafc',
                    padding: '1rem',
                    color: '#1e293b',
                    fontFamily: 'sans-serif'
                }}>
                    <div style={{
                        padding: '2rem',
                        backgroundColor: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '0.75rem',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        maxWidth: '28rem',
                        width: '100%',
                        textAlign: 'center'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Noe gikk galt</h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            Vi beklager, men det oppstod en feil. Prøv å laste siden på nytt.
                        </p>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('chunk_load_error_reload');
                                    window.location.reload();
                                }}
                                style={{
                                    padding: '0.5rem 1rem',
                                    backgroundColor: '#3b82f6',
                                    color: 'white',
                                    borderRadius: '0.375rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                Last siden på nytt
                            </button>

                            <details style={{ textAlign: 'left' }}>
                                <summary style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>
                                    Teknisk detaljer
                                </summary>
                                <pre style={{
                                    marginTop: '0.5rem',
                                    backgroundColor: '#f1f5f9',
                                    padding: '1rem',
                                    borderRadius: '0.25rem',
                                    fontSize: '0.75rem',
                                    fontFamily: 'monospace',
                                    overflow: 'auto',
                                    maxHeight: '10rem',
                                    color: '#475569'
                                }}>
                                    {this.state.error?.toString()}
                                    {this.state.error?.stack}
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
