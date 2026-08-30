import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function PublicOnlyRoute() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading_spinner">Loading Samvaad...</div>;
    }

    // If user is ALREADY logged in, prevent access to login/register and send to /home
    if (user) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
}

export default PublicOnlyRoute;