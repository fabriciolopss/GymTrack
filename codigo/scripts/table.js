document.addEventListener("DOMContentLoaded", function () {
  const historico = document.getElementById("tabela-historico");

  const gymDataString = localStorage.getItem("gymAppData");
  if (!gymDataString) return;

  const gymData = JSON.parse(gymDataString);

  function parseDateBRtoISO(dateStr) {
    if (dateStr.includes("-")) return new Date(dateStr);
    const [dia, mes, ano] = dateStr.split("/");
    return new Date(`${ano}-${mes}-${dia}`);
  }

  const treinosOrdenados = gymData.registered_trainings.sort((a, b) => {
    return parseDateBRtoISO(a.date) - parseDateBRtoISO(b.date);
  });

  treinosOrdenados.forEach((treino) => {
    const training = gymData.edited_trainings.find(
      (plan) => plan.id == treino.training_id
    );
    if (!training) return;

    const day = training.days[treino.day_index - 1];
    if (!day) return;

    const row = historico.insertRow(0);
    const data = row.insertCell(0);
    const membros = row.insertCell(1);
    const tipoDetreino = row.insertCell(2);
    const categoria = row.insertCell(3);
    const duracao = row.insertCell(4);
    const xp = row.insertCell(5);

    const dataFormatada = parseDateBRtoISO(treino.date).toLocaleDateString(
      "pt-BR"
    );

    const h = treino.duration?.hours || 0;
    const m = treino.duration?.minutes || 0;
    let duracaoFormatada = "";
    if (h > 0) duracaoFormatada += `${h}h `;
    if (m > 0) duracaoFormatada += `${m}min`;
    duracaoFormatada = duracaoFormatada.trim() || "0min";

    data.innerHTML = dataFormatada;
    membros.innerHTML = day.name;
    tipoDetreino.innerHTML = `<span class="badge-custom ${typeToClass(training.type)}">${training.type}</span>`;
    categoria.innerHTML = training.category;
    duracao.innerHTML = duracaoFormatada;
    xp.innerHTML = "+" + treino.xpGain;
  });
});


function typeToClass(type){
  switch(type){
    case "Ficha iniciante":
      return "badge-iniciante";
    case "Ficha intermediária":
      return "badge-intermediario";
    case "Ficha avançada":
      return "badge-avancado";
  }
}