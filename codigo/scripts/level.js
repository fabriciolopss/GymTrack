import ApiService from './services/api.js';

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
export async function mudarXpGanha(newXP) {
  try {
    const userData = await ApiService.getUserData();
    const gymData = userData || {};
    const xp = gymData.profile?.xp || 0;
    const { xpNivelAtual, xpParaProximoNivel } = calcularNivel(xp);
    const progressoFuturo = ((xp - xpNivelAtual + newXP) / xpParaProximoNivel) * 100;
    xpGain.textContent = `+${newXP} XP`;
    futureBar.style.width = `${progressoFuturo}%`;
    porcentagemSpan.textContent = `${Math.floor(progressoFuturo)}%`;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário para mudarXpGanha:', error);
  }
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

export async function xpModalCheckin() {
  try {
    const userData = await ApiService.getUserData();
    const gymData = userData.gymData || {};
    const xp = gymData.profile?.xp || 0;
    const { nivel, xpNivelAtual, xpProxNivel, xpParaProximoNivel } = calcularNivel(xp);
    const progressoAtual = ((xp - xpNivelAtual) / xpParaProximoNivel) * 100;
    nivelSpan.textContent = `Nível ${nivel}`;
    xpLowLimit.textContent = `${xpNivelAtual} XP`;
    xpHighLimit.textContent = `${xpProxNivel} XP`;
    xpGain.textContent = `+0 XP`;
    realBar.style.width = `${progressoAtual}%`;
    porcentagemSpan.textContent = `${Math.floor(progressoAtual)}%`;
  } catch (error) {
    console.error('Erro ao buscar dados do usuário para xpModalCheckin:', error);
  }
}

// Executa ao carregar a página
document.addEventListener("DOMContentLoaded", function(){
  const level = new Level;
})

class Level {
  constructor() {
    this.initializeLevel();
  }

  async initializeLevel() {
    try {
      const userData = await ApiService.getUserData();
      this.gymData = userData.gymData || {};
      this.levelContainer = document.querySelector('.level-container');
      this.bindEvents();
      this.renderLevel();
    } catch (error) {
      console.error('Erro ao inicializar level:', error);
      this.gymData = {};
    }
  }

  bindEvents() {
    // Add any event listeners here
  }

  async renderLevel() {
    if (!this.gymData.level) {
      this.gymData.level = 1;
    }

    this.levelContainer.innerHTML = `
      <div class="level-item">
        <h3>Nível ${this.gymData.level}</h3>
        <p>XP: ${this.gymData.xp || 0}</p>
      </div>
    `;
  }

  async addXp(xp) {
    try {
      if (!this.gymData.xp) {
        this.gymData.xp = 0;
      }
      
      this.gymData.xp += xp;
      // Check for level up
      const newLevel = Math.floor(this.gymData.xp / 100) + 1;
      if (newLevel > this.gymData.level) {
        this.gymData.level = newLevel;
        // You might want to trigger a level up notification here
      }
      
      await ApiService.updateUserData({ gymData: this.gymData });
      await this.renderLevel();
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
      throw error;
    }
  }
}
