import api from "./axios";

export const registerUserFunct = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUserFunct = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const refreshAccessTokenFunct = async () => {
  const response = await api.post("/auth/refresh");
  return response.data;
};

export const logoutUserFunct = async () => {
    const response = await api.post("/auth/logout");
    return response.data;
};