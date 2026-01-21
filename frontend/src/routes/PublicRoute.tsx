import { Navigate } from "react-router-dom";
import { type ReactNode, useEffect, useState } from "react";
import { refreshTokenAPI } from "../services/authServices";
import { Loader2 } from "lucide-react";

interface PublicRouteProps {
    children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem("accessToken"));

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("accessToken");
            if (!token) {
                const newToken = await refreshTokenAPI();
                setIsAuthenticated(!!newToken);
            } else {
                setIsAuthenticated(true);
            }
            setIsChecking(false);
        };

        checkAuth();
    }, []);

    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-amber-50 via-orange-50 to-rose-50">
                <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;
