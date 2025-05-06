// Utilidades de XP
function xpParaNivel(nivel, fator = 50, expoente = 1.5) {
  return Math.floor(fator * Math.pow(nivel, expoente));
}

function calcularNivel(xp, fator = 50, expoente = 1.4) {
  let totalXp = 0;
  let nivel = 1;

  while (xp >= totalXp + xpParaNivel(nivel, fator, expoente)) {
    totalXp += xpParaNivel(nivel, fator, expoente);
    nivel++;
  }

  const xpNivelAtual = totalXp;
  const xpProxNivel = totalXp + xpParaNivel(nivel, fator, expoente);
  const xpParaProximoNivel = xpProxNivel - xpNivelAtual;

  return { nivel, xpNivelAtual, xpProxNivel, xpParaProximoNivel };
}

// Elementos DOM
const nivelSpan = document.querySelector("#level");
const realBar = document.querySelector(".real-progress-bar");
const futureBar = document.querySelector(".future-progress-bar");
const xpLowLimit = document.querySelector("#xp-low-limit");
const xpHighLimit = document.querySelector("#xp-high-limit");
const xpGain = document.querySelector("#xp-gain");
const porcentagemSpan = document.querySelector("#xp-porcentagem");

// Atualiza barra com ganho de XP (pré-checkin)
export function mudarXpGanha(newXP) {
  const gymData = JSON.parse(localStorage.getItem("gymAppData"));
  if (!gymData) return;

  const { xp } = gymData.profile;
  const { xpNivelAtual, xpParaProximoNivel } = calcularNivel(xp);

  const progressoFuturo =
    ((xp - xpNivelAtual + newXP) / xpParaProximoNivel) * 100;

  xpGain.textContent = `+${newXP} XP`;
  futureBar.style.width = `${progressoFuturo}%`;
  porcentagemSpan.textContent = `${Math.floor(progressoFuturo)}%`;
}

export function calcularXpPorTipoETempo(tipo, horas, minutos) {
  const xpMultipliers = {
    "Ficha iniciante": 50, 
    "Ficha intermediária": 100, 
    "Ficha avançada": 150, 
  };

  const multiplier = xpMultipliers[tipo] || 10;
  const tempoEmHoras = horas + minutos / 60;
  return Math.round(tempoEmHoras * multiplier);
}

export function xpModalCheckin() {
  const gymData = JSON.parse(localStorage.getItem("gymAppData"));
  if (!gymData) return;

  const { xp } = gymData.profile;
  const { nivel, xpNivelAtual, xpProxNivel, xpParaProximoNivel } =
    calcularNivel(xp);

  const progressoAtual = ((xp - xpNivelAtual) / xpParaProximoNivel) * 100;

  nivelSpan.textContent = `Nível ${nivel}`;
  xpLowLimit.textContent = `${xpNivelAtual} XP`;
  xpHighLimit.textContent = `${xpProxNivel} XP`;
  xpGain.textContent = `+0 XP`;
  realBar.style.width = `${progressoAtual}%`;
  porcentagemSpan.textContent = `${Math.floor(progressoAtual)}%`;
}

// Executa ao carregar a página
document.addEventListener("DOMContentLoaded", xpModalCheckin);
