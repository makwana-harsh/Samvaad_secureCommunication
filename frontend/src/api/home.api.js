import api from "./axios";

export const getUserProfileFunct = async () => {
  const response = await api.get("/home/profile");
  return response.data;
};

export const updateUserProfileFunct = async (profileData) => {
  const response = await api.put("/home/profile/edit", profileData);
  return response.data;
};