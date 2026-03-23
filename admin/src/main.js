import './style.css'

// Simulación de "Traspaso de Datos" de la Web Principal
const mockLeads = [
  { nombre: 'Carlos Ruiz', sector: 'Retail', contacto: 'carlos@tienda.es', estado: 'Pendiente', fecha: 'Hoy, 10:30' },
  { nombre: 'Lucía Fer', sector: 'Wellness', contacto: '+34 600 123...', estado: 'Enviado a IA', fecha: 'Ayer, 18:20' },
  { nombre: 'Juan Gómez', sector: 'Inmobiliaria', contacto: 'juan@prop.com', estado: 'Finalizado', fecha: '22 Abr' },
];

function renderLeads() {
  const tableBody = document.getElementById('leads-body');
  const totalLeadsEl = document.getElementById('total-leads');
  
  if (!tableBody) return;

  totalLeadsEl.innerText = mockLeads.length;

  tableBody.innerHTML = mockLeads.map(lead => `
    <tr>
      <td><strong>${lead.nombre}</strong></td>
      <td>${lead.sector}</td>
      <td>${lead.contacto}</td>
      <td><span class="status-badge">${lead.estado}</span></td>
      <td>${lead.fecha}</td>
    </tr>
  `).join('');
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  renderLeads();
  console.log('Alquimia Admin Center Initialized');
});
