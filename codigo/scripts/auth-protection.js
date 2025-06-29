/**
 * Sistema de Proteção de Autenticação Genérico
 * Este arquivo fornece proteção de autenticação para todas as páginas da aplicação
 */

class AuthProtection {
    constructor() {
        this.protectedPages = [
            'dashboard.html',
            'perfil.html', 
            'progresso.html',
            'registrar-treino.html',
            'social.html',
            'historico.html',
            'consultar-fichas.html',
            'cadastro-treino.html'
        ];
        
        this.publicPages = [
            'login.html',
            'cadastro.html'
        ];
        
        this.tokenValidationInterval = null;
        
        this.init();
    }

    init() {
        // Aguarda o DOM estar carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.checkAuth());
        } else {
            this.checkAuth();
        }
        
        // Inicia validação periódica de token (a cada 5 minutos)
        this.startTokenValidation();
    }

    startTokenValidation() {
        // Valida o token a cada 5 minutos
        this.tokenValidationInterval = setInterval(async () => {
            if (window.auth && window.auth.isAuthenticated()) {
                const isValid = await this.validateToken();
                if (!isValid) {
                    console.log('Token expirado durante a sessão, redirecionando para login');
                    this.redirectToLogin();
                }
            }
        }, 5 * 60 * 1000); // 5 minutos
    }

    stopTokenValidation() {
        if (this.tokenValidationInterval) {
            clearInterval(this.tokenValidationInterval);
            this.tokenValidationInterval = null;
        }
    }

    checkAuth() {
        const currentPage = this.getCurrentPageName();
        
        // Verifica se auth.js foi carregado
        if (!window.auth) {
            console.error('Auth.js não foi carregado');
            this.showAuthError('Erro ao carregar sistema de autenticação. Recarregue a página.');
            return;
        }

        // Se é uma página protegida, verifica autenticação
        if (this.protectedPages.includes(currentPage)) {
            if (!window.auth.isAuthenticated()) {
                console.log('Usuário não autenticado, redirecionando para login');
                this.redirectToLogin();
                return;
            }
            console.log('Usuário autenticado, página protegida acessível');
        }
        
        // Se é uma página pública (login/cadastro) e usuário já está logado, redireciona para dashboard
        if (this.publicPages.includes(currentPage)) {
            if (window.auth.isAuthenticated()) {
                console.log('Usuário já autenticado, redirecionando para dashboard');
                this.redirectToDashboard();
                return;
            }
            console.log('Usuário não autenticado, página pública acessível');
        }
    }

    getCurrentPageName() {
        const path = window.location.pathname;
        const pageName = path.split('/').pop();
        return pageName || 'index.html';
    }

    redirectToLogin() {
        // Salva a página atual para redirecionamento após login
        const currentPage = this.getCurrentPageName();
        if (currentPage !== 'login.html') {
            sessionStorage.setItem('redirectAfterLogin', currentPage);
        }
        
        window.location.href = 'login.html';
    }

    redirectToDashboard() {
        window.location.href = 'dashboard.html';
    }

    showAuthError(message) {
        // Cria uma mensagem de erro visual
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #dc3545;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 9999;
            font-weight: bold;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove a mensagem após 5 segundos
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    // Método para verificar se o token ainda é válido
    async validateToken() {
        try {
            const token = window.auth.getToken();
            if (!token) {
                return false;
            }

            // Valida o token no servidor
            const response = await fetch('https://ti1-webserver-production.up.railway.app/test-auth', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                // Token inválido ou expirado
                console.log('Token inválido, fazendo logout');
                this.forceLogout();
                return false;
            }

            const data = await response.json();
            return data.valid;
        } catch (error) {
            console.error('Erro ao validar token:', error);
            // Em caso de erro de rede, mantém o usuário logado mas registra o erro
            return true;
        }
    }

    // Método para forçar logout
    forceLogout() {
        // Para a validação periódica de token
        this.stopTokenValidation();
        
        if (window.auth) {
            window.auth.logout();
            console.log("a");
        } else {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = 'login.html';
        }
    }
}

// Função para inicializar a proteção de autenticação
function initializeAuthProtection() {
    return new AuthProtection();
}

// Função para verificar autenticação em qualquer momento
function checkAuthentication() {
    if (!window.auth) {
        console.error('Auth.js não foi carregado');
        return false;
    }
    return window.auth.isAuthenticated();
}

// Função para proteger uma função específica
function requireAuth(callback) {
    if (!window.auth) {
        console.error('Auth.js não foi carregado');
        return;
    }
    
    if (!window.auth.isAuthenticated()) {
        console.error('Usuário não autenticado');
        window.location.href = 'login.html';
        return;
    }
    
    if (typeof callback === 'function') {
        callback();
    }
}

// Exporta as funções para uso global
window.AuthProtection = AuthProtection;
window.initializeAuthProtection = initializeAuthProtection;
window.checkAuthentication = checkAuthentication;
window.requireAuth = requireAuth;

// Inicializa automaticamente se o script for carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeAuthProtection();
    });
} else {
    initializeAuthProtection();
} 