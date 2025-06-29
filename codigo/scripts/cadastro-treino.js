import ApiService from "./services/api.js";
import { createNotification, Notifications } from "./notifications.js";
import { showAlert } from './utils/toast.js';

lucide.createIcons();

document.addEventListener("DOMContentLoaded", function () {
  new LayoutManager();

  // Verifica se auth.js foi carregado
  if (!window.auth) {
    console.error("Auth.js não foi carregado");
    alert("Erro ao carregar sistema de autenticação. Recarregue a página.");
    return;
  }

  initializeCadastroTreino();
});

let gymApp = null; // Será carregado do webserver
let treinoSelect = null;
let indiceTreinoSelect = -1;
let recursivo = false;
let treinoSelectTemp = null;

const interfaceDados = document.querySelector("#dados-treino");
const selecionarPlano = document.querySelector("#selecao-plano");
const customBtn = document.querySelector("#personalizar");
const criarBtn = document.querySelector("#criar");
const cancelarBtn = document.querySelector("#cancelar");
const excluirFicha = document.querySelector("#excluir-ficha");
const cadastrar = document.querySelector("#concluir-criacao");
const treinosGrid = document.querySelector("#treinos-grid");
const treinosCards = document.querySelector("#treinos-cards");
const semTreinos = document.querySelector("#sem-treinos");

// Função para inicializar a página de cadastro de treino
async function initializeCadastroTreino() {
    try {
        // Busca os dados do usuário do webserver
        gymApp = await ApiService.getUserData();
        console.log(gymApp);
        
        // Inicializa a interface após carregar os dados
        renderizarGridTreinos();
        setupEventListeners();
    } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        alert('Erro ao carregar dados do usuário. Tente novamente.');
    }
}

function rankTemplatesByCosine(templates, user, topN = 6) {
  // Verifica se o usuário tem os dados necessários
  if (!user || !user.objetivos || !user.metadados) {
    console.warn(
      "Perfil do usuário incompleto, retornando templates sem ordenação"
    );
    return templates.slice(0, topN);
  }

  // 1. Extrai perfil de usuário com verificação de segurança
  let freqMin = 3,
    freqMax = 5; // valores padrão
  try {
    if (user.objetivos.frequencia_semanal) {
      const freqMatch = user.objetivos.frequencia_semanal.match(/\d+/g);
      if (freqMatch && freqMatch.length >= 2) {
        [freqMin, freqMax] = freqMatch.map((n) => parseInt(n, 10));
      }
    }
  } catch (error) {
    console.warn("Erro ao extrair frequência semanal:", error);
  }

  // 2. Monta dicts de features
  const templateDicts = templates.map((t) => {
    const dict = {
      [`exp_${t.experience_level || "beginner"}`]: 1,
      [`obj_${t.objective || "general"}`]: 1,
      [`cat_${t.category || "strength"}`]: 1,
      n_days: t.days?.length || 0,
      xp_total: t.days?.reduce((sum, d) => sum + (d.xp || 0), 0) || 0,
    };
    return dict;
  });

  const userDict = {
    [`exp_${user.objetivos.experiencia_previa || "beginner"}`]: 1,
    [`obj_${user.objetivos.objetivo_principal || "general"}`]: 1,
    [`cat_${user.objetivos.tipo_treino || "strength"}`]: 1,
    n_days: (freqMin + freqMax) / 2,
    xp_total: user.metadados.xp || 0,
  };

  // 3. Constrói lista global de features
  const featureSet = new Set();
  templateDicts
    .concat(userDict)
    .forEach((d) => Object.keys(d).forEach((f) => featureSet.add(f)));
  const features = Array.from(featureSet);

  // 4. Transforma dict → vetor
  function dictToVector(dict) {
    return features.map((f) => dict[f] || 0);
  }
  const templateVecs = templateDicts.map(dictToVector);
  const userVec = dictToVector(userDict);

  // 5. Funções auxiliares de cosseno
  function dot(a, b) {
    return a.reduce((acc, v, i) => acc + v * b[i], 0);
  }
  function magnitude(v) {
    return Math.sqrt(v.reduce((acc, x) => acc + x * x, 0));
  }
  function cosineSim(a, b) {
    const magA = magnitude(a);
    const magB = magnitude(b);
    return magA && magB ? dot(a, b) / (magA * magB) : 0;
  }

  // 6. Calcula score e ordena
  const scored = templates.map((tpl, i) => ({
    tpl,
    score: cosineSim(userVec, templateVecs[i]),
  }));
  scored.sort((a, b) => b.score - a.score);

  console.log(scored);
  // 7. Retorna os topN templates
  return scored.slice(0, topN).map((item) => item.tpl);
}

async function loadAllTemplates() {
  const resp = await fetch(
    "../scripts/workouts/structured_workout_templates_final.json"
  );
  return await resp.json();
}

function getProfileFilters(profile) {
  if (!profile || !profile.objetivos) return {};
  const { tipo_treino, objetivo_principal, experiencia_previa } =
    profile.objetivos;
  return {
    tipo_treino: tipo_treino?.toLowerCase(),
    objetivo: objetivo_principal?.toLowerCase(),
    experiencia: experiencia_previa?.toLowerCase(),
  };
}

function searchTemplates(templates, query) {
  const q = query.trim().toLowerCase();
  if (!q) return templates;
  return templates.filter(
    (tpl) =>
      tpl.name?.toLowerCase().includes(q) ||
      tpl.category?.toLowerCase().includes(q) ||
      tpl.objective?.toLowerCase().includes(q) ||
      tpl.type?.toLowerCase().includes(q) ||
      tpl.experience_level?.toLowerCase().includes(q)
  );
}

function renderTemplateMenu(onSelect, templates, recommended) {
  const container = document.createElement("div");
  container.className = "mb-4";
  container.innerHTML = `<div class="card p-3 shadow-sm mb-3 animate__animated animate__fadeIn">
    <div class="d-flex align-items-center gap-2 mb-2">
      <i data-lucide="wand-2"></i>
      <span class="fw-bold fs-5">Sugestões de Treino</span>
    </div>
    <input type="text" class="form-control mb-3" id="template-search" placeholder="Pesquisar por nome, objetivo, categoria...">
    <div class="d-flex flex-wrap gap-2" id="template-suggestions"></div>
    <div class="text-muted small mt-2">Clique em um template para preencher automaticamente.<br>Passe o mouse para ver a prévia dos exercícios.</div>
  </div>`;
  interfaceDados.parentNode.insertBefore(container, interfaceDados);
  const menu = container.querySelector("#template-suggestions");
  function renderList(list) {
    menu.innerHTML = "";
    list.forEach((tpl, idx) => {
      const btn = document.createElement("button");
      btn.className =
        "btn btn-outline-primary d-flex align-items-center gap-2 animate__animated animate__fadeIn position-relative";
      btn.innerHTML = `<i data-lucide="sparkles"></i>${tpl.name} - ${tpl.objective}`;
      btn.type = "button";
      btn.onclick = () => {
        onSelect(tpl);
      };
      // Preview on hover
      let previewDiv;
      btn.addEventListener("mouseenter", (e) => {
        previewDiv = document.createElement("div");
        previewDiv.innerHTML = createTemplatePreview(tpl);
        previewDiv.style.position = "absolute";
        previewDiv.style.top = "110%";
        previewDiv.style.left = "0";
        previewDiv.style.background = "white";
        previewDiv.style.borderRadius = "0.7rem";
        previewDiv.style.boxShadow = "0 4px 24px rgba(161, 79, 206, 0.13)";
        previewDiv.style.padding = "0.7rem 1rem";
        previewDiv.style.pointerEvents = "none";
        previewDiv.style.minWidth = "220px";
        previewDiv.style.maxWidth = "320px";
        previewDiv.style.zIndex = "9999";
        btn.appendChild(previewDiv);
        lucide.createIcons();
      });
      btn.addEventListener("mouseleave", () => {
        if (previewDiv) previewDiv.remove();
      });
      menu.appendChild(btn);
    });
    lucide.createIcons();
  }
  renderList(recommended);
  container.querySelector("#template-search").addEventListener("input", (e) => {
    const val = e.target.value;
    const results = searchTemplates(templates, val).slice(0, 12);
    renderList(results);
  });
  return menu;
}

function createTemplatePreview(template) {
  let html = `<div class='template-preview card shadow-sm p-2 animate__animated animate__fadeIn' style='min-width:220px; max-width:320px; z-index:9999;'>`;
  template.days.forEach((day) => {
    html += `<div class='mb-2'><strong><i data-lucide="calendar"></i> ${day.name}</strong><ul class='mb-1 ms-3'>`;
    day.day.forEach((ex) => {
      html += `<li><i data-lucide="dumbbell" style='width:1em;height:1em;'></i> ${ex.exercise} <span class='text-muted small'>(${ex.series}x ${ex.repetitions})</span></li>`;
    });
    html += `</ul></div>`;
  });
  html += `</div>`;
  return html;
}

function criarNovoTreino() {
  if (!gymApp || !gymApp.edited_trainings) {
    // Fallback caso gymApp ainda não esteja carregado
    return {
      id: 1,
      name: "Nova ficha",
      category: "",
      type: "",
      days: [
        { id: 1, xp: 100, name: "Dia 1 - Nova ficha", day: [] },
        { id: 2, xp: 150, name: "Dia 2 - Nova ficha", day: [] },
      ],
    };
  }

  const novoId =
    gymApp.edited_trainings.length > 0
      ? Math.max(...gymApp.edited_trainings.map((t) => t.id)) + 1
      : 1;
  return {
    id: novoId,
    name: "Nova ficha",
    category: "",
    type: "",
    days: [
      { id: 1, xp: 100, name: "Dia 1 - Nova ficha", day: [] },
      { id: 2, xp: 150, name: "Dia 2 - Nova ficha", day: [] },
    ],
  };
}

function renderTreinoForm(treino) {
  let html = `
        <hr style="border: 1px solid #ccc; margin: 20px 0;">
        <div class="mb-4">
            <label for="titulo-treino" class="form-label fs-5 d-flex align-items-center gap-2"><i data-lucide="clipboard-list"></i>Título do treino:</label>
            <input id="titulo-treino" class="form-control form-control-lg mb-2" value="${
              treino.name
            }"/>
            <label for="categoria-treino" class="form-label d-flex align-items-center gap-2"><i data-lucide="tag"></i>Categoria:</label>
            <select id="categoria-treino" class="form-select mb-2">
                <option hidden>Selecionar...</option>
                <option value="Superiores" ${
                  treino.category == "Superiores" ? "selected" : ""
                }>Superiores</option>
                <option value="Inferiores" ${
                  treino.category == "Inferiores" ? "selected" : ""
                }>Inferiores</option>
                <option value="Cardio" ${
                  treino.category == "Cardio" ? "selected" : ""
                }>Cardio</option>
            </select>
            
            <label for="selecao-nivel" class="form-label d-flex align-items-center gap-2"><i data-lucide="bar-chart-3"></i>Nível de dificuldade</label>
            <select id="selecao-nivel" class="form-select mb-2">
                <option hidden>Selecionar...</option>
                <option value="Ficha iniciante" ${
                  treino.type == "Ficha iniciante" ? "selected" : ""
                }>Iniciante</option>
                <option value="Ficha intermediária" ${
                  treino.type == "Ficha intermediária" ? "selected" : ""
                }>Intermediário</option>
                <option value="Ficha avançada" ${
                  treino.type == "Ficha avançada" ? "selected" : ""
                }>Avançado</option>
            </select>
        </div>
        <div class="row g-4">
    `;
  treino.days.forEach((dia, diaIdx) => {
    html += `
            <div class="col-12 animate__animated animate__fadeIn">
                <div class="card shadow-sm mb-3 border-0 bg-light">
                    <div class="card-body">
                        <div class="d-flex align-items-center mb-2 gap-2">
                            <i data-lucide="calendar"></i>
                            <h5 class="card-title mb-0 flex-grow-1">Dia ${
                              diaIdx + 1
                            }</h5>
                        </div>
                        <label for="titulo-dia-${diaIdx}" class="form-label d-flex align-items-center gap-2"><i data-lucide="edit-3"></i>Título do dia:</label>
                        <input id="titulo-dia-${diaIdx}" class="form-control mb-3" value="${
      dia.name
    }"/>
                        <div class="list-group mb-3">
        `;
    dia.day.forEach((ex, exIdx) => {
      html += `
                <div class="list-group-item d-flex align-items-center gap-3 bg-white rounded mb-2 shadow-sm animate__animated animate__fadeIn">
                    <i data-lucide="dumbbell" class="text-primary"></i>
                    <input class="form-control form-control-sm flex-grow-1" type="text" id="dia-${diaIdx}-nome-exercicio-${exIdx}" value="${ex.exercise}" placeholder="Nome do exercício">
                    <input class="form-control form-control-sm" style="max-width:80px" type="number" id="dia-${diaIdx}-series-exercicio-${exIdx}" value="${ex.series}" placeholder="Séries">
                    <input class="form-control form-control-sm" style="max-width:80px" type="number" id="dia-${diaIdx}-rep-exercicio-${exIdx}" value="${ex.repetitions}" placeholder="Repetições">
                    <button class="btn btn-outline-danger btn-sm delete-ex d-flex align-items-center gap-1" data-dia="${diaIdx}" data-ex="${exIdx}"><i data-lucide="trash-2"></i></button>
                </div>
            `;
    });
    html += `</div>
            <button class="btn btn-outline-primary w-100 adicionar-exercicio d-flex align-items-center gap-2 mb-2" data-dia="${diaIdx}"><i data-lucide="plus"></i>Adicionar exercício</button>
        </div>
        </div>
        </div>
        `;
  });
  html += `</div><button id="adicionar-dia" class="btn btn-success d-flex align-items-center gap-2 mt-3"><i data-lucide="calendar-plus"></i>Adicionar dia</button>`;
  interfaceDados.innerHTML = html;

  document.querySelectorAll(".adicionar-exercicio").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const diaIdx = parseInt(btn.getAttribute("data-dia"));
      treino.days[diaIdx].day.push({
        exercise: "Novo exercício",
        series: "",
        repetitions: "",
      });
      renderTreinoForm(treino);
    });
  });
  document.querySelectorAll(".delete-ex").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const diaIdx = parseInt(btn.getAttribute("data-dia"));
      const exIdx = parseInt(btn.getAttribute("data-ex"));
      if (
        confirm(
          `Confirmar exclusão de "${treino.days[diaIdx].day[exIdx].exercise}"?`
        )
      ) {
        treino.days[diaIdx].day.splice(exIdx, 1);
        renderTreinoForm(treino);
      }
    });
  });
  document.getElementById("adicionar-dia").addEventListener("click", (e) => {
    e.preventDefault();
    const novoId =
      treino.days.length > 0
        ? Math.max(...treino.days.map((d) => d.id)) + 1
        : 1;
    treino.days.push({
      id: novoId,
      xp: 100,
      name: `Dia ${novoId} - Nova ficha`,
      day: [],
    });
    renderTreinoForm(treino);
  });
  lucide.createIcons();
}

function atualizarTreinoComInputs(treino) {
  treino.name = document.getElementById("titulo-treino").value;
  treino.category = document.getElementById("categoria-treino").value;
  treino.type = document.getElementById("selecao-nivel").value;
  treino.days.forEach((dia, diaIdx) => {
    dia.name = document.getElementById(`titulo-dia-${diaIdx}`).value;
    dia.day.forEach((ex, exIdx) => {
      ex.exercise = document.getElementById(
        `dia-${diaIdx}-nome-exercicio-${exIdx}`
      ).value;
      ex.series = document.getElementById(
        `dia-${diaIdx}-series-exercicio-${exIdx}`
      ).value;
      ex.repetitions = document.getElementById(
        `dia-${diaIdx}-rep-exercicio-${exIdx}`
      ).value;
    });
  });
}

let alertaValidacao = "Cadastro não realizado:\n";
function validarDados() {
  let valido = true;
  for (let i = 0; i < treinoSelect.days.length; i++) {
    if (document.querySelector(`#titulo-dia-${i}`).value.trim() == "") {
      alertaValidacao += `\t Insira um título para o dia ${i + 1}\n`;
      valido = false;
    }

    if (treinoSelect.days[i].day.length == 0) {
      alertaValidacao += `\t Adicione ao menos um exercício para o dia ${
        i + 1
      }\n`;
      valido = false;
    } else {
      for (let j = 0; j < treinoSelect.days[i].day.length; j++) {
        if (
          document
            .querySelector(`#dia-${i}-nome-exercicio-${j}`)
            .value.trim() == "" ||
          document.querySelector(`#dia-${i}-series-exercicio-${j}`).value <=
            0 ||
          document.querySelector(`#dia-${i}-rep-exercicio-${j}`).value <= 0
        ) {
          alertaValidacao += `\t Dia ${
            i + 1
          }: insira dados válidos para os exercícios cadastrados\n`;
          j = treinoSelect.days[i].day.length;
          valido = false;
        }
      }
    }
  }

  if (document.querySelector("#categoria-treino").value == "Selecionar...") {
    alertaValidacao += `\t Selecione uma categoria de treino\n`;
    valido = false;
  }

  if (document.querySelector("#selecao-nivel").value == "Selecionar...") {
    alertaValidacao += `\t Selecione um nível de dificuldade\n`;
    valido = false;
  }

  if (
    document.querySelector("#titulo-treino").value.trim() == "" ||
    document.querySelector("#categoria-treino").value.trim() == ""
  ) {
    alertaValidacao += `\t Não deixe espaços em branco\n`;
    valido = false;
  }

  return valido;
}

async function criarFicha() {
  treinoSelect = criarNovoTreino();

  // remove menu antigo
  const old = document.querySelector(".card p-3.shadow-sm");
  if (old) old.remove();

  // Esconde o grid de treinos
  treinosGrid.style.display = "none";

  // carrega todos os templates
  const allTemplates = await loadAllTemplates();

  // Usa o perfil carregado do webserver
  const profile = gymApp?.profile;

  if (!profile) {
    console.warn(
      "Perfil do usuário não encontrado, usando templates sem filtro"
    );
    // Renderiza menu sem recomendações personalizadas
    renderTemplateMenu(
      (tpl) => {
        treinoSelect = JSON.parse(JSON.stringify(tpl));
        treinoSelect.id = treinoSelect.id || criarNovoTreino().id;
        renderTreinoForm(treinoSelect);
      },
      allTemplates,
      allTemplates.slice(0, 6)
    );
  } else {
    // usa similaridade de cosseno para sugerir top 6
    const recommended = rankTemplatesByCosine(allTemplates, profile, 6);

    // renderiza o menu de sugestões
    renderTemplateMenu(
      (tpl) => {
        treinoSelect = JSON.parse(JSON.stringify(tpl));
        treinoSelect.id = treinoSelect.id || criarNovoTreino().id;
        renderTreinoForm(treinoSelect);
      },
      allTemplates,
      recommended
    );
  }

  renderTreinoForm(treinoSelect);
  cadastrar.classList.remove("d-none");
  cancelarBtn.classList.remove("d-none");
  criarBtn.classList.add("d-none");
}

// Setup dos event listeners
function setupEventListeners() {
  criarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    criarFicha();
  });

    customBtn.addEventListener("click", async e => {
        e.preventDefault();
        if (!gymApp || !gymApp.edited_trainings) {
            showAlert('Dados do usuário não foram carregados. Tente novamente.', 'error');
            return;
        }

        if(!validarDados()) {
            showAlert(alertaValidacao, 'error');
            alertaValidacao = "Cadastro não realizado:\n";
            return;
        }
        
        atualizarTreinoComInputs(treinoSelect);
        // Verifica se já existe um treino com esse id
        const idx = gymApp.edited_trainings.findIndex(t => t.id === treinoSelect.id);
        if (idx !== -1) {
            gymApp.edited_trainings[idx] = treinoSelect;
            try {
                await ApiService.updateUserData({ edited_trainings: gymApp.edited_trainings });
                
                // Criar notificação de treino editado
                try {
                    await createNotification({
                        title: "Treino Atualizado",
                        description: `O treino "${treinoSelect.name}" foi atualizado com sucesso!`,
                        type: "update"
                    });
                } catch (notificationError) {
                    console.warn('Erro ao criar notificação:', notificationError);
                }
                
                renderizarGridTreinos();
                limparFormulario();
            } catch (error) {
                alert('Erro ao salvar alterações no servidor.');
            }
        }
    });

    cadastrar.addEventListener("click", async e => {
        e.preventDefault();
        if (!gymApp || !gymApp.edited_trainings) {
            alert('Dados do usuário não foram carregados. Tente novamente.');
            return;
        }
        
        atualizarTreinoComInputs(treinoSelect);
        // Garante que não existe outro treino com o mesmo nome
        if (gymApp.edited_trainings.some(t => t.name === treinoSelect.name)) {
            showAlert('Já existe uma ficha com esse nome.', 'error');
            return;
        }

        if(!validarDados()) {
            showAlert(alertaValidacao, 'error');
            alertaValidacao = "Cadastro não realizado:\n";
            return;
        }
        gymApp.edited_trainings.push(treinoSelect);
        try {
            console.log(gymApp);
            await ApiService.updateUserData({ edited_trainings: gymApp.edited_trainings });
            
            // Criar notificação de treino criado
            try {
                await createNotification({
                    title: "Novo Treino Criado",
                    description: `O treino "${treinoSelect.name}" foi criado com sucesso!`,
                    type: "success"
                });
            } catch (notificationError) {
                console.warn('Erro ao criar notificação:', notificationError);
            }
            
            renderizarGridTreinos();
            limparFormulario();
        } catch (error) {
            alert('Erro ao salvar novo treino no servidor.');
        }
    });

  excluirFicha.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!gymApp || !gymApp.edited_trainings) {
      alert("Dados do usuário não foram carregados. Tente novamente.");
      return;
    }

    if (indiceTreinoSelect === -1) return;
    if (
      confirm(
        `Confirmar exclusão da ficha ${treinoSelect.name}? Essa ação é irreversível.`
      )
    ) {
      const treinoExcluido = treinoSelect.name; // Guarda o nome antes de excluir
      gymApp.edited_trainings.splice(indiceTreinoSelect, 1);
      try {
        await ApiService.updateUserData({
          edited_trainings: gymApp.edited_trainings,
        });

        // Criar notificação de treino excluído
        try {
          await createNotification({
            title: "Treino Excluído",
            description: `O treino "${treinoExcluido}" foi excluído com sucesso!`,
            type: "alert",
          });
        } catch (notificationError) {
          console.warn("Erro ao criar notificação:", notificationError);
        }

        renderizarGridTreinos();
        limparFormulario();
      } catch (error) {
        alert("Erro ao excluir treino no servidor.");
      }
    }
  });

  cancelarBtn.addEventListener("click", (e) => {
    e.preventDefault();
    limparFormulario();
  });
}

// Função para renderizar o grid de cards dos treinos
function renderizarGridTreinos() {
  if (!gymApp || !gymApp.edited_trainings) {
    treinosCards.innerHTML = "";
    semTreinos.style.display = "block";
    return;
  }

  if (gymApp.edited_trainings.length === 0) {
    treinosCards.innerHTML = "";
    semTreinos.style.display = "block";
    return;
  }

  semTreinos.style.display = "none";

  let html = "";
  gymApp.edited_trainings.forEach((treino, index) => {
    const totalExercicios = treino.days.reduce(
      (total, dia) => total + dia.day.length,
      0
    );
    const totalDias = treino.days.length;

    html += `
            <div class="col-md-6 col-lg-4 animate__animated animate__fadeIn">
                <div class="treino-card" data-treino-index="${index}">
                    <div class="treino-card-actions">
                        <button class="btn btn-outline-primary btn-sm" onclick="editarTreino(${index})">
                            <i data-lucide="edit-3"></i>
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="excluirTreino(${index})">
                            <i data-lucide="trash-2"></i>
                        </button>
                    </div>
                    <div class="treino-card-header">
                        <div>
                            <h6 class="treino-card-title">${treino.name}</h6>
                            <div class="treino-card-category">${
                              treino.category || "Sem categoria"
                            }</div>
                        </div>
                        <span class="treino-card-type">${
                          treino.type || "Geral"
                        }</span>
                    </div>
                    <div class="treino-card-stats">
                        <div class="treino-stat">
                            <i data-lucide="calendar"></i>
                            <span>${totalDias} dia${
      totalDias > 1 ? "s" : ""
    }</span>
                        </div>
                        <div class="treino-stat">
                            <i data-lucide="dumbbell"></i>
                            <span>${totalExercicios} exercício${
      totalExercicios > 1 ? "s" : ""
    }</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
  });

  treinosCards.innerHTML = html;
  lucide.createIcons();

  // Adicionar event listeners para os cards
  document.querySelectorAll(".treino-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      // Não ativar se clicou nos botões de ação
      if (e.target.closest(".treino-card-actions")) {
        return;
      }

      const index = parseInt(card.dataset.treinoIndex);
      selecionarTreino(index);
    });
  });
}

// Função para selecionar um treino do grid
function selecionarTreino(index) {
  if (
    !gymApp ||
    !gymApp.edited_trainings ||
    index < 0 ||
    index >= gymApp.edited_trainings.length
  ) {
    return;
  }

  // Remove seleção anterior
  document.querySelectorAll(".treino-card").forEach((card) => {
    card.classList.remove("selected");
  });

  // Adiciona seleção ao card clicado
  const card = document.querySelector(`[data-treino-index="${index}"]`);
  if (card) {
    card.classList.add("selected");
  }

  // Carrega o treino
  indiceTreinoSelect = index;
  treinoSelect = JSON.parse(JSON.stringify(gymApp.edited_trainings[index]));
  renderTreinoForm(treinoSelect);

  // Mostra botões de edição
  customBtn.classList.remove("d-none");
  cancelarBtn.classList.remove("d-none");
  excluirFicha.classList.remove("d-none");
  criarBtn.classList.add("d-none");

  // Esconde o grid
  treinosGrid.style.display = "none";
}

// Função para editar treino (chamada pelos botões dos cards)
window.editarTreino = function (index) {
  event.stopPropagation(); // Evita que o card seja selecionado
  selecionarTreino(index);
};

// Função para excluir treino (chamada pelos botões dos cards)
window.excluirTreino = function (index) {
  event.stopPropagation(); // Evita que o card seja selecionado

  if (!gymApp || !gymApp.edited_trainings) {
    alert("Dados do usuário não foram carregados. Tente novamente.");
    return;
  }

  const treino = gymApp.edited_trainings[index];
  if (
    confirm(
      `Confirmar exclusão da ficha "${treino.name}"? Essa ação é irreversível.`
    )
  ) {
    const treinoExcluido = treino.name;
    gymApp.edited_trainings.splice(index, 1);

    ApiService.updateUserData({ edited_trainings: gymApp.edited_trainings })
      .then(async () => {
        // Criar notificação de treino excluído
        try {
          await createNotification({
            title: "Treino Excluído",
            description: `O treino "${treinoExcluido}" foi excluído com sucesso!`,
            type: "alert",
          });
        } catch (notificationError) {
          console.warn("Erro ao criar notificação:", notificationError);
        }

        renderizarGridTreinos();
        limparFormulario();
      })
      .catch((error) => {
        alert("Erro ao excluir treino no servidor.");
      });
  }
};

// Função para limpar formulário e voltar ao grid
function limparFormulario() {
  interfaceDados.innerHTML = "";
  customBtn.classList.add("d-none");
  cancelarBtn.classList.add("d-none");
  excluirFicha.classList.add("d-none");
  cadastrar.classList.add("d-none");
  criarBtn.classList.remove("d-none");
  treinosGrid.style.display = "block";

  // Remove seleção dos cards
  document.querySelectorAll(".treino-card").forEach((card) => {
    card.classList.remove("selected");
  });

  indiceTreinoSelect = -1;
  treinoSelect = null;
}
