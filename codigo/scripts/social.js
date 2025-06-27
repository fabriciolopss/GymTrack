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
    this.sortBy = 'recent';
    this.category = 'all';
    this.searchTerm = '';
    this.filteredPosts = [];
    this.init();
    this.reachedEnd = false;
    this.totalPosts = 0;
  }

  async init() {
    try {
      this.attachScrollListener();
      this.attachSearchListener();
      this.attachFilterListeners();
      this.attachActionListeners();
      await this.loadPosts();
      await this.loadUserStats();
      await this.loadUserData();
    } catch (error) {
      console.error('Erro ao inicializar feed social:', error);
    }
  }
  
  attachScrollListener() {
    window.addEventListener('scroll', async () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const bodyHeight = document.body.offsetHeight;
  
      const threshold = 300;
  
      if (!this.isLoading && !this.reachedEnd && (scrollY + windowHeight >= bodyHeight - threshold)) {
        this.currentPage++;
        await this.loadPosts();
      }
  
      if (this.reachedEnd && scrollY + windowHeight >= bodyHeight) {
        window.scrollTo({
          top: bodyHeight - windowHeight - 40, 
          behavior: "smooth"
        });
      }
    });
  }
  
  attachSearchListener() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value.toLowerCase();
        
        // Aplicar filtros (busca + categoria)
        this.filterPosts();
      });
    }
  }
  
  attachFilterListeners() {
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        filterTabs.forEach(t => t.classList.remove('active'));
        // Add active class to clicked tab
        tab.classList.add('active');
        
        this.category = tab.dataset.category;
        
        // Aplicar filtro client-side
        this.filterPosts();
      });
    });
  }
  
  attachActionListeners() {
    const newPostBtn = document.getElementById('new-post-btn');
    const refreshBtn = document.getElementById('refresh-feed-btn');
    
    if (newPostBtn) {
      newPostBtn.addEventListener('click', () => {
        this.showNewPostModal();
      });
    }
    
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.refreshFeed();
      });
    }
  }
  
  showNewPostModal() {
    window.location.href = 'registrar-treino.html';
  }
  
  async refreshFeed() {
    const refreshBtn = document.getElementById('refresh-feed-btn');
    if (refreshBtn) {
      refreshBtn.style.pointerEvents = 'none';
      refreshBtn.style.opacity = '0.7';
    }
    
    this.currentPage = 0;
    this.reachedEnd = false;
    this.posts = [];
    this.filteredPosts = [];
    this.searchTerm = '';
    this.category = 'all';
    
    // Reset search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Reset filter tabs
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => tab.classList.remove('active'));
    const allTab = document.querySelector('[data-category="all"]');
    if (allTab) {
      allTab.classList.add('active');
    }
    
    // Clear feed
    const feed = document.getElementById("feed-posts");
    if (feed) {
      feed.innerHTML = '';
    }
    
    await this.loadPosts();
    await this.loadUserStats();
    
    if (refreshBtn) {
      refreshBtn.style.pointerEvents = 'auto';
      refreshBtn.style.opacity = '1';
    }
  }
  
  filterPosts() {
    this.filteredPosts = this.posts.filter(post => {
      const matchesSearch = !this.searchTerm || 
        post.name.toLowerCase().includes(this.searchTerm) ||
        post.message.toLowerCase().includes(this.searchTerm) ||
        post.category.toLowerCase().includes(this.searchTerm);
      
      const matchesCategory = this.category === 'all' || post.category === this.category;
      
      return matchesSearch && matchesCategory;
    });
    
    this.renderFilteredPosts();
  }
  
  async loadPosts() {
    const feed = document.getElementById("feed-posts");
  
    if (this.reachedEnd || this.isLoading) return;
  
    this.isLoading = true;
  
    document.getElementById("end-of-feed")?.remove();
  
    const loader = this.createLoadingElement();
    feed.appendChild(loader);
  
    const startTime = Date.now();
  
    try {
      const feedData = await ApiService.getSocialFeed(
        this.currentPage,
        10,
        this.sortBy,
        'all' // Sempre carregar todos os posts da API
      );

      this.totalPosts = feedData.pagination.totalItems;
  
      const novosPosts = feedData.feed || [];
  
      const elapsed = Date.now() - startTime;
      if (elapsed < 1000) {
        await new Promise((res) => setTimeout(res, 1000 - elapsed));
      }
  
      document.getElementById("loading-posts")?.remove();
  
      if (novosPosts.length === 0) {
        if (!document.getElementById("end-of-feed")) {
          feed.appendChild(this.createEndOfFeedElement());
        }
        this.reachedEnd = true; 
        return;
      }
  
      if (this.currentPage === 0) {
        this.posts = novosPosts;
      } else {
        this.posts = [...this.posts, ...novosPosts];
      }
  
      // Aplicar filtros se houver busca ou categoria ativa
      if (this.searchTerm || this.category !== 'all') {
        this.filterPosts();
      } else {
        this.renderPosts(novosPosts);
      }
  
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
      document.getElementById("loading-posts")?.remove();
    } finally {
      this.isLoading = false;
    }
  }

  createLoadingElement() {
    const loader = document.createElement("div");
    loader.id = "loading-posts";
    loader.classList.add("loading-posts");
    loader.innerHTML = `
      <div class="spinner"></div>
      <div class="loading-text">Carregando mais posts...</div>
    `;
    return loader;
  }

  createEndOfFeedElement() {
    const endElement = document.createElement('div');
    endElement.id = 'end-of-feed';
    endElement.classList.add('end-of-feed');
    endElement.innerHTML = `
      <div class="end-title">🎉 Você chegou ao final do feed! 🎉</div>
      <div class="end-subtitle">Continue treinando para ver mais posts 💪</div>
    `;
    return endElement;
  }


  renderPosts(newposts = []) {
    const feed = document.getElementById("feed-posts");
    
    // Se for a primeira página, limpar o feed
    if (this.currentPage === 0) {
      feed.innerHTML = '';
    }
    
    newposts.forEach((post) => {
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
          <div class = "xp-gained"><i data-lucide="sparkles"></i> ${post.xpGained} de XP ganho!</div>
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
    
    // Só adiciona end-of-feed se não estiver filtrando
    if (!this.searchTerm && !document.getElementById("end-of-feed")) {
      feed.appendChild(this.createEndOfFeedElement());
    }
  }

  renderFilteredPosts() {
    const feed = document.getElementById("feed-posts");
    feed.innerHTML = '';
    
    if (this.filteredPosts.length === 0) {
      const noResults = document.createElement('div');
      noResults.classList.add('no-results');
      
      let message = 'Nenhum resultado encontrado';
      let subtitle = 'Tente ajustar sua busca ou filtros';
      
      if (this.searchTerm && this.category !== 'all') {
        subtitle = `Nenhum post de "${this.category}" encontrado com "${this.searchTerm}"`;
      } else if (this.searchTerm) {
        subtitle = `Nenhum post encontrado com "${this.searchTerm}"`;
      } else if (this.category !== 'all') {
        subtitle = `Nenhum post de "${this.category}" encontrado`;
      }
      
      noResults.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #64748b;">
          <i class="fa-solid fa-search" style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;"></i>
          <h3>${message}</h3>
          <p>${subtitle}</p>
        </div>
      `;
      feed.appendChild(noResults);
      return;
    }
    
    // Renderizar posts filtrados sem adicionar end-of-feed
    this.filteredPosts.forEach((post) => {
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
          <div class = "xp-gained"><i data-lucide="sparkles"></i> ${post.xpGained} de XP ganho!</div>
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
  
  async loadUserStats() {
    try {
      // Simular dados de estatísticas (você pode integrar com sua API real)
      const stats = {
        totalWorkouts: Math.floor(Math.random() * 50) + 10,
        streakDays: this.totalPosts,
      };
      
      document.getElementById('total-workouts').innerText = stats.totalWorkouts;
      document.getElementById('streak-days').innerText = stats.streakDays;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  }
  
  async loadUserData() {
    try {
      const userData = await ApiService.getUserData();
      document.getElementById('xp-user').innerText = userData.profile.xp;
      document.getElementById('user-name').innerText = userData.profile.pessoal.nome || 'Usuário';
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      document.getElementById('user-name').innerText = 'Usuário';
    }
  }
}



// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
  new SocialFeed();
  var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl)
  })  
});

// Exportar para uso em outros módulos
export default SocialFeed; 