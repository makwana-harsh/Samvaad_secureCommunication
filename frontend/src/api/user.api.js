import api from "./axios";

export const getUserProfileFunct = async (userId) => {
  const response = await api.get(`/users/${userId}/profile`);
  return response.data;
};

export const unfriendUserFunct = async (userId) => {
  const response = await api.post(`/users/${userId}/unfriend`);
  return response.data;
};