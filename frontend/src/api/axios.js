import axios from 'axios';

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true
});

export const setupInterceptors = (getAccessToken, setAccessToken, logout) => {
    // Request Interceptor: Attach Access Token
    const reqInterceptor = api.interceptors.request.use(
        (config) => {
            const token = getAccessToken();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    // Response Interceptor: Handle 401 & Silent Refresh Token
    const resInterceptor = api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;

            if (error.response?.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const { data } = await axios.post(
                        "http://localhost:3000/api/auth/refresh",
                        {},
                        { withCredentials: true }
                    );

                    setAccessToken(data.accessToken);
                    originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                    return api(originalRequest);
                } 
                catch (refreshError) {
                    logout();
                    return Promise.reject(refreshError);
                }
            }
            return Promise.reject(error);
        }
    );

    // Cleanup function to prevent handler accumulation
    return () => {
        api.interceptors.request.eject(reqInterceptor);
        api.interceptors.response.eject(resInterceptor);
    };
};

export default api;