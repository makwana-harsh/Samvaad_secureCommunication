import { useNavigate } from "react-router-dom";

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <button onClick={() => navigate("/home")} className="home-btn">
            Back to Home
        </button>
        </div>
    );
}

export default NotFoundPage;