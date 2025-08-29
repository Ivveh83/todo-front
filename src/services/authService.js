const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const API_URL = 'http://localhost:9090/api';

export const authService = {

    login: async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Invalid credentials');
            }

            const data = await response.json();
            localStorage.setItem(TOKEN_KEY, data.token); // Här sparas token i localStorage (ett minne i webbläsaren) under nyckeln 'auth_token'.
            localStorage.setItem(USER_KEY, JSON.stringify(data)); // Här sparas all data från response (header, body etc.) under nyckeln 'auth_user' i localStorage.

            return data;
        } catch (error) {
            throw new Error(error.message || 'Login failed. Please try again.');
        }
    },

    logout: (isWindowClosing = false) => {
        try {
            const token = localStorage.getItem(TOKEN_KEY);
            if (!token) return true;

            const logoutEndpoint = `${API_URL}/auth/logout`;

            if (isWindowClosing) {
                // Synchronous logout for window closing
                const xhr = new XMLHttpRequest();
                xhr.open('POST', logoutEndpoint, false); // false makes it synchronous
                xhr.setRequestHeader('Authorization', `Bearer ${token}`);
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send();
            } else {
                // Asynchronous logout for normal logout
                fetch(logoutEndpoint, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            // Always clear local storage
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            // Still remove items from localStorage even if the API call fails
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            return true;
        }
    },

    hasRole: (user, role) => {
        return user?.roles?.includes(role) || false;
    },

    isAdmin: (user) => {
        return authService.hasRole(user, 'ROLE_ADMIN');
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    }


    /*
    login: async (email, password) => {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulated API response
        if (email === 'user' && password === 'password') {
            const response = {
                token: "eyJhbGciOiJIUzUxMiJ9.eyJyb2xlcyI6WyJST0xFX0FETUlOIiwiUk9MRV9VU0VSIl0sInN1YiI6ImFkbWluIiwiaWF0IjoxNzU0NjUyMjkyLCJleHAiOjE3NTQ3Mzg2OTJ9.EG3EfNWsthhJts1EV6-ATl_TOBkiSvWI3dGpVtiYpPrp5OB7Z1fIAYKEaV919ZO0khp7fWzFbRqOqg3dQ0X6PA",
                type: "Bearer",
                username: "user",
                name: "User",
                email: "user@test.se",
                roles: ["ROLE_USER"]
            };

            // Store in localStorage
            localStorage.setItem(TOKEN_KEY, response.token);
            localStorage.setItem(USER_KEY, JSON.stringify(response));

            return response;
        }
        throw new Error('Invalid email or password');
    },

    hasRole: (user, role) => {
        return user?.roles?.includes(role) || false;
    },

    isAdmin: (user) => {
        return authService.hasRole(user, 'ROLE_ADMIN');
    },

    logout: async () => {
        try {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
            return true;
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    },

    getCurrentUser: () => {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
    },

    getToken: () => {
        return localStorage.getItem(TOKEN_KEY);
    },

    isAuthenticated: () => {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    */
};