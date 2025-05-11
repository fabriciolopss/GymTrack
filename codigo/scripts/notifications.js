document.addEventListener("DOMContentLoaded", function(){
  const notifications = new Notifications;
})

const NOTIFICATION_ICONS = {
  Creation: "fa-solid fa-square-plus text-success", // Green for creation
  alert: "fa-solid fa-triangle-exclamation text-warning", // Yellow/Orange for alert
  update: "fa-solid fa-pen-to-square text-info", // Blue for update/edit
  message: "fa-solid fa-envelope text-primary", // Standard primary color for message
  error: "fa-solid fa-circle-xmark text-danger", // Red for error
  success: "fa-solid fa-circle-check text-success", // Green for success
  info: "fa-solid fa-circle-info text-secondary", // Grey/Secondary for general info
  default: "fa-solid fa-bell text-primary" // Default icon
};



export function createNotification({ title, description, type }) {
  const notification = {
    title,
    type,
    description,
    dateTime: new Date().toISOString()
  };

  const gymAppData = JSON.parse(localStorage.getItem('gymAppData')) || { notifications: [] };
  gymAppData.notifications.unshift(notification); 
  localStorage.setItem('gymAppData', JSON.stringify(gymAppData));
  
  return notification;
}

class Notifications{

  constructor(){
    this.notifications = this.getNotifications();
    this.notificationButton = document.querySelector('[redirect-session-name="notificacoes"]');
    this.notificationWrapper = document.querySelector('.notification-system-wrapper');
    this.notificationBody = document.querySelector('.notification-system-body');
    this.previousUsedDate;

    this.startNotificationsSystem();
    this.fillNotificationsBody();
    this.notificationsCount();
  }

  getNotifications(){
    const gymAppData = JSON.parse(localStorage.getItem('gymAppData'));
    return gymAppData.notifications;
  }

  countUpToNumber(targetNumber, duration = 1000, element = document.getElementById("notification-count")) {
    const startNumber = 0;
    const startTime = performance.now();
    
    const updateCount = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      const currentNumber = Math.floor(startNumber + (targetNumber - startNumber) * progress);
      if(currentNumber > 9){
        element.innerText = "9+";
        element.classList.remove("bg-primary");
        element.classList.add("bg-danger");
      }else{
        element.innerText = currentNumber;
        element.classList.add("bg-primary");
        element.classList.remove("bg-danger");
      }

      
      if (progress < 1) {
        requestAnimationFrame(updateCount);
      }
    };
    
    requestAnimationFrame(updateCount);
  }

  notificationsCount(){
    const count = document.getElementById("notification-count");
    this.countUpToNumber(this.notifications.length, 1000, count)
  }

  timeAgo(date) {
    const diffMs = new Date() - new Date(date);
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);
  
    if (diffSec < 60) return `${diffSec} segundo${diffSec > 1 ? 's' : ''} atrás`;
    if (diffMin < 60) return `${diffMin} minuto${diffMin > 1 ? 's' : ''} atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
  }

  isToGenerateHeader(notification){
    const formattedNotificationDate = new Date(notification.dateTime).toLocaleDateString('pt-BR');
    const formattedPreviousDate = new Date(this.previousUsedDate).toLocaleDateString('pt-BR');
    return formattedNotificationDate === formattedPreviousDate;
  }

  generateDateHeader(notification){
    if(this.isToGenerateHeader(notification)){
      return null;
    }else{
      const formattedNotificationDate = new Date(notification.dateTime).toLocaleDateString('pt-BR');
      const formattedToday = new Date().toLocaleDateString('pt-BR');

      const dateHeader = document.createElement("div");

      if(formattedNotificationDate === formattedToday){
        return dateHeader.innerHTML = `<div class="notification-date-header">Hoje</div>`;
      }else{
        return dateHeader.innerHTML = `<div class="notification-date-header">${formattedNotificationDate}</div>`;
      }
    }
  }

  fillNotificationsBody(){
    if(this.notifications.length > 0){
      this.notifications.forEach((notification, index) => {
        const dataHeader = this.generateDateHeader(notification);
        if(dataHeader)
          this.notificationBody.innerHTML += dataHeader;
        this.notificationBody.innerHTML += 
          `<div class="d-flex flex-row gap-3 justify-content-between align-items-start notification-item p-3 border-bottom" data-index="${index}">
            <div class="notification-icon">
                <i class="${NOTIFICATION_ICONS[notification.type]} notifications-icons text-primary"></i>
            </div>
            <div class="notification-content flex-grow-1">
              <h6 class="notification-title mb-1">${notification.title}</h6>
              <p class="notification-description text-muted mb-0 small">${notification.description}</p> 
            </div>
            <div class="notification-actions d-flex flex-column align-items-end gap-2" style="min-width: fit-content; ">
              <span class="notification-dateTime small text-muted">${this.timeAgo(notification.dateTime)}</span>
              <button class="btn btn-sm btn-outline-danger delete-notification" data-index="${index}">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </div>`;

        this.previousUsedDate = new Date(notification.dateTime).toISOString();
      });
      this.bindDeleteButtons();
    }else{
      this.notificationBody.innerHTML = 
        `<div class="text-center p-3 text-muted">Sem notificações recentes</div>`;
    }
  }

  bindDeleteButtons() {
    document.querySelectorAll('.delete-notification').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.currentTarget.dataset.index);
        this.notifications.splice(index, 1);
        const gymAppData = JSON.parse(localStorage.getItem('gymAppData'));
        gymAppData.notifications = this.notifications;
        localStorage.setItem('gymAppData', JSON.stringify(gymAppData));
        this.notificationBody.innerHTML = '';
        this.previousUsedDate = null;
        this.fillNotificationsBody();
      });
    });
  }

  startNotificationsSystem(){
    document.addEventListener('click', (event) => {
      if (!this.notificationWrapper.contains(event.target) && !this.notificationButton.contains(event.target)) {
        this.notificationWrapper.classList.remove('show');
      }
    });

    this.notificationButton.addEventListener('click', () => {
      this.notificationWrapper.classList.toggle('show');
    });
  }
}


