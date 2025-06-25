import ApiService from './services/api.js';
import { createNotification } from "./notifications.js";
import { showToast } from "./utils/toast.js";

lucide.createIcons();

document.addEventListener("DOMContentLoaded", function () {
  new LayoutManager();
  new Registration();
});

class Registration {
    constructor() {
        this.sections = {
            'treino-feito-content': {
                button: document.getElementById('treino-feito'),
                content: document.getElementById('treino-feito-content'),
            },
            'fazer-treino-content': {
                button: document.getElementById('fazer-treino'),
                content: document.getElementById('fazer-treino-content'),
            }
        };

        this.selectedSection = 'treino-feito-content';
        this.gymData = {};
        this.setupListeners();
        this.initializeForm();
    }

    async initializeForm() {
        try {
            const userData = await ApiService.getUserData();
            this.gymData = userData || {};
            console.log(userData);
            this.setupFormEventListeners();
            // Inicializar a barra de progresso do nível
            await this.initializeLevelBar();
        } catch (error) {
            console.error('Erro ao inicializar formulário:', error);
            this.gymData = {};
        }
    }

    async initializeLevelBar() {
        try {
            const xp = this.gymData.profile?.xp || 0;
            console.log('XP do usuário:', xp);
            console.log('Dados do usuário:', this.gymData);
            
            const { nivel, xpNivelAtual, xpProxNivel, xpParaProximoNivel } = this.calcularNivel(xp);
            const progressoAtual = ((xp - xpNivelAtual) / xpParaProximoNivel) * 100;
            
            console.log('Cálculo de nível:', { nivel, xpNivelAtual, xpProxNivel, xpParaProximoNivel, progressoAtual });
            
            const nivelSpan = document.querySelector("#level");
            const realBar = document.querySelector(".real-progress-bar");
            const xpLowLimit = document.querySelector("#xp-low-limit");
            const xpHighLimit = document.querySelector("#xp-high-limit");
            const xpGain = document.querySelector("#xp-gain");
            const porcentagemSpan = document.querySelector("#xp-porcentagem");
            
            console.log('Elementos DOM encontrados:', { nivelSpan, realBar, xpLowLimit, xpHighLimit, xpGain, porcentagemSpan });
            
            if (nivelSpan) nivelSpan.textContent = `Nível ${nivel}`;
            if (xpLowLimit) xpLowLimit.textContent = `${xpNivelAtual} XP`;
            if (xpHighLimit) xpHighLimit.textContent = `${xpProxNivel} XP`;
            if (xpGain) xpGain.textContent = `+0 XP`;
            if (realBar) realBar.style.width = `${progressoAtual}%`;
            if (porcentagemSpan) porcentagemSpan.textContent = `${Math.floor(progressoAtual)}%`;
        } catch (error) {
            console.error('Erro ao inicializar barra de nível:', error);
        }
    }

    calcularNivel(xp, fator = 50, expoente = 1.4) {
        let totalXp = 0;
        let nivel = 1;

        while (xp >= totalXp + this.xpParaNivel(nivel, fator, expoente)) {
            totalXp += this.xpParaNivel(nivel, fator, expoente);
            nivel++;
        }

        const xpNivelAtual = totalXp;
        const xpProxNivel = totalXp + this.xpParaNivel(nivel, fator, expoente);
        const xpParaProximoNivel = xpProxNivel - xpNivelAtual;

        return { nivel, xpNivelAtual, xpProxNivel, xpParaProximoNivel };
    }

    xpParaNivel(nivel, fator = 50, expoente = 1.5) {
        return Math.floor(fator * Math.pow(nivel, expoente));
    }

    setupFormEventListeners() {
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
                trainingDaysSelected.disabled = false;
                selectedPlan.days.forEach((day, index) => {
                    const option = document.createElement("option");
                    option.value = index;
                    option.textContent = day.name;
                    trainingDaysSelected.appendChild(option);
                });
                // Atualizar barra com XP base do primeiro dia
                this.atualizarBarraXP(selectedPlan.days[0].xp);
            }
        });

        trainingDaysSelected.addEventListener("change", () => {
            const selectedDay = trainingDaysSelected.value;
            const selectedPlan = this.gymData.edited_trainings?.find(
                (plan) => plan.id == trainingPlansSelected.value
            );
            const day = selectedPlan.days[selectedDay];

            if (day) {
                this.atualizarBarraXP(day.xp);
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
            const selectedDay = selectedPlan?.days[submitDayTrainedId];
            const xpGanho = this.calcularXpPorTipoETempo(selectedPlan.type, hours, minutes);

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
                
                await ApiService.updateUserData({ ...this.gymData });

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

        const newXP = this.calcularXpPorTipoETempo(selectedPlan.type, hours, minutes);
        this.atualizarBarraXP(newXP);
    }

    calcularXpPorTipoETempo(tipo, horas, minutos) {
        const xpMultipliers = {
            "Ficha iniciante": 50, 
            "Ficha intermediária": 100, 
            "Ficha avançada": 150, 
        };

        const multiplier = xpMultipliers[tipo] || 10;
        const tempoEmHoras = horas + minutos / 60;
        return Math.round(tempoEmHoras * multiplier);
    }

    atualizarBarraXP(newXP) {
        try {
            const xp = this.gymData.profile?.xp || 0;
            const { xpNivelAtual, xpParaProximoNivel } = this.calcularNivel(xp);
            const progressoFuturo = ((xp - xpNivelAtual + newXP) / xpParaProximoNivel) * 100;
            
            const xpGain = document.querySelector("#xp-gain");
            const futureBar = document.querySelector(".future-progress-bar");
            const porcentagemSpan = document.querySelector("#xp-porcentagem");
            
            if (xpGain) xpGain.textContent = `+${newXP} XP`;
            if (futureBar) futureBar.style.width = `${progressoFuturo}%`;
            if (porcentagemSpan) porcentagemSpan.textContent = `${Math.floor(progressoFuturo)}%`;
        } catch (error) {
            console.error('Erro ao atualizar barra de XP:', error);
        }
    }

    changeToSection(sectionKey) {
        if (this.selectedSection === sectionKey) return; 

        const prev = this.sections[this.selectedSection];
        const next = this.sections[sectionKey];

        prev.content.style.display = 'none';
        prev.button.classList.remove('active');
        if (prev.button.children[0]) prev.button.children[0].classList.remove('active');

        next.content.style.display = 'block';
        next.button.classList.add('active');
        if (next.button.children[0]) next.button.children[0].classList.add('active');

        this.selectedSection = sectionKey;
        console.log(`Switched to: ${sectionKey}`);
    }

    setupListeners() {
        Object.entries(this.sections).forEach(([key, { button }]) => {
            button?.addEventListener('click', () => this.changeToSection(key));
        });
    }
}
