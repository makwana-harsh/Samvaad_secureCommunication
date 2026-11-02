import { useNavigate } from "react-router-dom";
import "../../styles/NotFound/NotFoundPage.style.css";

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="not-found-container">
            <h1>404</h1>
            <h2>Page not found</h2>
            <p>The page you are looking for doesn't exist or has been moved.</p>
            <button onClick={() => navigate("/home")} className="home-btn">
                Back to home
            </button>
        </div>
    );
}

export default NotFoundPage;
