// utils/auth.ts
export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    role: 'USER' | 'ADMIN';
}

export const isAuthenticated = (): boolean => {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('accessToken');
    return !!token && !isTokenExpired();
};

export const getUser = (): User | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

export const getAccessToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
};

export const getRefreshToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
};

export const isTokenExpired = (): boolean => {
    const expiry = localStorage.getItem('tokenExpiry');
    if (!expiry) return true;
    return Date.now() > parseInt(expiry);
};

export const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('tokenExpiry');
    window.location.href = '/signin';
};

export const refreshToken = async (): Promise<string | null> => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return null;

    try {
        const response = await fetch('http://localhost:8080/api/auth/refreshtoken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to refresh token');
        }

        if (data.accessToken) {
            localStorage.setItem('accessToken', data.accessToken);
        }
        if (data.refreshToken) {
            localStorage.setItem('refreshToken', data.refreshToken);
        }
        if (data.expiresIn) {
            const expiryTime = Date.now() + (data.expiresIn * 1000);
            localStorage.setItem('tokenExpiry', expiryTime.toString());
        }

        return data.accessToken;
    } catch (error) {
        console.error('Token refresh error:', error);
        logout();
        return null;
    }
};

// API wrapper with automatic token refresh
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    let token = getAccessToken();

    // Check if token needs refresh
    if (token && isTokenExpired()) {
        token = await refreshToken();
        if (!token) {
            throw new Error('Session expired. Please sign in again.');
        }
    }

    const response = await fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    // If unauthorized, try to refresh token once
    if (response.status === 401) {
        const newToken = await refreshToken();
        if (newToken) {
            // Retry the request with new token
            return fetch(url, {
                ...options,
                headers: {
                    ...options.headers,
                    'Authorization': `Bearer ${newToken}`,
                    'Content-Type': 'application/json',
                },
            });
        } else {
            logout();
            throw new Error('Session expired. Please sign in again.');
        }
    }

    return response;
};