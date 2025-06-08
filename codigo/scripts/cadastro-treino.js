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
const cancelarBtn = document.querySelector("#cancelar");
const excluirFicha = document.querySelector("#excluir-ficha");
const cadastrar = document.querySelector("#concluir-criacao");
const containerDia1 = document.querySelector("#first-day");
const containerDia2 = document.querySelector("#second-day");

let treinoSelect;
function transformTreinoSelect() {
    if (
        gymApp.edited_trainings.find((e) => {
            return (e.name == document.querySelector("#titulo-treino").value && e.id != treinoSelect.id);
        })
    ) {
        alert("Nome já utilizado em outra ficha.");
        return false;
    } else {
        treinoSelect.name = document.querySelector("#titulo-treino").value;
    }
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

    return true;
}

function transformTreinoSelectTemp() {
    treinoSelectTemp.name = document.querySelector("#titulo-treino").value;
    treinoSelectTemp.category = document.querySelector("#categoria-treino").value;
    treinoSelectTemp.type = document.querySelector("#selecao-nivel").value;
    treinoSelectTemp.days[0].name = document.querySelector("#titulo-first").value;
    treinoSelectTemp.days[1].name = document.querySelector("#titulo-second").value;

    for (i = 0; i < treinoSelect.days[0].day.length; i++) {
        treinoSelectTemp.days[0].day[i].exercise = document.querySelector(
            `#dia-1-nome-exercicio-${i + 1}`
        ).value;
        treinoSelectTemp.days[0].day[i].series = document.querySelector(
            `#dia-1-series-exercicio-${i + 1}`
        ).value;
        treinoSelectTemp.days[0].day[i].repetitions = document.querySelector(
            `#dia-1-rep-exercicio-${i + 1}`
        ).value;
    }
    for (i = 0; i < treinoSelect.days[1].day.length; i++) {
        treinoSelectTemp.days[1].day[i].exercise = document.querySelector(
            `#dia-2-nome-exercicio-${i + 1}`
        ).value;
        treinoSelectTemp.days[1].day[i].series = document.querySelector(
            `#dia-2-series-exercicio-${i + 1}`
        ).value;
        treinoSelectTemp.days[1].day[i].repetitions = document.querySelector(
            `#dia-2-rep-exercicio-${i + 1}`
        ).value;
    }
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
let recursivo = false;
let treinoSelectTemp;

function carregarPlano() {
    {
        let botaoExcluirD1 = [];
        let botaoExcluirD2 = [];
        let botaoAddD1, botaoAddD2;

        indiceTreinoSelect = -1;

        if (!recursivo) {
            treinoSelect = gymApp.edited_trainings.find((e) => {
                indiceTreinoSelect++;
                console.log(indiceTreinoSelect);
                return e.name == selecionarPlano.value;
            });

            treinoSelectTemp = treinoSelect;
        } else {
            treinoSelect = treinoSelectTemp;
            recursivo = false;
        }

        customBtn.style = "display: inline";
        cancelarBtn.style = "display: inline";
        excluirFicha.style = "display: inline; float: right";
        criarBtn.style = "display: none";

        interfaceDados.innerHTML = `
        <hr style="border: 1px solid #ccc; margin: 20px 0;">
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
                        <input class="fs-5" type="text" id="dia-1-nome-exercicio-${i + 1}" value="${
                    treinoSelect.days[0].day[i].exercise
                }">
                        <div id="series-rep">
                            <label for="dia-1-series-exercicio-${i + 1}">Número de séries: </label>
                            <input type="number" id="dia-1-series-exercicio-${i + 1}" value="${
                    treinoSelect.days[0].day[i].series
                }">
                            
                            <label for="dia-1-rep-exercicio-${i + 1}">Número de repetições</label>
                            <select id="dia-1-rep-exercicio-${i + 1}">
                                <option hidden>Selecionar...</option>
                                <option value="4-6" ${
                                    treinoSelect.days[0].day[i].repetitions == "4-6" ? "selected" : ""
                                }>4-6</option>
                                <option value="8-12" ${
                                    treinoSelect.days[0].day[i].repetitions == "8-12" ? "selected" : ""
                                }>8-12</option>
                                <option value="12-15" ${
                                    treinoSelect.days[0].day[i].repetitions == "12-15" ? "selected" : ""
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
                        <input class="fs-5" type="text" id="dia-2-nome-exercicio-${i + 1}" value="${
                    treinoSelect.days[1].day[i].exercise
                }">
                        <div id="series-rep">
                            <label for="dia-2-series-exercicio-${i + 1}">Número de séries: </label>
                            <input type="number" id="dia-2-series-exercicio-${i + 1}" value="${
                    treinoSelect.days[1].day[i].series
                }">
                            
                            <label for="dia-2-rep-exercicio-${i + 1}">Número de repetições</label>
                            <select id="dia-2-rep-exercicio-${i + 1}">
                                <option hidden>Selecionar...</option>
                                <option value="4-6" ${
                                    treinoSelect.days[1].day[i].repetitions == "4-6" ? "selected" : ""
                                }>4-6</option>
                                <option value="8-12" ${
                                    treinoSelect.days[1].day[i].repetitions == "8-12" ? "selected" : ""
                                }>8-12</option>
                                <option value="12-15" ${
                                    treinoSelect.days[1].day[i].repetitions == "12-15" ? "selected" : ""
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

        botaoAddD1 = document.querySelector("#adicionar-exercicio-d1");
        botaoAddD2 = document.querySelector("#adicionar-exercicio-d2");

        botaoAddD1.addEventListener("click", (e) => {
            e.preventDefault();

            transformTreinoSelectTemp();
            recursivo = true;

            treinoSelect.days[0].day[treinoSelect.days[0].day.length] = {
                exercise: "Novo exercício",
                series: "",
                repetitions: "",
            };

            carregarPlano();
        });

        botaoAddD2.addEventListener("click", (e) => {
            e.preventDefault();

            transformTreinoSelectTemp();
            recursivo = true;

            treinoSelect.days[1].day[treinoSelect.days[1].day.length] = {
                exercise: "Novo exercício",
                series: "",
                repetitions: "",
            };

            carregarPlano();
        });

        for (let i = 0; i < treinoSelect.days[0].day.length; i++) {
            botaoExcluirD1[i] = document.querySelector(`#delete-ex${i + 1}-d1`);
            botaoExcluirD1[i].addEventListener("click", (e) => {
                e.preventDefault();

                let confirmExcluir = confirm(
                    `Confirmar exclusão de "${treinoSelect.days[0].day[i].exercise}"? Você poderá recuperá-lo se cancelar as alterações.`
                );

                if (confirmExcluir) {
                    treinoSelect.days[0].day.splice(i, 1);
                    botaoExcluirD1.splice(i, 1);

                    transformTreinoSelectTemp();
                    recursivo = true;

                    carregarPlano();
                }
            });
        }

        for (let i = 0; i < treinoSelect.days[1].day.length; i++) {
            botaoExcluirD2[i] = document.querySelector(`#delete-ex${i + 1}-d2`);
            botaoExcluirD2[i].addEventListener("click", (e) => {
                e.preventDefault();

                let confirmExcluir = confirm(
                    `Confirmar exclusão de "${treinoSelect.days[1].day[i].exercise}"? Você poderá recuperá-lo se cancelar as alterações.`
                );

                if (confirmExcluir) {
                    treinoSelect.days[1].day.splice(i, 1);
                    botaoExcluirD2.splice(i, 1);

                    transformTreinoSelectTemp();
                    recursivo = true;

                    carregarPlano();
                }
            });
        }
    }
}

treinoSelect = {
    id: gymApp.edited_trainings[gymApp.edited_trainings.length - 1].id + 1,
    name: "Nova ficha",
    category: "",
    type: "",
    days: [
        {
            id: 1,
            xp: 100,
            name: "Dia 1 - Nova ficha",
            day: [],
        },
        {
            id: 2,
            xp: 150,
            name: "Dia 2 - Nova ficha",
            day: [],
        },
    ],
};
function criarFicha() {
    {
        let botaoExcluirD1 = [];
        let botaoExcluirD2 = [];
        let botaoAddD1, botaoAddD2;

        document.querySelector("#container-selecao-plano").style = "display: none";

        if (!recursivo) {
            treinoSelectTemp = treinoSelect;
        } else {
            treinoSelect = treinoSelectTemp;
            recursivo = false;
        }

        indiceTreinoSelect = -1;

        cadastrar.style = "display: inline; margin-top: 2vh";
        cancelarBtn.style = "display: inline; margin-top: 2vh";
        criarBtn.style = "display: none";

        interfaceDados.innerHTML = `
        <hr style="border: 1px solid #ccc; margin: 20px 0;">
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
                        <input class="fs-5" type="text" id="dia-1-nome-exercicio-${i + 1}" value="${
                    treinoSelect.days[0].day[i].exercise
                }">
                        <div id="series-rep">
                            <label for="dia-1-series-exercicio-${i + 1}">Número de séries: </label>
                            <input type="number" id="dia-1-series-exercicio-${i + 1}" value="${
                    treinoSelect.days[0].day[i].series
                }">
                            
                            <label for="dia-1-rep-exercicio-${i + 1}">Número de repetições</label>
                            <select id="dia-1-rep-exercicio-${i + 1}">
                                <option hidden>Selecionar...</option>
                                <option value="4-6" ${
                                    treinoSelect.days[0].day[i].repetitions == "4-6" ? "selected" : ""
                                }>4-6</option>
                                <option value="8-12" ${
                                    treinoSelect.days[0].day[i].repetitions == "8-12" ? "selected" : ""
                                }>8-12</option>
                                <option value="12-15" ${
                                    treinoSelect.days[0].day[i].repetitions == "12-15" ? "selected" : ""
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
                        <input class="fs-5" type="text" id="dia-2-nome-exercicio-${i + 1}" value="${
                    treinoSelect.days[1].day[i].exercise
                }">
                        <div id="series-rep">
                            <label for="dia-2-series-exercicio-${i + 1}">Número de séries: </label>
                            <input type="number" id="dia-2-series-exercicio-${i + 1}" value="${
                    treinoSelect.days[1].day[i].series
                }">
                            
                            <label for="dia-2-rep-exercicio-${i + 1}">Número de repetições</label>
                            <select id="dia-2-rep-exercicio-${i + 1}">
                                <option hidden>Selecionar...</option>
                                <option value="4-6" ${
                                    treinoSelect.days[1].day[i].repetitions == "4-6" ? "selected" : ""
                                }>4-6</option>
                                <option value="8-12" ${
                                    treinoSelect.days[1].day[i].repetitions == "8-12" ? "selected" : ""
                                }>8-12</option>
                                <option value="12-15" ${
                                    treinoSelect.days[1].day[i].repetitions == "12-15" ? "selected" : ""
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

        botaoAddD1 = document.querySelector("#adicionar-exercicio-d1");
        botaoAddD2 = document.querySelector("#adicionar-exercicio-d2");

        botaoAddD1.addEventListener("click", (e) => {
            e.preventDefault();

            transformTreinoSelectTemp();
            recursivo = true;

            treinoSelect.days[0].day[treinoSelect.days[0].day.length] = {
                exercise: "Novo exercício",
                series: "",
                repetitions: "",
            };
            criarFicha();
        });

        botaoAddD2.addEventListener("click", (e) => {
            e.preventDefault();

            transformTreinoSelectTemp();
            recursivo = true;

            treinoSelect.days[1].day[treinoSelect.days[1].day.length] = {
                exercise: "Novo exercício",
                series: "",
                repetitions: "",
            };
            criarFicha();
        });

        for (let i = 0; i < treinoSelect.days[0].day.length; i++) {
            botaoExcluirD1[i] = document.querySelector(`#delete-ex${i + 1}-d1`);
            botaoExcluirD1[i].addEventListener("click", (e) => {
                e.preventDefault();

                let confirmExcluir = confirm(
                    `Confirmar exclusão de "${treinoSelect.days[0].day[i].exercise}"? Você poderá recuperá-lo se cancelar as alterações.`
                );

                if (confirmExcluir) {
                    treinoSelect.days[0].day.splice(i, 1);
                    botaoExcluirD1.splice(i, 1);

                    transformTreinoSelectTemp();
                    recursivo = true;

                    carregarPlano();
                }
            });
        }

        for (let i = 0; i < treinoSelect.days[1].day.length; i++) {
            botaoExcluirD2[i] = document.querySelector(`#delete-ex${i + 1}-d2`);
            botaoExcluirD2[i].addEventListener("click", (e) => {
                e.preventDefault();

                let confirmExcluir = confirm(
                    `Confirmar exclusão de "${treinoSelect.days[1].day[i].exercise}"? Você poderá recuperá-lo se cancelar as alterações.`
                );

                if (confirmExcluir) {
                    treinoSelect.days[1].day.splice(i, 1);
                    botaoExcluirD2.splice(i, 1);

                    transformTreinoSelectTemp();
                    recursivo = true;

                    carregarPlano();
                }
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

    if(transformTreinoSelect()) {
    gymApp.edited_trainings[treinoSelect.id - 1] = treinoSelect;
    localStorage.setItem("gymAppData", JSON.stringify(gymApp));

    location.reload();
    }
});

cancelarBtn.addEventListener("click", (e) => {
    e.preventDefault();

    location.reload();
});

excluirFicha.addEventListener("click", (e) => {
    e.preventDefault();

    if (
        confirm(
            `Confirmar exclusão da ficha ${treinoSelect.name}? Essa ação é irreversível.`
        )
    ) {
        gymApp.edited_trainings.splice(indiceTreinoSelect, 1);
        localStorage.setItem("gymAppData", JSON.stringify(gymApp));
        location.reload();
    }
});

criarBtn.addEventListener("click", (e) => {
    e.preventDefault();

    criarFicha();
});

cadastrar.addEventListener("click", (e) => {
    e.preventDefault();

    if(transformTreinoSelect()) {
        gymApp.edited_trainings[gymApp.edited_trainings.length] = treinoSelect;
        localStorage.setItem("gymAppData", JSON.stringify(gymApp));
        location.reload();
    }
});