import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function LoginPage(){
    
    const navigate = useNavigate();
    const { login } = useAuth();
    const [userData, setUserData] = useState({
        userName : "", userPassword : ""
    });

    function handleChange(e) {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try{
            await login(userData);
            alert("Login successful!");
            navigate("/home"); 
        } 
        catch (err) {
            const errorMessage = err.response?.data?.message || "Login failed";
            alert(errorMessage);
        }
        setUserData({
            userName: "",userPassword: ""
        });
    }

    return (<>
        <div className="login_main_container">
            <h1 className="login_header_section">Login</h1>
            <form className="login_form_section" onSubmit={handleSubmit} >
                <div className="login_field_div">
                    <label>Username: </label>
                    <input type="text" name="userName" required placeholder="Enter username" value={userData.userName} onChange={handleChange} />
                </div>
                
                <div className="login_field_div">
                    <label>Password: </label>
                    <input type="password" name="userPassword" required placeholder="Enter password" value={userData.userPassword} onChange={handleChange} />
                </div>
                
                <button type="submit">Submit</button>
            </form>
        </div>
    </>);
}
export default LoginPage;