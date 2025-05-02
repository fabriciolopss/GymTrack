document.addEventListener("DOMContentLoaded", function () {
  const gymDataString = localStorage.getItem("gymAppData");

  const gymData = JSON.parse(gymDataString);

  const trainingPlansSelected = document.getElementById("training-plans");
  const trainingDaysSelected = document.getElementById("training-days");
  const dateCheckin = document.getElementById("date-checkin");
  const form = document.getElementById("form-checkin");

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

    if (selectedPlan) {
      trainingDaysSelected.disabled = false;
      selectedPlan.days.forEach((day) => {
        const option = document.createElement("option");
        option.value = day.name;
        option.textContent = day.name;
        trainingDaysSelected.appendChild(option);
      });
    }
  });


  dateCheckin.value = new Date().toISOString().split("T")[0]

  form.addEventListener("submit", function(event){
    event.preventDefault();
    const submitPlanId = trainingPlansSelected.value;
    const submitDate = dateCheckin.value;
    const submitDayTrained = trainingDaysSelected.value;
    const novoCheckin = {
      training_id: parseInt(submitPlanId), 
      day_index: submitDayTrained ,
      date: submitDate
    }
    gymData.registered_trainings.push(novoCheckin);
    localStorage.setItem("gymAppData", JSON.stringify(gymData));
      
  const modalElement = document.getElementById("checkinTreino");
  const modalInstance = bootstrap.Modal.getInstance(modalElement);
  modalInstance.hide();
  })

});
