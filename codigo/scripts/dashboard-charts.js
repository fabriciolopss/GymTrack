const equipamentos = [
  { id: "flexora", label: "Mesa flexora" },
  { id: "legPress", label: "Leg press" },
  { id: "cadeiraExtensora", label: "Cadeira extensora" },
  { id: "supinoReto", label: "Supino reto" },
  { id: "puxadaAlta", label: "Puxada alta" },
  { id: "desenvolvimentoHalteres", label: "Desenvolvimento com halteres" },
  { id: "roscaDireta", label: "Rosca direta" },
  { id: "tricepsTesta", label: "Tríceps testa" },
  { id: "agachamentoLivre", label: "Agachamento livre" },
  { id: "remadaCurvada", label: "Remada curvada" },
];

const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function renderVolumeCard(maquina = "flexora") {
  const ctxVolume = document.getElementById("volumeChart")?.getContext("2d");

  if (!ctxVolume) return;

  const gradient = ctxVolume.createLinearGradient(0, 0, 0, ctxVolume.canvas.clientHeight);
  gradient.addColorStop(0, "rgba(173, 255, 47, 0.7)"); // Light Green
  gradient.addColorStop(0.33, "rgba(255, 255, 0, 0.7)"); // Yellow
  gradient.addColorStop(0.66, "rgba(255, 165, 0, 0.7)"); // Orange
  gradient.addColorStop(1, "rgba(221, 160, 221, 0.7)"); // Plum/Purple

  const volumeData = {
    flexora: [100, 250, 150, 200], // Sample data for flexora
    legPress: [120, 300, 180, 220], // Sample data for leg press
    cadeiraExtensora: [80, 200, 130, 170], // Sample data for cadeira extensora
    supinoReto: [90, 240, 160, 210], // Sample data for supino reto
    puxadaAlta: [110, 280, 190, 230], // Sample data for puxada alta
    desenvolvimentoHalteres: [130, 320, 200, 250], // Sample data for desenvolvimento com halteres
    roscaDireta: [70, 180, 120, 160], // Sample data for rosca direta
    tricepsTesta: [60, 150, 110, 140], // Sample data for tríceps testa
    agachamentoLivre: [140, 350, 220, 270], // Sample data for agachamento livre
    remadaCurvada: [150, 370, 240, 290], // Sample data for remada curvada
  };

  const data = volumeData[maquina] || volumeData.flexora; // Default to flexora if no match

  console.log(`Rendering volume chart for: ${maquina}`, data);

  const volumeChart = new Chart(ctxVolume, {
    type: "line",
    data: {
      labels: ["S 16", "S 16", "S 16", "S 16"],
      datasets: [
        {
          label: "Volume Total (kg)",
          data,
          borderColor: gradient,
          borderWidth: 3,
          tension: 0.4, // Makes the line curved
          pointRadius: 0, // Hides points by default
          pointHoverRadius: 8,
          pointHoverBackgroundColor: "rgba(221, 160, 221, 1)", // Plum for hover
          pointHoverBorderColor: "white",
          fill: false, // No fill under the line
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              // Custom tooltip for a specific point
              if (context.dataIndex === 2 && context.dataset.data[context.dataIndex] === 150) {
                // Example: Highlight a specific point if its value is 150
                return "300 kg"; // Displaying 300kg for the point that has 150 in data
              }
              return context.dataset.label + ": " + context.parsed.y + " kg";
            },
          },
          backgroundColor: "rgba(128, 0, 128, 0.8)", // Purple tooltip background
          titleFont: {
            size: 0, // Hide title
          },
          bodyFont: {
            size: 14,
            weight: "bold",
          },
          displayColors: false, // Hide color box in tooltip
          padding: 10,
          yAlign: "bottom",
          xAlign: "center",
          caretSize: 5,
          cornerRadius: 6,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: function (context) {
              if (context.tick.value === 0) {
                return "transparent"; // Hide the zero line if not needed
              }
              return "rgba(0, 0, 0, 0.05)"; // Light dotted lines for other grid lines
            },
            borderDash: [2, 2], // Dotted lines
          },
          ticks: {
            display: false, // Hide Y-axis labels
            stepSize: 50,
          },
        },
        x: {
          grid: {
            display: false, // Hide X-axis grid lines
          },
          ticks: {
            font: {
              weight: "bold",
              size: 12,
            },
            color: "#333",
          },
        },
      },
    },
  });
}

async function renderCargaCard(maquina = "flexora") {
  const ctxCarga = document.getElementById("progressaoCargaChart")?.getContext("2d");

  if (!ctxCarga) return;

  const progressaoCargaChart = new Chart(ctxCarga, {
    type: "bar",
    data: {
      labels: ["", "", "", "", ""], // 5 bars, no labels needed as per image
      datasets: [
        {
          label: "Carga (kg)",
          data: [100, 120, 200, 280, 320], // Sample data
          backgroundColor: [
            "rgba(221, 180, 231, 0.8)", // Light purple
            "rgba(221, 180, 231, 0.8)",
            "rgba(221, 180, 231, 0.8)",
            "rgba(0, 0, 0, 0.9)", // Black for the specific bar
            "rgba(221, 180, 231, 0.8)",
          ],
          borderColor: ["rgba(221, 180, 231, 1)", "rgba(221, 180, 231, 1)", "rgba(221, 180, 231, 1)", "rgba(0, 0, 0, 1)", "rgba(221, 180, 231, 1)"],
          borderWidth: 0,
          borderRadius: 20, // Rounded bars
          barPercentage: 0.6,
          categoryPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: "index",
          intersect: false,
          displayColors: false,
          backgroundColor: "rgba(177, 130, 189, 1)", // Purple tooltip
          titleFont: { size: 0 },
          bodyFont: { size: 12, weight: "bold" },
          padding: 8,
          cornerRadius: 6,
          yAlign: "bottom",
          xAlign: "center",
          callbacks: {
            label: function (context) {
              if (context.dataIndex === 3) {
                // The bar that should show 300kg
                return "300 kg";
              }
              return context.parsed.y + " kg";
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
            color: "rgba(0, 0, 0, 0.05)",
            borderDash: [2, 2], // Dotted lines
          },
          ticks: {
            display: false, // Hide Y-axis labels
          },
        },
        x: {
          grid: {
            display: false, // Hide X-axis grid lines
          },
          ticks: {
            display: false, // Hide X-axis labels
          },
        },
      },
    },
  });
}

function popularEquipamentos(selectElement, equipamentosArray) {
  if (!selectElement) return;
  selectElement.innerHTML = "";
  equipamentosArray.forEach((equipamento, index) => {
    const option = document.createElement("option");
    option.value = equipamento.id.toLowerCase().replace(/\s+/g, "-");
    option.textContent = equipamento.label;
    if (index === 0) {
      option.selected = true;
    }
    selectElement.appendChild(option);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  const volumeSelect = document.getElementById("equipamentoVolumeSelect");
  const cargaSelect = document.getElementById("equipamentoCargaSelect");

  popularEquipamentos(volumeSelect, equipamentos);
  popularEquipamentos(cargaSelect, equipamentos);

  renderCargaCard();
  renderVolumeCard();

  volumeSelect.addEventListener("change", function () {
    renderVolumeCard(this.value);
  });

  cargaSelect.addEventListener("change", function () {
    renderCargaCard(this.value);
  });
});
