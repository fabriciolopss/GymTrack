const API_URL = 'https://ti1-webserver.onrender.com';

// Função para fazer login
async function login(email, password) {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao fazer login');
        }

        // Salva o token e os dados do usuário no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    } catch (error) {
        throw error;
    }
}

// Função para registrar novo usuário
async function register(email, password) {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Erro ao registrar usuário');
        }

        // Salva o token e os dados do usuário no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        return data;
    } catch (error) {
        throw error;
    }
}

// Função para verificar se o usuário está autenticado
function isAuthenticated() {
    return !!localStorage.getItem('token');
}

// Função para fazer logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'login.html';
}

// Função para obter o token atual
function getToken() {
    return localStorage.getItem('token');
}

// Função para obter os dados do usuário atual
function getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}

// Exporta as funções
window.auth = {
    login,
    register,
    logout,
    isAuthenticated,
    getToken,
    getCurrentUser
}; 