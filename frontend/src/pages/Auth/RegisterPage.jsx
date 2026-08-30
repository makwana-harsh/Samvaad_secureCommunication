import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {registerUserFunct} from "../../api/auth.api";

function RegisterPage(){
    const navigate = useNavigate();
    const [userData, setUserData] = useState({fullName:'', userName:'', emailId:'', mobileNo:'', password:''});

    function handleChange(e) {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            const res = await registerUserFunct(userData);  
            alert(res.message || "Registration successful!");
            navigate("/login");
        } 
        catch (err) {
            // Inspect raw error in DevTools console
            console.log("Full Error Object:", err.response?.data);

            // Check top-level message FIRST, then Zod array, then fallback
            const errorMessage = 
                err.response?.data?.message || 
                err.response?.data?.errors?.[0]?.message || 
                "Registration failed";

            alert(errorMessage);
        }
        setUserData({
            fullName: "",
            userName: "",
            emailId: "",
            mobileNo: "",
            password: ""
        });
    }

    return (<>
        <div className="register_main_container">
            <h1 className="register_header_section">Create Your Account</h1>

            <form className="register_form_section" onSubmit={handleSubmit}>
                <div>
                    <label>Full Name:</label>
                    <input type="text" name="fullName" placeholder="Enter Full Name" required value={userData.fullName} onChange={handleChange} />
                </div>
                <div>
                    <label>Username:</label>
                    <input type="text" name="userName" placeholder="Enter Username" required value={userData.userName} onChange={handleChange} />
                </div>
                <div>
                    <label>Email Id:</label>
                    <input type="text" name="emailId" placeholder="Enter Email Id" required value={userData.emailId} onChange={handleChange} />
                </div>
                <div>
                    <label>Mobile No:</label>
                    <input type="text" name="mobileNo" placeholder="Enter Mobile Number" required value={userData.mobileNo} onChange={handleChange} />
                </div>
                <div>
                    <label>Password:</label>
                    <input type="password" name="password" placeholder="Enter Your Password" required value={userData.password} onChange={handleChange} />
                </div>
                <button className="registerButton" type="submit">Register</button>
            </form>
        </div>
    </>);
}
export default RegisterPage;