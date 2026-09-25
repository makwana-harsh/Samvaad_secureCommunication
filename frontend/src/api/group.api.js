import api from "./axios";

export const getGroupDetailsFunct = async (groupId) => {
  const response = await api.get(`/groups/${groupId}/details`);
  return response.data;
};

export const joinGroupFunct = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/join`);
  return response.data;
};

export const leaveGroupFunct = async (groupId) => {
  const response = await api.post(`/groups/${groupId}/leave`);
  return response.data;
};

export const sendGroupInvitationFunct = async (groupId, targetUserId) => {
  const response = await api.post(`/groups/${groupId}/invite`, { targetUserId });
  return response.data;
};

export const createGroupApi = async (groupData) => {
  const response = await api.post("/groups/create", groupData);
  return response.data;
};