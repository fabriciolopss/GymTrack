import ApiService from './services/api.js';
import { calcularNivel } from './level.js';

lucide.createIcons();

document.addEventListener("DOMContentLoaded", function () {
  new LayoutManager();
});


class SocialFeed {
  constructor() {
    this.posts = [];
    this.currentPage = 0;
    this.init();
  }

  async init() {
    try {
      await this.loadPosts();
    } catch (error) {
      console.error('Erro ao inicializar feed social:', error);
    }
  }

  async loadPosts() {
    this.isLoading = true;

    try {
      const feedData = await ApiService.getSocialFeed(
        this.currentPage, 
        10, 
        this.sortBy, 
        this.category
      );
      
      if (this.currentPage === 0) {
        this.posts = feedData.feed || [];
      } else {
        this.posts = [...this.feed, ...(feedData.feed || [])];
      }

    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    } finally {
      this.isLoading = false;
    }
    this.renderPosts();
  }

  renderPosts() {
    const feed = document.getElementById("feed-posts");
    this.posts.forEach((post) => {
      const { nivel, xpNivelAtual, xpProxNivel, xpParaProximoNivel } = calcularNivel(post.xpTotal);
      const progressoAtual = ((post.xpTotal - xpNivelAtual) / xpParaProximoNivel) * 100;
  
      // Criação do elemento do post
      const postNow = document.createElement('div');
      postNow.classList.add('post');
      postNow.innerHTML = `
        <div class="post-header">
          <div class="circle-experience">
            <div class="avatar-post"><i class="fa-solid fa-user"></i></div>
            <div class="hexagon-level">${nivel}</div>
          </div>
          <div class="post-header-info">
            <div class="post-name">${post.name}</div>
            <div class="post-action">Fez um treino de ${post.category}</div>
            <div class="post-time">${post.timeAgo}</div>
          </div>
        </div>
        <div class="post-body">
          <div class="post-body-description">${post.message}</div>
          <div class="mural-exercices"></div>
        </div>

        <div class="post-footer">
          <div class="time-spent"><i data-lucide="clock"></i> ${post.duration}</div>
          <div class = "xp-gained"><i data-lucide="sparkles"></i> ${post.xpGained}</div>
        </div>
      `;
  
      // Atualiza o círculo de progresso
      const circle = postNow.querySelector(".circle-experience");
      circle.style.background = `conic-gradient(#66a5fb 0% ${progressoAtual}%, transparent ${progressoAtual}% 100%)`;
  
      // Renderiza os exercícios dinamicamente em formato de cards
      const mural = postNow.querySelector(".mural-exercices");
      if (post.training.day && post.training.day.length > 0) {
        post.training.day.forEach((day) => {
          const exerciseDiv = document.createElement("div");
          exerciseDiv.classList.add("exercise-card");
          exerciseDiv.innerHTML = `
            <div class="exercise-card-header">
              <span class="exercise-icon"><i class='fa-solid fa-dumbbell'></i></span>
              <span class="exercise-title">${day.exercise}</span>
            </div>
            <div class="exercise-info-row">
              <span class="exercise-series"><i class='fa-solid fa-repeat'></i> ${day.series}x</span>
              <span class="exercise-reps"><i class='fa-solid fa-list-ol'></i> ${day.repetitions} reps</span>
              <span class="exercise-rest"><i class='fa-solid fa-clock'></i> ${day.descanso || '-'} descanso</span>
            </div>
          `;
          mural.appendChild(exerciseDiv);
        });
      } else {
        mural.innerHTML = '<div class="no-exercises">Nenhum exercício registrado neste treino.</div>';
      }
  
      // Adiciona o post ao feed
      feed.appendChild(postNow);
      lucide.createIcons();


    });
  }
}



// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new SocialFeed();
});

// Exportar para uso em outros módulos
export default SocialFeed; 