import api from "./axios";

export const sendFriendRequestFunct = async (receiverId) => {
  const response = await api.post("/requests/send", { receiverId });
  return response.data;
};

export const cancelFriendRequestFunct = async (requestId) => {
  const response = await api.post("/requests/cancel", { requestId });
  return response.data;
};

export const acceptFriendRequestFunct = async (requestId) => {
  const response = await api.post("/requests/accept", { requestId });
  return response.data;
};

export const rejectFriendRequestFunct = async (requestId) => {
  const response = await api.post("/requests/reject", { requestId });
  return response.data;
};

export const getPendingRequestsFunct = async () => {
    const response = await api.get("/requests/pending");
    return response.data;
};