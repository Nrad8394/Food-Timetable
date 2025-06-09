import axios, { AxiosError, AxiosResponse, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { jwtDecode } from 'jwt-decode';
import Cookies from 'js-cookie'; // Import js-cookie
import { BASE_URL } from '@/handler/apiConfig';
import { useRouter } from "next/navigation"

interface ApiErrorResponse {
    detail?: string;
    [key: string]: unknown;
}

interface AuthResponse {
    access: string;
    refresh: string;
}

interface DecodedToken {
    exp: number;
}

// Redirect to login
const redirectToLogin = () => {
    Cookies.remove('accessToken'); // Remove tokens from cookies
    Cookies.remove('refreshToken');
    // use Next.js router for smoother client-side navigation
    //   const router = useRouter()
    //   router.push("/login")};
}

// Handle API errors
export const handleApiError = (error: AxiosError<ApiErrorResponse>) => {
    if (error.response && error.response.data) {
        console.error('API Error:', error.response.data);
        throw error.response.data;
    } else {
        console.error('API Error:', error.message);
        throw error;
    }
};

// Create Axios instance
export const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // Include cookies in requests
});

// Function to check if a token is expired
const isTokenExpired = (token: string | undefined): boolean => {
    if (!token) return true;
    try {
        const decoded: DecodedToken = jwtDecode(token);
        return decoded.exp * 1000 < Date.now(); // Convert seconds to milliseconds
    } catch (error) {
        return true;
    }
};

// Token refresh queue handler
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

// Add subscriber to queue
const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

// Notify subscribers when token is refreshed
const onRefreshed = (newToken: string) => {
    refreshSubscribers.forEach((callback) => callback(newToken));
    refreshSubscribers = [];
};

// Request Interceptor
api.interceptors.request.use(
    async (config: AxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        let accessToken = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');

        // If access token is expired, try to refresh it
        if (isTokenExpired(accessToken) && refreshToken) {
            if (!isRefreshing) {
                isRefreshing = true;
                try {
                    const response = await axios.post<AuthResponse>(TOKEN_REFRESH_URL, { refresh: refreshToken }, { withCredentials: true });

                    if (response.status === 200) {
                        accessToken = response.data.access;
                        Cookies.set('accessToken', accessToken, { expires: 1, secure: true, sameSite: 'Strict' }); // Store new accessToken
                        onRefreshed(accessToken); // Notify waiting requests
                    } else {
                        redirectToLogin();
                    }
                } catch (refreshError) {
                    console.error('Token refresh failed:', refreshError);
                    redirectToLogin();
                    return Promise.reject(refreshError);
                } finally {
                    isRefreshing = false;
                }
            }

            // Queue requests while refreshing and continue once token is refreshed
            return new Promise((resolve) => {
                subscribeTokenRefresh((newToken: string) => {
                    if (config.headers) {
                        config.headers.Authorization = `Bearer ${newToken}`;
                    }
                    resolve(config as InternalAxiosRequestConfig);
                });
            });
        }

        // Attach access token to headers if available
        if (accessToken && config.headers) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }

        return config as InternalAxiosRequestConfig;
    },
    (error: AxiosError) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
    (response: AxiosResponse) => response,
    async (error: AxiosError) => {
        const originalRequest: (AxiosRequestConfig & { _retry?: boolean }) | undefined = error.config;
        if (!originalRequest) {
            return Promise.reject(error);
        }

        // If request fails due to expired token
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = Cookies.get('refreshToken');
            if (!refreshToken || isTokenExpired(refreshToken)) {
                redirectToLogin();
                return Promise.reject(error);
            }

            try {
                const response = await axios.post<AuthResponse>(TOKEN_REFRESH_URL, { refresh: refreshToken }, { withCredentials: true });

                if (response.status === 200) {
                    const newAccessToken = response.data.access;
                    Cookies.set('accessToken', newAccessToken, { expires: 1, secure: true, sameSite: 'Strict' }); // Store new token

                    // Retry original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    }
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error('Error refreshing token:', refreshError);
                redirectToLogin();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);
