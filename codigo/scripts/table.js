document.addEventListener("DOMContentLoaded", function () {
  const gymDataString = localStorage.getItem("gymAppData");
  if (!gymDataString) return;

  const gymData = JSON.parse(gymDataString);

  function parseDateBRtoISO(dateStr) {
    if (dateStr.includes("-")) return new Date(dateStr);
    const [dia, mes, ano] = dateStr.split("/");
    return new Date(`${ano}-${mes}-${dia}`);
  }

  const treinosOrdenados = gymData.registered_trainings.sort((a, b) => {
    return parseDateBRtoISO(b.date) - parseDateBRtoISO(a.date); // Reverse order for newest first
  });

  const tableData = treinosOrdenados.map(treino => {
    const training = gymData.edited_trainings.find(
      (plan) => plan.id == treino.training_id
    );
    if (!training) return null;

    const day = training.days[treino.day_index - 1];
    if (!day) return null;

    const h = treino.duration?.hours || 0;
    const m = treino.duration?.minutes || 0;
    let duracaoFormatada = "";
    if (h > 0) duracaoFormatada += `${h}h `;
    if (m > 0) duracaoFormatada += `${m}min`;
    duracaoFormatada = duracaoFormatada.trim() || "0min";

    return {
      data: parseDateBRtoISO(treino.date).toLocaleDateString("pt-BR"),
      membros: day.name,
      tipoTreino: `<span class="badge-custom ${typeToClass(training.type)}">${training.type}</span>`,
      categoria: training.category,
      duracao: duracaoFormatada,
      xp: "+" + treino.xpGain
    };
  }).filter(item => item !== null);

  // Initialize DataTable
  const table = $('#tabela-historico').DataTable({
    data: tableData,
    columns: [
      { data: 'data' },
      { data: 'membros' },
      { 
        data: 'tipoTreino',
        render: function(data) {
          return data;
        }
      },
      { data: 'categoria' },
      { data: 'duracao' },
      { data: 'xp' }
    ],
    responsive: true,
    language: {
      url: '//cdn.datatables.net/plug-ins/2.0.0/i18n/pt-BR.json'
    },
    order: [[0, 'desc']], // Sort by date column descending
    pageLength: 10,
    lengthMenu: [[10, 25, 50, -1], [10, 25, 50, "Todos"]],
    dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip',
    initComplete: function() {
      $('.dataTables_length select').addClass('form-select form-select-sm');
      $('.dataTables_filter input').addClass('form-control form-control-sm');
    }
  });
  
  document.getElementById('exportExcel').addEventListener('click', function() {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(tableData.map(item => ({
      'Data': item.data,
      'Membros': item.membros,
      'Tipo de Treino': item.tipoTreino.replace(/<[^>]*>/g, ''),
      'Categoria': item.categoria,
      'Duração': item.duracao,
      'XP': item.xp
    })));
    XLSX.utils.book_append_sheet(wb, ws, "Histórico de Treinos");
    XLSX.writeFile(wb, "historico_treinos.xlsx");
  });

  // Export to PDF
  document.getElementById('exportPDF').addEventListener('click', function() {
    const doc = new jsPDF();
    doc.autoTable({
      html: '#tabela-historico',
      theme: 'grid',
      headStyles: { fillColor: [161, 79, 206] },
      styles: { fontSize: 8 },
      margin: { top: 20 }
    });
    doc.save('historico_treinos.pdf');
  });
});

function typeToClass(type) {
  switch(type) {
    case "Ficha iniciante":
      return "badge-iniciante";
    case "Ficha intermediária":
      return "badge-intermediario";
    case "Ficha avançada":
      return "badge-avancado";
  }
}