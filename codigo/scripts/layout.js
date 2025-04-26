class LayoutManager {
  constructor() {
    this.headerItems = document.querySelectorAll(".header-item");
    this.activeItem = null;

    this.setActiveHeaderFromURL();
    this.addEventListeners();
  }

  setActiveHeaderFromURL() {
    const path = window.location.pathname;
    const fileName = path.split("/").pop();

    let sectionName = "Dashboard";

    if (fileName && fileName !== "index.html" && fileName !== "") {
      sectionName = fileName.replace(".html", "").replace(/-/g, " ");
      sectionName = this.capitalizeEachWord(sectionName);
    }

    this.activeItem = sectionName;

    this.headerItems.forEach((headerItem) => {
      if (
        headerItem.innerText.trim().toLowerCase() === sectionName.toLowerCase()
      ) {
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
    this.redirectToSection(item.innerText);
  }

  redirectToSection(section) {
    if (section.toLowerCase() === "dashboard") {
      window.location.href = `/codigo/index.html`;
    } else {
      let fileName = section.toLowerCase().replace(/\s+/g, "-") + ".html";
      window.location.href = `/codigo/sections/${fileName}`;
    }
  }
}
