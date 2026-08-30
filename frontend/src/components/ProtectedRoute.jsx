import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import HeaderComponent from "./HeaderComponent.jsx";

function ProtectedRoute() {
    const { user, loading } = useAuth();

    // 1. Wait for silent refresh / auth check to complete
    if (loading) {
        return <div className="loading_spinner">Loading Samvaad...</div>;
    }

    // 2. Redirect to login if user is not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Render child routes via Outlet
    return (
        <>
            <div className="big_screen_div">
                <HeaderComponent />
                <main className="main_three_screens_div">
                    <Outlet />
                </main>
            </div>
        </>
    );
}

export default ProtectedRoute;