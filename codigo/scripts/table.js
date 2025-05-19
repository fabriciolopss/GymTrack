import { showToast } from "./utils/toast.js";

document.addEventListener("DOMContentLoaded", function () {
  const gymDataString = localStorage.getItem("gymAppData");
  if (!gymDataString) return;

  const gymData = JSON.parse(gymDataString);

  function parseDateBRtoISO(dateStr) {
    if (dateStr.includes("-")) return new Date(dateStr);
    const [dia, mes, ano] = dateStr.split("/");
    return new Date(`${ano}-${mes}-${dia}`);
  }

  const treinosOrdenados = gymData.registered_trainings.sort((a, b) => {
    return parseDateBRtoISO(b.date) - parseDateBRtoISO(a.date);
  });

  const tableBody = document.querySelector('#tabela-historico tbody');

  treinosOrdenados.forEach(treino => {
    const training = gymData.edited_trainings.find(plan => plan.id == treino.training_id);
    if (!training) return;

    const day = training.days[treino.day_index - 1];
    if (!day) return;

    const h = treino.duration?.hours || 0;
    const m = treino.duration?.minutes || 0;
    let duracaoFormatada = "";
    if (h > 0) duracaoFormatada += `${h}h `;
    if (m > 0) duracaoFormatada += `${m}min`;
    duracaoFormatada = duracaoFormatada.trim() || "0min";

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${parseDateBRtoISO(treino.date).toLocaleDateString("pt-BR")}</td>
      <td>${day.name}</td>
      <td><span class="badge-custom ${typeToClass(training.type)}">${training.type}</span></td>
      <td>${training.category}</td>
      <td>${duracaoFormatada}</td>
      <td>+${treino.xpGain}</td>
      <td>
        <button class="btn btn-sm btn-primary editar-treino" data-id="${treino.id}">Editar</button>
        <button class="btn btn-sm btn-danger deletar-treino" data-id="${treino.id}">Excluir</button>
      </td>
    `;
    tableBody.appendChild(row);
  });

  document.querySelectorAll('.editar-treino').forEach((btn, index) => {
    const id = index;
    btn.addEventListener('click', function () {
      const treino = gymData.registered_trainings[id];
      if (!treino) return;

      const novaData = prompt("Nova data (DD/MM/AAAA):", treino.date);
      if (!novaData) return;

      treino.date = novaData;
      localStorage.setItem("gymAppData", JSON.stringify(gymData));
      location.reload();
    });
  });

  document.querySelectorAll('.deletar-treino').forEach((btn, index) => {
    const id = index;
    btn.addEventListener('click', function () {
      if (gymData.registered_trainings[id] && confirm("Tem certeza que deseja excluir este treino?")) {
        gymData.registered_trainings.splice(index, 1);
        localStorage.setItem("gymAppData", JSON.stringify(gymData));
        location.reload();
        showToast({message: "Treino deletado com sucesso", delay: 2000})
      }
    });
  });

  function typeToClass(type) {
    switch (type) {
      case "Ficha iniciante": return "badge-iniciante";
      case "Ficha intermediária": return "badge-intermediario";
      case "Ficha avançada": return "badge-avancado";
      default: return "";
    }
  }
});
