import ApiService from './services/api.js';

async function saveGymData(gymData) {
    try {
        await ApiService.updateUserData({
            profile: gymData.profile,
            edited_trainings: gymData.edited_trainings,
            notifications: gymData.notifications,
            registered_trainings: gymData.registered_trainings
          });
    } catch (error) {
        console.error('Erro ao salvar dados do usuário:', error);
    }
}

function calcularXpConquista(tipo, valor) {
    if (tipo === "treinos") return valor * 10;
    if (tipo === "streak") return valor * 15;
    if (tipo === "minutos") return Math.round(valor / 5);
    return 10;
}

function generateConquistaDetails(tipo, valor) {
    let nome = '';
    let descricao = '';

    const numericValor = typeof valor === 'number' && !isNaN(valor) ? valor : 0;

    if (tipo === "treinos") {
        nome = `${numericValor} Treinos Completos`;
        descricao = `Complete ${numericValor} treinos para ganhar esta conquista.`;
    } else if (tipo === "streak") {
        nome = `${numericValor} Dias Seguidos`;
        descricao = `Complete ${numericValor} dias de treino consecutivos.`;
    } else if (tipo === "minutos") {
        nome = `${numericValor} Minutos de Treino`;
        descricao = `Acumule ${numericValor} minutos de treino.`;
    }
    return { nome, descricao };
}

let calMesAtual = null;
let calAnoAtual = null;

function initCalendarioNavegavel(gymData) {
    const hoje = new Date();
    calMesAtual = hoje.getMonth();
    calAnoAtual = hoje.getFullYear();
    document.getElementById("cal-prev-mes").onclick = function() {
        calMesAtual--;
        if (calMesAtual < 0) {
            calMesAtual = 11;
            calAnoAtual--;
        }
        preencherCalendario(gymData);
    };
    document.getElementById("cal-next-mes").onclick = function() {
        calMesAtual++;
        if (calMesAtual > 11) {
            calMesAtual = 0;
            calAnoAtual++;
        }
        preencherCalendario(gymData);
    };
}

document.addEventListener("DOMContentLoaded", async function () {
    try {
        const userData = await ApiService.getUserData();
        const gymData = userData;
        const profile = userData.profile || { metadados: {} };

        console.log(gymData);

        preencherResumo(gymData);
        preencherConquistas(gymData);
        initCalendarioNavegavel(gymData);
        preencherCalendario(gymData);
        preencherRanking(gymData);
        preencherHistoricoConquistas(gymData);
        preencherSocialFeatures(gymData);
        preencherDicasPersonalizadas(gymData);

        document.getElementById("form-nova-conquista").addEventListener("submit", function (e) {
            e.preventDefault();
            const tipo = document.getElementById("tipo-conquista").value;
            const valor = parseInt(document.getElementById("valor-conquista").value);
            const xp = calcularXpConquista(tipo, valor);
            const { nome, descricao } = generateConquistaDetails(tipo, valor);
            const id = `custom_${tipo}_${valor}_${Date.now()}`;
            const nova = { id, tipo, valor, xp, nome, descricao, conquistada: false, resgatada: false };
            gymData.profile.metadados.conquistas.push(nova);
            saveGymData(gymData);
            document.getElementById("form-nova-conquista").reset();
            bootstrap.Modal.getInstance(document.getElementById("modalNovaConquista")).hide();
            preencherConquistas(gymData);
        });

        function atualizarXpPreview() {
            const tipo = document.getElementById("tipo-conquista").value;
            const valorInput = document.getElementById("valor-conquista").value;
            const valor = parseInt(valorInput) || 0; // Garante que valor é um número (ou 0)
            const xp = calcularXpConquista(tipo, valor);
            const { nome, descricao } = generateConquistaDetails(tipo, valor);

            document.getElementById("xp-preview").textContent = xp;
        }
        document.getElementById("tipo-conquista").addEventListener("change", atualizarXpPreview);
        document.getElementById("valor-conquista").addEventListener("input", atualizarXpPreview);

        window.editarConquistaCustom = function(id) {
            let conquistasCustom = gymData.profile.metadados.conquistas || [];
            const c = conquistasCustom.find(c => c.id === id);
            if (!c || c.resgatada) return;

            document.getElementById("tipo-conquista").value = c.tipo;
            document.getElementById("valor-conquista").value = c.valor;

            atualizarXpPreview();

            document.getElementById("form-nova-conquista").onsubmit = function(e) {
                e.preventDefault();
                conquistasCustom = conquistasCustom.filter(x => x.id !== id);

                const tipo = document.getElementById("tipo-conquista").value;
                const valor = parseInt(document.getElementById("valor-conquista").value);
                const xp = calcularXpConquista(tipo, valor);
                const { nome, descricao } = generateConquistaDetails(tipo, valor);
                const newId = `custom_${tipo}_${valor}_${Date.now()}`;
                
                const nova = { 
                    id: newId, 
                    tipo, 
                    valor, 
                    xp, 
                    nome, 
                    descricao, 
                    conquistada: c.conquistada, 
                    resgatada: c.resgatada 
                };

                conquistasCustom.push(nova);
                gymData.profile.metadados.conquistas = conquistasCustom;
                saveGymData(gymData);

                document.getElementById("form-nova-conquista").reset();
                bootstrap.Modal.getInstance(document.getElementById("modalNovaConquista")).hide();

                preencherConquistas(gymData);

                document.getElementById("form-nova-conquista").onsubmit = defaultNovaConquistaSubmit;
            };

            new bootstrap.Modal(document.getElementById("modalNovaConquista")).show();
        };

        window.excluirConquistaCustom = function(id) {
            if (!confirm("Tem certeza que deseja excluir esta conquista?")) return;
            let conquistasCustom = gymData.profile.metadados.conquistas || [];
            conquistasCustom = conquistasCustom.filter(c => c.id !== id);
            gymData.profile.metadados.conquistas = conquistasCustom;
            saveGymData(gymData);
            preencherConquistas(gymData);
        };

        const defaultNovaConquistaSubmit = document.getElementById("form-nova-conquista").onsubmit;

        window.resgatarConquistaCustom = function(id) {
            let conquistasCustom = gymData.profile.metadados.conquistas || [];
            const idx = conquistasCustom.findIndex(c => c.id === id);
            if (idx !== -1 && conquistasCustom[idx].conquistada && !conquistasCustom[idx].resgatada) {
                if (!gymData.profile) gymData.profile = { xp: 0 };
                gymData.profile.xp = (gymData.profile.xp || 0) + conquistasCustom[idx].xp;
                conquistasCustom[idx].resgatada = true;
                conquistasCustom[idx].dataResgate = new Date().toISOString();
                
                // Adicionar à lista de conquistas recentes da comunidade
                if (!gymData.community_achievements) gymData.community_achievements = [];
                gymData.community_achievements.unshift({
                    usuario: 'Você',
                    conquista: conquistasCustom[idx].nome,
                    xp: conquistasCustom[idx].xp,
                    data: new Date().toISOString()
                });
                
                // Manter apenas as 5 conquistas mais recentes
                gymData.community_achievements = gymData.community_achievements.slice(0, 5);
                
                gymData.profile.metadados.conquistas = conquistasCustom;
                saveGymData(gymData);
                preencherConquistas(gymData);
                preencherHistoricoConquistas(gymData);
                preencherSocialFeatures(gymData);
                alert("Conquista resgatada! XP adicionado ao seu perfil.");
            }
        };
    } catch (error) {
        console.error('Erro ao carregar dados do progresso do webserver:', error);
    }
});

function preencherResumo(gymData) {
    const diasSeguidos = calcularStreak(gymData.registered_trainings || []);
    document.getElementById("dias-treino").textContent = diasSeguidos;
    document.getElementById("treinos-concluidos").textContent = (gymData.registered_trainings || []).length;
    const conquistasResgatadas = (gymData.profile.metadados.conquistas || []).filter(c => c.resgatada).length;
    document.getElementById("conquistas-atingidas").textContent = conquistasResgatadas;
}

function calcularStreak(treinos) {
    if (!treinos.length) return 0;
    const datas = treinos.map(t => new Date(t.date)).sort((a, b) => a - b);
    let streak = 1, maxStreak = 1;
    for (let i = 1; i < datas.length; i++) {
        const diff = (datas[i] - datas[i - 1]) / (1000 * 60 * 60 * 24);
        if (diff === 1) {
            streak++;
            maxStreak = Math.max(maxStreak, streak);
        } else if (diff > 1) {
            streak = 1;
        }
    }
    return maxStreak;
}

function calcularConquistas(gymData) {
    const treinos = gymData.registered_trainings || [];
    const conquistas = [];
    if (treinos.length > 0) conquistas.push({ nome: "Primeiro treino", descricao: "Complete seu primeiro treino e registre na plataforma", conquistado: true });
    if (treinos.length >= 10) conquistas.push({ nome: "10 treinos", descricao: "Complete 10 treinos na plataforma", conquistado: true });
    if (calcularStreak(treinos) >= 5) conquistas.push({ nome: "Sequência de 5 dias", descricao: "Complete 5 dias de treino seguidos", conquistado: true });
    if (treinos.length < 10) conquistas.push({ nome: "10 treinos", descricao: "Complete 10 treinos na plataforma", conquistado: false });
    if (calcularStreak(treinos) < 5) conquistas.push({ nome: "Sequência de 5 dias", descricao: "Complete 5 dias de treino seguidos", conquistado: false });
    return conquistas;
}

function verificaRequisitoConquistaCustom(c, gymData) {
    if (c.tipo === "treinos") {
        return (gymData.registered_trainings || []).length >= c.valor;
    }
    if (c.tipo === "streak") {
        return calcularStreak(gymData.registered_trainings || []) >= c.valor;
    }
    if (c.tipo === "minutos") {
        const total = (gymData.registered_trainings || []).reduce((acc, t) => acc + ((t.duration?.hours || 0) * 60 + (t.duration?.minutes || 0)), 0);
        return total >= c.valor;
    }
    return false;
}

function preencherConquistas(gymData) {
    let conquistasCustom = gymData.profile.metadados.conquistas || [];
    conquistasCustom = conquistasCustom.map(c => {
        if (!c.resgatada && verificaRequisitoConquistaCustom(c, gymData)) {
            c.conquistada = true;
        }
        return c;
    });
    saveGymData(gymData);
    const lista = document.getElementById("conquistas-lista");
    lista.innerHTML = "";
    if (conquistasCustom.length === 0) {
        const col = document.createElement("div");
        col.className = "col-md-3";
        col.innerHTML = `<div class='card h-100 border-secondary d-flex align-items-center justify-content-center' style='min-height:180px;'>
            <div class='card-body text-center'>
                <p class='mb-2'>Nenhuma conquista cadastrada ainda.</p>
                <button class='btn btn-outline-primary' data-bs-toggle='modal' data-bs-target='#modalNovaConquista'>Criar conquista</button>
            </div>
        </div>`;
        lista.appendChild(col);
        return;
    }
    conquistasCustom.forEach(c => {
        const col = document.createElement("div");
        col.className = "col-md-3";
        let btnResgatar = '';
        let btnEditar = '';
        let btnExcluir = '';
        if (!c.resgatada) {
            btnEditar = `<button class='btn btn-outline-secondary btn-sm me-1' title='Editar' onclick='editarConquistaCustom(\"${c.id}\")'><i class='fa fa-edit'></i></button>`;
            btnExcluir = `<button class='btn btn-outline-danger btn-sm' title='Excluir' onclick='excluirConquistaCustom(\"${c.id}\")'><i class='fa fa-trash'></i></button>`;
        }
        if (c.conquistada && !c.resgatada) {
            btnResgatar = `<button class='btn btn-success btn-sm mt-2' data-id='${c.id}' onclick='resgatarConquistaCustom(\"${c.id}\")'>Resgatar XP</button>`;
        }
        const progresso = calcularProgressoConquista(c, gymData);
        col.innerHTML = `<div class=\"card h-100 ${c.resgatada ? 'border-success' : c.conquistada ? 'border-primary' : ''}\">
            <div class=\"card-body\">
                <div class='d-flex justify-content-end mb-2'>${btnEditar}${btnExcluir}</div>
                ${c.resgatada ? '<span class=\"badge bg-success mb-2\">Resgatada</span>' : c.conquistada ? '<span class=\"badge bg-primary mb-2\">Disponível</span>' : ''}
                <h6 class=\"card-title\">${c.nome}</h6>
                <p class=\"card-text\">${c.descricao}</p>
                <div class=\"progress mb-2\" style=\"height: 8px;\">
                    <div class=\"progress-bar bg-info\" role=\"progressbar\" style=\"width: ${progresso.percent}%\" aria-valuenow=\"${progresso.percent}\" aria-valuemin=\"0\" aria-valuemax=\"100\"></div>
                </div>
                <div class=\"small text-muted mb-1\">${progresso.texto}</div>
                <div class=\"small text-muted\">XP: ${c.xp}</div>
                ${btnResgatar}
            </div>
        </div>`;
        lista.appendChild(col);
    });
}

function calcularProgressoConquista(c, gymData) {
    let atual = 0, total = c.valor;
    if (c.tipo === "treinos") {
        atual = (gymData.registered_trainings || []).length;
    } else if (c.tipo === "streak") {
        atual = calcularStreak(gymData.registered_trainings || []);
    } else if (c.tipo === "minutos") {
        atual = (gymData.registered_trainings || []).reduce((acc, t) => acc + ((t.duration?.hours || 0) * 60 + (t.duration?.minutes || 0)), 0);
    }
    const percent = Math.min(100, Math.round((atual / total) * 100));
    return { percent, texto: `${Math.min(atual, total)} / ${total}` };
}

function preencherCalendario(gymData) {
    const table = document.getElementById("progresso-calendario");
    table.innerHTML = "";
    let mes, ano;
    if (typeof calMesAtual === 'number' && typeof calAnoAtual === 'number') {
        mes = calMesAtual;
        ano = calAnoAtual;
    } else {
        const hoje = new Date();
        mes = hoje.getMonth();
        ano = hoje.getFullYear();
    }
    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    document.getElementById("cal-mes-ano").textContent = `${meses[mes]} ${ano}`;
    const hoje = new Date();
    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);
    const treinos = (gymData.registered_trainings || []).map(t => (typeof t.date === 'string' ? t.date.slice(0, 10) : new Date(t.date).toISOString().slice(0, 10)));
    const treinosDetalhados = gymData.registered_trainings || [];
    const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
    let thead = `<thead><tr>${diasSemana.map(d => `<th>${d}</th>`).join("")}</tr></thead>`;
    let tbody = "<tbody>";
    let diaSemana = (primeiroDia.getDay() + 6) % 7; 
    let dia = 1;
    for (let i = 0; i < 6; i++) {
        tbody += "<tr>";
        for (let j = 0; j < 7; j++) {
            if ((i === 0 && j < diaSemana) || dia > ultimoDia.getDate()) {
                tbody += "<td></td>";
            } else {
                const dataAtual = new Date(ano, mes, dia);
                const dataAtualStr = dataAtual.toISOString().slice(0, 10);
                let classe = "";
                if (treinos.includes(dataAtualStr)) {
                    classe = "bg-success text-white";
                } else if (dataAtual < hoje && (mes !== hoje.getMonth() || ano !== hoje.getFullYear() || dataAtual < hoje)) {
                    classe = "bg-danger text-white";
                } else if (dataAtual.toDateString() === hoje.toDateString() && mes === hoje.getMonth() && ano === hoje.getFullYear()) {
                    classe = "bg-primary text-white";
                }
                tbody += `<td class="${classe} calendario-dia" data-dia="${dia}" data-mes="${mes}" data-ano="${ano}" style="cursor:pointer;">${dia}</td>`;
                dia++;
            }
        }
        tbody += "</tr>";
        if (dia > ultimoDia.getDate()) break;
    }
    tbody += "</tbody>";
    table.innerHTML = thead + tbody;

    setTimeout(() => {
        document.querySelectorAll('.calendario-dia').forEach(td => {
            td.onclick = function() {
                const d = parseInt(td.getAttribute('data-dia'));
                const m = parseInt(td.getAttribute('data-mes'));
                const a = parseInt(td.getAttribute('data-ano'));
                mostrarModalTreinosDia(a, m, d, gymData);
            };
        });
    }, 0);
}

function mostrarModalTreinosDia(ano, mes, dia, gymData) {
    const dataStr = new Date(ano, mes, dia).toISOString().slice(0, 10);
    const treinosDia = (gymData.registered_trainings || []).filter(t => {
        const tData = (typeof t.date === 'string' ? t.date.slice(0, 10) : new Date(t.date).toISOString().slice(0, 10));
        return tData === dataStr;
    });
    let html = `<div class='mb-2'><strong>${dia.toString().padStart(2, '0')}/${(mes+1).toString().padStart(2, '0')}/${ano}</strong></div>`;
    if (treinosDia.length === 0) {
        html += `<div class='text-muted'>Nenhum treino realizado neste dia.</div>`;
    } else {
        html += '<ul class="list-group">';
        treinosDia.forEach(t => {
            let nome = t.training_name || 'Treino';
            if (!nome && gymData.edited_trainings) {
                const plano = gymData.edited_trainings.find(p => p.id == t.training_id);
                if (plano) nome = plano.name;
            }
            let dur = '';
            if (t.duration) {
                const h = t.duration.hours || 0;
                const m = t.duration.minutes || 0;
                dur = (h > 0 ? h + 'h ' : '') + (m > 0 ? m + 'min' : '');
            }
            html += `<li class="list-group-item d-flex flex-column align-items-start">
                <div><strong>${nome}</strong></div>
                <div class="small text-muted">Duração: ${dur || '0min'} | XP: ${t.xpGain || 0}</div>
            </li>`;
        });
        html += '</ul>';
    }
    document.getElementById('treinos-dia-body').innerHTML = html;
    const modal = new bootstrap.Modal(document.getElementById('modalTreinosDia'));
    modal.show();
}

function findUserPosition(ranking, userId){
    for(let position = 0; position < ranking.length; position++){
        if(ranking[position].id === parseInt(userId)){
            return position;
        }
    }
}

async function preencherRanking(gymData) {
    try {
        const ranking = await ApiService.getRanking();
        const userId = window.auth.getCurrentUserId && window.auth.getCurrentUserId();
        let top5;
        const userPosition = findUserPosition(ranking, userId);
        if(userPosition > 4){
            top5 = ranking.slice(0,4);
            let userAttributes = ranking[userPosition];
            userAttributes.realPosition = userPosition;
            top5.push(userAttributes);
        }else{
            top5 = ranking.slice(0,5);
        }
        console.log(userPosition);
        const rankingDiv = document.getElementById("progresso-ranking");
        let posUsuario = 0;
        rankingDiv.innerHTML = `
            <ul class="list-group mb-3">
                ${top5.map((p, i) => {
                    const isUser = userId && String(p.id) === String(userId);
                    if (isUser) posUsuario = i + 1;
                    return `
                        <li class="list-group-item d-flex justify-content-between align-items-center ${isUser ? 'list-group-item-primary fw-bold' : ''}">
                            <div class="d-flex align-items-center gap-2">
                                <span class="badge bg-${isUser ? 'primary' : 'secondary'} rounded-circle" style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;">${p.realPosition ? p.realPosition : i + 1}</span>
                                <span>${isUser ? 'Você' : (p.email || 'Usuário')}</span>
                            </div>
                            <span>${p.xp} XP</span>
                        </li>
                    `;
                }).join('')}
            </ul>
            <div class="small text-muted">Sua posição: <strong>${posUsuario || '-'}º</strong></div>
        `;
        const usuario = ranking.find(p => userId && String(p.id) === String(userId));
        const xp = usuario ? usuario.xp : 0;
        document.getElementById("ranking-progress-bar").style.width = `${Math.min(100, Math.round((xp/4000)*100))}%`;
        document.getElementById("desafio-mes").textContent = "4000 XP";
        document.getElementById("desafio-status").textContent = xp >= 4000 ? "Completo" : "Incompleto";
    } catch (error) {
        console.error('Erro ao carregar ranking global:', error);
    }
}


function preencherHistoricoConquistas(gymData) {
    const timeline = document.getElementById("achievement-timeline");
    const conquistas = gymData.profile.metadados.conquistas || [];
    
    // Filtrar apenas conquistas resgatadas e ordenar por data
    const conquistasResgatadas = conquistas
        .filter(c => c.resgatada && c.dataResgate)
        .sort((a, b) => new Date(b.dataResgate) - new Date(a.dataResgate));

    if (conquistasResgatadas.length === 0) {
        timeline.innerHTML = `
            <div class="text-center text-muted py-3">
                <i class="fa-solid fa-trophy mb-2" style="font-size: 2rem;"></i>
                <p>Nenhuma conquista resgatada ainda.</p>
            </div>
        `;
        return;
    }

    timeline.innerHTML = conquistasResgatadas.map(c => {
        const data = new Date(c.dataResgate);
        const dataFormatada = data.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        return `
            <div class="achievement-item">
                <div class="achievement-date">${dataFormatada}</div>
                <div class="achievement-title">${c.nome}</div>
                <div class="achievement-desc">${c.descricao}</div>
                <div class="achievement-xp small text-success">+${c.xp} XP</div>
            </div>
        `;
    }).join('');
}

function preencherSocialFeatures(gymData) {
    const gruposLista = document.getElementById("grupos-lista");
    const recentAchievements = document.getElementById("recent-achievements");
    
    // Grupos de treino
    const grupos = gymData.training_groups || [];
    if (grupos.length === 0) {
        gruposLista.innerHTML = `
            <div class="text-center text-muted py-3">
                <p>Nenhum grupo de treino encontrado.</p>
                <button class="btn btn-sm btn-outline-primary" onclick="criarNovoGrupo()">
                    Criar Primeiro Grupo
                </button>
            </div>
        `;
    } else {
        gruposLista.innerHTML = grupos.map(g => `
            <div class="grupo-item">
                <div class="grupo-nome">${g.nome}</div>
                <div class="grupo-membros">${g.membros.length} membros</div>
            </div>
        `).join('');
    }

    // Conquistas recentes da comunidade
    const conquistasRecentes = gymData.community_achievements || [];
    if (conquistasRecentes.length === 0) {
        recentAchievements.innerHTML = `
            <div class="text-center text-muted py-3">
                <p>Nenhuma conquista recente na comunidade.</p>
            </div>
        `;
    } else {
        recentAchievements.innerHTML = conquistasRecentes.map(c => `
            <div class="achievement-card">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${c.usuario}</strong>
                        <div class="small text-muted">${c.conquista}</div>
                    </div>
                    <span class="badge bg-success">+${c.xp} XP</span>
                </div>
            </div>
        `).join('');
    }
}

function preencherDicasPersonalizadas(gymData) {
    const tipsContainer = document.getElementById("personalized-tips");
    const dicas = gerarDicasPersonalizadas(gymData);
    
    tipsContainer.innerHTML = dicas.map(dica => `
        <div class="tip-card priority-${dica.prioridade}">
            <div class="tip-header">
                <div class="tip-icon">
                    <i class="fa-solid ${dica.icone}"></i>
                </div>
                <h6 class="tip-title">${dica.titulo}</h6>
            </div>
            <p class="tip-content">${dica.conteudo}</p>
        </div>
    `).join('');
}

function gerarDicasPersonalizadas(gymData) {
    const dicas = [];
    const treinos = gymData.registered_trainings || [];
    const streak = calcularStreak(treinos);
    const totalTreinos = treinos.length;
    const conquistas = gymData.profile.metadados.conquistas || [];
    const conquistasResgatadas = conquistas.filter(c => c.resgatada).length;

    // Dica baseada no streak
    if (streak < 3) {
        dicas.push({
            prioridade: 'high',
            icone: 'fa-fire',
            titulo: 'Mantenha sua sequência!',
            conteudo: 'Complete mais 2 treinos para estabelecer uma sequência de 3 dias.'
        });
    }

    // Dica baseada no total de treinos
    if (totalTreinos < 10) {
        dicas.push({
            prioridade: 'medium',
            icone: 'fa-dumbbell',
            titulo: 'Próximo marco',
            conteudo: `Complete mais ${10 - totalTreinos} treinos para atingir 10 treinos no total.`
        });
    }

    // Dica baseada em conquistas
    if (conquistasResgatadas < 5) {
        dicas.push({
            prioridade: 'medium',
            icone: 'fa-trophy',
            titulo: 'Novas conquistas',
            conteudo: 'Crie novas conquistas personalizadas para ganhar mais XP.'
        });
    }

    // Dica sobre horários de treino
    const horarios = treinos.map(t => new Date(t.date).getHours());
    const horarioMaisFrequente = encontrarHorarioMaisFrequente(horarios);
    if (horarioMaisFrequente) {
        dicas.push({
            prioridade: 'low',
            icone: 'fa-clock',
            titulo: 'Horário ideal',
            conteudo: `Seus treinos são mais frequentes às ${horarioMaisFrequente}h. Mantenha essa consistência!`
        });
    }

    return dicas;
}

function encontrarHorarioMaisFrequente(horarios) {
    if (!horarios.length) return null;
    const frequencia = {};
    horarios.forEach(h => frequencia[h] = (frequencia[h] || 0) + 1);
    return Object.entries(frequencia)
        .sort((a, b) => b[1] - a[1])[0][0];
}

