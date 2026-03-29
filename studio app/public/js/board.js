/* ════════════════════════════════════════════
   ARCUS — Kanban Board Logic
   ════════════════════════════════════════════ */

requireAuth();

const COLUMNS = [
  { id: 'todo',       label: 'To Do',       color: '#5a6490', dotColor: 'var(--text-3)' },
  { id: 'inprogress', label: 'In Progress',  color: '#6378ff', dotColor: 'var(--blue)' },
  { id: 'review',     label: 'Review',       color: '#a855f7', dotColor: 'var(--violet)' },
  { id: 'done',       label: 'Done',         color: '#10b981', dotColor: 'var(--emerald)' },
];

let boardTasks = Mock.tasks.map(t => ({ ...t }));
let dragCard = null;
let dragSourceCol = null;

document.addEventListener('DOMContentLoaded', () => {
  renderBoard();
  populateBoardProjectFilter();

  document.getElementById('board-search')?.addEventListener('input', renderBoard);
  document.getElementById('board-project-filter')?.addEventListener('change', renderBoard);
});

// ── Render Board ────────────────────────────────
function renderBoard() {
  const board = document.getElementById('kanban-board');
  if (!board) return;

  const search = document.getElementById('board-search')?.value.toLowerCase() || '';
  const projFilter = document.getElementById('board-project-filter')?.value || '';

  let tasks = boardTasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search);
    const matchProj = !projFilter || String(t.projectId) === projFilter;
    return matchSearch && matchProj;
  });

  board.innerHTML = COLUMNS.map(col => {
    const colTasks = tasks.filter(t => t.status === col.id);
    return `
      <div class="kanban-col" id="col-${col.id}" data-col="${col.id}"
           ondragover="onDragOver(event)" ondrop="onDrop(event, '${col.id}')">
        <div class="kanban-col-header">
          <div class="kanban-col-title">
            <div class="kanban-dot" style="background:${col.dotColor}"></div>
            ${col.label}
          </div>
          <span class="kanban-count">${colTasks.length}</span>
        </div>
        <div class="kanban-cards" id="cards-${col.id}">
          ${colTasks.map(t => cardHTML(t)).join('')}
        </div>
        <button class="kanban-add-card" onclick="openCardModal('${col.id}')">
          + Add card
        </button>
      </div>
    `;
  }).join('');

  // Bind drag events after render
  document.querySelectorAll('.kanban-card').forEach(bindDragEvents);
}

// ── Card HTML ───────────────────────────────────
function cardHTML(task) {
  const proj = Mock.projects.find(p => p.id === task.projectId);
  const priorityColors = { low:'var(--text-3)', medium:'var(--blue)', high:'var(--amber)', urgent:'var(--rose)' };
  const priorityBg = { low:'var(--surface-3)', medium:'rgba(99,120,255,.12)', high:'rgba(245,158,11,.12)', urgent:'rgba(244,63,94,.12)' };
  const memberColors = { JD:'av-blue', AK:'av-violet', SC:'av-emerald', MG:'av-amber', LM:'av-cyan' };
  const daysLeft = daysUntil(task.dueDate);
  const dueColor = daysLeft === null ? 'var(--text-3)' : daysLeft < 0 ? 'var(--rose)' : daysLeft <= 2 ? 'var(--amber)' : 'var(--text-3)';

  return `
    <div class="kanban-card" id="card-${task.id}" data-id="${task.id}" draggable="true">
      <!-- Priority & Project tag -->
      <div style="display:flex;align-items:center;gap:.4rem;margin-bottom:.6rem;flex-wrap:wrap">
        ${proj ? `<span class="kanban-card-tag" style="background:${proj.color}18;color:${proj.color}">${proj.name}</span>` : ''}
        <span style="font-size:.65rem;font-weight:600;text-transform:uppercase;letter-spacing:.06em;
          padding:.15rem .5rem;border-radius:99px;background:${priorityBg[task.priority]};color:${priorityColors[task.priority]}">
          ${task.priority}
        </span>
      </div>

      <div class="kanban-card-title">${task.title}</div>

      <!-- Footer -->
      <div class="kanban-card-meta" style="margin-top:.65rem">
        <div style="display:flex;align-items:center;gap:.4rem">
          ${task.assignee ? `<div class="avatar avatar-sm ${memberColors[task.assignee] || 'av-blue'}">${task.assignee}</div>` : ''}
          ${task.dueDate ? `<span style="font-size:.68rem;font-family:'JetBrains Mono',monospace;color:${dueColor}">${formatDate(task.dueDate)}</span>` : ''}
        </div>
        <button onclick="deleteCard(${task.id})" style="background:none;border:none;color:var(--text-3);cursor:pointer;font-size:.85rem;padding:0;opacity:0;transition:opacity var(--t-fast)"
          onmouseenter="this.style.color='var(--rose)';this.style.opacity=1"
          onmouseleave="this.style.color='var(--text-3)'"
          class="card-delete-btn">🗑</button>
      </div>
    </div>
  `;
}

// Show delete on card hover
document.addEventListener('mouseover', e => {
  const card = e.target.closest?.('.kanban-card');
  if (card) card.querySelector('.card-delete-btn')?.style && (card.querySelector('.card-delete-btn').style.opacity = '1');
});
document.addEventListener('mouseout', e => {
  const card = e.target.closest?.('.kanban-card');
  if (card && !card.contains(e.relatedTarget)) {
    const btn = card.querySelector('.card-delete-btn');
    if (btn) btn.style.opacity = '0';
  }
});

// ── Drag & Drop ─────────────────────────────────
function bindDragEvents(el) {
  el.addEventListener('dragstart', e => {
    dragCard = el;
    dragSourceCol = el.closest('[data-col]')?.dataset.col;
    el.style.opacity = '0.4';
    e.dataTransfer.setData('text/plain', el.dataset.id);
  });
  el.addEventListener('dragend', () => {
    el.style.opacity = '1';
    dragCard = null;
  });
}

function onDragOver(e) {
  e.preventDefault();
  const col = e.currentTarget;
  col.style.background = 'rgba(99,120,255,0.04)';
  col.style.borderColor = 'var(--border-hi)';
}

function onDrop(e, colId) {
  e.preventDefault();
  const col = e.currentTarget;
  col.style.background = '';
  col.style.borderColor = '';

  const taskId = parseInt(e.dataTransfer.getData('text/plain'));
  if (!taskId) return;

  const task = boardTasks.find(t => t.id === taskId);
  if (task && task.status !== colId) {
    task.status = colId;
    showToast(`Moved to "${COLUMNS.find(c => c.id === colId)?.label}" ✓`, 'success');
    renderBoard();
  }
}

// Column drag leave
document.addEventListener('dragleave', e => {
  const col = e.target.closest?.('[data-col]');
  if (col && !col.contains(e.relatedTarget)) {
    col.style.background = '';
    col.style.borderColor = '';
  }
});

// ── Card Modal ─────────────────────────────────
function openCardModal(defaultStatus = 'todo') {
  document.getElementById('card-status').value = defaultStatus;
  document.getElementById('card-modal-title').textContent = 'Add Card';
  document.getElementById('card-form').reset();
  document.getElementById('card-status').value = defaultStatus;
  openModal('card-modal');
}

document.getElementById('card-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const title = document.getElementById('card-title').value.trim();
  if (!title) return;

  const btn = this.querySelector('[type=submit]');
  btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
  await new Promise(r => setTimeout(r, 400));

  boardTasks.push({
    id: Date.now(),
    title,
    status: document.getElementById('card-status').value,
    priority: document.getElementById('card-priority').value,
    projectId: 1,
    assignee: document.getElementById('card-assignee').value || null,
    dueDate: document.getElementById('card-due').value || null,
    description: document.getElementById('card-desc').value
  });

  closeModal('card-modal');
  renderBoard();
  showToast('Card created! 🃏', 'success');

  btn.disabled = false; btn.innerHTML = 'Save Card';
});

function deleteCard(id) {
  confirmAction('Delete this card?', () => {
    const idx = boardTasks.findIndex(t => t.id === id);
    if (idx !== -1) { boardTasks.splice(idx, 1); renderBoard(); showToast('Card deleted', 'success'); }
  });
}

// ── Project filter ─────────────────────────────
function populateBoardProjectFilter() {
  const sel = document.getElementById('board-project-filter');
  if (!sel) return;
  Mock.projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = p.name;
    sel.appendChild(opt);
  });
}
