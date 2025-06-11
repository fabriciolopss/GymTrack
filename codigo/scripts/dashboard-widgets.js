function getGymAppData() {
  return JSON.parse(localStorage.getItem("gymAppData"));
}

function getBadgeClass(type) {
  if (!type) return "badge-iniciante";
  if (type.toLowerCase().includes("iniciante")) return "badge-iniciante";
  if (type.toLowerCase().includes("intermediária"))
    return "badge-intermediario";
  if (type.toLowerCase().includes("avançada")) return "badge-avancado";
  return "badge-iniciante";
}
function pad(n) {
  return n < 10 ? "0" + n : n;
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

// Calcula o maior número de dias consecutivos de treino
function calcularDiasSeguidos(registered_trainings) {
  if (!registered_trainings || registered_trainings.length === 0) return 0;
  // Ordena as datas do histórico do mais recente para o mais antigo
  const datas = registered_trainings
    .map((rt) => rt.date)
    .map((date) => new Date(date))
    .sort((a, b) => b - a);
  let maxSeq = 1;
  let atualSeq = 1;
  for (let i = 1; i < datas.length; i++) {
    const diff = (datas[i - 1] - datas[i]) / (1000 * 60 * 60 * 24);
    if (diff === 1) {
      atualSeq++;
      if (atualSeq > maxSeq) maxSeq = atualSeq;
    } else if (diff > 1) {
      atualSeq = 1;
    }
  }
  return maxSeq;
}

window.addEventListener("DOMContentLoaded", function () {
  const data = getGymAppData();
  if (!data) return;

  // Nome do usuário
  if (
    data.profile &&
    data.profile.pessoal &&
    data.profile.pessoal.nome_completo
  ) {
    const userNameSpan = document.getElementById("user-name");
    if (userNameSpan)
      userNameSpan.textContent = data.profile.pessoal.nome_completo;
  }

  // Ficha atual (primeira do array)
  const fichaAtual = data.edited_trainings[0];
  const fichaAtualCard = document.querySelectorAll(".ficha-card")[0];
  if (fichaAtualCard) {
    fichaAtualCard.querySelector(".ficha-status").textContent = fichaAtual.type;
    fichaAtualCard.querySelector(".ficha-status").className =
      "ficha-status " + getBadgeClass(fichaAtual.type);
    // Troca Pernas por Inferiores
    let categoriaAtual =
      fichaAtual.category === "Pernas" ? "Inferiores" : fichaAtual.category;
    fichaAtualCard.querySelector(".ficha-tipo").textContent = categoriaAtual;
    // Tempo do treino mais recente dessa ficha
    let ultTreino = data.registered_trainings
      .filter((rt) => rt.training_id === fichaAtual.id)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    let tempoFicha = "";
    if (ultTreino) {
      let minutos = ultTreino.duration.hours * 60 + ultTreino.duration.minutes;
      tempoFicha = minutos + " minutos";
    } else {
      tempoFicha = "0 minutos";
    }
    fichaAtualCard.querySelector(".ficha-duracao").innerHTML =
      '<i class="fa-regular fa-clock"></i> ' + tempoFicha;
    // Exibir apenas o tipo do treino do dia mais recente dessa ficha
    let nomeDia = "";
    if (ultTreino && fichaAtual.days && fichaAtual.days.length > 0) {
      const dia = fichaAtual.days.find((d) => d.id === ultTreino.day_index);
      if (dia) nomeDia = dia.name.replace(/^Dia \d+ - /i, "");
    }
    fichaAtualCard.querySelector(".ficha-exercicios").innerHTML = nomeDia
      ? `<li>${nomeDia}</li>`
      : "";
  }

  // Última ficha diferente da atual utilizada
  const fichaUltimaCard = document.querySelectorAll(".ficha-card")[1];
  let ultimaFichaReg = data.registered_trainings.find(
    (rt) => rt.training_id !== fichaAtual.id
  );
  let ultimaFicha = ultimaFichaReg
    ? data.edited_trainings.find((et) => et.id === ultimaFichaReg.training_id)
    : fichaAtual;
  if (fichaUltimaCard) {
    fichaUltimaCard.querySelector(".ficha-status").textContent =
      ultimaFicha.type;
    fichaUltimaCard.querySelector(".ficha-status").className =
      "ficha-status " + getBadgeClass(ultimaFicha.type);
    // Troca Pernas por Inferiores
    let categoriaUltima =
      ultimaFicha.category === "Pernas" ? "Inferiores" : ultimaFicha.category;
    fichaUltimaCard.querySelector(".ficha-tipo").textContent = categoriaUltima;
    // Tempo do treino mais recente dessa ficha
    let ultTreinoUlt = data.registered_trainings
      .filter((rt) => rt.training_id === ultimaFicha.id)
      .sort((a, b) => b.date.localeCompare(a.date))[0];
    let tempoFichaUlt = "";
    if (ultTreinoUlt) {
      let minutos =
        ultTreinoUlt.duration.hours * 60 + ultTreinoUlt.duration.minutes;
      tempoFichaUlt = minutos + " minutos";
    } else {
      tempoFichaUlt = "0 minutos";
    }
    fichaUltimaCard.querySelector(".ficha-duracao").innerHTML =
      '<i class="fa-regular fa-clock"></i> ' + tempoFichaUlt;
    // Exibir apenas o tipo do treino do dia mais recente dessa ficha
    let nomeDiaUlt = "";
    if (ultTreinoUlt && ultimaFicha.days && ultimaFicha.days.length > 0) {
      const dia = ultimaFicha.days.find((d) => d.id === ultTreinoUlt.day_index);
      if (dia) nomeDiaUlt = dia.name.replace(/^Dia \d+ - /i, "");
    }
    fichaUltimaCard.querySelector(".ficha-exercicios").innerHTML = nomeDiaUlt
      ? `<li>${nomeDiaUlt}</li>`
      : "";
  }

  // Distribuição de treinos por categoria
  let categorias = {};
  data.registered_trainings.forEach((rt) => {
    let ficha = data.edited_trainings.find((et) => et.id === rt.training_id);
    if (!ficha) return;
    let categoria = ficha.category === "Pernas" ? "Inferiores" : ficha.category;
    categorias[categoria] = (categorias[categoria] || 0) + 1;
  });
  const coresCat = [
    "#7bed9f",
    "#70a1ff",
    "#ffa502",
    "#2ed573",
    "#5352ed",
    "#ff6b81",
  ];
  const catLabels = Object.keys(categorias);
  const catData = Object.values(categorias);
  const catColors = catLabels.map((_, i) => coresCat[i % coresCat.length]);
  if (document.getElementById("distribuicao-treinos")) {
    new Chart(document.getElementById("distribuicao-treinos"), {
      type: "doughnut",
      data: {
        labels: catLabels,
        datasets: [{ data: catData, backgroundColor: catColors }],
      },
      options: {
        cutout: "70%",
        plugins: { legend: { display: false } },
        responsive: false,
      },
    });
    // Legenda dinâmica
    document.getElementById("distribuicao-legenda").innerHTML = "";
    // Totais dinâmicos
    document.getElementById("distribuicao-totais").innerHTML = catLabels
      .map(
        (cat, i) =>
          `<div><span class=\"dot\" style=\"background:${catColors[i]}\"></span> ${cat}: <b>${catData[i]}</b></div>`
      )
      .join("");
  }

  // Adiciona funcionalidade ao botão de download do dashboard
  const downloadBtn = document.querySelector(".historico-download");
  if (downloadBtn) {
    downloadBtn.addEventListener("click", function () {
      // Monta os dados do histórico
      const gymData = getGymAppData();
      if (!gymData) return;
      const treinos = gymData.registered_trainings
        .slice()
        .sort((a, b) => b.date.localeCompare(a.date));
      const rows = treinos.map((rt) => {
        const ficha = gymData.edited_trainings.find(
          (et) => et.id === rt.training_id
        );
        const day =
          ficha && ficha.days
            ? ficha.days.find((d) => d.id === rt.day_index)
            : null;
        const dayName = day ? day.name : "";
        const h = rt.duration?.hours || 0;
        const m = rt.duration?.minutes || 0;
        let duracaoFormatada = "";
        if (h > 0) duracaoFormatada += `${h}h `;
        if (m > 0) duracaoFormatada += `${m}min`;
        duracaoFormatada = duracaoFormatada.trim() || "0min";
        return [
          formatDate(rt.date),
          ficha ? ficha.name : "",
          dayName,
          ficha ? ficha.type : "",
          ficha ? ficha.category : "",
          duracaoFormatada,
          "+" + (rt.xpGain || 0),
        ];
      });
      const doc = new window.jspdf.jsPDF();
      doc.text("Histórico de Treinos", 14, 14);
      doc.autoTable({
        head: [
          [
            "Data",
            "Treino",
            "Dia",
            "Tipo de Ficha",
            "Categoria",
            "Duração",
            "XP",
          ],
        ],
        body: rows,
        startY: 20,
        styles: { fontSize: 10 },
        headStyles: { fillColor: [25, 118, 210] },
      });
      doc.save("historico_treinos.pdf");
    });
  }

  // Histórico de treinos
  let hist = data.registered_trainings
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  let histHtml = hist
    .slice(0, 5)
    .map((rt) => {
      let ficha = data.edited_trainings.find((et) => et.id === rt.training_id);
      let dayName =
        ficha && ficha.days && ficha.days.length > 0
          ? ficha.days.find((d) => d.id === rt.day_index)
            ? ficha.days.find((d) => d.id === rt.day_index).name
            : ""
          : "";
      let tipoDia = dayName ? dayName.replace(/^Dia \d+ - /i, "") : "";
      return `<li class=\"historico-item\">
        <span class=\"historico-icone\" style=\"color:#222\"><i class=\"fa-solid fa-dumbbell\"></i></span>
        <span class=\"historico-nome\">${
          ficha ? ficha.name : "Ficha desconhecida"
        }${
        tipoDia
          ? ` <span class='historico-nome-complemento'>- ${tipoDia}</span>`
          : ""
      }</span>
        <span class=\"historico-tipo badge ${getBadgeClass(
          ficha ? ficha.type : ""
        )}\">${ficha ? ficha.type : ""}</span>
        <span class=\"historico-data\">${formatDate(rt.date)}</span>
      </li>`;
    })
    .join("");
  document.getElementById("historico-treinos").innerHTML = histHtml;
  document.querySelector(
    ".historico-total"
  ).innerHTML = `<b>${data.registered_trainings.length}</b> treinos no registro`;

  // Experiência do usuário
  function getLevel(xp) {
    let level = 1,
      nextXp = 200,
      totalXp = 0;
    while (xp >= nextXp) {
      xp -= nextXp;
      totalXp += nextXp;
      nextXp += 200;
      level++;
    }
    return { level, xp, nextXp, totalXp };
  }
  let totalXP = data.registered_trainings.reduce(
    (acc, rt) => acc + rt.xpGain,
    0
  );
  let lvlInfo = getLevel(totalXP);
  let percent = Math.floor((lvlInfo.xp / lvlInfo.nextXp) * 100);
  // Widget de perfil
  const perfilXP = document.querySelector(".perfil-xp-porcentagem");
  if (perfilXP) {
    perfilXP.querySelector(
      ".perfil-nivel"
    ).textContent = `Nível ${lvlInfo.level}`;
    perfilXP.querySelector(".perfil-porcentagem").textContent = `${percent}%`;
    perfilXP.querySelector(
      ".perfil-xp"
    ).innerHTML = `${lvlInfo.xp}/${lvlInfo.nextXp}<small>XP</small>`;
  }
  // Título do card de perfil
  const perfilCardTitle = document.querySelector(
    ".perfil-card .dashboard-card-title"
  );
  if (perfilCardTitle) perfilCardTitle.textContent = "Perfil no GymTrack";
  // Dias de treino seguidos e total dinâmicos (agora calculado)
  const diasSeguidos = calcularDiasSeguidos(data.registered_trainings);
  const totalTreinos = data.registered_trainings.length;
  const stats = document.querySelector(".perfil-stats");
  if (stats) {
    stats.querySelector(".dias-treino").textContent = diasSeguidos;
    // Ajuste singular/plural
    const diasLabel = stats.querySelector(".dias-treino").parentElement;
    if (diasSeguidos === 1) {
      diasLabel.innerHTML = `<i class="fa-solid fa-fire"></i> <b class="dias-treino">1</b> dia de treino seguido`;
    } else {
      diasLabel.innerHTML = `<i class="fa-solid fa-fire"></i> <b class="dias-treino">${diasSeguidos}</b> dias de treino seguidos`;
    }
    stats.querySelector(".total-treinos").textContent = totalTreinos;
  }
  if (document.getElementById("xp-progress")) {
    new Chart(document.getElementById("xp-progress"), {
      type: "doughnut",
      data: {
        datasets: [
          {
            data: [lvlInfo.xp, lvlInfo.nextXp - lvlInfo.xp],
            backgroundColor: ["#a14fce", "#eee"],
            borderWidth: 0,
          },
        ],
      },
      options: {
        cutout: "80%",
        plugins: { legend: { display: false } },
        tooltips: { enabled: false },
        responsive: false,
      },
    });
  }
});
