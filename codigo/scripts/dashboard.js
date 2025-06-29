import ApiService from "./services/api.js";
import { getTimeAgo } from "./utils/toast.js";

// Variável global para armazenar os dados das fichas
let fichasData = [];

// Funções para navegação do carrossel
window.previousFicha = function (button) {
  const wrapper = button.closest(".ficha-carousel-wrapper");
  const track = wrapper.querySelector(".ficha-carousel-track");
  const currentIndex = parseInt(track.dataset.currentIndex || 0);
  const totalFichas = parseInt(wrapper.dataset.totalFichas);

  const newIndex = currentIndex > 0 ? currentIndex - 1 : totalFichas - 1;
  updateFichaDisplay(wrapper, newIndex, "left");
};

window.nextFicha = function (button) {
  const wrapper = button.closest(".ficha-carousel-wrapper");
  const track = wrapper.querySelector(".ficha-carousel-track");
  const currentIndex = parseInt(track.dataset.currentIndex || 0);
  const totalFichas = parseInt(wrapper.dataset.totalFichas);

  const newIndex = currentIndex < totalFichas - 1 ? currentIndex + 1 : 0;
  updateFichaDisplay(wrapper, newIndex, "right");
};

function updateFichaDisplay(wrapper, index, direction = "right") {
  const track = wrapper.querySelector(".ficha-carousel-track");
  const ficha = fichasData[index];

  if (!ficha) return;

  const iconMap = {
    Pernas: "activity",
    Superiores: "barbell",
    Funcional: "heartbeat",
    Cardio: "flame",
  };

  const colorMap = {
    Pernas: "#F44336",
    Superiores: "#3F51B5",
    Funcional: "#4CAF50",
    Cardio: "#FF9800",
  };

  const icon = iconMap[ficha.category] || "clipboard-list";
  const color = colorMap[ficha.category] || "#9E9E9E";

  // Adicionar classe de animação de saída com direção
  const currentItem = track.querySelector(".ficha-carousel-item");
  if (currentItem) {
    currentItem.classList.add("slide-out");
    currentItem.style.animationDirection =
      direction === "left" ? "reverse" : "normal";
  }

  // Aguardar a animação de saída terminar antes de trocar o conteúdo
  setTimeout(() => {
    track.innerHTML = `
      <div class="ficha-carousel-item" style="border-left: 4px solid ${color};">
        <div class="ficha-icon"><i data-lucide="${icon}"></i></div>
        <div class="ficha-info">
          <div class="ficha-nome">${ficha.name}</div>
          <div class="ficha-categoria">${ficha.category} · ${ficha.type}</div>
        </div>
      </div>
    `;

    track.dataset.currentIndex = index;
    lucide.createIcons();
  }, 300); // Tempo da animação slideOut
}

async function loadUserData() {
  try {
    const userData = await ApiService.getUserData();
    const widgets = [
      {
        id: "treinos-usuario",
        title: "Total de treinos do usuário",
        type: "info-card",
        icon: "clipboard-list",
        w: 4,
      },
      {
        id: "treino-preferido",
        title: "Treino preferido do usuário",
        type: "info-card",
        icon: "file-heart",
        w: 4,
      },
      {
        id: "media-treinos",
        title: "Média de treinos por usuário",
        type: "info-card",
        icon: "users-round",
        w: 4,
      },
      {
        id: "xp-total",
        title: "Total de XP acumulado",
        type: "info-card",
        icon: "star",
        w: 4,
      },
      {
        id: "media-duracao",
        title: "Tempo médio dos treinos",
        type: "info-card",
        icon: "timer",
        w: 4,
      },
      {
        id: "categoria-xp",
        title: "Categoria com mais XP",
        type: "info-card",
        icon: "flame",
        w: 4,
      },
      {
        id: "evolucao-xp",
        title: "Evolução do XP nos treinos",
        type: "chart-line",
        icon: "trending-up",
        w: 6,
      },
      {
        id: "distribuicao-categorias",
        title: "Distribuição por categoria",
        type: "chart-pie",
        icon: "pie-chart",
        w: 6,
      },
      {
        id: "progresso-conquistas",
        title: "Conquistas alcançadas",
        type: "info-card",
        icon: "trophy",
        w: 4,
      },
      {
        id: "ultima-atividade",
        title: "Último treino registrado",
        type: "info-card",
        icon: "clock",
        w: 4,
      },
      {
        id: "quantidade-fichas",
        title: "Fichas criadas",
        type: "info-card",
        icon: "layers",
        w: 4,
      },
    ];

    const grid = document.getElementById("grid");

    widgets.forEach((widget) => {
      const col = document.createElement("div");
      col.className = `col-lg-${widget.w} col-md-6`;

      col.innerHTML = `
        <div class="card">
          <div class="card-title d-flex align-items-center justify-content-between header-responsivity">
            <div class="card-header-info">
              <div class="header-icon">
                <i data-lucide="${widget.icon}" ></i> 
              </div>
              ${widget.title}
            </div>
            <i data-lucide="info" data-bs-toggle="tooltip" data-bs-placement="top" title='${getTooltipText(
              widget.id
            )}'></i>
          </div>
          <div class="card-content">
            ${
              widget.type === "info-card"
                ? generateCardInfo(widget.id)
                : `<canvas id="chart-${widget.id}"></canvas>`
            }
          </div>
        </div>
      `;

      lucide.createIcons();
      grid.appendChild(col);

      if (widget.type.startsWith("chart")) {
        generateChart(widget.id);
      }
    });

    // Recria os ícones do Lucide após criar todos os widgets
    setTimeout(() => {
      lucide.createIcons();
    }, 50);

    // Inicializa tooltips após criar todos os widgets
    setTimeout(() => {
      if (typeof bootstrap === "undefined") {
        return;
      }

      var tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
      );
      var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl, {
          trigger: "hover",
          placement: "top",
          html: true,
        });
      });

      // Verifica se o carrossel de fichas foi criado corretamente
      const fichaCarousel = document.querySelector(".ficha-carousel-wrapper");
      if (fichaCarousel) {
        // Recria os ícones especificamente para o carrossel
        const carouselIcons = fichaCarousel.querySelectorAll("[data-lucide]");
      }
    }, 100);

    function generateCardInfo(id) {
      const generators = {
        "treinos-usuario": () => `
          <div class="card-info-text-wrapper">
            <div class="card-info-main-text">${
              userData.registered_trainings?.length || 0
            } <span class="info-description">treinos feitos</span></div>
          </div>`,

        "treino-preferido": () => {
          const { category, percentage } = getPreferedTrainingStats();
          return `
            <div class="card-info-text-wrapper">
              <div class="card-info-main-text">${category || "Nenhum"}</div>
              <div class="card-info-second-text">${percentage}% dos treinos</div>
            </div>`;
        },

        "media-treinos": () => `
          <div class="card-info-text-wrapper">
            <div class="card-info-main-text">${
              userData.media_treinos_por_usuario
            } <span class="info-description">média geral</span></div>
            <div class="card-info-second-text">${getAboveAveragePercentage()}</div>
          </div>`,

        "xp-total": () => `
          <div class="card-info-text-wrapper">
            <div class="card-info-main-text">${
              userData.profile?.xp || 0
            } XP</div>
          </div>`,

        "media-duracao": () => {
          const totalMin =
            userData.registered_trainings?.reduce(
              (acc, t) => acc + (t.duration?.minutes || 0),
              0
            ) || 0;
          const media =
            totalMin && userData.registered_trainings?.length
              ? (totalMin / userData.registered_trainings.length).toFixed(1)
              : 0;
          return `<div class="card-info-text-wrapper">
            <div class="card-info-main-text">${media} min</div>
            <div class="card-info-second-text">Tempo médio</div>
          </div>`;
        },

        "categoria-xp": () => {
          const categoriaXP = {};
          userData.edited_trainings?.forEach((t) => {
            t.days?.forEach((day) => {
              if (t.category) {
                categoriaXP[t.category] =
                  (categoriaXP[t.category] || 0) + (day.xp || 0);
              }
            });
          });
          let maxCat = "Nenhuma",
            maxXP = 0;
          for (const [cat, xp] of Object.entries(categoriaXP)) {
            if (xp > maxXP) {
              maxCat = cat;
              maxXP = xp;
            }
          }
          return `<div class="card-info-text-wrapper">
            <div class="card-info-main-text">${maxCat}</div>
            <div class="card-info-second-text">${maxXP} XP acumulado</div>
          </div>`;
        },

        "progresso-conquistas": () => {
          const conquistas = userData.profile?.metadados?.conquistas || [];

          if (conquistas.length === 0) {
            return `<div class="card-info-text-wrapper">
              <div class="card-info-main-text">0</div>
              <div class="card-info-second-text">nenhuma conquista ainda</div>
            </div>`;
          }

          const listaConquistas = conquistas
            .slice(0, 6)
            .map((c) => {
              return `
              <div class="conquista-item ${
                c.conquistada ? "ativa" : "inativa"
              }" data-bs-toggle="tooltip" data-bs-placement="top" title="${
                c.nome
              }: ${c.descricao}">
                🏆
              </div>`;
            })
            .join("");

          const totalDesbloqueadas = conquistas.filter(
            (c) => c.conquistada
          ).length;

          return `
            <div class="conquista-galeria-wrapper">
              <div class="card-info-main-text">${totalDesbloqueadas} <span class="info-description">conquistas desbloqueadas</span></div>
              <div class="conquista-galeria">${listaConquistas}</div>
              <div class="card-info-second-text">total: ${conquistas.length}</div>
            </div>`;
        },

        "ultima-atividade": () => {
          const treinos = userData.registered_trainings || [];
          if (treinos.length === 0) {
            return `<div class="card-info-text-wrapper">
              <div class="card-info-main-text">Sem treinos</div>
              <div class="card-info-second-text">Você ainda não registrou treinos</div>
            </div>`;
          }

          // Pega o treino mais recente
          const ultimoTreino = [...treinos].sort(
            (a, b) => new Date(b.date) - new Date(a.date)
          )[0];
          const ficha = userData.edited_trainings?.find(
            (f) => f.id === ultimoTreino.training_id
          );
          const dia = ficha?.days?.[ultimoTreino.day_index];
          const duration = ultimoTreino.duration || { hours: 0, minutes: 30 };

          const timeAgo = getTimeAgo(new Date(ultimoTreino.date));
          const category = ficha?.category || "Treino";
          const iconMap = {
            Pernas: "activity",
            Superiores: "barbell",
            Funcional: "heartbeat",
            Cardio: "flame",
          };
          const icon = iconMap[category] || "clipboard-list";

          return `
            <div class="ultima-atividade-card">
              <div class="atividade-header">
                <i data-lucide="${icon}" class="atividade-icon"></i>
                <div>
                  <div class="atividade-titulo">${
                    dia?.name || "Dia de treino"
                  }</div>
                  <div class="atividade-subtitulo">${category} • ${
            ficha?.name || "Ficha personalizada"
          }</div>
                </div>
              </div>

              <div class="atividade-detalhes">
                <div><i data-lucide="clock" class="detalhe-icon"></i> ${
                  duration.hours
                }h ${duration.minutes}min</div>
                <div><i data-lucide="zap" class="detalhe-icon"></i> +${
                  ultimoTreino.xpGain || 0
                } XP</div>
                <div><i data-lucide="calendar" class="detalhe-icon"></i> ${timeAgo}</div>
              </div>
            </div>
          `;
        },

        "quantidade-fichas": () => {
          const fichas = userData.edited_trainings || [];

          // Armazenar dados das fichas na variável global
          fichasData = fichas;

          if (fichas.length === 0) {
            return `<div class="card-info-text-wrapper">
              <div class="card-info-main-text">0</div>
              <div class="card-info-second-text">nenhuma ficha criada</div>
            </div>`;
          }

          const iconMap = {
            Pernas: "activity",
            Superiores: "barbell",
            Funcional: "heartbeat",
            Cardio: "flame",
          };

          const colorMap = {
            Pernas: "#F44336",
            Superiores: "#3F51B5",
            Funcional: "#4CAF50",
            Cardio: "#FF9800",
          };

          // Mostrar apenas a primeira ficha inicialmente
          const currentFicha = fichas[0];
          const icon = iconMap[currentFicha.category] || "clipboard-list";
          const color = colorMap[currentFicha.category] || "#9E9E9E";

          const fichaContent = `
            <div class="ficha-carousel-item" style="border-left: 4px solid ${color};">
              <div class="ficha-icon"><i data-lucide="${icon}"></i></div>
              <div class="ficha-info">
                <div class="ficha-nome">${
                  currentFicha.name || "Ficha sem nome"
                }</div>
                <div class="ficha-categoria">${
                  currentFicha.category || "Sem categoria"
                } · ${currentFicha.type || "Geral"}</div>
              </div>
            </div>
          `;

          const showNavigation = fichas.length > 1;

          return `
            <div class="card-info-main-text">${
              fichas.length
            } <span class="info-description">fichas criadas</span></div>

            <div class="ficha-carousel-wrapper" data-total-fichas="${
              fichas.length
            }">
              ${
                showNavigation
                  ? '<button class="carousel-btn left-btn" onclick="previousFicha(this)"><i data-lucide="chevron-left"></i></button>'
                  : ""
              }
              <div class="ficha-carousel-track" data-current-index="0">${fichaContent}</div>
              ${
                showNavigation
                  ? '<button class="carousel-btn right-btn" onclick="nextFicha(this)"><i data-lucide="chevron-right"></i></button>'
                  : ""
              }
            </div>
          `;
        },

        "objetivo-usuario": () => {
          const objetivo =
            userData.profile?.objetivos?.objetivo_principal || "Não definido";
          return `<div class="card-info-text-wrapper">
            <div class="card-info-main-text">${objetivo}</div>
            <div class="card-info-second-text">objetivo atual</div>
          </div>`;
        },
      };

      const generate = generators[id];
      return generate ? generate() : `<div>Dados indisponíveis</div>`;
    }

    function getAboveAveragePercentage() {
      const userCount = userData.registered_trainings?.length || 0;
      const platformAverage = userData.media_treinos_por_usuario || 1;
      const diff = userCount;
      const percentage = ((diff / platformAverage) * 100).toFixed(1);
      return `${Math.abs(percentage)}% ${
        diff <= 0
          ? '<i data-lucide="move-down-right"></i>'
          : '<i data-lucide="move-up-right"></i>'
      }`;
    }

    function getPreferedTrainingStats() {
      const categoryCount = {};
      const totalTrainings = userData.registered_trainings?.length || 0;
      if (totalTrainings === 0) return { category: "Nenhum", percentage: 0 };
      userData.registered_trainings.forEach((registered) => {
        const training = userData.edited_trainings.find(
          (t) => t.id === registered.training_id
        );
        if (training && training.category) {
          const category = training.category;
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });
      let preferredCategory = null;
      let maxCount = 0;
      for (const [category, count] of Object.entries(categoryCount)) {
        if (count > maxCount) {
          preferredCategory = category;
          maxCount = count;
        }
      }
      const percentage = ((maxCount / totalTrainings) * 100).toFixed(1);
      return { category: preferredCategory, percentage };
    }

    function generateChart(id) {
      const ctx = document.getElementById(`chart-${id}`).getContext("2d");
      if (id === "evolucao-xp") {
        const xpByDate = {};

        // Agrupa XP por data
        userData.registered_trainings?.forEach((t) => {
          const date = new Date(t.date).toLocaleDateString("pt-BR");
          xpByDate[date] = (xpByDate[date] || 0) + (t.xpGain || 0);
        });

        // Ordena as datas em ordem cronológica
        const sortedEntries = Object.entries(xpByDate).sort((a, b) => {
          const dateA = new Date(a[0].split("/").reverse().join("-"));
          const dateB = new Date(b[0].split("/").reverse().join("-"));
          return dateA - dateB;
        });

        const labels = sortedEntries.map(([date]) => date);
        const data = sortedEntries.map(([, xp]) => xp);

        new Chart(ctx, {
          type: "line",
          data: {
            labels,
            datasets: [
              {
                label: "XP por dia",
                data,
                fill: false,
                borderColor: "rgb(75, 192, 192)",
                tension: 0.1,
              },
            ],
          },
        });
      } else if (id === "distribuicao-categorias") {
        const catMap = {};

        // Percorre todos os treinos registrados
        userData.registered_trainings?.forEach((registeredTraining) => {
          // Encontra a ficha correspondente ao treino registrado
          const ficha = userData.edited_trainings?.find(
            (t) => t.id === registeredTraining.training_id
          );

          // Se encontrou a ficha e ela tem categoria, conta o treino
          if (ficha && ficha.category) {
            catMap[ficha.category] = (catMap[ficha.category] || 0) + 1;
          }
        });

        // Definir tons de azul: primeiro segmento com o azul principal do app, os outros mais claros
        const baseColors = [
          "#1976d2", // azul principal do app
          "#64b5f6", // azul claro
          "#90caf9", // azul ainda mais claro
          "#bbdefb", // quase branco
          "#e3f2fd", // super claro
        ];
        // Tons mais escuros para hover
        const hoverColors = [
          "#0d47a1", // azul escuro para o principal
          "#1976d2", // azul principal
          "#42a5f5", // azul intermediário
          "#64b5f6", // azul claro
          "#90caf9", // azul bem claro
        ];
        const categories = Object.keys(catMap);
        const data = Object.values(catMap);
        const backgroundColor = categories.map((_, i) =>
          i === 0
            ? baseColors[0]
            : baseColors[(i % (baseColors.length - 1)) + 1]
        );
        const hoverBackgroundColor = categories.map((_, i) =>
          i === 0
            ? hoverColors[0]
            : hoverColors[(i % (hoverColors.length - 1)) + 1]
        );

        new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: categories,
            datasets: [
              {
                label: "Treinos por categoria",
                data: data,
                backgroundColor: backgroundColor,
                hoverBackgroundColor: hoverBackgroundColor,
                borderWidth: 0,
              },
            ],
          },
          options: {
            cutout: "70%", // donut mais grosso
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  padding: 36,
                },
              },
            },
          },
        });
      }
    }

    function getTooltipText(widgetId) {
      const tooltips = {
        "treinos-usuario":
          "Mostra o número total de treinos que você já registrou na plataforma. Inclui todos os treinos desde o seu primeiro registro.",
        "treino-preferido":
          "Exibe a categoria de treino que você mais pratica, baseado na frequência dos seus registros. Mostra também a porcentagem de uso.",
        "media-treinos":
          "Compara sua quantidade de treinos com a média geral de todos os usuários da plataforma. Mostra se você está acima ou abaixo da média.",
        "xp-total":
          "Apresenta toda a experiência (XP) que você acumulou através dos seus treinos registrados. Quanto mais XP, maior seu nível.",
        "media-duracao":
          "Calcula o tempo médio dos seus treinos em minutos. Baseado na duração total de todos os treinos registrados.",
        "categoria-xp":
          "Mostra qual categoria de treino te rendeu mais XP até agora. Útil para identificar onde você tem melhor performance.",
        "evolucao-xp":
          "Gráfico que mostra como seu XP evoluiu ao longo do tempo. Permite visualizar seu progresso e consistência nos treinos.",
        "distribuicao-categorias":
          "Visualize a proporção de treinos realizados em cada categoria. O gráfico mostra como suas atividades estão distribuídas entre os diferentes tipos de treino.",
        "progresso-conquistas":
          "Exibe as conquistas que você já desbloqueou e quantas ainda faltam. As conquistas são desbloqueadas ao atingir metas específicas.",
        "ultima-atividade":
          "Mostra informações detalhadas do seu último treino registrado, incluindo duração, XP ganho e há quanto tempo foi realizado.",
        "quantidade-fichas":
          "Apresenta o número total de fichas de treino que você criou. Permite navegar entre suas fichas usando as setas.",
      };

      return tooltips[widgetId] || "Informações sobre este card.";
    }
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    document.getElementById("user-name").innerText = "Usuário";
  }
}

loadUserData();
