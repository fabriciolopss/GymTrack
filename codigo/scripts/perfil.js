lucide.createIcons();

document.addEventListener("DOMContentLoaded", function () {
  new LayoutManager();
});

const divDados = document.querySelector("#dados");
const botaoEditar = document.querySelector("#editar");
const botaoConcluirEdit = document.querySelector("#concluir-edicao");
const botaoCancelarEdit = document.querySelector("#cancelar-edicao");
const botaoExcluir = document.querySelector("#excluir-perfil");

if (JSON.parse(localStorage.getItem("gymAppData")).profile.pessoal != null) {
  const gymAppDataFull = JSON.parse(localStorage.getItem("gymAppData"));

  const dadosUsuarioRaw = JSON.parse(
    localStorage.getItem("gymAppData")
  ).profile;
  let dadosUsuario = JSON.parse(localStorage.getItem("gymAppData")).profile;

  const divDados = document.querySelector("#dados");
  const botaoEditar = document.querySelector("#editar");
  const botaoConcluirEdit = document.querySelector("#concluir-edicao");
  const botaoCancelarEdit = document.querySelector("#cancelar-edicao");

  function traducaoDados() {
    let anoNascimento = dadosUsuarioRaw.pessoal.data_nascimento.substring(0, 4);
    let mesNascimento = dadosUsuarioRaw.pessoal.data_nascimento.substring(5, 7);
    let diaNascimento = dadosUsuarioRaw.pessoal.data_nascimento.substring(
      8,
      10
    );

    dadosUsuario.pessoal.data_nascimento =
      diaNascimento + "/" + mesNascimento + "/" + anoNascimento;

    let telefone = dadosUsuario.pessoal.telefone;
    if (telefone.length == 11) {
      dadosUsuario.pessoal.telefone =
        "(" +
        telefone.substring(0, 2) +
        ") " +
        telefone.substring(2, 7) +
        "-" +
        telefone.substring(7, 11);
    } else if (telefone.length == 10) {
      dadosUsuarioRaw.pessoal.telefone =
        telefone.substring(0, 2) + "9" + telefone.substring(2, 10);
      dadosUsuario.pessoal.telefone =
        "(" +
        telefone.substring(0, 2) +
        ") 9" +
        telefone.substring(2, 6) +
        "-" +
        telefone.substring(6, 10);
    }
  }

  traducaoDados();

  divDados.innerHTML = `
      <ul class="list-unstyled row">
        <h1 class="fs-1 text-secondary mt-3 col-12">Dados pessoais</h1>
        <li class="col-xl-4 col-lg-12">Nome completo: <span class="dado-usuario">${dadosUsuario.pessoal.nome_completo}</span></li>
        <li class="col-xl-4 col-lg-6">Data de nascimento: <span class="dado-usuario">${dadosUsuario.pessoal.data_nascimento}</span></li>
        <li class="col-xl-4 col-lg-6">Gênero: <span class="dado-usuario">${dadosUsuario.pessoal.genero}</span></li>
        <li class="col-xl-4 col-lg-6">Altura (cm): <span class="dado-usuario">${dadosUsuario.pessoal.altura_cm}</span></li>
        <li class="col-xl-4 col-lg-6">Peso (kg): <span class="dado-usuario">${dadosUsuario.pessoal.peso_kg}</span></li>
        <li class="col-xl-4 col-lg-6">Telefone: <span class="dado-usuario">${dadosUsuario.pessoal.telefone}</span></li>
        <li class="col-12">Email: <span class="dado-usuario">${dadosUsuario.pessoal.email}</span></li>
      </ul>
      <ul class="list-unstyled row">
        <h1 class="fs-1 text-secondary">Objetivos</h1>
        <li class="col-lg-4 col-md-6">Experiência: <span class="dado-usuario">${dadosUsuario.objetivos.experiencia_previa}</span></li>
        <li class="col-lg-4 col-md-6">Frequência semanal: <span class="dado-usuario">${dadosUsuario.objetivos.frequencia_semanal}</span></li>
        <li class="col-lg-4 col-md-6">Objetivo principal: <span class="dado-usuario">${dadosUsuario.objetivos.objetivo_principal}</span></li>
        <li class="col-lg-4 col-md-6">Tipo de atividade: <span class="dado-usuario">${dadosUsuario.objetivos.tipo_treino}</span></li>
      </ul>
    `;

  botaoEditar.addEventListener("click", (e) => {
    botaoEditar.style = "display: none";
    botaoConcluirEdit.style = "display: inline";
    botaoCancelarEdit.style = "display: inline";

    e.preventDefault();
    divDados.innerHTML = `<ul class="list-unstyled row">
        <h1 class="fs-1 text-secondary mt-3 col-12">Dados pessoais</h1>
        <li class="col-xl-4 col-lg-12" id="nome">
          Nome completo: <input id="input-nome" class="w-lg-50" type="text" value="${dadosUsuario.pessoal.nome_completo}">
        </li>
        <li class="col-xl-4 col-lg-6" id="nascimento">
          Data de nascimento: <input id="input-nasc" type="date" value="${dadosUsuarioRaw.pessoal.data_nascimento}">
        </li>
        <li class="col-xl-4 col-lg-6" id="genero">
          Gênero: <strong>${dadosUsuario.pessoal.genero}</strong>
        </li>
        <li class="col-xl-4 col-lg-6" id="altura">
          Altura (cm): <input id="input-altura" type="number" value="${dadosUsuario.pessoal.altura_cm}">
        </li>
        <li class="col-xl-4 col-lg-6" id="peso">
          Peso (kg): <input id="input-peso" type="number" value="${dadosUsuario.pessoal.peso_kg}">
        </li>
        <li class="col-xl-4 col-lg-6" id="telefone">
          Telefone: <input id="input-tel" type="tel" value="${dadosUsuarioRaw.pessoal.telefone}">
        </li>
        <li class="col-12" id="email">
          Email: <input id="input-email" type="email" value="${dadosUsuario.pessoal.email}">
        </li>
      </ul>
      <ul class="list-unstyled row">
        <h1 class="fs-1 text-secondary">Objetivos</h1>
        <li id="experiencia" class="col-xl-4 col-lg-6">
          Experiência: <strong>${dadosUsuario.objetivos.experiencia_previa}</strong>
        </li>
        <li id="frequencia" class="col-xl-4 col-lg-6">
          Frequência semanal:<strong>${dadosUsuario.objetivos.frequencia_semanal}</strong>
        </li>
        <li id="objetivo" class="col-xl-4 col-lg-6">
          Objetivo principal:<strong>${dadosUsuario.objetivos.objetivo_principal}</strong>
        </li>
        <li id="atividade" class="col-xl-4 col-lg-6">
          Tipo de atividade: <strong>${dadosUsuario.objetivos.tipo_treino}</strong>
        </li>
      </ul>`;

    let liGenero = document.querySelector("#genero");
    liGenero.innerHTML = `
        <label for="input-genero">Gênero:</label>
        <select id="input-genero" name="genero" required>
            <option value="Masculino" ${
              dadosUsuario.pessoal.genero == "Masculino" ? "selected" : ""
            }>Masculino</option>
            <option value="Feminino" ${
              dadosUsuario.pessoal.genero == "Feminino" ? "selected" : ""
            }>Feminino</option>
            <option value="Não binário" ${
              dadosUsuario.pessoal.genero == "Não binário" ? "selected" : ""
            }>Não binário</option>
            <option value="Prefiro não informar" ${
              dadosUsuario.pessoal.genero == "Prefiro não informar"
                ? "selected"
                : ""
            }>Prefiro não identificar</option>
        </select>
      `;

    let liExper = document.querySelector("#experiencia");
    liExper.innerHTML = `
        <label for="input-experiencia">Experiência:</label>
        <select id="input-experiencia" name="experiencia" required>
          <option value="Iniciante" ${
            dadosUsuario.objetivos.experiencia_previa == "Iniciante"
              ? "selected"
              : ""
          }>Iniciante</option>
          <option value="Intermediário" ${
            dadosUsuario.objetivos.experiencia_previa == "Intermediário"
              ? "selected"
              : ""
          }>Intermediário</option>
          <option value="Avançado" ${
            dadosUsuario.objetivos.experiencia_previa == "Avançado"
              ? "selected"
              : ""
          }>Avançado</option>
        </select>
      `;

    let liFreq = document.querySelector("#frequencia");
    liFreq.innerHTML = `
        <label for="input-frequencia">Frequência semanal:</label>
        <select id="input-frequencia" name="frequencia" required>
          <option value="2-3 vezes" ${
            dadosUsuario.objetivos.frequencia_semanal == "2-3 vezes"
              ? "selected"
              : ""
          }>2-3 vezes</option>
          <option value="3-4 vezes" ${
            dadosUsuario.objetivos.frequencia_semanal == "3-4 vezes"
              ? "selected"
              : ""
          }>3-4 vezes</option>
          <option value="5+ vezes" ${
            dadosUsuario.objetivos.frequencia_semanal == "5+ vezes"
              ? "selected"
              : ""
          }>5+ vezes</option>
        </select>
      `;

    let liObj = document.querySelector("#objetivo");
    liObj.innerHTML = `
        <label for="input-objetivo">Objetivo principal:</label>
        <select id="input-objetivo" name="objetivo" required>
          <option value="Perda de peso" ${
            dadosUsuario.objetivos.objetivo_principal == "Perda de peso"
              ? "selected"
              : ""
          }>Perda de peso</option>
          <option value="Ganho de massa muscular" ${
            dadosUsuario.objetivos.objetivo_principal ==
            "Ganho de massa muscular"
              ? "selected"
              : ""
          }>Ganho de massa muscular</option>
          <option value="Condicionamento físico" ${
            dadosUsuario.objetivos.objetivo_principal ==
            "Condicionamento físico"
              ? "selected"
              : ""
          }>Condicionamento físico</option>
          <option value="Saúde e bem-estar" ${
            dadosUsuario.objetivos.objetivo_principal == "Saúde e bem-estar"
              ? "selected"
              : ""
          }>Saúde e bem-estar</option>
        </select>
      `;

    let liAtiv = document.querySelector("#atividade");
    liAtiv.innerHTML = `
        <label for="input-atividade">Tipo de atividade:</label>
        <select id="input-atividade" name="atividade" required>
          <option value="Musculação" ${
            dadosUsuario.objetivos.tipo_treino == "Musculação" ? "selected" : ""
          }>Musculação</option>
          <option value="Funcional" ${
            dadosUsuario.objetivos.tipo_treino == "Funcional" ? "selected" : ""
          }>Funcional</option>
          <option value="Cardio" ${
            dadosUsuario.objetivos.tipo_treino == "Cardio" ? "selected" : ""
          }>Cardio</option>
        </select>
      `;
  });

  botaoConcluirEdit.addEventListener("click", (e) => {
    e.preventDefault();

    if (
      document.querySelector("#input-tel").value.length == 11 ||
      document.querySelector("#input-tel").value.length == 10
    ) {
      gymAppDataFull.profile.pessoal.nome_completo =
        document.querySelector("#input-nome").value;
      gymAppDataFull.profile.pessoal.data_nascimento =
        document.querySelector("#input-nasc").value;
      gymAppDataFull.profile.pessoal.genero =
        document.querySelector("#input-genero").value;
      gymAppDataFull.profile.pessoal.email =
        document.querySelector("#input-email").value;
      gymAppDataFull.profile.pessoal.peso_kg =
        document.querySelector("#input-peso").value;
      gymAppDataFull.profile.pessoal.altura_cm =
        document.querySelector("#input-altura").value;
      gymAppDataFull.profile.pessoal.telefone =
        document.querySelector("#input-tel").value;
      gymAppDataFull.profile.objetivos.experiencia_previa =
        document.querySelector("#input-experiencia").value;
      gymAppDataFull.profile.objetivos.frequencia_semanal =
        document.querySelector("#input-frequencia").value;
      gymAppDataFull.profile.objetivos.objetivo_principal =
        document.querySelector("#input-objetivo").value;
      gymAppDataFull.profile.objetivos.tipo_treino =
        document.querySelector("#input-atividade").value;

      localStorage.setItem("gymAppData", JSON.stringify(gymAppDataFull));

      location.reload();
    } else {
      document.querySelector("#input-tel").style.border = "1px solid red";
      alert("Insira um número de telefone válido.");
    }
  });

  botaoCancelarEdit.addEventListener("click", (e) => {
    e.preventDefault();

    location.reload();
  });

  console.log(JSON.stringify(dadosUsuario));

  botaoExcluir.addEventListener("click", (e) => {
    e.preventDefault();

    const confirmExcluir = confirm(
      "Tem certeza que deseja deletar seu perfil?"
    );
    if (confirmExcluir == true) {
      gymAppDataFull.profile = {};
      localStorage.setItem("gymAppData", JSON.stringify(gymAppDataFull));
      location.reload();
    }
  });
} else {
  console.log("Nada cadastrado");

  botaoEditar.style = "display: none";
  botaoExcluir.style = "display: none";

  divDados.innerHTML =
    '<h1 class="mt-5">Não há usuário conectado :/</h1><br><p class="mb-5">Crie sua conta e conecte-se <a href="./cadastro.html">aqui</a>!</p>';
}
