import api from "./axios";

export const getConversationsApi = async (tab, search = "", page = 1, limit = 15) => {
    const res = await api.get("/conversations", {
        params: { tab, search, page, limit },
    });
    return res.data;
};

export const openPrivateConversationApi = async (userId) => {
    const res = await api.post(`/conversations/private/${userId}`);
    return res.data;
};

export const getMessagesApi = async (conversationId, page = 1, limit = 30) => {
    const res = await api.get(`/messages/${conversationId}`, {
        params: { page, limit },
    });
    return res.data;
};

export const sendMessageApi = async (conversationId, content) => {
    const res = await api.post(`/messages/${conversationId}`, { content });
    return res.data;
};

export const getOnlineFriendsApi = async () => {
    const res = await api.get("/conversations/online-friends");
    return res.data;
};

export const sendAttachmentApi = async (conversationId,file,onUploadProgress) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`/messages/${conversationId}/attachment`,formData,{
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        }
    );

    return res.data;
};

export const downloadAttachmentApi = async (message) => {
    const res = await api.get(
        `/messages/attachment/${message._id}/download`,
        { responseType: "blob" }
    );

    const url = URL.createObjectURL(res.data);
    const link = document.createElement("a");

    link.href = url;
    link.download = message.originalFileName || "attachment";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
};