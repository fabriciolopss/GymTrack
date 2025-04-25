class LayoutManager {
  constructor() {
    this.headerItems = document.querySelectorAll(".header-item");
    this.activeItem = "Dashboard";

    this.addEventListeners();
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
    this.loadSection(item.innerText);
  }

  async loadSection(section) {
    const response = await fetch(`./sections/${section}.html`);
    if (!response.ok) {
      console.error("Error loading section:", response.statusText);
      return;
    }
    const html = await response.text();
    document.querySelector("#main-content").innerHTML = html;
  }
}
