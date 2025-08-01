class LayoutManager {
  constructor() {
    this.sidebar = document.querySelector(".sidebar");
    this.sidebarToggle = document.getElementById("sidebarToggle");
    this.headerItems = [];
    this.activeItem = null;

    this.populateSidebar();
    this.setActiveHeaderFromURL();
    this.addEventListeners();
    this.initializeSidebar();
    this.addLogoutButton();
    this.createTopHeaderNav();
  }

  populateSidebar() {
    if (!this.sidebar) return;

    const sidebarNav = this.sidebar.querySelector(".sidebar-nav");
    if (!sidebarNav) return;

    // Define os itens da sidebar
    const sidebarItems = [
      {
        redirectSessionName: "social",
        icon: "home",
        text: "Home",
      },
      {
        redirectSessionName: "dashboard",
        icon: "chart-area",
        text: "Estatísticas",
      },
      {
        redirectSessionName: "registrar-treino",
        icon: "square-plus",
        text: "Registrar treino",
      },
      {
        redirectSessionName: "consultar-fichas",
        icon: "clipboard-list",
        text: "Consultar fichas",
      },
      {
        redirectSessionName: "progresso",
        icon: "trending-up",
        text: "Progresso",
      },
      {
        redirectSessionName: "historico",
        icon: "History",
        text: "Histórico",
      },
      {
        redirectSessionName: "notificacoes",
        icon: "bell-dot",
        text: "Notificações",
        isNotification: true,
      },
    ];

    // Limpa o conteúdo existente da nav
    sidebarNav.innerHTML = "";

    // Cria os itens da sidebar
    sidebarItems.forEach((item) => {
      if (item.isNotification) {
        // Item de notificação com wrapper especial
        const notificationWrapper = document.createElement("div");
        notificationWrapper.className = "header-item-wrapper position-relative";
        notificationWrapper.setAttribute(
          "redirect-session-name",
          item.redirectSessionName
        );

        notificationWrapper.innerHTML = `
          <div class="position-relative">
            <i data-lucide="${item.icon}"></i>
            <span id="notification-count" class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary"></span>
          </div>
          <span class="nav-text">${item.text}</span>
        `;

        sidebarNav.appendChild(notificationWrapper);
        this.headerItems.push(notificationWrapper);
      } else {
        // Item normal
        const headerItem = document.createElement("div");
        headerItem.className = "header-item";
        headerItem.setAttribute(
          "redirect-session-name",
          item.redirectSessionName
        );

        headerItem.innerHTML = `
          <i data-lucide="${item.icon}"></i>
          <span class="nav-text">${item.text}</span>
        `;

        sidebarNav.appendChild(headerItem);
        this.headerItems.push(headerItem);
      }
    });

    // Adiciona o sistema de notificações após os itens
    const notificationSystem = document.createElement("div");
    notificationSystem.className = "notification-system-wrapper";
    notificationSystem.innerHTML = `
      <div class="notification-header-wrapper d-flex flex-row justify-content-between">
        <div class="notification-title">Notificações</div>
        <div class="d-flex flex-row gap-1 align-items-center">
          <i class="fa-solid fa-check-double"></i>
          <div class="as-read">Marcar como lidas</div>
        </div>
      </div>
      <div class="notification-system-body"></div>
    `;
    sidebarNav.appendChild(notificationSystem);

    // Recria os ícones do Lucide após adicionar os elementos dinamicamente
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  initializeSidebar() {
    if (!this.sidebar || !this.sidebarToggle) return;

    const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";
    if (isCollapsed) {
      this.sidebar.classList.add("collapsed");
    }

    this.sidebarToggle.addEventListener("click", () => {
      this.sidebar.classList.toggle("collapsed");
      localStorage.setItem(
        "sidebarCollapsed",
        this.sidebar.classList.contains("collapsed")
      );
    });
  }

  getAttributeFromItem(item) {
    return item.getAttribute("redirect-session-name");
  }

  setActiveHeaderFromURL() {
    const path = window.location.pathname;
    const currentPage = path.split("/").pop().split(".")[0];

    // Se estamos na página index, o activeItem deve ser 'index'
    this.activeItem = currentPage === "index" ? "index" : currentPage;

    this.headerItems.forEach((headerItem) => {
      const itemSessionName = this.getAttributeFromItem(headerItem);
      if (itemSessionName === this.activeItem) {
        headerItem.classList.add("active");
      } else {
        headerItem.classList.remove("active");
      }
    });
  }

  capitalizeEachWord(str) {
    return str.replace(/\b\w/g, (c) => c.toUpperCase());
  }

  addEventListeners() {
    this.headerItems.forEach((item) => {
      item.addEventListener("click", () => {
        this.handleHeaderClick(item);
      });
    });
  }

  handleHeaderClick(item) {
    const sessionName = item.getAttribute("redirect-session-name");

    // Se for o item de notificações, não redireciona (deixa o notifications.js cuidar)
    if (sessionName === "notificacoes") {
      return;
    }

    if (this.activeItem === item.innerText) return;
    this.activeItem = item.innerText;
    this.headerItems.forEach((headerItem) => {
      headerItem.classList.remove("active");
    });
    item.classList.add("active");
    this.redirectToSection(sessionName);
  }

  redirectToSection(session) {
    const fileName = session.toLowerCase().replace(/\s+/g, "-") + ".html";

    const pathParts = window.location.pathname.split("/");

    pathParts.pop();

    const isInSections = pathParts.includes("sections");

    if (isInSections) {
      pathParts.pop();
    }

    const basePath = pathParts.join("/");

    const targetPath = `${basePath}/sections/${fileName}`;

    window.location.href = targetPath;
  }

  addLogoutButton() {
    const sidebarFooter = document.querySelector(".sidebar-footer");
    if (!sidebarFooter) return;

    // Cria o botão de logout
    const logoutButton = document.createElement("button");
    logoutButton.className = "btn btn-danger w-100 mt-2";
    logoutButton.style.cssText =
      "background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 1px solid #dee2e6; color: #6c757d; white-space: nowrap; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; font-weight: 600; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); transition: all 0.3s ease;";
    logoutButton.innerHTML = `
        <i data-lucide="log-out"></i>
        <span class="nav-text">Sair</span>
    `;

    const profileButton = document.createElement("button");
    profileButton.className = "btn btn-danger w-100 mt-2";
    profileButton.style.cssText =
      "background: linear-gradient(135deg, #007bff 0%, #0056b3 100%); border: none; white-space: nowrap; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; font-weight: 600; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0, 123, 255, 0.2); transition: all 0.3s ease;";
    profileButton.innerHTML = `
        <i data-lucide="user"></i>
        <span class="nav-text">Perfil</span>
    `;

    logoutButton.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Redireciona para a página de login
      window.location.href = "login.html";
    });

    // Adiciona efeito hover para o botão de logout
    logoutButton.addEventListener("mouseenter", () => {
      logoutButton.style.background =
        "linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%)";
      logoutButton.style.transform = "translateY(-1px)";
      logoutButton.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.15)";
      logoutButton.style.color = "#495057";
    });

    logoutButton.addEventListener("mouseleave", () => {
      logoutButton.style.background =
        "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)";
      logoutButton.style.transform = "translateY(0)";
      logoutButton.style.boxShadow = "0 2px 4px rgba(0, 0, 0, 0.1)";
      logoutButton.style.color = "#6c757d";
    });

    profileButton.addEventListener("click", function () {
      window.location.href = "perfil.html";
    });

    // Adiciona efeito hover para o botão de perfil
    profileButton.addEventListener("mouseenter", () => {
      profileButton.style.background =
        "linear-gradient(135deg, #0056b3 0%, #004085 100%)";
      profileButton.style.transform = "translateY(-1px)";
      profileButton.style.boxShadow = "0 4px 8px rgba(0, 123, 255, 0.3)";
    });

    profileButton.addEventListener("mouseleave", () => {
      profileButton.style.background =
        "linear-gradient(135deg, #007bff 0%, #0056b3 100%)";
      profileButton.style.transform = "translateY(0)";
      profileButton.style.boxShadow = "0 2px 4px rgba(0, 123, 255, 0.2)";
    });

    sidebarFooter.appendChild(profileButton);
    // Adiciona o botão após o botão de registrar treino
    sidebarFooter.appendChild(logoutButton);
  }

  createTopHeaderNav() {
    // Remove se já existir
    const oldHeader = document.querySelector(".top-header-nav");
    if (oldHeader) oldHeader.remove();

    const headerNav = document.createElement("div");
    headerNav.className = "top-header-nav";

    const navItems = [
      { redirectSessionName: 'social', icon: 'home' },
      { redirectSessionName: 'dashboard', icon: 'chart-area' },
      { redirectSessionName: 'registrar-treino', icon: 'square-plus' },
      { redirectSessionName: 'consultar-fichas', icon: 'clipboard-list' },
      { redirectSessionName: 'progresso', icon: 'trending-up' },
      { redirectSessionName: 'perfil', icon: 'user' }
    ];

    navItems.forEach((item) => {
      const navItem = document.createElement("button");
      navItem.className = "nav-item";
      navItem.setAttribute("data-section", item.redirectSessionName);
      navItem.innerHTML = `
        <span class="indicator"></span>
        <i class="icon" data-lucide="${item.icon}"></i>
      `;
      navItem.addEventListener("click", () => {
        document
          .querySelectorAll(".top-header-nav .nav-item")
          .forEach((i) => i.classList.remove("active"));
        navItem.classList.add("active");
        if (item.redirectSessionName === "perfil") {
          window.location.href = "perfil.html";
        } else {
          this.redirectToSection(item.redirectSessionName);
        }
      });
      headerNav.appendChild(navItem);
    });

    document.body.appendChild(headerNav);

    // Ativa o item correto ao carregar a página
    const currentPage = window.location.pathname
      .split("/")
      .pop()
      .replace(".html", "");
    document.querySelectorAll(".top-header-nav .nav-item").forEach((item) => {
      if (item.getAttribute("data-section") === currentPage) {
        item.classList.add("active");
      }
    });

    // Recria os ícones do Lucide
    if (window.lucide) window.lucide.createIcons();
  }
}
