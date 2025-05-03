import {
  mudarXpGanha,
  xpModalCheckin,
  calcularXpPorTipoETempo,
} from "./level.js";
import { showToast } from "./utils/toast.js";

document.addEventListener("DOMContentLoaded", function () {
  const gymDataString = localStorage.getItem("gymAppData");

  const gymData = JSON.parse(gymDataString);

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

  botaoModal.addEventListener("click", function () {
    xpModalCheckin();
  });

  gymData.edited_trainings.forEach((plan) => {
    const option = document.createElement("option");
    option.value = plan.id;
    option.textContent = plan.name;
    trainingPlansSelected.appendChild(option);
  });

  trainingPlansSelected.addEventListener("change", function () {
    const selectedPlanId = trainingPlansSelected.value;
    const selectedPlan = gymData.edited_trainings.find(
      (plan) => plan.id == selectedPlanId
    );

    trainingDaysSelected.innerHTML = "";

    mudarXpGanha(gymData.edited_trainings[selectedPlanId - 1].days[0].xp);

    if (selectedPlan) {
      trainingDaysSelected.disabled = false;
      selectedPlan.days.forEach((day) => {
        const option = document.createElement("option");
        option.value = day.id;
        option.textContent = day.name;
        trainingDaysSelected.appendChild(option);
      });
    }
  });

  trainingDaysSelected.addEventListener("change", function () {
    const selectedDay = this.value;
    const selectedPlan = gymData.edited_trainings.find(
      (plan) => plan.id == trainingPlansSelected.value
    );
    const day = selectedPlan.days.find((day) => day.id == selectedDay);

    if (day) {
      const xpGain = day.xp;
      mudarXpGanha(xpGain);
    }
  });

  dateCheckin.value = new Date().toISOString().split("T")[0];

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const submitPlanId = trainingPlansSelected.value;
    const submitDate = dateCheckin.value;
    const submitDayTrainedId = trainingDaysSelected.value;

    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;

    const selectedPlan = gymData.edited_trainings.find(
      (plan) => plan.id == submitPlanId
    );
    const xpGanho = calcularXpPorTipoETempo(selectedPlan.type, hours, minutes);

    gymData.profile.xp += xpGanho;

    const novoCheckin = {
      training_id: parseInt(submitPlanId),
      day_index: parseInt(submitDayTrainedId),
      date: submitDate,
      xpGain: xpGanho,
      duration: { hours, minutes },
    };

    gymData.registered_trainings.push(novoCheckin);
    localStorage.setItem("gymAppData", JSON.stringify(gymData));

    const modalElement = document.getElementById("checkinTreino");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
    showToast({
      message: "Treino salvo com sucesso!",
      background: "text-bg-success",
      delay: 4000,
    });
  });

  btnDecHours.addEventListener("click", () => {
    const value = parseInt(hoursInput.value) || 0;
    if (value > 0) hoursInput.value = value - 1;
    mudarXpGanhaPreview();
  });

  btnIncHours.addEventListener("click", () => {
    const value = parseInt(hoursInput.value) || 0;
    if (value < 3) hoursInput.value = value + 1;
    mudarXpGanhaPreview();
  });

  btnDecMinutes.addEventListener("click", () => {
    const value = parseInt(minutesInput.value) || 0;
    if (value > 0) {
      minutesInput.value = value - 5 >= 0 ? value - 5 : 0;
    }
    mudarXpGanhaPreview();
  });

  btnIncMinutes.addEventListener("click", () => {
    const value = parseInt(minutesInput.value) || 0;
    if (value < 59) {
      minutesInput.value = value + 5 <= 59 ? value + 5 : 59;
    }
    mudarXpGanhaPreview();
  });

  trainingPlansSelected.addEventListener("change", mudarXpGanhaPreview);
  trainingDaysSelected.addEventListener("change", mudarXpGanhaPreview);
  hoursInput.addEventListener("change", mudarXpGanhaPreview);
  minutesInput.addEventListener("change", mudarXpGanhaPreview);

  function mudarXpGanhaPreview() {
    const planId = trainingPlansSelected.value;
    const dayId = trainingDaysSelected.value;
    const hours = parseInt(hoursInput.value) || 0;
    const minutes = parseInt(minutesInput.value) || 0;

    const selectedPlan = gymData.edited_trainings.find(
      (plan) => plan.id == planId
    );
    if (!selectedPlan) return;

    const xp = calcularXpPorTipoETempo(selectedPlan.type, hours, minutes);
    console.log(xp);
    mudarXpGanha(xp);
  }
});
