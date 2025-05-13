document.addEventListener("DOMContentLoaded", () => {
  new DashboardManager();
});

class DashboardManager {
  constructor() {
    this.gymData = JSON.parse(localStorage.getItem("gymAppData")) || {};
    this.getUserName();
    this.hideCadastroIfProfileExists();
  }

  getUserName() {
    document.getElementById("user-name").innerText =
      this.gymData.profile.name || "Usuário desconhecido";
  }

  hideCadastroIfProfileExists() {
    const profile = this.gymData.profile;

    function isEmptyProfile(profile) {
      return (
        !profile ||
        typeof profile !== "object" ||
        Array.isArray(profile) ||
        Object.keys(profile).length === 0
      );
    }

    const cadastroMenuItem = document.querySelector(
      '[redirect-session-name="cadastro"]'
    );
    if (cadastroMenuItem) {
      cadastroMenuItem.style.display = isEmptyProfile(profile)
        ? "flex"
        : "none";
    }
  }
}
class Dashboard {
  constructor() {
    this.grid = null;
    this.initGrid();
    this.createExampleCards();
  }

  initGrid() {
    this.grid = GridStack.init({
      float: true,
      removable: false,
      removeTimeout: 100,
      acceptWidgets: false,
      margin: 10,
      cellHeight: 70,
      minRow: 1,
      disableDrag: false,
      disableResize: false,
    });
  }

  createExampleCards() {
    const cards = [
      {
        id: 1,
        x: 0,
        y: 0,
        width: 6,
        height: 4,
        title: "Progresso Semanal",
        type: "chart",
        chartData: {
          labels: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"],
          datasets: [
            {
              label: "Carga (kg)",
              data: [65, 67, 70, 72, 68, 75, 73],
              borderColor: "#6366f1",
              backgroundColor: "rgba(99, 102, 241, 0.1)",
              tension: 0.3,
              fill: true,
              borderWidth: 2,
            },
          ],
        },
      },
      {
        id: 1,
        x: 0,
        y: 0,
        width: 4,
        height: 2,
        title: "Progresso Semanal",
        content: "Seu progresso esta semana: +5kg no supino!",
      },
      {
        id: 2,
        x: 4,
        y: 0,
        width: 4,
        height: 3,
        title: "Próximo Treino",
        content: "Treino de pernas amanhã às 18:00",
      },
      {
        id: 3,
        x: 8,
        y: 0,
        width: 4,
        height: 2,
        title: "Conquistas",
        content: "Você desbloqueou 3 novas conquistas!",
      },
      {
        id: 4,
        x: 0,
        y: 2,
        width: 6,
        height: 3,
        title: "Estatísticas",
        content: "Você treinou 4 vezes esta semana. Mantenha o ritmo!",
      },
      {
        id: 5,
        x: 6,
        y: 3,
        width: 6,
        height: 2,
        title: "Dicas",
        content: "Lembre-se de se alongar antes do treino",
      },
    ];

    cards.forEach((card) => {
      const el = document.createElement("div");
      el.setAttribute("gs-id", card.id);
      el.setAttribute("gs-x", card.x);
      el.setAttribute("gs-y", card.y);
      el.setAttribute("gs-w", card.width);
      el.setAttribute("gs-h", card.height);
      el.classList.add("grid-stack-item");

      if (card.type === "chart") {
        el.innerHTML = `
                <div class="grid-stack-item-content">
                    <div class="card-title">${card.title}</div>
                    <div class="card-content" style="height: calc(100% - 30px);">
                        <canvas class="progress-chart"></canvas>
                    </div>
                </div>
            `;
      } else {
        el.innerHTML = `
                <div class="grid-stack-item-content">
                    <div class="card-title">${card.title}</div>
                    <div class="card-content">${card.content}</div>
                </div>
            `;
      }

      this.grid.addWidget(el);

      // Initialize chart after adding to DOM
      if (card.type === "chart") {
        this.initChart(el, card.chartData);
      }
    });
  }

  initChart(cardElement, chartData) {
    const canvas = cardElement.querySelector(".progress-chart");
    new Chart(canvas, {
      type: "line",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: "#1e293b",
            titleColor: "#f8fafc",
            bodyColor: "#f8fafc",
            borderColor: "#64748b",
            borderWidth: 1,
            padding: 12,
            usePointStyle: true,
          },
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: "rgba(203, 213, 225, 0.2)",
            },
            ticks: {
              color: "#64748b",
            },
          },
          x: {
            grid: {
              color: "rgba(203, 213, 225, 0.2)",
            },
            ticks: {
              color: "#64748b",
            },
          },
        },
        elements: {
          point: {
            radius: 4,
            hoverRadius: 6,
            backgroundColor: "#ffffff",
            borderWidth: 2,
          },
        },
      },
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  new Dashboard();
});
