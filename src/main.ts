import './style.css'
import Chart from 'chart.js/auto'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

// Project data
const projects = [
  {
    title: 'Infraestructura Cloud',
    description: 'Despliegues automatizados en AWS utilizando Terraform y CI/CD.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'Data-Driven CRM',
    description: 'Sistema de gestión de clientes con análisis predictivo.',
    image: 'https://images.unsplash.com/photo-1551288049-bbbda536339a?auto=format&fit=crop&q=80&w=800'
  },
  {
    title: 'IA Agents Hub',
    description: 'Orquestación de agentes inteligentes para automatización de flujos.',
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
  }
]

// Survey Data
const surveyValues = [
  { id: 'autonomia', label: 'Autonomía', def: 'Capacidad para tomar las propias decisiones y disponer de tiempo libremente.' },
  { id: 'complejidad', label: 'Complejidad Creciente', def: 'Plantearse continuamente retos nuevos, superarse, dejar atrás la seguridad de la rutina.' },
  { id: 'dinero', label: 'Recompensa Dinero', def: 'Sentir un alto interés por los incentivos económicos.' },
  { id: 'poder', label: 'Recompensa Poder', def: 'Querer pertenecer al círculo de élite en la toma de decisiones.' },
  { id: 'reconocimiento', label: 'Recompensa Reconocimiento', def: 'Desear que los méritos sean visibles y agradecidos públicamente.' }
]

const talents = [
  { id: 'motivador', label: 'Motivador', desc: 'Lidera al equipo, inspira y aúna' },
  { id: 'hacedor', label: 'Hacedor', desc: 'Ejecuta personalmente los proyectos y participa de forma activa' },
  { id: 'vendedor', label: 'Vendedor', desc: 'Sabe usar la influencia para conseguir un resultado' },
  { id: 'comunicador', label: 'Comunicador', desc: 'Sabe transmitir ideas, divulga información y conocimiento' },
  { id: 'ideador', label: 'Ideador o creativo', desc: 'Genera ideas desde el origen es innovador en su máxima expresión' },
  { id: 'analizador', label: 'Analizador', desc: 'Identifica y relaciona puntos críticos, extrae conclusiones de los datos' },
  { id: 'organizador', label: 'Organizador', desc: 'Crea procesos para mejorar el flujo de trabajo, la eficacia y la eficiencia' }
]

interface SurveyResponses {
  [key: string]: { personal: number; real: number };
}

interface SurveyState {
  phase: 'info' | 'personal' | 'real' | 'results' | 'talents' | 'final';
  personalInfo: { name: string; email: string; phone: string };
  responses: SurveyResponses;
  rankings: {
    personal: (string | null)[];
    assignment: (string | null)[];
  };
}

let state: SurveyState = {
  phase: 'info',
  personalInfo: { name: '', email: '', phone: '' },
  responses: surveyValues.reduce((acc, v) => ({ ...acc, [v.id]: { personal: 0, real: 0 } }), {}),
  rankings: {
    personal: Array(7).fill(null),
    assignment: Array(7).fill(null)
  }
}

// Render functions
const renderProjects = () => {
  const container = document.querySelector('.projects-container')
  if (!container) return

  projects.forEach(project => {
    const card = document.createElement('div')
    card.className = 'project-card glass-card'
    card.innerHTML = `
      <div class="project-image" style="background-image: url('${project.image}')"></div>
      <div class="project-overlay">
        <h3>${project.title}</h3>
        <p>${project.description}</p>
      </div>
    `
    container.appendChild(card)
  })
}

const calculateTotal = (type: 'personal' | 'real') => {
  return Object.values(state.responses).reduce((sum, r) => sum + r[type], 0)
}

const renderSurveyStep = () => {
  const container = document.getElementById('survey-container')
  if (!container) return

  if (state.phase === 'info') {
    container.innerHTML = `
      <div class="form-step">
        <span class="step-info">Fase 1: Registro</span>
        <h3>Bienvenido al Test de Ajuste al Rol</h3>
        <div class="form-group">
          <label>Nombre Completo *</label>
          <input type="text" id="survey-name" value="${state.personalInfo.name}" placeholder="Tu nombre...">
        </div>
        <div class="form-group">
          <label>Correo Electrónico (Opcional)</label>
          <input type="email" id="survey-email" value="${state.personalInfo.email}" placeholder="correo@ejemplo.com">
        </div>
        <div class="form-group">
          <label>Teléfono (Opcional)</label>
          <input type="tel" id="survey-phone" value="${state.personalInfo.phone}" placeholder="+593...">
        </div>
        <button class="btn-primary" id="survey-next-info">Comenzar Evaluación</button>
      </div>
    `
  } else if (state.phase === 'personal' || state.phase === 'real' || state.phase === 'results') {
    const isPersonal = state.phase === 'personal'
    const isReal = state.phase === 'real'
    const isResults = state.phase === 'results'
    const total = calculateTotal(isPersonal ? 'personal' : (isReal ? 'real' : 'personal'))
    const remaining = 100 - total

    let phaseTitle = 'Evaluación de Motivación Personal'
    let phaseDesc = 'Asigna pesos (0-100) según lo que más te motiva.'
    if (isReal) {
      phaseTitle = 'Evaluación de Realidad en el Rol'
      phaseDesc = 'Asigna pesos (0-100) según lo que realmente vives hoy.'
    } else if (isResults) {
      phaseTitle = 'Análisis de Desajuste'
      phaseDesc = 'Comparativa final entre motivación y realidad.'
    }

    container.innerHTML = `
      <div class="form-step" style="max-width: 100%;">
        <span class="step-info">Fase 2: Tabla de Valores</span>
        <h3>${phaseTitle}</h3>
        <p style="color: var(--text-muted); font-size: 0.8rem; margin-bottom: 1.5rem;">${phaseDesc}</p>
        
        ${!isResults ? `
          <div class="points-info" id="points-feedback">
            Te quedan <b id="remaining-val">${remaining}</b> puntos por distribuir de 100.
          </div>
        ` : ''}

        <table class="survey-table">
          <thead>
            <tr>
              <th>Elemento</th>
              <th>Definición</th>
              <th style="text-align: center; width: 100px;">Personal</th>
              <th style="text-align: center; width: 100px;">Realidad</th>
              ${isResults ? '<th style="text-align: center; width: 100px;">Dif.</th>' : ''}
            </tr>
          </thead>
          <tbody>
            ${surveyValues.map(v => {
              const resp = state.responses[v.id]
              const diff = resp.real - resp.personal
              return `
                <tr>
                  <td>${v.label}</td>
                  <td style="font-size: 0.75rem; color: var(--text-muted); opacity: 0.8;">${v.def}</td>
                  <td>
                    <input type="number" 
                      class="survey-input" 
                      data-id="${v.id}" 
                      data-type="personal" 
                      value="${resp.personal}" 
                      ${!isPersonal ? 'disabled' : ''} 
                      min="0" max="100">
                  </td>
                  <td>
                    <input type="number" 
                      class="survey-input" 
                      data-id="${v.id}" 
                      data-type="real" 
                      value="${resp.real}" 
                      ${!isReal ? 'disabled' : ''} 
                      min="0" max="100">
                  </td>
                  ${isResults ? `<td class="diff-col ${diff < 0 ? 'negative-val' : ''}">${diff > 0 ? '+' : ''}${diff}</td>` : ''}
                </tr>
              `
            }).join('')}
          </tbody>
        </table>

        <div style="display: flex; gap: 1rem; margin-top: 2rem; justify-content: center;">
          ${state.phase === 'personal' ? '<button class="btn-secondary" id="survey-back-phase">Atrás</button>' : ''}
          <button class="btn-primary" id="survey-next-phase" ${!isResults && total !== 100 ? 'disabled' : ''}>
            ${isPersonal ? 'Siguiente: Realidad' : (isReal ? 'Ver Diferencias' : 'Siguiente: Ranking de Talentos')}
          </button>
        </div>
      </div>
    `
    setupTableListeners()
  } else if (state.phase === 'talents') {
    renderTalentsStep()
  } else {
    renderResults()
  }
}

const renderTalentsStep = () => {
  const container = document.getElementById('survey-container')
  if (!container) return

  // Talents that are not yet placed in BOTH columns (optional: or just show all for simplicity as requested)
  // The user says "arrastra los talentos como etiquetas a la tabla... y las orden de 1 a 7 en ambas tablas"
  // This implies you can use the same talent in both.
  
  container.innerHTML = `
    <div class="form-step" style="max-width: 100%;">
      <span class="step-info">Fase 3: Ranking de Talentos</span>
      <h3>Ranking Comparativo de Talentos</h3>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1.5rem;">
        Arrastra los talentos desde el panel superior a los espacios de ambas tablas.
      </p>

      <div class="talents-pool" id="talents-pool">
        ${talents.map(t => {
          const usedInPersonal = state.rankings.personal.includes(t.id);
          const usedInAssignment = state.rankings.assignment.includes(t.id);
          const useCount = (usedInPersonal ? 1 : 0) + (usedInAssignment ? 1 : 0);
          
          let statusClass = '';
          if (useCount === 1) statusClass = 'half-used';
          else if (useCount === 2) statusClass = 'used';

          return `<div class="talent-tag ${statusClass}" draggable="${useCount < 2}" data-id="${t.id}">${t.label}</div>`
        }).join('')}
      </div>

      <div class="talents-container">
        <div class="rankings-grid">
          <!-- Col 1: Personal -->
          <div class="ranking-column">
            <h4>Talentos Personales</h4>
            <div class="ranking-slots">
              ${[0, 1, 2, 3, 4, 5, 6].map(i => {
                const id = state.rankings.personal[i]
                const talent = talents.find(t => t.id === id)
                return `
                  <div class="slot">
                    <div class="slot-number">${i + 1}</div>
                    <div class="slot-dropzone" data-index="${i}" data-type="personal">
                      ${talent ? `<div class="talent-tag used" draggable="true" data-id="${talent.id}">${talent.label}</div>` : ''}
                    </div>
                  </div>
                `
              }).join('')}
            </div>
          </div>

          <!-- Col 2: Assignment -->
          <div class="ranking-column">
            <h4>Talentos de la Asignación</h4>
            <div class="ranking-slots">
              ${[0, 1, 2, 3, 4, 5, 6].map(i => {
                const id = state.rankings.assignment[i]
                const talent = talents.find(t => t.id === id)
                return `
                  <div class="slot">
                    <div class="slot-number">${i + 1}</div>
                    <div class="slot-dropzone" data-index="${i}" data-type="assignment">
                      ${talent ? `<div class="talent-tag used" draggable="true" data-id="${talent.id}">${talent.label}</div>` : ''}
                    </div>
                  </div>
                `
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <div style="display: flex; gap: 1rem; margin-top: 2rem; justify-content: center;">
        <button class="btn-secondary" id="survey-back-to-results">Atrás</button>
        <button class="btn-primary" id="survey-finish" ${isRankingComplete() ? '' : 'disabled'}>Finalizar y Ver Gráficos</button>
      </div>
    </div>
  `
  setupDragAndDrop()
}

const isRankingComplete = () => {
  return state.rankings.personal.every(v => v !== null) && 
         state.rankings.assignment.every(v => v !== null)
}

const setupDragAndDrop = () => {
  const draggables = document.querySelectorAll('.talent-tag')
  const drops = document.querySelectorAll('.slot-dropzone')

  draggables.forEach(d => {
    d.addEventListener('dragstart', (e: any) => {
      e.dataTransfer.setData('text/plain', d.getAttribute('data-id'))
      d.classList.add('dragging')
    })
    d.addEventListener('dragend', () => d.classList.remove('dragging'))
  })

  drops.forEach(drop => {
    drop.addEventListener('dragover', (e) => {
      e.preventDefault()
      drop.classList.add('over')
    })
    drop.addEventListener('dragleave', () => drop.classList.remove('over'))
    drop.addEventListener('drop', (e: any) => {
      e.preventDefault()
      drop.classList.remove('over')
      
      const talentId = e.dataTransfer.getData('text/plain')
      const index = parseInt(drop.getAttribute('data-index')!)
      const type = drop.getAttribute('data-type') as 'personal' | 'assignment'
      
      // Check if talent already exists in THIS column and remove it from old position
      const oldIndex = state.rankings[type].indexOf(talentId)
      if (oldIndex !== -1) {
        state.rankings[type][oldIndex] = null
      }
      
      state.rankings[type][index] = talentId
      renderTalentsStep()
    })
  })
}

const setupTableListeners = () => {
  const inputs = document.querySelectorAll('.survey-input')
  inputs.forEach(input => {
    input.addEventListener('input', (e) => {
      const el = e.target as HTMLInputElement
      const id = el.dataset.id!
      const type = el.dataset.type as 'personal' | 'real'
      let val = parseInt(el.value) || 0
      
      // Limit value to prevent going over 100 total
      const otherValuesSum = surveyValues
        .filter(v => v.id !== id)
        .reduce((sum, v) => sum + state.responses[v.id][type], 0)
      
      if (val + otherValuesSum > 100) {
        val = 100 - otherValuesSum
        el.value = val.toString()
      }
      
      state.responses[id][type] = val
      
      // Update feedback
      const total = calculateTotal(type)
      const feedback = document.getElementById('remaining-val')
      if (feedback) feedback.innerText = (100 - total).toString()
      
      const btn = document.getElementById('survey-next-phase') as HTMLButtonElement
      if (btn) btn.disabled = (total !== 100)
    })
  })
}

const renderResults = () => {
  const container = document.getElementById('survey-container')
  if (!container) return

  // Interpretation Logic
  const getExpectationsInterpretation = () => {
    const gaps = surveyValues.map(v => ({ label: v.label, gap: state.responses[v.id].real - state.responses[v.id].personal }));
    const majorGap = gaps.sort((a,b) => a.gap - b.gap)[0]; // Most negative
    const majorFit = gaps.sort((a,b) => b.gap - a.gap)[0]; // Most positive
    
    if (Math.abs(majorGap.gap) > 30) {
      return `Existe un desajuste significativo en <b>${majorGap.label}</b>. Sientes que tu motivación personal en este aspecto es mucho más alta de lo que el rol actual te permite vivir. Por otro lado, tu mayor satisfacción o alineación se encuentra en <b>${majorFit.label}</b>.`;
    }
    return "Tus expectativas y la realidad del rol guardan una armonía razonable. No se observan fugas críticas de motivación en los valores fundamentales analizados.";
  }

  const getTalentsInterpretation = () => {
    let alignedCount = 0;
    talents.forEach(t => {
      const p = state.rankings.personal.indexOf(t.id);
      const a = state.rankings.assignment.indexOf(t.id);
      if (Math.abs(p - a) <= 1) alignedCount++;
    });

    if (alignedCount >= 5) {
      return "<b>Excelente Alineación:</b> Tus fortalezas naturales coinciden casi perfectamente con el orden de prioridades que exige tu posición actual. Estás en el lugar correcto para brillar.";
    } else if (alignedCount >= 3) {
      return "<b>Alineación Moderada:</b> Hay algunos talentos clave que no se están utilizando en su máximo potencial según la prioridad del rol. Se recomienda revisar las tareas secundarias.";
    } else {
      return "<b>Divergencia de Perfil:</b> Existe una separación marcada entre lo que mejor sabes hacer y lo que el rol te demanda prioritariamente. Riesgo de agotamiento por sobreesfuerzo en áreas no naturales.";
    }
  }

  const downloadResultsPDF = async () => {
    const btn = document.getElementById('download-pdf') as HTMLButtonElement;
    const originalText = btn.innerText;
    btn.innerText = 'Generando PDF...';
    btn.disabled = true;

    try {
      const element = document.getElementById('survey-container')!;
      // Hide buttons for screenshot
      const buttons = element.querySelectorAll('button');
      buttons.forEach(b => b.style.display = 'none');

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#F7F5F2',
        logging: false
      });

      // Show buttons back
      buttons.forEach(b => b.style.display = 'block');

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      const now = new Date();
      const dateStr = now.toLocaleDateString() + ' ' + now.toLocaleTimeString();

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      
      // Add Footer with timestamp
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(`Documento generado para: ${state.personalInfo.name}`, 10, 285);
      pdf.text(`Fecha de realización: ${dateStr}`, 10, 290);
      pdf.text(`IA Factory Marco Logacho - Ajuste al Rol`, pdfWidth - 70, 290);

      pdf.save(`Ajuste_Rol_${state.personalInfo.name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('Error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      btn.innerText = originalText;
      btn.disabled = false;
    }
  };

  container.innerHTML = `
    <div class="form-step" style="max-width: 100%; text-align: center;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 1rem; margin-bottom: 2rem;">
        <img src="/logo.jpg" alt="Logo" style="height: 60px;">
        <h3>Diagnóstico Integral de Carrera</h3>
        <p>Hola <b>${state.personalInfo.name}</b>, aquí tienes el análisis detallado de tu perfil.</p>
      </div>
      
      <div class="results-grid">
        <!-- Radar Chart Box -->
        <div class="chart-box">
          <h4>Expectativas vs Realidad (Análisis de Valores)</h4>
          <div class="chart-container">
            <canvas id="expectationsChart"></canvas>
          </div>
          <div class="interpretation-box">
            <h5><span>💡</span> Interpretación de Valores</h5>
            <p>${getExpectationsInterpretation()}</p>
          </div>
        </div>

        <!-- Alignment Chart Box -->
        <div class="chart-box">
          <h4>Alineación de Talentos (Puesto vs Perfil)</h4>
          <div class="chart-container">
            <canvas id="talentsChart"></canvas>
          </div>
          <div class="interpretation-box">
            <h5><span>🎯</span> Interpretación de Talentos</h5>
            <p>${getTalentsInterpretation()}</p>
          </div>
        </div>
      </div>
      
      <div style="display: flex; gap: 1rem; justify-content: center; margin-top: 3rem; margin-bottom: 2rem;">
        <button class="btn-secondary" id="download-pdf" style="display: flex; align-items: center; gap: 0.5rem;">
          <span>📄</span> Descargar PDF
        </button>
        <button class="btn-primary" id="survey-close">Finalizar y Salir</button>
      </div>
    </div>
  `

  setTimeout(() => {
    document.getElementById('download-pdf')?.addEventListener('click', downloadResultsPDF);
    document.getElementById('survey-close')?.addEventListener('click', () => {
      document.getElementById('survey-modal')?.classList.remove('active')
    });
  }, 100);

  // 1. Radar Chart Setup
  const ctxE = (document.getElementById('expectationsChart') as HTMLCanvasElement).getContext('2d')
  if (ctxE) {
    new Chart(ctxE, {
      type: 'radar',
      data: {
        labels: surveyValues.map(v => v.label),
        datasets: [{
          label: 'Motivación',
          data: surveyValues.map(v => state.responses[v.id].personal),
          backgroundColor: 'rgba(167, 199, 163, 0.2)',
          borderColor: '#A7C7A3',
          borderWidth: 3,
          pointBackgroundColor: '#A7C7A3'
        }, {
          label: 'Realidad',
          data: surveyValues.map(v => state.responses[v.id].real),
          backgroundColor: 'rgba(53, 92, 125, 0.1)',
          borderColor: '#355C7D',
          borderWidth: 3,
          pointBackgroundColor: '#355C7D'
        }]
      },
      options: {
        scales: {
          r: {
            beginAtZero: true, max: 100, ticks: { display: false },
            grid: { color: 'rgba(53, 92, 125, 0.1)' },
            pointLabels: { color: '#355C7D', font: { size: 12, weight: 'bold' } }
          }
        },
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top', labels: { color: '#355C7D', font: { size: 12 } } } }
      }
    })
  }

  // 2. Alignment Chart Setup (Scatter with Line)
  const ctxT = (document.getElementById('talentsChart') as HTMLCanvasElement).getContext('2d')
  if (ctxT) {
    const alignmentData = talents.map(t => {
      const pIndex = state.rankings.personal.indexOf(t.id) + 1
      const aIndex = state.rankings.assignment.indexOf(t.id) + 1
      return { x: aIndex, y: pIndex, label: t.label } // X: Assignment, Y: Personal
    }).sort((a, b) => a.x - b.x); // Sort by X to make the line continuous

    new Chart(ctxT, {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'Tu Perfil',
            data: alignmentData,
            backgroundColor: '#C08552',
            borderColor: '#C08552',
            borderWidth: 2,
            pointRadius: 8,
            pointHoverRadius: 11,
            showLine: true, // Conecta los puntos con una línea
            tension: 0.3, // Línea ligeramente curva
            fill: false
          },
          {
            label: 'Línea de Ajuste Ideal',
            data: [{x:1, y:1, label: 'Ideal'}, {x:7, y:7, label: 'Ideal'}],
            type: 'line',
            borderColor: 'rgba(53, 92, 125, 0.2)',
            borderDash: [8, 4],
            fill: false,
            pointRadius: 0
          }
        ]
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          x: {
            title: { display: true, text: 'Talento Requerido por el Puesto (1-7)', color: '#355C7D', font: { weight: 'bold' } },
            min: 0.5, max: 7.5,
            ticks: { 
              stepSize: 1, 
              color: '#64748b',
              callback: (val: any) => {
                const idx = Math.round(val) - 1;
                const tid = state.rankings.assignment[idx];
                const t = talents.find(tal => tal.id === tid);
                return t ? `${idx + 1}. ${t.label}` : '';
              }
            },
            grid: { color: 'rgba(53, 92, 125, 0.05)' }
          },
          y: {
            title: { display: true, text: 'Tu Prioridad Personal (1-7)', color: '#355C7D', font: { weight: 'bold' } },
            min: 0.5, max: 7.5,
            ticks: { 
              stepSize: 1, 
              color: '#64748b',
              callback: (val: any) => {
                const idx = Math.round(val) - 1;
                const tid = state.rankings.personal[idx];
                const t = talents.find(tal => tal.id === tid);
                return t ? `${idx + 1}. ${t.label}` : '';
              }
            },
            grid: { color: 'rgba(53, 92, 125, 0.05)' },
            reverse: true
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const item = alignmentData[ctx.dataIndex] || ctx.raw;
                if (item.label === 'Ideal') return 'Línea de Ajuste Perfecto';
                return ` ${item.label}: Puesto #${item.x}, Yo #${item.y}`;
              }
            }
          },
          legend: { position: 'top' }
        }
      }
    })
  }

  document.getElementById('survey-close')?.addEventListener('click', () => {
    document.getElementById('survey-modal')?.classList.remove('active')
  })
}

// Event Listeners
const setupSurveyEvents = () => {
  const container = document.getElementById('survey-container')
  if (!container) return

  container.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    
    // Info -> Personal
    if (target.id === 'survey-next-info') {
      const name = (document.getElementById('survey-name') as HTMLInputElement).value
      if (!name) return alert('Por favor, ingresa tu nombre.')
      state.personalInfo = {
        name,
        email: (document.getElementById('survey-email') as HTMLInputElement).value,
        phone: (document.getElementById('survey-phone') as HTMLInputElement).value
      }
      state.phase = 'personal'
      renderSurveyStep()
    }

    // Phase transitions
    if (target.id === 'survey-next-phase') {
      if (state.phase === 'personal') {
        state.phase = 'real'
      } else if (state.phase === 'real') {
        state.phase = 'results'
      } else if (state.phase === 'results') {
        state.phase = 'talents'
      }
      renderSurveyStep()
    }

    if (target.id === 'survey-back-phase') {
      state.phase = 'info'
      renderSurveyStep()
    }

    if (target.id === 'survey-back-to-results') {
      state.phase = 'results'
      renderSurveyStep()
    }

    if (target.id === 'survey-finish') {
      state.phase = 'final'
      renderSurveyStep()
    }
  })

  document.querySelector('.close-modal')?.addEventListener('click', () => {
    document.getElementById('survey-modal')?.classList.remove('active')
  })

  document.getElementById('btn-survey')?.addEventListener('click', () => {
    state = { 
      phase: 'info', 
      personalInfo: { name: '', email: '', phone: '' }, 
      responses: surveyValues.reduce((acc, v) => ({ ...acc, [v.id]: { personal: 0, real: 0 } }), {}),
      rankings: {
        personal: Array(7).fill(null),
        assignment: Array(7).fill(null)
      }
    }
    document.getElementById('survey-modal')?.classList.add('active')
    renderSurveyStep()
  })
}

// Existing animations and setups
const animateNumbers = () => {
  const stats = document.querySelectorAll('.stat-value')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement
        const endValue = parseInt(target.getAttribute('data-target') || '0')
        let startValue = 0
        const duration = 2000
        const stepTime = Math.abs(Math.floor(duration / endValue))
        const timer = setInterval(() => {
          startValue += 1
          target.innerText = startValue + (target.getAttribute('data-target') === '100' || target.getAttribute('data-target') === '98' ? '%' : '')
          if (startValue === endValue) clearInterval(timer)
        }, stepTime)
        observer.unobserve(target)
      }
    })
  }, { threshold: 0.5 })
  stats.forEach(stat => observer.observe(stat))
}

const revealOnScroll = () => {
  const elements = document.querySelectorAll('.animate-up')
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('visible')
    })
  }, { threshold: 0.1 })
  elements.forEach(el => observer.observe(el))
}

const setupButtons = () => {
  // Main listeners removed per user request (only survey button remains)
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  renderProjects()
  animateNumbers()
  revealOnScroll()
  setupButtons()
  setupSurveyEvents()
  setTimeout(() => {
    document.querySelectorAll('.hero-section .animate-up').forEach(el => el.classList.add('visible'))
  }, 100)
})
