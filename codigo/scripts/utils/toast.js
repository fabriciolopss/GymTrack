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


export function showAlert(message, type) {
  let color, icon;
  
  switch (type){
    case "error" :
      color = 'bg-danger';
      icon = 'circle-x';
      break;
    default:
      color = 'bg-success';
      icon = 'check-circle';
      break;
  }
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white ${color} border-0 position-fixed top-0 end-0 m-3`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i data-lucide="${icon}" class="me-2"></i>${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  
  document.body.appendChild(toast);
  const bsToast = new bootstrap.Toast(toast);
  bsToast.show();
  
  toast.addEventListener('hidden.bs.toast', () => {
    document.body.removeChild(toast);
  });
  
  lucide.createIcons();
}