import {Routes, Route, Navigate} from "react-router-dom";

import LandingPage from "./pages/Auth/LandingPage";
import LoginPage from "./pages/Auth/LoginPage";
import RegisterPage from "./pages/Auth/RegisterPage";

import HomePage from "./pages/Home/HomePage";
import ConversationsPage from "./pages/Conversations/ConversationsPage";
import DiscoverPage from "./pages/Discover/DiscoverPage";
import NotFoundPage from "./pages/NotFound/NotFoundPage"; // 1. Import 404 Page

import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";


function App(){
    return (<>
        <Routes>
            {/* 1. Public ONLY Routes (Logged-in users redirected to /home) */}
            <Route element={<PublicOnlyRoute />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/register" element={<RegisterPage/>} />
                <Route path="/login" element={<LoginPage/>} />
            </Route>

            {/* 2. Protected Routes (Unauthenticated users redirected to /login) */}
            <Route element={<ProtectedRoute />}>
                <Route path="/home/*" element={<HomePage />} />
                <Route path="/conversations/*" element={<ConversationsPage />} />
                <Route path="/discover/*" element={<DiscoverPage />} />
            </Route>
            
            {/* 3. Catch-All Route for non-existent paths */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>        
    </>);
}

export default App;