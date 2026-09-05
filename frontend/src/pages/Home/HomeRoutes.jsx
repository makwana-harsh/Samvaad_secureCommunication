import { Route, Routes } from "react-router-dom";
import HomePage from "./HomePage.jsx";
import EditProfilePage from "./EditProfilePage.jsx";
import ConversationPage from "../Conversations/ConversationsPage.jsx";

function HomeRoutes(){
    return (<>
        <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Profile routes */}
            <Route path="profile" element={<EditProfilePage isEditMode={false} />} />
            <Route path="profile/edit" element={<EditProfilePage isEditMode={true} />} />
            <Route path="conversations" element={<ConversationPage />} />
        </Routes>
    </>);
}
export default HomeRoutes;