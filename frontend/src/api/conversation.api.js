import api from "./axios";

export const getConversationsListApi = async (tab, search = "", page = 1, limit = 15) => {
    const response = await api.get("/conversations", {
        params: { tab, search, page, limit },
    });
    return response.data;
};



