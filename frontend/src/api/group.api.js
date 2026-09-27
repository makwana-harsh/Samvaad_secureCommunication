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

export const sendGroupInvitationFunct = async (groupId, userName) => {
    const response = await api.post(`/groups/${groupId}/invitations`, { userName });
    return response.data;
};

export const searchGroupUsersFunct = async (search = "", page = 1, limit = 15) => {
    const response = await api.get("/users/search", {
        params: { search, page, limit },
    });
    return response.data;
};

export const createGroupFunct = async (data) => {
    const formData = new FormData();

    formData.append("groupName", data.groupName);
    formData.append("bio", data.bio);
    formData.append("visibility", data.visibility);
    formData.append("memberIds", JSON.stringify(data.memberIds));

    if (data.avatar) formData.append("avatar", data.avatar);

    const response = await api.post("/groups", formData);
    return response.data;
};

export const updateGroupFunct = async (groupId, bio, avatar = null) => {
    const formData = new FormData();
    formData.append("bio", bio || "");
    if (avatar) formData.append("avatar", avatar);

    const response = await api.patch(`/groups/${groupId}`, formData);
    return response.data;
};

export const removeGroupMemberFunct = async (groupId, userId) => {
    const response = await api.delete(`/groups/${groupId}/members/${userId}`);
    return response.data;
};


export const acceptGroupInvitationFunct = async (groupId, requestId) => {
    const response = await api.post(
        `/groups/${groupId}/invitations/${requestId}/accept`
    );
    return response.data;
};

export const rejectGroupInvitationFunct = async (groupId, requestId) => {
    const response = await api.post(
        `/groups/${groupId}/invitations/${requestId}/reject`
    );
    return response.data;
};