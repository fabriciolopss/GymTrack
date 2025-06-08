lucide.createIcons();

document.addEventListener("DOMContentLoaded", function () {
  new LayoutManager();
});

const gymAppString = localStorage.getItem("gymAppData");
const gymApp = JSON.parse(gymAppString);

const interfaceDados = document.querySelector("#dados-treino");
const selecionarPlano = document.querySelector("#selecao-plano");
const customBtn = document.querySelector("#personalizar");
const criarBtn = document.querySelector("#criar");
const cancelarBtn = document.querySelector("#cancelar-alteracoes");
const containerDia1 = document.querySelector("#first-day");
const containerDia2 = document.querySelector("#second-day");

let treinoSelect;

function resetLocalStorage() {
  gymApp.edited_trainings = [
    {
      id: 1,
      name: "Treino de inferiores",
      category: "Pernas",
      type: "Ficha iniciante",
      days: [
        {
          id: 1,
          xp: 100,
          name: "Dia 1 - Gluteos e Posterior de Coxa",
          day: [
            { exercise: "Supino reto", series: 4, repetitions: "8-12" },
            { exercise: "Supino inclinado", series: 4, repetitions: "8-12" },
            { exercise: "Supino transversal", series: 4, repetitions: "8-12" },
          ],
        },
        {
          id: 2,
          xp: 150,
          name: "Dia 2 - Quadriceps e Panturrilha",
          day: [
            { exercise: "Supino reto", series: 4, repetitions: "8-12" },
            { exercise: "Supino inclinado", series: 4, repetitions: "8-12" },
            { exercise: "Supino transversal", series: 4, repetitions: "8-12" },
          ],
        },
      ],
    },
    {
      id: 2,
      name: "Treino de superiores",
      category: "Superiores",
      type: "Ficha intermediária",
      days: [
        {
          id: 1,
          xp: 50,
          name: "Dia 1 - Costas",
          day: [
            { exercise: "Supino reto", series: 4, repetitions: "8-12" },
            { exercise: "Supino inclinado", series: 4, repetitions: "8-12" },
            { exercise: "Supino transversal", series: 4, repetitions: "8-12" },
          ],
        },
        {
          id: 2,
          xp: 75,
          name: "Dia 2 - Ombro",
          day: [
            { exercise: "Supino reto", series: 4, repetitions: "8-12" },
            { exercise: "Supino inclinado", series: 4, repetitions: "8-12" },
            { exercise: "Supino transversal", series: 4, repetitions: "8-12" },
          ],
        },
      ],
    },
  ];
  localStorage.setItem("gymAppData", JSON.stringify(gymApp));
  location.reload();
}

let selecionarTemp = `
    <option selected hidden>Selecionar...</option>
`;
for (i = 0; i < gymApp.edited_trainings.length; i++) {
  selecionarTemp += `
        <option value="${gymApp.edited_trainings[i].name}">${gymApp.edited_trainings[i].name}</option>
    `;
}

let indiceTreinoSelect;
function carregarPlano() {
  {
    let botaoExcluirD1 = [];
    let botaoExcluirD2 = [];

    indiceTreinoSelect = -1;
    treinoSelect = gymApp.edited_trainings.find((e) => {
      indiceTreinoSelect++;
      console.log(indiceTreinoSelect);
      return e.name == selecionarPlano.value;
    });

    customBtn.style = "display: inline";
    cancelarBtn.style = "display: inline";
    criarBtn.style = "display: none";

    interfaceDados.innerHTML = `
        <label for="titulo-treino" class="mt-2">Título do treino: </label>
        <input id="titulo-treino" value="${treinoSelect.name}"/>
        <label for="categoria-treino">Categoria: </label>
        <input id="categoria-treino" value="${treinoSelect.category}"/>
        <label for="selecao-nivel">Nível de dificuldade</label>
        <select id="selecao-nivel">
            <option hidden>Selecionar...</option>
            <option value="Ficha iniciante" ${
              treinoSelect.type == "Ficha iniciante" ? "selected" : ""
            }>Iniciante</option>
            <option value="Ficha intermediária" ${
              treinoSelect.type == "Ficha intermediária" ? "selected" : ""
            }>Intermedário</option>
            <option value="Ficha avançada" ${
              treinoSelect.type == "Ficha avançada" ? "selected" : ""
            }>Avançado</option>
        </select>
    `;

    let containerDias = `
        <h1 class="mt-3">Dia 1</h1>
        <label for="titulo-first">Título do dia: </label>
        <input id="titulo-first" class="mb-3" value="${treinoSelect.days[0].name}"/>
        <div id="first-day">
    `;
    for (i = 0; i < treinoSelect.days[0].day.length; i++) {
      containerDias =
        containerDias +
        `
            <div class="exercicio d-flex flex-row justify-content-between align-items-center">
                <div>
                    <input class="fs-5" type="text" id="dia-1-nome-exercicio-${
                      i + 1
                    }" value="${treinoSelect.days[0].day[i].exercise}">
                    <div id="series-rep">
                        <label for="dia-1-series-exercicio-${
                          i + 1
                        }">Número de séries: </label>
                        <input type="number" id="dia-1-series-exercicio-${
                          i + 1
                        }" value="${treinoSelect.days[0].day[i].series}">
                        
                        <label for="dia-1-rep-exercicio-${
                          i + 1
                        }">Número de repetições</label>
                        <select id="dia-1-rep-exercicio-${i + 1}">
                            <option hidden>Selecionar...</option>
                            <option value="4-6" ${
                              treinoSelect.days[0].day[i].repetitions == "4-6"
                                ? "selected"
                                : ""
                            }>4-6</option>
                            <option value="8-12" ${
                              treinoSelect.days[0].day[i].repetitions == "8-12"
                                ? "selected"
                                : ""
                            }>8-12</option>
                            <option value="12-15" ${
                              treinoSelect.days[0].day[i].repetitions == "12-15"
                                ? "selected"
                                : ""
                            }>12-15</option>
                        </select>
                    </div>
                </div>
                <button id="delete-ex${i + 1}-d1">Excluir</button>
            </div>
        `;
    }

    containerDias += `
        </div>
        <button id="adicionar-exercicio-d1">Adicionar exercício</button>
        <h1 class="mt-3">Dia 2</h1>
        <label for="titulo-second">Título do dia: </label>
        <input id="titulo-second" class="mb-3" value="${treinoSelect.days[1].name}"/>
        <div id="second-day">
    `;

    for (i = 0; i < treinoSelect.days[1].day.length; i++) {
      containerDias =
        containerDias +
        `
            <div class="exercicio d-flex flex-row justify-content-between align-items-center">
                <div>
                    <input class="fs-5" type="text" id="dia-2-nome-exercicio-${
                      i + 1
                    }" value="${treinoSelect.days[1].day[i].exercise}">
                    <div id="series-rep">
                        <label for="dia-2-series-exercicio-${
                          i + 1
                        }">Número de séries: </label>
                        <input type="number" id="dia-2-series-exercicio-${
                          i + 1
                        }" value="${treinoSelect.days[1].day[i].series}">
                        
                        <label for="dia-2-rep-exercicio-${
                          i + 1
                        }">Número de repetições</label>
                        <select id="dia-2-rep-exercicio-${i + 1}">
                            <option hidden>Selecionar...</option>
                            <option value="4-6" ${
                              treinoSelect.days[1].day[i].repetitions == "4-6"
                                ? "selected"
                                : ""
                            }>4-6</option>
                            <option value="8-12" ${
                              treinoSelect.days[1].day[i].repetitions == "8-12"
                                ? "selected"
                                : ""
                            }>8-12</option>
                            <option value="12-15" ${
                              treinoSelect.days[1].day[i].repetitions == "12-15"
                                ? "selected"
                                : ""
                            }>12-15</option>
                        </select>
                    </div>
                </div>
                <button id="delete-ex${i + 1}-d2">Excluir</button>
            </div>
        `;
    }
    containerDias += `
        </div>
        <button id="adicionar-exercicio-d2">Adicionar exercício</button>
    `;
    interfaceDados.innerHTML += containerDias;

    for (let i = 0; i < treinoSelect.days[0].day.length; i++) {
      botaoExcluirD1[i] = document.querySelector(`#delete-ex${i + 1}-d1`);
      botaoExcluirD1[i].addEventListener("click", (e) => {
        e.preventDefault();

        treinoSelect.days[0].day.splice(i, 1);
        botaoExcluirD1.splice(i, 1);

        carregarPlano();
      });
    }

    for (let i = 0; i < treinoSelect.days[1].day.length; i++) {
      botaoExcluirD2[i] = document.querySelector(`#delete-ex${i + 1}-d2`);
      botaoExcluirD2[i].addEventListener("click", (e) => {
        e.preventDefault();

        treinoSelect.days[1].day.splice(i, 1);
        botaoExcluirD2.splice(i, 1);

        carregarPlano();
      });
    }
  }
}

selecionarPlano.innerHTML = selecionarTemp;
selecionarPlano.addEventListener("change", (e) => {
  e.preventDefault();
  carregarPlano();
});

customBtn.addEventListener("click", (e) => {
  e.preventDefault();

  treinoSelect.name = document.querySelector("#titulo-treino").value;
  treinoSelect.category = document.querySelector("#categoria-treino").value;
  treinoSelect.type = document.querySelector("#selecao-nivel").value;
  treinoSelect.days[0].name = document.querySelector("#titulo-first").value;
  treinoSelect.days[1].name = document.querySelector("#titulo-second").value;

  for (i = 0; i < treinoSelect.days[0].day.length; i++) {
    treinoSelect.days[0].day[i].exercise = document.querySelector(
      `#dia-1-nome-exercicio-${i + 1}`
    ).value;
    treinoSelect.days[0].day[i].series = document.querySelector(
      `#dia-1-series-exercicio-${i + 1}`
    ).value;
    treinoSelect.days[0].day[i].repetitions = document.querySelector(
      `#dia-1-rep-exercicio-${i + 1}`
    ).value;
  }
  for (i = 0; i < treinoSelect.days[1].day.length; i++) {
    treinoSelect.days[1].day[i].exercise = document.querySelector(
      `#dia-2-nome-exercicio-${i + 1}`
    ).value;
    treinoSelect.days[1].day[i].series = document.querySelector(
      `#dia-2-series-exercicio-${i + 1}`
    ).value;
    treinoSelect.days[1].day[i].repetitions = document.querySelector(
      `#dia-2-rep-exercicio-${i + 1}`
    ).value;
  }

  gymApp.edited_trainings[treinoSelect.id - 1] = treinoSelect;
  localStorage.setItem("gymAppData", JSON.stringify(gymApp));

  location.reload();
});

cancelarBtn.addEventListener("click", (e) => {
  e.preventDefault();

  location.reload();
});
