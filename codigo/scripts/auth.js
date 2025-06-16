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

        // Salva o token e o ID do usuário no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.user.id);

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

        // Salva o token e o ID do usuário no localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId);

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
    localStorage.removeItem('userId');
    window.location.href = 'login.html';
}

// Função para obter o token atual
function getToken() {
    return localStorage.getItem('token');
}

// Função para obter o ID do usuário atual
function getCurrentUserId() {
    return localStorage.getItem('userId');
}

// Função para obter os dados do usuário atual do servidor
async function getCurrentUserData() {
    try {
        const userId = getCurrentUserId();
        if (!userId) return null;

        const response = await fetch(`${API_URL}/users/${userId}`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        });

        if (!response.ok) {
            throw new Error('Erro ao obter dados do usuário');
        }

        const userData = await response.json();
        return userData;
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        return null;
    }
}

// Exporta as funções
window.auth = {
    login,
    register,
    logout,
    isAuthenticated,
    getToken,
    getCurrentUserId,
    getCurrentUserData
}; 