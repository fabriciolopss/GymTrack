document.addEventListener('DOMContentLoaded', function () {
    // Verifica se o usuário já está autenticado
    if (window.auth.isAuthenticated()) {
        window.location.href = 'index.html';
        return;
    }

    // Tab navigation
    const tabButtons = document.querySelectorAll('.tab-button');
    const forms = document.querySelectorAll('.form-content');

    function switchForm(formId) {
        // Update tab buttons
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.form === formId);
        });

        // Update forms
        forms.forEach(form => {
            form.classList.toggle('active', form.id === formId + 'Form');
        });
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            switchForm(button.dataset.form);
        });
    });

    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelector('.carousel-indicators');
    const indicatorDots = document.querySelectorAll('.indicator');
    const prevButton = document.querySelector('.carousel-arrow.prev');
    const nextButton = document.querySelector('.carousel-arrow.next');
    let currentSlide = 0;
    let slideInterval;
    let isAnimating = false;

    function addSlideOutClass(element) {
        if (element) {
            element.classList.add('slide-out');
            // Adiciona classe slide-out para todos os elementos filhos
            element.querySelectorAll('.feature-content, .feature-preview, .preview-container, .preview-form, .form-group, .progress-stats, .stat-card, .calendar-preview, .calendar-day, .routine-preview, .exercise-item, .achievements-preview, .achievement-card').forEach(el => {
                el.classList.add('slide-out');
            });
        }
    }

    function removeSlideOutClass(element) {
        if (element) {
            element.classList.remove('slide-out');
            // Remove classe slide-out de todos os elementos filhos
            element.querySelectorAll('.feature-content, .feature-preview, .preview-container, .preview-form, .form-group, .progress-stats, .stat-card, .calendar-preview, .calendar-day, .routine-preview, .exercise-item, .achievements-preview, .achievement-card').forEach(el => {
                el.classList.remove('slide-out');
            });
        }
    }

    function showSlide(index) {
        if (isAnimating) return;
        isAnimating = true;

        // Esconde os indicadores
        indicators.classList.add('hidden');

        // Remove active class from current slide and add slide-out class
        const currentActiveSlide = document.querySelector('.carousel-slide.active');
        if (currentActiveSlide) {
            addSlideOutClass(currentActiveSlide);
            currentActiveSlide.classList.remove('active');
        }

        // Add active class to new slide
        setTimeout(() => {
            slides.forEach(slide => {
                slide.classList.remove('active');
                removeSlideOutClass(slide);
            });
            indicatorDots.forEach(dot => dot.classList.remove('active'));

            slides[index].classList.add('active');
            indicatorDots[index].classList.add('active');
            currentSlide = index;

            // Mostra os indicadores novamente
            setTimeout(() => {
                indicators.classList.remove('hidden');
                isAnimating = false;
            }, 500);
        }, 500);
    }

    function nextSlide() {
        if (isAnimating) return;
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }

    function prevSlide() {
        if (isAnimating) return;
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }

    // Add click event listeners to indicators
    indicatorDots.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            if (isAnimating || currentSlide === index) return;
            showSlide(index);
            resetInterval();
        });
    });

    // Add click event listeners to navigation arrows
    prevButton.addEventListener('click', () => {
        if (isAnimating) return;
        prevSlide();
        resetInterval();
    });

    nextButton.addEventListener('click', () => {
        if (isAnimating) return;
        nextSlide();
        resetInterval();
    });

    // Function to reset the interval
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(nextSlide, 5000);
    }

    // Start automatic rotation
    resetInterval();

    // Add hover pause functionality
    const carousel = document.querySelector('.feature-carousel');
    carousel.addEventListener('mouseenter', () => {
        clearInterval(slideInterval);
    });

    carousel.addEventListener('mouseleave', () => {
        resetInterval();
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (isAnimating) return;
        if (e.key === 'ArrowLeft') {
            prevSlide();
            resetInterval();
        } else if (e.key === 'ArrowRight') {
            nextSlide();
            resetInterval();
        }
    });

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');

    // Função para mostrar mensagens de erro
    function showError(message, form) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.color = '#e74c3c';
        errorDiv.style.marginTop = '10px';
        errorDiv.style.textAlign = 'center';

        // Remove mensagens de erro anteriores
        const existingError = form.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        form.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Função para mostrar mensagens de sucesso
    function showSuccess(message, form) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.color = '#2ecc71';
        successDiv.style.marginTop = '10px';
        successDiv.style.textAlign = 'center';

        // Remove mensagens de sucesso anteriores
        const existingSuccess = form.querySelector('.success-message');
        if (existingSuccess) {
            existingSuccess.remove();
        }

        form.appendChild(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    // Função para mostrar loading no botão
    function setButtonLoading(button) {
        const originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        return originalText;
    }

    // Função para mostrar sucesso no botão
    function setButtonSuccess(button) {
        button.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            button.disabled = false;
        }, 1000);
    }

    // Função para restaurar o botão ao estado original
    function resetButton(button, originalText) {
        button.disabled = false;
        button.innerHTML = originalText;
    }

    // Event listener para o formulário de login
    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = setButtonLoading(submitButton);

        try {
            await window.auth.login(email, password);
            setButtonSuccess(submitButton);
            showSuccess('Login realizado com sucesso!', loginForm);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            resetButton(submitButton, originalButtonText);
            showError(error.message, loginForm);
        }
    });

    // Event listener para o formulário de registro
    registerForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const submitButton = registerForm.querySelector('button[type="submit"]');
        const originalButtonText = setButtonLoading(submitButton);

        if (password !== confirmPassword) {
            resetButton(submitButton, originalButtonText);
            showError('As senhas não coincidem', registerForm);
            return;
        }

        try {
            await window.auth.register(email, password);
            setButtonSuccess(submitButton);
            showSuccess('Cadastro realizado com sucesso!', registerForm);
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } catch (error) {
            resetButton(submitButton, originalButtonText);
            showError(error.message, registerForm);
        }
    });

    // Event listeners para alternar entre login e registro
    showRegisterLink.addEventListener('click', function (e) {
        e.preventDefault();
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    });

    showLoginLink.addEventListener('click', function (e) {
        e.preventDefault();
        registerForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
});