document.addEventListener("DOMContentLoaded", async function () {
  // Utilidades
  function getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }
  function formatMinutes(min) {
    if (min < 60) return min + " min";
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h + "h" + (m > 0 ? " " + m + "min" : "");
  }
  function formatDataExtenso(date) {
    const meses = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro",
    ];
    return `Dia ${date.getDate()} de ${meses[date.getMonth()]} de ${date.getFullYear()}`;
  }
  // Busca dados reais
  let data;
  try {
    data = await window.ApiService.getUserData();
  } catch (e) {
    console.error("Erro ao buscar dados do usuário:", e);
    return;
  }
  const treinos = data.registered_trainings || [];
  // 1. Linha de datas da semana
  const hoje = new Date();
  const semanaAtual = getWeekNumber(hoje);
  const anoAtual = hoje.getFullYear();
  const diasSemana = [];
  const diasNomes = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];
  // Começa no domingo
  const primeiroDia = new Date(hoje);
  primeiroDia.setDate(hoje.getDate() - hoje.getDay());
  for (let i = 0; i < 7; i++) {
    const d = new Date(primeiroDia);
    d.setDate(primeiroDia.getDate() + i);
    diasSemana.push(d);
  }
  const resumoSemanaDias = document.getElementById("resumoSemanaDias");
  if (resumoSemanaDias) {
    resumoSemanaDias.innerHTML = diasSemana
      .map((d) => {
        const isHoje = d.toDateString() === hoje.toDateString();
        return `<div style="min-width:38px; padding:4px 0; border-radius:1rem; background:${
          isHoje ? "#d4f7c5" : "#f0f0f0"
        }; color:${isHoje ? "#222" : "#888"}; font-weight:${
          isHoje ? "bold" : "normal"
        }; border: ${
          isHoje ? "2px solid #4CAF50" : "none"
        }; text-align:center; font-size:0.95rem;">
        <div style='font-size:0.8rem;'>${diasNomes[d.getDay()]}</div>
        <div style='font-size:1.1rem;'>${d.getDate()}</div>
      </div>`;
      })
      .join("");
  }
  // 2. Data de hoje
  const resumoDataHoje = document.getElementById("resumoDataHoje");
  if (resumoDataHoje) resumoDataHoje.textContent = formatDataExtenso(hoje);
  // 3. Dias sem falhar (consecutivos)
  function calcularDiasSeguidos(treinos) {
    if (!treinos.length) return 0;
    const datas = treinos.map((t) => new Date(t.date)).sort((a, b) => a - b);
    let maxSeq = 1,
      atualSeq = 1;
    for (let i = 1; i < datas.length; i++) {
      const diff = (datas[i] - datas[i - 1]) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        atualSeq++;
        if (atualSeq > maxSeq) maxSeq = atualSeq;
      } else if (diff > 1) {
        atualSeq = 1;
      }
    }
    return maxSeq;
  }
  const diasSemFalhar = calcularDiasSeguidos(treinos);
  const elDiasSemFalhar = document.getElementById("resumoDiasSemFalhar");
  if (elDiasSemFalhar) elDiasSemFalhar.textContent = diasSemFalhar;
  // 4. Total de séries na semana
  let totalSeries = 0;
  treinos
    .filter((t) => {
      const d = new Date(t.date);
      return getWeekNumber(d) === semanaAtual && d.getFullYear() === anoAtual;
    })
    .forEach((t) => {
      const ficha = data.edited_trainings?.find(
        (et) => et.id === t.training_id
      );
      if (ficha && ficha.days) {
        const diaFicha = ficha.days.find((dia) => dia.id === t.day_index);
        if (diaFicha && diaFicha.day) {
          diaFicha.day.forEach((ex) => {
            totalSeries += ex.series ? parseInt(ex.series) : 0;
          });
        }
      }
    });
  const elTotalSeries = document.getElementById("resumoTotalSeries");
  if (elTotalSeries) elTotalSeries.textContent = totalSeries;
  // 5. Minutos treinados na semana
  const minutosSemana = treinos
    .filter((t) => {
      const d = new Date(t.date);
      return getWeekNumber(d) === semanaAtual && d.getFullYear() === anoAtual;
    })
    .reduce(
      (acc, t) =>
        acc + ((t.duration?.hours || 0) * 60 + (t.duration?.minutes || 0)),
      0
    );
  const elMinutos = document.getElementById("resumoMinutos");
  if (elMinutos) elMinutos.textContent = minutosSemana;
  // Card 2: Evolução do XP
  let xpAcumulado = 0;
  const xpPorData = treinos
    .slice()
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((t) => {
      xpAcumulado += t.xpGain || 0;
      return { data: t.date, xp: xpAcumulado };
    });
  if (document.getElementById("xpEvolucaoChart")) {
    new Chart(document.getElementById("xpEvolucaoChart"), {
      type: "line",
      data: {
        labels: xpPorData.map((x) => x.data),
        datasets: [
          {
            label: "XP acumulado",
            data: xpPorData.map((x) => x.xp),
            borderColor: "#a14fce",
            backgroundColor: "rgba(161,79,206,0.1)",
            tension: 0.3,
            fill: true,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true },
          x: {},
        },
      },
    });
  }
  // Card 3: Meta semanal
  const metaInput = document.getElementById("metaInput");
  const metaProgressBar = document.getElementById("metaProgressBar");
  const metaStatus = document.getElementById("metaStatus");
  function atualizarMeta() {
    const meta = parseInt(metaInput.value) || 1;
    const treinosSemana = treinos.filter((t) => {
      const d = new Date(t.date);
      return getWeekNumber(d) === semanaAtual && d.getFullYear() === anoAtual;
    });
    const progresso = Math.min(
      100,
      Math.round((treinosSemana.length / meta) * 100)
    );
    metaProgressBar.style.width = progresso + "%";
    metaProgressBar.setAttribute("aria-valuenow", progresso);
    metaProgressBar.textContent = progresso + "%";
    metaStatus.textContent = `Você fez ${treinosSemana.length} de ${meta} treinos nesta semana.`;
    if (progresso >= 100) {
      metaProgressBar.classList.add("bg-success");
      metaStatus.textContent += " Parabéns, meta atingida!";
    } else {
      metaProgressBar.classList.remove("bg-success");
    }
  }
  if (metaInput && metaProgressBar && metaStatus) {
    metaInput.addEventListener("input", atualizarMeta);
    atualizarMeta();
  }
});
