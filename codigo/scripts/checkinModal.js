import {
  mudarXpGanha,
  xpModalCheckin,
  calcularXpPorTipoETempo,
} from "./level.js";
import { createNotification } from "./notifications.js";
import { showToast } from "./utils/toast.js";
import ApiService from './services/api.js';

class CheckinModal {
  constructor() {
    this.initializeCheckinModal();
  }

  async initializeCheckinModal() {
    try {
      const userData = await ApiService.getUserData();
      this.gymData = userData.gymData || {};
      this.setupEventListeners();
    } catch (error) {
      console.error('Erro ao inicializar modal de check-in:', error);
      this.gymData = {};
    }
  }

  setupEventListeners() {
    const botaoModal = document.querySelector(".abrir-modal");
    const trainingPlansSelected = document.getElementById("training-plans");
    const trainingDaysSelected = document.getElementById("training-days");
    const dateCheckin = document.getElementById("date-checkin");
    const form = document.getElementById("form-checkin");
    const hoursInput = document.getElementById("hours-trained");
    const minutesInput = document.getElementById("minutes-trained");

    const btnDecHours = document.getElementById("decrement-hours");
    const btnIncHours = document.getElementById("increment-hours");
    const btnDecMinutes = document.getElementById("decrement-minutes");
    const btnIncMinutes = document.getElementById("increment-minutes");

    botaoModal.addEventListener("click", () => xpModalCheckin());

    // Populate training plans
    this.gymData.edited_trainings?.forEach((plan) => {
      const option = document.createElement("option");
      option.value = plan.id;
      option.textContent = plan.name;
      trainingPlansSelected.appendChild(option);
    });

    trainingPlansSelected.addEventListener("change", () => {
      const selectedPlanId = trainingPlansSelected.value;
      const selectedPlan = this.gymData.edited_trainings?.find(
        (plan) => plan.id == selectedPlanId
      );

      trainingDaysSelected.innerHTML = "";

      if (selectedPlan) {
        mudarXpGanha(selectedPlan.days[0].xp);
        trainingDaysSelected.disabled = false;
        selectedPlan.days.forEach((day) => {
          const option = document.createElement("option");
          option.value = day.id;
          option.textContent = day.name;
          trainingDaysSelected.appendChild(option);
        });
      }
    });

    trainingDaysSelected.addEventListener("change", () => {
      const selectedDay = trainingDaysSelected.value;
      const selectedPlan = this.gymData.edited_trainings?.find(
        (plan) => plan.id == trainingPlansSelected.value
      );
      const day = selectedPlan?.days.find((day) => day.id == selectedDay);

      if (day) {
        mudarXpGanha(day.xp);
      }
    });

    dateCheckin.value = new Date().toISOString().split("T")[0];
    dateCheckin.max = new Date().toISOString().split("T")[0];

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submitPlanId = trainingPlansSelected.value;
      const submitDate = dateCheckin.value;
      const submitDayTrainedId = trainingDaysSelected.value;

      const hours = parseInt(hoursInput.value) || 0;
      const minutes = parseInt(minutesInput.value) || 0;

      const selectedPlan = this.gymData.edited_trainings?.find(
        (plan) => plan.id == submitPlanId
      );
      const selectedDay = selectedPlan?.days.find((day) => day.id == submitDayTrainedId);
      const xpGanho = calcularXpPorTipoETempo(selectedPlan.type, hours, minutes);

      const novoCheckin = {
        training_id: parseInt(submitPlanId),
        day_index: parseInt(submitDayTrainedId),
        date: submitDate,
        xpGain: xpGanho,
        duration: { hours, minutes },
      };

      try {
        // Update user data with new training and XP
        this.gymData.profile.xp = (this.gymData.profile.xp || 0) + xpGanho;
        this.gymData.registered_trainings = this.gymData.registered_trainings || [];
        this.gymData.registered_trainings.push(novoCheckin);
        
        await ApiService.updateUserData({ gymData: this.gymData });

        const modalElement = document.getElementById("checkinTreino");
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

        showToast({
          message: "Treino salvo com sucesso!",
          background: "text-bg-success",
          delay: 4000,
        });

        await createNotification({
          title: "Treino registrado com sucesso!", 
          description: `O dia de ${selectedDay.name} da ficha ${selectedPlan.name}`,
          type: "Creation"
        });

        // Reset form
        form.reset();
        dateCheckin.value = new Date().toISOString().split("T")[0];
      } catch (error) {
        console.error('Erro ao salvar treino:', error);
        showToast({
          message: "Erro ao salvar treino. Tente novamente.",
          background: "text-bg-danger",
          delay: 4000,
        });
      }
    });

    // Time input handlers
    btnDecHours.addEventListener("click", () => {
      const value = parseInt(hoursInput.value) || 0;
      if (value > 0) hoursInput.value = value - 1;
      this.mudarXpGanhaPreview();
    });

    btnIncHours.addEventListener("click", () => {
      const value = parseInt(hoursInput.value) || 0;
      if (value < 3) hoursInput.value = value + 1;
      this.mudarXpGanhaPreview();
    });

    btnDecMinutes.addEventListener("click", () => {
      const value = parseInt(minutesInput.value) || 0;
      if (value > 0) {
        minutesInput.value = value - 5 >= 0 ? value - 5 : 0;
      }
      this.mudarXpGanhaPreview();
    });

    btnIncMinutes.addEventListener("click", () => {
      const value = parseInt(minutesInput.value) || 0;
      if (value < 59) {
        minutesInput.value = value + 5 <= 59 ? value + 5 : 59;
      }
      this.mudarXpGanhaPreview();
    });

    // XP preview handlers
    trainingPlansSelected.addEventListener("change", () => this.mudarXpGanhaPreview());
    trainingDaysSelected.addEventListener("change", () => this.mudarXpGanhaPreview());
    hoursInput.addEventListener("change", () => this.mudarXpGanhaPreview());
    minutesInput.addEventListener("change", () => this.mudarXpGanhaPreview());
  }

  mudarXpGanhaPreview() {
    const trainingPlansSelected = document.getElementById("training-plans");
    const trainingDaysSelected = document.getElementById("training-days");
    const hoursInput = document.getElementById("hours-trained");
    const minutesInput = document.getElementById("minutes-trained");

    const planId = trainingPlansSelected.value;
    const dayId = trainingDaysSelected.value;
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;

    const selectedPlan = this.gymData.edited_trainings?.find(
      (plan) => plan.id == planId
    );
    if (!selectedPlan) return;

    const xp = calcularXpPorTipoETempo(selectedPlan.type, hours, minutes);
    mudarXpGanha(xp);
  }
}

// Initialize the modal when the document is loaded
document.addEventListener("DOMContentLoaded", function () {
  new CheckinModal();
});
