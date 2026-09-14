import api from "./axios";

export const getDiscoverFeedFunct = async (search, page = 1, limit = 10) => {
  const response = await api.get("/discover", {
    params: { search, page, limit },
  });
  return response.data;
};