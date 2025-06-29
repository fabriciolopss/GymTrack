import ApiService from './services/api.js';
import { createNotification } from "./notifications.js";
import { showAlert } from "./utils/toast.js";

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
        
        // Definir a aba inicial como ativa
        this.sections[this.selectedSection].content.classList.add('active');
        this.sections[this.selectedSection].button.classList.add('active');
        if (this.sections[this.selectedSection].button.children[0]) {
            this.sections[this.selectedSection].button.children[0].classList.add('active');
        }
    }

    async initializeForm() {
        try {
            const userData = await ApiService.getUserData();
            this.gymData = userData || {};
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
            
            const { nivel, xpNivelAtual, xpProxNivel, xpParaProximoNivel } = this.calcularNivel(xp);
            const progressoAtual = ((xp - xpNivelAtual) / xpParaProximoNivel) * 100;
                        
            const nivelSpan = document.querySelector("#level");
            const realBar = document.querySelector(".real-progress-bar");
            const xpLowLimit = document.querySelector("#xp-low-limit");
            const xpHighLimit = document.querySelector("#xp-high-limit");
            const xpGain = document.querySelector("#xp-gain");
            const porcentagemSpan = document.querySelector("#xp-porcentagem");
                        
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
            let xpGanho;
            try{
                if(submitPlanId === "Selecionar o plano de treino realizado") throw new Error("Selecione um plano de treino antes")
                if(submitDate === "") throw new Error("Data não pode estar vazia");
                xpGanho = this.calcularXpPorTipoETempo(selectedPlan.type, hours, minutes);
                

                const novoCheckin = {
                    training_id: parseInt(submitPlanId),
                    day_index: parseInt(submitDayTrainedId),
                    date: submitDate,
                    xpGain: xpGanho,
                    duration: { hours, minutes },
                };
                this.gymData.profile.xp = (this.gymData.profile.xp || 0) + xpGanho;
                this.gymData.registered_trainings = this.gymData.registered_trainings || [];
                this.gymData.registered_trainings.push(novoCheckin);
                
                await ApiService.updateUserData({ ...this.gymData });

                showAlert("Treino registrado com sucesso", 'success');

                await createNotification({
                    title: "Treino registrado com sucesso!", 
                    description: `O dia de ${selectedDay.name} da ficha ${selectedPlan.name}`,
                    type: "Creation"
                });

                this.initializeLevelBar();

                // Reset form
                form.reset();
                dateCheckin.value = new Date().toISOString().split("T")[0];
            }catch(error){
                showAlert(`Erro ao registrar o treino: ${error.message}` , "error");
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

        // Adicionar animação de fade out na aba atual
        prev.content.classList.add('fade-out');
        prev.button.classList.remove('active');
        if (prev.button.children[0]) prev.button.children[0].classList.remove('active');

        // Após a animação de fade out, esconder e mostrar a nova aba
        setTimeout(() => {
            prev.content.classList.remove('active', 'fade-out');
            prev.content.style.display = 'none';
            
            next.content.style.display = 'block';
            next.content.classList.add('active');
            next.button.classList.add('active');
            if (next.button.children[0]) next.button.children[0].classList.add('active');
            
            this.selectedSection = sectionKey;
        }, 200); // Metade do tempo da transição CSS
    }

    setupListeners() {
        Object.entries(this.sections).forEach(([key, { button }]) => {
            button?.addEventListener('click', () => this.changeToSection(key));
        });
    }
}

class RunningTraining{
    constructor(selectedTrainingDay){
        this.trainingDay = selectedTrainingDay;
        this.currentExercise = 0;
        this.currentSeries = 1; // Começa na série 1
        this.isRelaxingTime = false;
        this.playPauseButton = document.getElementById('button-playpause');
        this.forwardButton = document.getElementById('button-forward');
        this.timeDisplay = document.getElementById('time-display');
        this.ticks = document.querySelectorAll('.tick');
        this.timerType = document.getElementById('type-display')
        this.interval = null;
        this.tickInterval = null;
        this.timerPaused = true;
        this.timeLeft = 0;
        this.timePassed = 0;
        this.totalTicks = 60;
        this.tickIndex = 0;
        this.trainingTime = [];
        this.nextExercise();
        this.setupListeners();
        this.updatePlayPauseIcon();
    }

    nextExercise(){
        if (this.currentExercise >= this.trainingDay.day.length) {
            this.finishTraining();
            return;
        }
        this.currentSeries = 1; // Reset série para novo exercício
        this.isRelaxingTime = false; // Começa com exercício
        const exerciseTitle = document.getElementById('current-exercise');
        const repetitions = document.getElementById('current-repetitions');
        const seriesInfo = document.getElementById('series-info');
        const exercise = this.trainingDay.day[this.currentExercise];
        exerciseTitle.innerText = exercise.exercise;
        repetitions.innerText = `${exercise.series} x ${exercise.repetitions}`;
        seriesInfo.innerText = `Série ${this.currentSeries}/${exercise.series}`;
        this.timerType.innerText = "fazendo o exercício";
        this.startStopwatch(); // Começa com cronômetro para exercício
    }

    setupListeners(){
        this.playPauseButton.addEventListener('click', () => {
            if (this.timerPaused) {
                if (this.isRelaxingTime) {
                    this.resumeTimer();
                } else {
                    this.resumeStopwatch();
                }
            } else {
                if (this.isRelaxingTime) {
                    this.pauseTimer();
                } else {
                    this.pauseStopwatch();
                }
            }
            this.updatePlayPauseIcon();
        });
        this.forwardButton.addEventListener('click', () => {
            this.nextSeries();
        });
    }

    nextSeries() {
        const exercise = this.trainingDay.day[this.currentExercise];
        
        if (this.isRelaxingTime) {
            // Estava no descanso, vai para próxima série ou próximo exercício
            const tempoUsado =  parseInt(this.trainingDay.day[this.currentExercise].descanso.split(" ")[0]) - this.parseTime(document.getElementById('time-display').innerText);
            this.trainingTime.push(tempoUsado);
            
            this.currentSeries++;
            if (this.currentSeries > exercise.series) {
                // Terminou todas as séries deste exercício
                this.currentExercise++;
                this.nextExercise();
            } else {
                // Próxima série do mesmo exercício
                this.isRelaxingTime = false;
                const exerciseTitle = document.getElementById('current-exercise');
                const seriesInfo = document.getElementById('series-info');
                exerciseTitle.innerText = exercise.exercise;
                seriesInfo.innerText = `Série ${this.currentSeries}/${exercise.series}`;
                this.timerType.innerText = "fazendo o exercício";
                this.startStopwatch();
            }
        } else {
            // Estava no exercício, vai para descanso
            const tempoUsado = this.parseTime(document.getElementById('time-display').innerText);
            this.trainingTime.push(tempoUsado);
            
            this.isRelaxingTime = true;
            this.timerType.innerText = "restante de descanso";
            this.startCountdown();
        }
        
        this.updatePlayPauseIcon();
    }

    updatePlayPauseIcon() {
        if (this.timerPaused) {
            this.playPauseButton.classList.remove('fa-pause');
            this.playPauseButton.classList.add('fa-play');
        } else {
            this.playPauseButton.classList.remove('fa-play');
            this.playPauseButton.classList.add('fa-pause');
        }
    }

    formatTime(seconds) {
        const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
        const secs = String(seconds % 60).padStart(2, '0');
        return `${mins}:${secs}`;
    }

    parseTime(timeStr) {
        const [mins, secs] = timeStr.split(':').map(Number);
        return mins * 60 + secs;
    }

    resetTicks() {
        this.ticks.forEach(t => t.classList.remove('active'));
    }

    // Timer decrescente para descanso
    startCountdown() {
        const exercise = this.trainingDay.day[this.currentExercise];
        const descanso = parseInt(exercise.descanso.split(" ")[0]);
        this.timeLeft = descanso;
        this.tickIndex = 0;
        this.resetTicks();
        clearInterval(this.interval);
        clearInterval(this.tickInterval);
        this.timerPaused = false;
        this.timeDisplay.textContent = this.formatTime(this.timeLeft);
        this.interval = setInterval(() => {
            if (!this.timerPaused) {
                this.timeLeft--;
                this.timeDisplay.textContent = this.formatTime(this.timeLeft);
                if (this.timeLeft <= 0) {
                    clearInterval(this.interval);
                    clearInterval(this.tickInterval);
                }
            }
        }, 1000);
        const tickStep = this.timeLeft * 1000 / this.totalTicks;
        this.tickInterval = setInterval(() => {
            if (!this.timerPaused) {
                if (this.tickIndex >= this.totalTicks) {
                    clearInterval(this.tickInterval);
                    return;
                }
                this.ticks[this.tickIndex].classList.add('active');
                this.tickIndex++;
            }
        }, tickStep);
    }

    pauseTimer() {
        this.timerPaused = true;
    }

    resumeTimer() {
        if (this.interval === null || this.tickInterval === null) {
            this.startCountdown();
        }
        this.timerPaused = false;
    }

    // Timer crescente para exercício
    startStopwatch() {
        this.timePassed = 0;
        this.tickIndex = 0;
        this.resetTicks();
        clearInterval(this.interval);
        clearInterval(this.tickInterval);
        this.timerPaused = false;
        this.timeDisplay.textContent = this.formatTime(0);
        this.interval = setInterval(() => {
            if (!this.timerPaused) {
                this.timePassed++;
                this.timeDisplay.textContent = this.formatTime(this.timePassed);
                if (this.timePassed % 60 === 0) {
                    this.resetTicks();
                    this.tickIndex = 0;
                }
            }
        }, 1000);
        this.tickInterval = setInterval(() => {
            if (!this.timerPaused) {
                if (this.tickIndex < this.totalTicks) {
                    this.ticks[this.tickIndex].classList.add('active');
                    this.tickIndex++;
                }
            }
        }, 1000);
    }

    pauseStopwatch() {
        this.timerPaused = true;
    }

    resumeStopwatch() {
        if (this.interval === null || this.tickInterval === null) {
            this.startStopwatch();
        }
        this.timerPaused = false;
    }

    finishTraining() {
        clearInterval(this.interval);
        clearInterval(this.tickInterval);
        this.showTrainingSummary();
    }

    showTrainingSummary() {
        const fazerTreinoContent = document.getElementById('fazer-treino-content');
        const totalTime = this.trainingTime.reduce((sum, time) => sum + time, 0);
        
        const summaryHTML = `
            <div class="training-summary">
                <h3>Treino Concluído!</h3>
                <div class="mb-3">
                    <label for="training-name" class="form-label">Nome do Treino</label>
                    <input type="text" class="form-control" id="training-name" placeholder="Ex: Treino A - Peito e Tríceps">
                </div>
                <div class="summary-stats">
                    <div class="stat-item">
                        <span class="stat-label">Tempo Total:</span>
                        <span class="stat-value">${this.formatTime(totalTime)}</span>
                    </div>
                    <div class="stat-item">
                        <span class="stat-label">Exercícios:</span>
                        <span class="stat-value">${this.trainingDay.day.length}</span>
                    </div>
                </div>

                <div class="summary-actions">
                    <button class="btn btn-primary" id="save-training-btn">Salvar Treino</button>
                    <button class="btn btn-secondary" id="restart-training-btn">Fazer Novamente</button>
                </div>
                
                <!-- Gráficos -->
                <div class="training-charts">
                    <h5>Análise de Performance</h5>
                    <div class="charts-container">
                        <div class="chart-item">
                            <h6>Tempo por Série</h6>
                            <canvas id="performanceChart"></canvas>
                        </div>
                        <div class="chart-item">
                            <h6>Exercício vs Descanso</h6>
                            <canvas id="comparisonChart"></canvas>
                        </div>
                        <div class="chart-item">
                            <h6>Distribuição do Tempo</h6>
                            <canvas id="distributionChart"></canvas>
                        </div>
                        <div class="chart-item">
                            <h6>Progressão por Exercício</h6>
                            <canvas id="progressionChart"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="training-timeline">
                    <h5>Timeline do Treino</h5>
                    <div class="timeline-table">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Exercício</th>
                                    <th>Série</th>
                                    <th>Tempo de Exercício</th>
                                    <th>Tempo de Descanso</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.generateTimelineRows()}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        `;
        
        fazerTreinoContent.innerHTML = summaryHTML;
        
        // Adicionar event listeners após criar o HTML
        document.getElementById('save-training-btn').addEventListener('click', () => this.saveTraining());
        document.getElementById('restart-training-btn').addEventListener('click', () => this.restartTraining());
        
        // Renderizar gráficos após criar o HTML
        this.renderCharts();
    }

    renderCharts() {
        this.renderPerformanceChart();
        this.renderComparisonChart();
        this.renderDistributionChart();
        this.renderProgressionChart();
    }

    renderPerformanceChart() {
        const ctx = document.getElementById('performanceChart').getContext('2d');
        const chartData = this.getPerformanceChartData();
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Tempo de Exercício (segundos)',
                    data: chartData.exerciseTimes,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Tempo de Descanso (segundos)',
                    data: chartData.restTimes,
                    borderColor: '#FF9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Performance por Série'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tempo (segundos)'
                        }
                    }
                }
            }
        });
    }

    renderComparisonChart() {
        const ctx = document.getElementById('comparisonChart').getContext('2d');
        const chartData = this.getComparisonChartData();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Tempo de Exercício',
                    data: chartData.exerciseData,
                    backgroundColor: '#4CAF50'
                }, {
                    label: 'Tempo de Descanso',
                    data: chartData.restData,
                    backgroundColor: '#FF9800'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Comparação Exercício vs Descanso'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tempo (segundos)'
                        }
                    }
                }
            }
        });
    }

    renderDistributionChart() {
        const ctx = document.getElementById('distributionChart').getContext('2d');
        const chartData = this.getDistributionChartData();
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartData.labels,
                datasets: [{
                    data: chartData.data,
                    backgroundColor: [
                        '#4CAF50',
                        '#FF9800',
                        '#2196F3',
                        '#9C27B0',
                        '#F44336'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição do Tempo Total'
                    },
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    renderProgressionChart() {
        const ctx = document.getElementById('progressionChart').getContext('2d');
        const chartData = this.getProgressionChartData();
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Tempo Médio por Exercício',
                    data: chartData.data,
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    pointBackgroundColor: '#4CAF50'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Progressão por Exercício'
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Tempo (segundos)'
                        }
                    }
                }
            }
        });
    }

    getPerformanceChartData() {
        const labels = [];
        const exerciseTimes = [];
        const restTimes = [];
        let timeIndex = 0;
        let seriesCount = 1;
        
        for (let i = 0; i < this.trainingDay.day.length; i++) {
            const exercise = this.trainingDay.day[i];
            
            for (let serie = 1; serie <= exercise.series; serie++) {
                labels.push(`S${seriesCount}`);
                exerciseTimes.push(this.trainingTime[timeIndex] || 0);
                restTimes.push(this.trainingTime[timeIndex + 1] || 0);
                timeIndex += 2;
                seriesCount++;
            }
        }
        
        return { labels, exerciseTimes, restTimes };
    }

    getComparisonChartData() {
        const labels = [];
        const exerciseData = [];
        const restData = [];
        let timeIndex = 0;
        
        for (let i = 0; i < this.trainingDay.day.length; i++) {
            const exercise = this.trainingDay.day[i];
            
            for (let serie = 1; serie <= exercise.series; serie++) {
                labels.push(`${exercise.exercise} S${serie}`);
                exerciseData.push(this.trainingTime[timeIndex] || 0);
                restData.push(this.trainingTime[timeIndex + 1] || 0);
                timeIndex += 2;
            }
        }
        
        return { labels, exerciseData, restData };
    }

    getDistributionChartData() {
        const totalExerciseTime = this.trainingTime.filter((_, index) => index % 2 === 0).reduce((sum, time) => sum + time, 0);
        const totalRestTime = this.trainingTime.filter((_, index) => index % 2 === 1).reduce((sum, time) => sum + time, 0);
        
        return {
            labels: ['Tempo de Exercício', 'Tempo de Descanso'],
            data: [totalExerciseTime, totalRestTime]
        };
    }

    getProgressionChartData() {
        const labels = [];
        const data = [];
        let timeIndex = 0;
        
        for (let i = 0; i < this.trainingDay.day.length; i++) {
            const exercise = this.trainingDay.day[i];
            labels.push(exercise.exercise);
            
            let exerciseTotalTime = 0;
            for (let serie = 1; serie <= exercise.series; serie++) {
                exerciseTotalTime += this.trainingTime[timeIndex] || 0;
                timeIndex += 2;
            }
            
            data.push(exerciseTotalTime / exercise.series); // Tempo médio por série
        }
        
        return { labels, data };
    }

    generateTimelineRows() {
        let rows = '';
        let timeIndex = 0;
        
        for (let i = 0; i < this.trainingDay.day.length; i++) {
            const exercise = this.trainingDay.day[i];
            
            for (let serie = 1; serie <= exercise.series; serie++) {
                const exerciseTime = this.trainingTime[timeIndex] || 0;
                const restTime = this.trainingTime[timeIndex + 1] || 0;
                
                rows += `
                    <tr>
                        <td>${exercise.exercise}</td>
                        <td>${serie}/${exercise.series}</td>
                        <td>${this.formatTime(exerciseTime)}</td>
                        <td>${this.formatTime(restTime)}</td>
                    </tr>
                `;
                timeIndex += 2;
            }
        }
        
        return rows;
    }

    async saveTraining() {
        const trainingName = document.getElementById('training-name').value;
        if (!trainingName.trim()) {
            alert('Por favor, insira um nome para o treino.');
            return;
        }
        
        try {
            // Buscar dados do usuário
            const userData = await ApiService.getUserData();
            const totalTime = this.trainingTime.reduce((sum, time) => sum + time, 0);
            const totalMinutes = Math.floor(totalTime / 60);
            const totalHours = Math.floor(totalMinutes / 60);
            const remainingMinutes = totalMinutes % 60;
            
            // Calcular XP baseado no tempo total (usando a mesma lógica do treino feito)
            const xpGanho = this.calcularXpPorTipoETempo("Ficha intermediária", totalHours, remainingMinutes);
            
            // Criar objeto do treino para salvar
            const novoCheckin = {
                training_id: this.trainingDay.id || 1, // ID do treino atual
                day_index: 0, // Índice do dia treinado
                date: new Date().toISOString().split("T")[0],
                xpGain: xpGanho,
                duration: { 
                    hours: totalHours, 
                    minutes: remainingMinutes 
                },
                // Dados específicos do treino em tempo real
                realTimeData: {
                    name: trainingName,
                    totalTime: totalTime,
                    exercises: this.trainingDay.day.length,
                    timeline: this.generateTimelineData(),
                    trainingTimes: this.trainingTime,
                    date: new Date().toISOString()
                }
            };
            
            // Atualizar dados do usuário
            userData.profile.xp = (userData.profile.xp || 0) + xpGanho;
            userData.registered_trainings = userData.registered_trainings || [];
            userData.registered_trainings.push(novoCheckin);
            
            await ApiService.updateUserData({ ...userData });
            
            // Mostrar notificação de sucesso
            showToast({
                message: "Treino salvo com sucesso!",
                background: "text-bg-success",
                delay: 4000,
            });
            
            // Criar notificação
            await createNotification({
                title: "Treino em Tempo Real Concluído!", 
                description: `${trainingName} - ${this.formatTime(totalTime)} de treino`,
                type: "Creation"
            });
            
            // Redirecionar ou mostrar mensagem de sucesso
            alert('Treino salvo com sucesso! Você será redirecionado.');
            window.location.href = '../index.html';
            
        } catch (error) {
            console.error('Erro ao salvar treino:', error);
            showToast({
                message: "Erro ao salvar treino. Tente novamente.",
                background: "text-bg-danger",
                delay: 4000,
            });
        }
    }

    generateTimelineData() {
        const timeline = [];
        let timeIndex = 0;
        
        for (let i = 0; i < this.trainingDay.day.length; i++) {
            const exercise = this.trainingDay.day[i];
            const exerciseSeries = [];
            
            for (let serie = 1; serie <= exercise.series; serie++) {
                const exerciseTime = this.trainingTime[timeIndex] || 0;
                const restTime = this.trainingTime[timeIndex + 1] || 0;
                
                exerciseSeries.push({
                    serie: serie,
                    exerciseTime: exerciseTime,
                    restTime: restTime
                });
                timeIndex += 2;
            }
            
            timeline.push({
                exercise: exercise.exercise,
                series: exercise.series,
                repetitions: exercise.repetitions,
                seriesData: exerciseSeries
            });
        }
        
        return timeline;
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

    restartTraining() {
        location.reload();
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    const trainingPlansFazer = document.getElementById('training-plans-fazer');
    const trainingDaysFazer = document.getElementById('training-days-fazer');
    const startTraining = document.getElementById('start-training');

    let userData = {};
    try {
        userData = await ApiService.getUserData();
    } catch (e) {
        console.error('Erro ao buscar dados do usuário para fazer-treino:', e);
    }

    startTraining.addEventListener('click', function() {
        new RunningTraining(userData.edited_trainings[trainingPlansFazer.value - 1].days[trainingDaysFazer.value])
    })

    if (trainingPlansFazer && trainingDaysFazer) {
        // Limpar opções
        trainingPlansFazer.innerHTML = '<option selected>Selecionar o plano de treino realizado</option>';
        trainingDaysFazer.innerHTML = '<option selected>Selecionar dia do treino realizado</option>';
        trainingDaysFazer.disabled = true;
        // Buscar planos da API
        const plans = userData?.edited_trainings || [];
        plans.forEach(plan => {
            const option = document.createElement('option');
            option.value = plan.id;
            option.textContent = plan.name;
            trainingPlansFazer.appendChild(option);
        });
        // Listener para popular dias
        trainingPlansFazer.addEventListener('change', function () {
            const selectedPlan = plans.find(plan => plan.id == trainingPlansFazer.value);
            trainingDaysFazer.innerHTML = '';
            if (selectedPlan) {
                trainingDaysFazer.disabled = false;
                selectedPlan.days.forEach((day, idx) => {
                    const option = document.createElement('option');
                    option.value = idx;
                    option.textContent = day.name;
                    trainingDaysFazer.appendChild(option);
                });
                startTraining.disabled = false;
                startTraining.classList.remove('disabled');
            } else {
                trainingDaysFazer.disabled = true;
                trainingDaysFazer.innerHTML = '<option selected>Selecionar dia do treino realizado</option>';
            }
        });
    }
});

const circle = document.getElementById('circle');
const timeDisplay = document.getElementById('time-display');
const totalTicks = 60;
const ticks = [];

// Create 60 ticks evenly spaced in a circle
for (let i = 0; i < totalTicks; i++) {
  const tick = document.createElement('div');
  tick.classList.add('tick');
  const angle = i * (360 / totalTicks);
  tick.style.transform = `rotate(${angle}deg) translateY(-115px)`;
  circle.appendChild(tick);
  ticks.push(tick);
}

let interval, tickInterval;

function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }

function startTimer(seconds) {
  let timeLeft = seconds;
  const totalTime = seconds;
  let tickIndex = 0;

  // Reset all ticks
  ticks.forEach(t => t.classList.remove('active'));

  // Clear any previous timers
  clearInterval(interval);
  clearInterval(tickInterval);

  // Start timer display
  interval = setInterval(() => {
    timeLeft--;
    const mins = String(Math.floor(timeLeft / 60)).padStart(2, '0');
    const secs = String(timeLeft % 60).padStart(2, '0');
    timeDisplay.textContent = `${mins}:${secs}`;

    if (timeLeft <= 0){
        clearInterval(interval);
        playTime
    } 
  }, 1000);

  // Start tick animation – evenly spread over total duration
  const tickStep = totalTime * 1000 / totalTicks; // in ms
  tickInterval = setInterval(() => {
    if (tickIndex >= totalTicks) {
      clearInterval(tickInterval);
      return;
    }
    ticks[tickIndex].classList.add('active');
    tickIndex++;
  }, tickStep);

  // Initial time display
  const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
  const secs = String(seconds % 60).padStart(2, '0');
  timeDisplay.textContent = `${mins}:${secs}`;
}

function stopAll() {
    clearInterval(interval);
    clearInterval(tickInterval);
}

function resetTicks() {
ticks.forEach(t => t.classList.remove('active'));
}

function startStopwatch() {
    stopAll();
    resetTicks();

    let timePassed = 0;
    let tickIndex = 0;

    timeDisplay.textContent = formatTime(0);

    interval = setInterval(() => {
        timePassed++;
        timeDisplay.textContent = formatTime(timePassed);

        // A cada 60 segundos (1 minuto), resetar os ticks
        if (timePassed % 60 === 0) {
        resetTicks();
        tickIndex = 0;
        }
    }, 1000);

    tickInterval = setInterval(() => {
        if (tickIndex < totalTicks) {
        ticks[tickIndex].classList.add('active');
        tickIndex++;
        }
    }, 1000); // 1 por segundo
}