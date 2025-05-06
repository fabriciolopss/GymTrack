export function showToast({
  message,
  background = "text-bg-primary",
  delay = 3000,
}) {
  const container = document.getElementById("toast-container");
  const template = document.getElementById("toast-template");

  if (!container || !template) return;

  const toastClone = template.cloneNode(true);
  toastClone.classList.remove("d-none");
  toastClone.classList.add(background, "show");

  // Atualiza a mensagem
  toastClone.querySelector(".toast-body").textContent = message;

  // Adiciona ao container
  container.appendChild(toastClone);

  // Cria e exibe o toast
  const toast = new bootstrap.Toast(toastClone, { delay });
  toast.show();

  // Remove ao esconder
  toastClone.addEventListener("hidden.bs.toast", () => {
    toastClone.remove();
  });
}
