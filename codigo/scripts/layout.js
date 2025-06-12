class LayoutManager {
  constructor() {
    this.headerItems = document.querySelectorAll(".header-item");
    this.activeItem = null;
    this.sidebar = document.querySelector('.sidebar');
    this.sidebarToggle = document.getElementById('sidebarToggle');

    this.setActiveHeaderFromURL();
    this.addEventListeners();
    this.initializeSidebar();
    this.addLogoutButton();
  }

  initializeSidebar() {
    if (!this.sidebar || !this.sidebarToggle) return;
    
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
    if (isCollapsed) {
      this.sidebar.classList.add('collapsed');
    }

    this.sidebarToggle.addEventListener('click', () => {
      this.sidebar.classList.toggle('collapsed');
      localStorage.setItem('sidebarCollapsed', this.sidebar.classList.contains('collapsed'));
    });
  }

  getAttributeFromItem(item) {
    return item.getAttribute("redirect-session-name");
  }

  setActiveHeaderFromURL() {
    const path = window.location.pathname;
    this.activeItem = path.split("/").pop().split(".")[0];

    this.headerItems.forEach((headerItem) => {
      if (this.getAttributeFromItem(headerItem) === this.activeItem) {
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
    if (this.activeItem === item.innerText) return;
    this.activeItem = item.innerText;
    this.headerItems.forEach((headerItem) => {
      headerItem.classList.remove("active");
    });
    item.classList.add("active");
    this.redirectToSection(item.getAttribute("redirect-session-name"));
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

    const targetPath =
      session === "index"
        ? `${basePath}/index.html`
        : `${basePath}/sections/${fileName}`;

    window.location.href = targetPath;
  }

  addLogoutButton() {
    const sidebarFooter = document.querySelector('.sidebar-footer');
    if (!sidebarFooter) return;

    // Cria o botão de logout
    const logoutButton = document.createElement('button');
    logoutButton.className = 'btn btn-danger w-100 mt-2';
    logoutButton.style.cssText = 'background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); border: none; white-space: nowrap; display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1rem; font-weight: 600; border-radius: 0.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.3s ease;';
    logoutButton.innerHTML = `
        <i data-lucide="log-out"></i>
        <span class="nav-text">Sair</span>
    `;

    // Adiciona o evento de clique
    logoutButton.addEventListener('click', () => {
      // Remove o token e os dados do usuário do localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redireciona para a página de login
      window.location.href = 'login.html';
    });

    // Adiciona o botão após o botão de registrar treino
    sidebarFooter.appendChild(logoutButton);
  }
}
