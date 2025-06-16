document.addEventListener("DOMContentLoaded", async function () {
  // --- VERIFICAÇÃO INICIAL: O usuário já está cadastrado? ---
  try {
    const userData = await window.auth.getCurrentUserData();
    if (userData?.userData?.profile?.metadados?.data_cadastro) {
      console.log("Usuário já cadastrado. Redirecionando para o dashboard...");
      window.location.href = "index.html";
      return;
    }
  } catch (error) {
    console.error("Erro ao verificar dados existentes:", error);
    // Continua mesmo se houver erro na leitura, permitindo o cadastro
  }

  // Elementos principais
  const form = document.getElementById("student-form");
  if (!form) {
    console.error("Elemento do formulário #student-form não encontrado!");
    return;
  }

  const steps = Array.from(form.querySelectorAll(".form-step"));
  const stepIndicatorItems = Array.from(
    document.querySelectorAll("#step-indicator .step-item")
  );
  const prevBtn = document.getElementById("prev-btn");
  const nextBtn = document.getElementById("next-btn");
  const submitBtn = document.getElementById("submit-btn");
  const mainContent = document.getElementById("main-content");
  const confirmationScreen = document.getElementById("confirmation-screen");

  if (
    !steps.length ||
    !stepIndicatorItems.length ||
    !prevBtn ||
    !nextBtn ||
    !submitBtn ||
    !mainContent ||
    !confirmationScreen
  ) {
    console.error(
      "Um ou mais elementos essenciais do formulário multi-step não foram encontrados. Verifique os IDs no HTML."
    );
    return;
  }

  let currentStep = 0;

  // Mostra o passo atual e foca no primeiro campo
  function showStep(stepIndex) {
    steps.forEach((step) => step.classList.remove("active"));
    if (steps[stepIndex]) {
      steps[stepIndex].classList.add("active");
      // Foco automático no primeiro campo visível do passo
      setTimeout(() => {
        const firstInput = steps[stepIndex].querySelector(
          "input:not([type='hidden']):not([disabled]), select:not([disabled]), textarea:not([disabled])"
        );
        if (firstInput) firstInput.focus();
      }, 100);
    } else {
      console.error(`Passo com índice ${stepIndex} não encontrado.`);
      return;
    }

    // Atualiza o indicador de passos
    stepIndicatorItems.forEach((item, index) => {
      item.classList.remove("active", "completed");
      const stepNumber = item.querySelector(".step-number");
      if (index < stepIndex) {
        item.classList.add("completed");
      } else if (index === stepIndex) {
        item.classList.add("active");
        item.setAttribute("aria-current", "step");
      } else {
        item.removeAttribute("aria-current");
      }
      if (stepNumber) {
        stepNumber.textContent = `${index + 1}`;
      }
    });

    // Atualiza a visibilidade dos botões
    prevBtn.style.display = stepIndex === 0 ? "none" : "inline-block";
    nextBtn.style.display =
      stepIndex === steps.length - 1 ? "none" : "inline-block";
    submitBtn.style.display =
      stepIndex === steps.length - 1 ? "inline-block" : "none";

    // Renderiza ícones novamente
    if (typeof lucide !== "undefined") {
      lucide.createIcons();
    }
  }

  // Validação do passo atual
  function validateStep(stepIndex) {
    if (!steps[stepIndex]) {
      console.error(`Tentando validar um passo inválido: ${stepIndex}`);
      return false;
    }
    const currentStepElement = steps[stepIndex];
    const inputs = Array.from(
      currentStepElement.querySelectorAll(
        "input:not([type='hidden']), select, textarea"
      )
    );
    let isValid = true;
    let firstInvalidInput = null;

    inputs.forEach((input) => {
      input.classList.remove("is-invalid");
      if (!input.checkValidity()) {
        if (input.offsetParent !== null && !input.disabled) {
          input.classList.add("is-invalid");
          isValid = false;
          if (!firstInvalidInput) {
            firstInvalidInput = input;
          }
        }
      } else {
        input.classList.remove("is-invalid");
      }
    });

    if (!isValid && firstInvalidInput) {
      firstInvalidInput.focus();
    }
    return isValid;
  }

  // Navegação por clique no step-indicator (apenas para passos já visitados ou atuais)
  stepIndicatorItems.forEach((item, idx) => {
    item.addEventListener("click", () => {
      if (idx <= currentStep && validateStep(currentStep)) {
        currentStep = idx;
        showStep(currentStep);
      }
    });
  });

  // Botão próximo
  nextBtn.addEventListener("click", () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
        mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

  // Botão anterior
  prevBtn.addEventListener("click", () => {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
      mainContent.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  // Event listener para o botão de submit
  submitBtn.addEventListener("click", async function () {
    if (form.checkValidity()) {
      const formData = new FormData(form);
      const profile = {
        metadados: {
          termos: true,
          data_cadastro: new Date().toISOString(),
          xp: 0,
          conquistas: []
        },
        objetivos: {
          objetivo: formData.get("objetivo"),
          frequencia: formData.get("frequencia"),
          nivel: formData.get("nivel")
        },
        pessoal: {
          nome: formData.get("nome"),
          data_nascimento: formData.get("data_nascimento"),
          genero: formData.get("genero"),
          altura: formData.get("altura"),
          peso: formData.get("peso")
        }
      };

      try {
        const userId = window.auth.getCurrentUserId();
        if (!userId) {
          throw new Error('ID do usuário não encontrado');
        }

        const response = await fetch(`${window.auth.API_URL}/users/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${window.auth.getToken()}`
          },
          body: JSON.stringify({
            userData: {
              ...profile,
              default_trainings: { ids: [] },
              edited_trainings: [],
              notifications: [],
              registered_trainings: []
            }
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao salvar dados do perfil');
        }

        // Redireciona para o dashboard
        window.location.href = "index.html";
      } catch (error) {
        console.error("Erro ao salvar dados do perfil:", error);
        alert("Erro ao salvar cadastro. Verifique o console para mais detalhes.");
      }
    } else {
      console.log("Formulário inválido no último passo. Verifique os campos marcados.");
    }
  });

  // Remove a indicação de erro assim que o usuário corrige o campo
  form.addEventListener("input", function (event) {
    const target = event.target;
    if (
      target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.tagName === "TEXTAREA"
    ) {
      if (target.classList.contains("is-invalid")) {
        if (target.checkValidity()) {
          target.classList.remove("is-invalid");
        }
      }
    }
  });

  // Validação dinâmica para data
  var today = new Date();
  var yyyy = today.getFullYear();
  var mm = String(today.getMonth() + 1).padStart(2, "0");
  var dd = String(today.getDate()).padStart(2, "0");
  var maxDate = yyyy + "-" + mm + "-" + dd;

  var inputData = document.getElementById("data_nascimento");
  if (inputData) {
    inputData.setAttribute("max", maxDate);
  }

  // Inicialização
  showStep(currentStep);

  // Inicializa ícones Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    console.warn("Biblioteca Lucide Icons não encontrada.");
  }
});
