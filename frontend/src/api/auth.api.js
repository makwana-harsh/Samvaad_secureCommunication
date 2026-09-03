import api from "./axios";

export const registerUserFunct = async (userData) => {
  console.log("From Auth.api.js>>");
  const response = await api.post("/auth/register", userData);
  console.log("(from Auth.api.js)Response from registration : ", response);
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