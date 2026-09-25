import api from "./axios";

export const getUserProfileFunct = async (userId) => {
  const response = await api.get(`/users/${userId}/profile`);
  return response.data;
};

export const unfriendUserFunct = async (userId) => {
  const response = await api.post(`/users/${userId}/unfriend`);
  return response.data;
};

export const searchMinimalUsersApi = async (search = "", page = 1, limit = 8) => {
  const response = await api.get("/users/search-minimal", {
    params: { search, page, limit },
  });
  return response.data;
};