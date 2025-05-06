class LayoutManager {
  constructor() {
    this.headerItems = document.querySelectorAll(".header-item");
    this.activeItem = null;

    this.setActiveHeaderFromURL();
    this.addEventListeners();
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
}
