import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AgencyRouteGuard = () => {
    const { user, isAgency, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth" replace state={{ from: location }} />;
    }

    if (!isAgency) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AgencyRouteGuard;
