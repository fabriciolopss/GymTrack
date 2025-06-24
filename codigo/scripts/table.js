import { showToast } from "./utils/toast.js";
import ApiService from "./services/api.js";

document.addEventListener("DOMContentLoaded", async function () {
  try {
    const userData = await ApiService.getUserData();
    const gymData = userData || {};
    if (!gymData.registered_trainings || !gymData.edited_trainings) return;

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
      const training = gymData.edited_trainings[treino.training_id - 1];
      if (!training) return;

      const day = training.days[treino.day_index];
      console.log(treino);
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

    // As funções de editar/deletar localmente não fazem sentido com webserver,
    // então aqui só mostramos o histórico. Se quiser implementar edição/exclusão,
    // deve-se fazer via ApiService.updateUserData().

    function typeToClass(type) {
      switch (type) {
        case "Ficha iniciante": return "badge-iniciante";
        case "Ficha intermediária": return "badge-intermediario";
        case "Ficha avançada": return "badge-avancado";
        default: return "";
      }
    }
  } catch (error) {
    console.error('Erro ao carregar histórico do webserver:', error);
  }
});
