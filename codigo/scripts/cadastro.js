document.addEventListener("DOMContentLoaded", function () {
  // --- VERIFICAÇÃO INICIAL: O usuário já está cadastrado? ---
  try {
    const existingAppData =
      JSON.parse(localStorage.getItem("gymAppData")) || {};
    if (
      existingAppData.profile &&
      existingAppData.profile.meta &&
      existingAppData.profile.meta.data_cadastro
    ) {
      console.log("Usuário já cadastrado. Redirecionando para o dashboard...");
      window.location.href = "index.html";
      return;
    }
  } catch (error) {
    console.error("Erro ao verificar dados existentes no localStorage:", error);
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

  // SUBMIT: coleta dados organizados, calcula IMC, salva e redireciona
  form.addEventListener("submit", function (e) {
    e.preventDefault();

    if (validateStep(currentStep)) {
      // Coleta os dados do formulário pelos IDs/names
      const altura = parseFloat(
        document.getElementById("altura_cm")?.value || ""
      );
      const peso = parseFloat(document.getElementById("peso_kg")?.value || "");
      const imc =
        altura && peso && altura > 0
          ? (peso / (altura / 100) ** 2).toFixed(1)
          : null;

      const profile = {
        pessoal: {
          nome_completo: document.getElementById("nome_completo")?.value || "",
          data_nascimento:
            document.getElementById("data_nascimento")?.value || "",
          genero: document.getElementById("genero")?.value || "",
          altura_cm: altura,
          peso_kg: peso,
          imc: imc,
          telefone: document.getElementById("telefone")?.value || "",
          email: document.getElementById("email")?.value || "",
        },
        objetivos: {
          objetivo_principal:
            document.getElementById("objetivo_principal")?.value || "",
          frequencia_semanal:
            document.getElementById("frequencia_semanal")?.value || "",
          experiencia_previa:
            document.getElementById("experiencia_previa")?.value || "",
          tipo_treino: document.getElementById("tipo_treino")?.value || "",
        },
        metadados: {
          termos: document.getElementById("termos")?.checked || false,
          data_cadastro: new Date().toISOString(),
          xp: 0,
          conquistas: [],
        },
      };

      try {
        let appData = JSON.parse(localStorage.getItem("gymAppData")) || {};
        appData.profile = profile;
        localStorage.setItem("gymAppData", JSON.stringify(appData));
        console.log(
          "Dados do perfil salvos com sucesso em gymAppData:",
          appData
        );

        // Redireciona para o dashboard
        window.location.href = "../index.html";
      } catch (error) {
        console.error("Erro ao salvar dados no gymAppData:", error);
        alert(
          "Erro ao salvar cadastro. Verifique o console para mais detalhes."
        );
      }
    } else {
      console.log(
        "Formulário inválido no último passo. Verifique os campos marcados."
      );
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

  // Inicialização
  showStep(currentStep);

  // Inicializa ícones Lucide
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  } else {
    console.warn("Biblioteca Lucide Icons não encontrada.");
  }
});
