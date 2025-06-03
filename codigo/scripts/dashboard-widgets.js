function getGymAppData() {
  return JSON.parse(localStorage.getItem("gymAppData"));
}

function getBadgeClass(type) {
  if (!type) return "badge-secondary";
  if (type.toLowerCase().includes("iniciante")) return "badge-iniciante";
  if (type.toLowerCase().includes("intermediária"))
    return "badge-intermediario";
  if (type.toLowerCase().includes("avançada")) return "badge-avancado";
  return "badge-secondary";
}
function pad(n) {
  return n < 10 ? "0" + n : n;
}
function formatDate(dateStr) {
  const d = new Date(dateStr);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

window.addEventListener("DOMContentLoaded", function () {
  const data = getGymAppData();
  if (!data) return;

  // Nome do usuário (caso queira mostrar)
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
  document.getElementById("ficha-atual-badge").textContent = fichaAtual.type;
  document.getElementById("ficha-atual-badge").className =
    "badge " + getBadgeClass(fichaAtual.type);
  document.getElementById("ficha-atual-nome").textContent = fichaAtual.name;
  document.getElementById("ficha-atual-categoria").textContent =
    fichaAtual.category;
  let duracoes = data.registered_trainings
    .filter((rt) => rt.training_id === fichaAtual.id)
    .map((rt) => rt.duration.hours * 60 + rt.duration.minutes);
  let mediaMin = duracoes.length
    ? Math.round(duracoes.reduce((a, b) => a + b, 0) / duracoes.length)
    : 40;
  document.getElementById(
    "ficha-atual-duracao"
  ).textContent = `${mediaMin} min`;

  // Última ficha diferente da atual utilizada
  let ultimaFichaReg = data.registered_trainings.find(
    (rt) => rt.training_id !== fichaAtual.id
  );
  let ultimaFicha = ultimaFichaReg
    ? data.edited_trainings.find((et) => et.id === ultimaFichaReg.training_id)
    : fichaAtual;
  document.getElementById("ultima-ficha-badge").textContent = ultimaFicha.type;
  document.getElementById("ultima-ficha-badge").className =
    "badge " + getBadgeClass(ultimaFicha.type);
  document.getElementById("ultima-ficha-nome").textContent = ultimaFicha.name;
  document.getElementById("ultima-ficha-categoria").textContent =
    ultimaFicha.category;
  let duracoesUlt = data.registered_trainings
    .filter((rt) => rt.training_id === ultimaFicha.id)
    .map((rt) => rt.duration.hours * 60 + rt.duration.minutes);
  let mediaMinUlt = duracoesUlt.length
    ? Math.round(duracoesUlt.reduce((a, b) => a + b, 0) / duracoesUlt.length)
    : 40;
  document.getElementById(
    "ultima-ficha-duracao"
  ).textContent = `${mediaMinUlt} min`;

  // Distribuição de treinos por categoria
  let categorias = {};
  data.registered_trainings.forEach((rt) => {
    let ficha = data.edited_trainings.find((et) => et.id === rt.training_id);
    if (!ficha) return;
    categorias[ficha.category] = (categorias[ficha.category] || 0) + 1;
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
    document.getElementById("distribuicao-legenda").innerHTML = catLabels
      .map(
        (cat, i) =>
          `<span style="color:${catColors[i]};font-weight:600;">${cat}: ${catData[i]}</span>`
      )
      .join("");
  }

  // Histórico de treinos
  let hist = data.registered_trainings
    .slice()
    .sort((a, b) => b.date.localeCompare(a.date));
  let histHtml = hist
    .slice(0, 5)
    .map((rt) => {
      let ficha = data.edited_trainings.find((et) => et.id === rt.training_id);
      return `<li class="list-group-item d-flex justify-content-between align-items-center">
    <div>
      <span style="font-weight:600">${
        ficha ? ficha.name : "Ficha desconhecida"
      }</span>
      <span class="text-muted ms-2">${ficha ? ficha.type : ""}</span>
    </div>
    <span class="text-secondary small">${formatDate(rt.date)}</span>
  </li>`;
    })
    .join("");
  document.getElementById("historico-treinos").innerHTML = histHtml;
  document.getElementById("total-treinos").textContent =
    data.registered_trainings.length;

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
  document.getElementById("level-label").textContent = `Nível ${lvlInfo.level}`;
  document.getElementById("xp-percent").textContent = percent;
  document.getElementById("xp-current").textContent = lvlInfo.xp;
  document.getElementById("xp-next").textContent = lvlInfo.nextXp;
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
