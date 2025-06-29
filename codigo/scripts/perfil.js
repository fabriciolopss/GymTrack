import ApiService from './services/api.js';

lucide.createIcons();

document.addEventListener("DOMContentLoaded", function () {
  new LayoutManager();
});

class ProfileManager {
  constructor() {
    this.initializeElements();
    this.initializeEventListeners();
    this.currentProfile = null;
    this.initializeProfile();
  }

  initializeElements() {
    this.dadosDiv = document.getElementById("dados");
    this.loadingDiv = document.getElementById("loading");
    this.errorMessageDiv = document.getElementById("error-message");
    this.editarButton = document.getElementById("editar");
    this.concluirEdicaoButton = document.getElementById("concluir-edicao");
    this.cancelarEdicaoButton = document.getElementById("cancelar-edicao");
    this.excluirPerfilButton = document.getElementById("excluir-perfil");
    this.editButtonsContainer = this.concluirEdicaoButton.parentElement;
  }

  initializeEventListeners() {
    this.editarButton.addEventListener("click", () => this.toggleEditMode(true));
    this.concluirEdicaoButton.addEventListener("click", () => this.saveProfile());
    this.cancelarEdicaoButton.addEventListener("click", () => this.toggleEditMode(false));
    this.excluirPerfilButton.addEventListener("click", () => this.deleteProfile());
  }

  async initializeProfile() {
    try {
      this.showLoading(true);
      const userData = await ApiService.getUserData();
      
      if (!userData?.profile) {
        this.showIncompleteProfile();
        return;
      }

      if (this.isProfileIncomplete(userData.profile)) {
        this.showIncompleteProfile();
        return;
      }

      this.currentProfile = userData.profile;
      this.displayProfile(userData.profile);
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
      this.showError("Erro ao carregar perfil. Por favor, tente novamente.");
    } finally {
      this.showLoading(false);
    }
  }

  isProfileIncomplete(profile) {
    return !profile.pessoal?.nome || 
           !profile.pessoal?.data_nascimento || 
           !profile.pessoal?.altura || 
           !profile.pessoal?.peso || 
           !profile.objetivos?.objetivo_principal;
  }

  showIncompleteProfile() {
    this.dadosDiv.innerHTML = `
      <div class="text-center py-5">
        <i data-lucide="alert-circle" class="text-warning mb-3" style="width: 48px; height: 48px;"></i>
        <h3 class="mb-3">Perfil Incompleto</h3>
        <p class="text-muted mb-4">Para aproveitar ao máximo o GymTrack, complete seu cadastro com suas informações pessoais e objetivos.</p>
        <a href="cadastro.html" class="btn btn-primary">
          <i data-lucide="user-plus" class="me-2"></i>Completar Cadastro
        </a>
      </div>
    `;
    lucide.createIcons();
  }

  displayProfile(profile, isEditing = false) {
    const pessoal = profile.pessoal || {};
    const objetivos = profile.objetivos || {};
    const metadados = profile.metadados || {};

    this.dadosDiv.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-header bg-light d-flex align-items-center">
              <i data-lucide="user-circle" class="me-2" style="width: 24px; height: 24px; color: #4CAF50;"></i>
              <h5 class="card-title mb-0">Dados Pessoais</h5>
            </div>
            <div class="card-body">
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="user" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Nome</label>
                  ${isEditing ? 
                    `<input type="text" class="form-control" id="nome" value="${pessoal.nome || ''}" required>` :
                    `<p class="mb-0 fw-medium">${pessoal.nome || 'Não informado'}</p>`
                  }
                </div>
              </div>
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="calendar" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Data de Nascimento</label>
                  ${isEditing ? 
                    `<input type="date" class="form-control" id="data_nascimento" value="${pessoal.data_nascimento || ''}" required>` :
                    `<p class="mb-0 fw-medium">${this.formatDate(pessoal.data_nascimento) || 'Não informado'}</p>`
                  }
                </div>
              </div>
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="venus-mars" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Gênero</label>
                  ${isEditing ? 
                    `<select class="form-select" id="genero" required>
                      <option value="">Selecione...</option>
                      <option value="Masculino" ${pessoal.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
                      <option value="Feminino" ${pessoal.genero === 'Feminino' ? 'selected' : ''}>Feminino</option>
                      <option value="Outro" ${pessoal.genero === 'Outro' ? 'selected' : ''}>Outro</option>
                    </select>` :
                    `<p class="mb-0 fw-medium">${pessoal.genero || 'Não informado'}</p>`
                  }
                </div>
              </div>
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="ruler" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Altura (cm)</label>
                  ${isEditing ? 
                    `<input type="number" class="form-control" id="altura" value="${pessoal.altura || ''}" min="100" max="250" required>` :
                    `<p class="mb-0 fw-medium">${pessoal.altura ? `${pessoal.altura} cm` : 'Não informado'}</p>`
                  }
                </div>
              </div>
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="scale" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Peso (kg)</label>
                  ${isEditing ? 
                    `<input type="number" class="form-control" id="peso" value="${pessoal.peso || ''}" min="30" max="300" required>` :
                    `<p class="mb-0 fw-medium">${pessoal.peso ? `${pessoal.peso} kg` : 'Não informado'}</p>`
                  }
                </div>
              </div>
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="phone" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Telefone</label>
                  ${isEditing ? 
                    `<input type="tel" class="form-control" id="telefone" value="${pessoal.telefone || ''}" pattern="[0-9]{10,11}" required>` :
                    `<p class="mb-0 fw-medium">${pessoal.telefone || 'Não informado'}</p>`
                  }
                </div>
              </div>
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="mail" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Email</label>
                  ${isEditing ? 
                    `<input type="email" class="form-control" id="email" value="${pessoal.email || ''}" required>` :
                    `<p class="mb-0 fw-medium">${pessoal.email || 'Não informado'}</p>`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-4">
          <div class="card h-100 border-0 shadow-sm">
            <div class="card-header bg-light d-flex align-items-center">
              <i data-lucide="target" class="me-2" style="width: 24px; height: 24px; color: #4CAF50;"></i>
              <h5 class="card-title mb-0">Objetivos</h5>
            </div>
            <div class="card-body">
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="flag" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Objetivo Principal</label>
                  ${isEditing ? 
                    `<select class="form-select" id="objetivo_principal" required>
                      <option value="">Selecione...</option>
                      <option value="Perda de peso" ${objetivos.objetivo_principal === 'Perda de peso' ? 'selected' : ''}>Perda de peso</option>
                      <option value="Ganho de massa" ${objetivos.objetivo_principal === 'Ganho de massa' ? 'selected' : ''}>Ganho de massa</option>
                      <option value="Condicionamento físico" ${objetivos.objetivo_principal === 'Condicionamento físico' ? 'selected' : ''}>Condicionamento físico</option>
                      <option value="Saúde" ${objetivos.objetivo_principal === 'Saúde' ? 'selected' : ''}>Saúde</option>
                    </select>` :
                    `<p class="mb-0 fw-medium">${objetivos.objetivo_principal || 'Não informado'}</p>`
                  }
                </div>
              </div>
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="award" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Experiência Prévia</label>
                  ${isEditing ? 
                    `<select class="form-select" id="experiencia_previa" required>
                      <option value="">Selecione...</option>
                      <option value="Iniciante" ${objetivos.experiencia_previa === 'Iniciante' ? 'selected' : ''}>Iniciante</option>
                      <option value="Intermediário" ${objetivos.experiencia_previa === 'Intermediário' ? 'selected' : ''}>Intermediário</option>
                      <option value="Avançado" ${objetivos.experiencia_previa === 'Avançado' ? 'selected' : ''}>Avançado</option>
                    </select>` :
                    `<p class="mb-0 fw-medium">${objetivos.experiencia_previa || 'Não informado'}</p>`
                  }
                </div>
              </div>
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="calendar-clock" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Frequência Semanal</label>
                  ${isEditing ? 
                    `<select class="form-select" id="frequencia_semanal" required>
                      <option value="">Selecione...</option>
                      <option value="1-2 vezes" ${objetivos.frequencia_semanal === '1-2 vezes' ? 'selected' : ''}>1-2 vezes</option>
                      <option value="3-4 vezes" ${objetivos.frequencia_semanal === '3-4 vezes' ? 'selected' : ''}>3-4 vezes</option>
                      <option value="5+ vezes" ${objetivos.frequencia_semanal === '5+ vezes' ? 'selected' : ''}>5+ vezes</option>
                    </select>` :
                    `<p class="mb-0 fw-medium">${objetivos.frequencia_semanal || 'Não informado'}</p>`
                  }
                </div>
              </div>
              <div class="mb-4 d-flex align-items-center">
                <i data-lucide="dumbbell" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                <div class="w-100">
                  <label class="form-label text-muted mb-1">Tipo de Treino</label>
                  ${isEditing ? 
                    `<select class="form-select" id="tipo_treino" required>
                      <option value="">Selecione...</option>
                      <option value="Musculação" ${objetivos.tipo_treino === 'Musculação' ? 'selected' : ''}>Musculação</option>
                      <option value="Funcional" ${objetivos.tipo_treino === 'Funcional' ? 'selected' : ''}>Funcional</option>
                      <option value="Cardio" ${objetivos.tipo_treino === 'Cardio' ? 'selected' : ''}>Cardio</option>
                      <option value="Misto" ${objetivos.tipo_treino === 'Misto' ? 'selected' : ''}>Misto</option>
                    </select>` :
                    `<p class="mb-0 fw-medium">${objetivos.tipo_treino || 'Não informado'}</p>`
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="row">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-light d-flex align-items-center">
              <i data-lucide="activity" class="me-2" style="width: 24px; height: 24px; color: #4CAF50;"></i>
              <h5 class="card-title mb-0">Progresso</h5>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-4">
                  <div class="d-flex align-items-center">
                    <i data-lucide="calendar-check" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                    <div>
                      <label class="form-label text-muted mb-1">Data de Cadastro</label>
                      <p class="mb-0 fw-medium">${this.formatDate(metadados.data_cadastro) || 'Não informado'}</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="d-flex align-items-center">
                    <i data-lucide="zap" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                    <div>
                      <label class="form-label text-muted mb-1">XP Atual</label>
                      <p class="mb-0 fw-medium">
                        <span class="badge bg-success">${profile.xp || 0} XP</span>
                      </p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4 mb-4">
                  <div class="d-flex align-items-center">
                    <i data-lucide="trophy" class="me-3" style="width: 20px; height: 20px; color: #666;"></i>
                    <div>
                      <label class="form-label text-muted mb-1">Conquistas</label>
                      <p class="mb-0 fw-medium">
                        <span class="badge bg-warning text-dark">${metadados.conquistas?.length || 0} conquistas</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
  }

  toggleEditMode(editing) {
    this.editarButton.style.display = editing ? 'none' : 'block';
    this.editButtonsContainer.style.display = editing ? 'block' : 'none';
    this.excluirPerfilButton.style.display = editing ? 'none' : 'block';
    
    // Use the stored current profile data when entering edit mode
    this.displayProfile(this.currentProfile, editing);
  }

  getCurrentProfileData() {
    return {
      profile: {
        pessoal: {
          nome: document.getElementById('nome')?.value || '',
          data_nascimento: document.getElementById('data_nascimento')?.value || '',
          genero: document.getElementById('genero')?.value || '',
          altura: document.getElementById('altura')?.value || '',
          peso: document.getElementById('peso')?.value || '',
          telefone: document.getElementById('telefone')?.value || '',
          email: document.getElementById('email')?.value || ''
        },
        objetivos: {
          objetivo_principal: document.getElementById('objetivo_principal')?.value || '',
          experiencia_previa: document.getElementById('experiencia_previa')?.value || '',
          frequencia_semanal: document.getElementById('frequencia_semanal')?.value || '',
          tipo_treino: document.getElementById('tipo_treino')?.value || ''
        },
        metadados: this.currentProfile?.metadados || {
          termos: true,
          data_cadastro: new Date().toISOString(),
          xp: 0,
          conquistas: []
        },
        xp: this.currentProfile.xp
      }
    };
  }

  validateForm(data) {
    const requiredFields = {
      pessoal: ['nome', 'data_nascimento', 'genero', 'altura', 'peso', 'telefone', 'email'],
      objetivos: ['objetivo_principal', 'experiencia_previa', 'frequencia_semanal', 'tipo_treino']
    };

    for (const section in requiredFields) {
      for (const field of requiredFields[section]) {
        if (!data.profile[section][field]) {
          return false;
        }
      }
    }

    return true;
  }

  async saveProfile() {
    try {
      const formData = this.getCurrentProfileData();
      
      // Validate required fields
      if (!this.validateForm(formData)) {
        this.showError("Por favor, preencha todos os campos obrigatórios.");
        return;
      }

      this.showLoading(true);
      await ApiService.updateUserData(formData);
      
      // Update the current profile with the new data
      this.currentProfile = formData.profile;
      
      this.toggleEditMode(false);
      this.displayProfile(this.currentProfile);
      this.showSuccess("Perfil atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      this.showError("Erro ao salvar perfil. Por favor, tente novamente.");
    } finally {
      this.showLoading(false);
    }
  }

  formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  }

  showLoading(show) {
    this.loadingDiv.style.display = show ? 'block' : 'none';
    this.dadosDiv.style.display = show ? 'none' : 'block';
  }

  showError(message) {
    this.errorMessageDiv.textContent = message;
    this.errorMessageDiv.style.display = 'block';
    setTimeout(() => {
      this.errorMessageDiv.style.display = 'none';
    }, 5000);
  }

  showSuccess(message) {
    const toast = document.createElement('div');
    toast.className = 'toast align-items-center text-white bg-success border-0 position-fixed top-0 end-0 m-3';
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">
          <i data-lucide="check-circle" class="me-2"></i>${message}
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

  async deleteProfile() {
    if (!confirm("Tem certeza que deseja excluir seu perfil? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      this.showLoading(true);
      await ApiService.deleteUser();
      window.location.href = "login.html";
    } catch (error) {
      console.error("Erro ao excluir perfil:", error);
      this.showError("Erro ao excluir perfil. Por favor, tente novamente.");
    } finally {
      this.showLoading(false);
    }
  }
}

// Initialize the profile manager when the DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ProfileManager();
});

