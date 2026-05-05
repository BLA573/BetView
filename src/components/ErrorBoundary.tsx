import React from "react";

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    message: string;
}

class ErrorBoundary extends React.Component<Props, State> {
    state: State = {
        hasError: false,
        message: "",
    };

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            message: error.message || "Unexpected application error.",
        };
    }

    componentDidCatch(error: Error) {
        // Keep the error visible in the console for debugging in development.
        console.error("Unhandled render error:", error);
    }

    render() {
        if (this.state.hasError) {
            return (
                <main className="min-h-screen flex items-center justify-center bg-background px-4">
                    <div className="max-w-lg rounded-xl border border-destructive/20 bg-destructive/5 p-6 text-center">
                        <h1 className="text-xl font-semibold text-foreground">Something went wrong</h1>
                        <p className="mt-2 text-sm text-muted-foreground">The page could not be rendered.</p>
                        <p className="mt-3 text-xs text-destructive">{this.state.message}</p>
                    </div>
                </main>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
