const API_URL = "https://ti1-webserver-production.up.railway.app";

class ApiService {
  static async getUserData() {
    const userId = window.auth.getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado");

    const response = await fetch(`${API_URL}/users/${userId}/data`, {
      headers: {
        Authorization: `Bearer ${window.auth.getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error("Erro ao obter dados do usuário");
    }

    return response.json();
  }

  static async updateUserData(data) {
    const userId = window.auth.getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado");

    const response = await fetch(`${API_URL}/users/${userId}/data`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.auth.getToken()}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error("Erro ao atualizar dados do usuário");
    }

    return response.json();
  }

  static async addNotification(notification) {
    const userId = window.auth.getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado");

    const response = await fetch(`${API_URL}/users/${userId}/notifications`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.auth.getToken()}`,
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      throw new Error("Erro ao adicionar notificação");
    }

    return response.json();
  }

  static async deleteNotification(index) {
    const userId = window.auth.getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado");

    const response = await fetch(
      `${API_URL}/users/${userId}/notifications/${index}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${window.auth.getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao remover notificação");
    }

    return response.json();
  }

  static async registerTraining(training) {
    const userId = window.auth.getCurrentUserId();
    if (!userId) throw new Error("Usuário não autenticado");

    const response = await fetch(`${API_URL}/users/${userId}/trainings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${window.auth.getToken()}`,
      },
      body: JSON.stringify(training),
    });

    if (!response.ok) {
      throw new Error("Erro ao registrar treino");
    }

    return response.json();
  }

  static async getRanking() {
    const response = await fetch(`${API_URL}/ranking`, {
      headers: {
        Authorization: `Bearer ${window.auth.getToken()}`,
      },
    });
    if (!response.ok) {
      throw new Error("Erro ao obter ranking global");
    }
    return response.json();
  }

  static async getSocialFeed(page = 0, limit = 10) {
    const response = await fetch(`${API_URL}/social-feed?page=${page}&limit=${limit}`, {
      headers: {
        'Authorization': `Bearer ${window.auth.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao obter feed social');
    }
    
    return response.json();
  }

  static async getAllUsers() {
    const response = await fetch(`${API_URL}/users`, {
      headers: {
        'Authorization': `Bearer ${window.auth.getToken()}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Erro ao obter lista de usuários');
    }
    
    return response.json();
  }
}

export default ApiService;
window.ApiService = ApiService;
