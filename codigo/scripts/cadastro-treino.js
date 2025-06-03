const gymAppString = localStorage.getItem("gymAppData");
const gymApp = JSON.parse(gymAppString);

const interfaceDados = document.querySelector("#dados-treino");
const selecionarPlano = document.querySelector("#selecao");

let treinoSelect;

let selecionarTemp = `
    <option selected hidden>Selecionar...</option>
`;
for(i = 0; i<gymApp.edited_trainings.length; i++) {
    selecionarTemp += `
        <option value="${gymApp.edited_trainings[i].name}">${gymApp.edited_trainings[i].name}</option>
    `;
}

selecionarPlano.innerHTML = selecionarTemp;

selecionarPlano.addEventListener("change", e => {
    e.preventDefault();
    treinoSelect = (gymApp.edited_trainings).find(e => {
        return e.name == selecionarPlano.value;
    });
    console.log(treinoSelect);

    interfaceDados.innerHTML = `
          <label for="titulo-treino" class="mt-2">Título do treino: </label>
          <input id="titulo-treino" value="${treinoSelect.name}"/>
          <label for="categoria-treino">Categoria: </label>
          <input id="categoria-treino" value="${treinoSelect.category}"/>
          <label for="selecao">Nível de dificuldade</label>
          <select id="selecao">
            <option hidden>Selecionar...</option>
            <option ${treinoSelect.type == "Ficha iniciante" ? "selected" : ""}>Iniciante</option>
            <option ${treinoSelect.type == "Ficha intermediária" ? "selected" : ""}>Intermedário</option>
            <option ${treinoSelect.type == "Ficha avançada" ? "selected" : ""}>Avançado</option>
          </select>

          <div id="first-day">
            <h1 class="mt-3">Dia 1</h1>
            <label for="titulo-first">Título do dia: </label>
            <input id="titulo-first" class="mb-3" value="${treinoSelect.days[0].name}"/>

            <div
              class="exercicio d-flex flex-row justify-content-between align-items-center"
            >
              <div>
                <h5>Nome do exercício</h5>
                <p>Número de séries - Número de repetições</p>
              </div>
              <button id="delete-ex1-d1">Excluir</button>
            </div>

            <div
              class="exercicio d-flex flex-row justify-content-between align-items-center"
            >
              <div>
                <h5>Nome do exercício</h5>
                <p>Número de séries - Número de repetições</p>
              </div>
              <button id="delete-ex2-d1">Excluir</button>
            </div>
          </div>
          <div id="second-day">
            <h1 class="mt-3">Dia 2</h1>
            <label for="titulo-second">Título do dia: </label>
            <input id="titulo-second" class="mb-3" value="${treinoSelect.days[1].name}"/>

            <div
              class="exercicio d-flex flex-row justify-content-between align-items-center"
            >
              <div>
                <h5>Nome do exercício</h5>
                <p>Número de séries - Número de repetições</p>
              </div>
              <button id="delete-ex1-d2">Excluir</button>
            </div>

            <div
              class="exercicio d-flex flex-row justify-content-between align-items-center"
            >
              <div>
                <h5>Nome do exercício</h5>
                <p>Número de séries - Número de repetições</p>
              </div>
              <button id="delete-ex2-d2">Excluir</button>
            </div>
          </div>
    `;
});