import ApiService from './services/api.js';

document.addEventListener("DOMContentLoaded", async function () {


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
          experiencia_previa: formData.get("experiencia_previa"),
          frequencia_semanal: formData.get("frequencia_semanal"),
          objetivo_principal: formData.get("objetivo_principal"),
          tipo_treino: formData.get("tipo_treino")
        },
        pessoal: {
          nome: formData.get("nome_completo"),
          data_nascimento: formData.get("data_nascimento"),
          genero: formData.get("genero"),
          altura: formData.get("altura_cm"),
          peso: formData.get("peso_kg"),
          telefone: formData.get("telefone"),
          email: formData.get("email")
        }
      };

      try {
        // Mostra loading
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Salvando...
        `;

        // Salva os dados usando o ApiService
        await ApiService.updateUserData({ profile });

        // Mostra tela de confirmação
        mainContent.style.display = "none";
        confirmationScreen.style.display = "block";
        confirmationScreen.scrollIntoView({ behavior: "smooth", block: "start" });

        // Redireciona para o dashboard após 3 segundos
        setTimeout(() => {
          window.location.href = "perfil.html";
        }, 3000);
      } catch (error) {
        console.error("Erro ao salvar dados do perfil:", error);
        alert("Erro ao salvar cadastro. Por favor, tente novamente.");
        
        // Restaura o botão
        submitBtn.disabled = false;
        submitBtn.textContent = "Finalizar Cadastro";
      }
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
