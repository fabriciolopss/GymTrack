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


export function getTimeAgo(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return `há ${diffSec} segundo${diffSec !== 1 ? "s" : ""}`;
  if (diffMin < 60) return `há ${diffMin} minuto${diffMin !== 1 ? "s" : ""}`;
  if (diffHour < 24) return `há ${diffHour} hora${diffHour !== 1 ? "s" : ""}`;
  if (diffDay < 7) return `há ${diffDay} dia${diffDay !== 1 ? "s" : ""}`;
  if (diffWeek < 5) return `há ${diffWeek} semana${diffWeek !== 1 ? "s" : ""}`;
  if (diffMonth < 12) return `há ${diffMonth} mês${diffMonth !== 1 ? "es" : ""}`;
  return `há ${diffYear} ano${diffYear !== 1 ? "s" : ""}`;
}