import api from "./axios";

export const getConversationsApi = async ({ tab = "friends", search = "", page = 1, limit = 15 }) => {
    const response = await api.get("/conversations", {params: { tab, search, page, limit }});
    return response.data; // Expected response shape: { success: true, data: [...], pagination: { total, page, pages, hasMore } }
};