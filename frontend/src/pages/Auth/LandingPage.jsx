import { useNavigate } from "react-router-dom";
import '../../styles/LandingPage.style.css';

function LandingPage(){
    const navigate = useNavigate();

    return (<>
        <div className="landing_main_container">

            <h1 className="landing_header_section">Welcome to the secure communication platform</h1>
            
            <div className="entry_section">
                <button onClick={()=>{navigate('/register')}}>Register</button>
                <button onClick={()=>{navigate('/login')}}>Login</button>
            </div>
        
        </div>
    </>);
}

export default LandingPage;