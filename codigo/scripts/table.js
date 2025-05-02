
document.addEventListener("DOMContentLoaded", function(){


    const historico = document.getElementById("tabela-historico");

    const gymDataString = localStorage.getItem("gymAppData");

    const gymData = JSON.parse(gymDataString);

    gymData.registered_trainings.forEach(treino => {

    
        
        var row = historico.insertRow(0);
        var data = row.insertCell(0);
        var membros = row.insertCell(1);
        var tipoDetreino = row.insertCell(2);
        var categoria = row.insertCell(3);
        let dataformatada = new Date(treino.date).toLocaleDateString("pt-BR")



        data.innerHTML = dataformatada;
        membros.innerHTML = treino.day_index;
        tipoDetreino.innerHTML = gymData.edited_trainings[treino.training_id].type;
        categoria.innerHTML = gymData.edited_trainings[treino.training_id].category;



    });



})