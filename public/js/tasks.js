/* ════════════════════════════════════════════
   ARCUS — Tasks Page Logic
   ════════════════════════════════════════════ */

requireAuth();

let activeTasks    = Mock.tasks.map(t => ({ ...t }));
let activeFilter   = 'all';
let activePriority = null;
let sortMode       = 'dueDate';   // dueDate | priority | title | status
let groupMode      = 'status';    // status | priority | project | none
let editingId      = null;

const sortModes  = ['dueDate','priority','title','status'];
const groupModes = ['status','priority','project','none'];
const sortLabels  = { dueDate:'Due Date', priority:'Priority', title:'Title', status:'Status' };
const groupLabels = { status:'Status', priority:'Priority', project:'Project', none:'None' };

// ── Boot ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  populateProjectSelect();
  renderStats();
  renderTasks();

  document.getElementById('task-search')?.addEventListener('input', renderTasks);

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      activeFilter = this.dataset.filter;
      document.querySelectorAll('.filter-btn').forEach(b => {
        b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
        b.classList.remove('btn-primary'); b.classList.add('btn-ghost');
      });
      this.style.background = 'var(--blue)';
      this.style.color = '#fff';
      this.style.borderColor = 'var(--blue)';
      toggleClearBtn();
      renderTasks();
    });
  });

  // Priority filter buttons
  document.querySelectorAll('.priority-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const p = this.dataset.priority;
      if (activePriority === p) {
        activePriority = null;
        this.style.background = '';
        this.style.borderColor = '';
      } else {
        activePriority = p;
        document.querySelectorAll('.priority-btn').forEach(b => { b.style.background=''; b.style.borderColor=''; });
        this.style.background = 'rgba(99,120,255,.12)';
        this.style.borderColor = 'var(--blue)';
      }
      toggleClearBtn();
      renderTasks();
    });
  });
});

// ── Stats ──────────────────────────────────────
function renderStats() {
  const all       = activeTasks.length;
  const inprog    = activeTasks.filter(t => t.status === 'inprogress').length;
  const done      = activeTasks.filter(t => t.status === 'done').length;
  const overdue   = activeTasks.filter(t => {
    if (!t.dueDate || t.status === 'done') return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  setTimeout(() => animateCount(document.getElementById('st-all'),        all,    ''), 200);
  setTimeout(() => animateCount(document.getElementById('st-inprogress'), inprog, ''), 300);
  setTimeout(() => animateCount(document.getElementById('st-overdue'),    overdue,''), 400);
  setTimeout(() => animateCount(document.getElementById('st-done'),       done,   ''), 500);
}

// ── Render Tasks ───────────────────────────────
function renderTasks() {
  const search = document.getElementById('task-search')?.value.toLowerCase() || '';

  let tasks = activeTasks.filter(t => {
    const matchFilter   = activeFilter === 'all' || t.status === activeFilter;
    const matchPriority = !activePriority || t.priority === activePriority;
    const matchSearch   = !search || t.title.toLowerCase().includes(search);
    return matchFilter && matchPriority && matchSearch;
  });

  // Sort
  tasks = sortTasks(tasks, sortMode);

  // Group
  const container = document.getElementById('task-groups');
  if (!container) return;

  if (groupMode === 'none') {
    container.innerHTML = `<div class="card" style="padding:0">${taskTable(tasks)}</div>`;
  } else {
    const groups = groupTasks(tasks, groupMode);
    container.innerHTML = groups.map(g => `
      <div class="card" style="padding:0;margin-bottom:1rem">
        <div style="padding:.9rem 1.2rem;border-bottom:1px solid var(--border);
          display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;align-items:center;gap:.6rem">
            <div style="width:10px;height:10px;border-radius:50%;background:${g.color}"></div>
            <span style="font-family:'Syne',sans-serif;font-size:.9rem;font-weight:700">${g.label}</span>
            <span style="background:var(--surface-3);color:var(--text-3);font-size:.7rem;
              font-weight:700;padding:.1rem .55rem;border-radius:99px">${g.tasks.length}</span>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="addTaskInGroup('${g.id}')">+ Add</button>
        </div>
        ${g.tasks.length > 0 ? taskTable(g.tasks) : `
          <div style="padding:2rem;text-align:center;color:var(--text-3);font-size:.85rem">
            No tasks here — <button class="btn btn-ghost btn-sm" onclick="addTaskInGroup('${g.id}')">add one</button>
          </div>`}
      </div>
    `).join('');
  }

  observeReveal('.task-row');
}

// ── Task Table ─────────────────────────────────
function taskTable(tasks) {
  if (!tasks.length) return `<div style="padding:2rem;text-align:center;color:var(--text-3)">No tasks</div>`;
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th style="width:32px"></th>
            <th>Task</th>
            <th>Project</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due</th>
            <th style="width:80px"></th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(t => taskRow(t)).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function taskRow(t) {
  const proj = Mock.projects.find(p => p.id === t.projectId);
  const isDone = t.status === 'done';
  const isOverdue = t.dueDate && !isDone && new Date(t.dueDate) < new Date();

  return `
    <tr class="task-row" id="row-${t.id}" style="opacity:0">
      <td>
        <input type="checkbox" ${isDone ? 'checked' : ''}
          style="accent-color:var(--blue);width:15px;height:15px;cursor:pointer;display:block"
          onchange="toggleDone(${t.id}, this.checked)"/>
      </td>
      <td>
        <div style="${isDone ? 'text-decoration:line-through;color:var(--text-3)' : ''}">
          <span style="cursor:pointer;font-weight:500" onclick="openDetail(${t.id})">${t.title}</span>
          ${t.description ? `<div class="text-xs text-muted mt-1" style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${t.description}</div>` : ''}
        </div>
      </td>
      <td>
        ${proj
          ? `<div style="display:flex;align-items:center;gap:.4rem">
               <div style="width:8px;height:8px;border-radius:50%;background:${proj.color}"></div>
               <span class="text-sm">${proj.name}</span>
             </div>`
          : '<span class="text-muted text-sm">—</span>'}
      </td>
      <td>${priorityBadge(t.priority)}</td>
      <td>${statusBadge(t.status)}</td>
      <td>
        ${t.dueDate
          ? `<span style="font-size:.78rem;font-family:'JetBrains Mono',monospace;
              color:${isOverdue ? 'var(--rose)' : 'var(--text-3)'}" ${isOverdue ? 'title="Overdue!"' : ''}>
              ${isOverdue ? '⚠ ' : ''}${formatDate(t.dueDate)}
            </span>`
          : '<span class="text-muted">—</span>'}
      </td>
      <td>
        <div style="display:flex;gap:.3rem;justify-content:flex-end">
          <button class="btn btn-ghost btn-icon btn-sm" onclick="openEdit(${t.id})" data-tip="Edit">✏️</button>
          <button class="btn btn-ghost btn-icon btn-sm" onclick="deleteTask(${t.id})" data-tip="Delete" style="color:var(--rose)">🗑</button>
        </div>
      </td>
    </tr>
  `;
}

// ── Grouping ───────────────────────────────────
function groupTasks(tasks, mode) {
  if (mode === 'status') {
    return [
      { id:'todo',       label:'To Do',       color:'var(--text-3)', tasks: tasks.filter(t => t.status === 'todo') },
      { id:'inprogress', label:'In Progress',  color:'var(--blue)',   tasks: tasks.filter(t => t.status === 'inprogress') },
      { id:'review',     label:'Review',       color:'var(--violet)', tasks: tasks.filter(t => t.status === 'review') },
      { id:'done',       label:'Done',         color:'var(--emerald)',tasks: tasks.filter(t => t.status === 'done') },
    ];
  }
  if (mode === 'priority') {
    return [
      { id:'urgent', label:'Urgent', color:'var(--rose)',    tasks: tasks.filter(t => t.priority === 'urgent') },
      { id:'high',   label:'High',   color:'var(--amber)',   tasks: tasks.filter(t => t.priority === 'high') },
      { id:'medium', label:'Medium', color:'var(--blue)',    tasks: tasks.filter(t => t.priority === 'medium') },
      { id:'low',    label:'Low',    color:'var(--text-3)',  tasks: tasks.filter(t => t.priority === 'low') },
    ];
  }
  if (mode === 'project') {
    return Mock.projects.map(p => ({
      id: String(p.id), label: p.name, color: p.color,
      tasks: tasks.filter(t => t.projectId === p.id)
    })).concat([{
      id: 'none', label: 'No Project', color: 'var(--text-3)',
      tasks: tasks.filter(t => !t.projectId)
    }]).filter(g => g.tasks.length > 0);
  }
  return [{ id: 'all', label: 'All Tasks', color: 'var(--blue)', tasks }];
}

// ── Sorting ────────────────────────────────────
function sortTasks(tasks, mode) {
  return [...tasks].sort((a, b) => {
    if (mode === 'dueDate') {
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    }
    if (mode === 'priority') {
      const order = { urgent:0, high:1, medium:2, low:3 };
      return (order[a.priority] ?? 4) - (order[b.priority] ?? 4);
    }
    if (mode === 'title') return a.title.localeCompare(b.title);
    if (mode === 'status') {
      const order = { todo:0, inprogress:1, review:2, done:3 };
      return (order[a.status] ?? 4) - (order[b.status] ?? 4);
    }
    return 0;
  });
}

function cycleSort() {
  const idx = sortModes.indexOf(sortMode);
  sortMode = sortModes[(idx + 1) % sortModes.length];
  document.getElementById('sort-label').textContent = sortLabels[sortMode];
  renderTasks();
}
function cycleGroup() {
  const idx = groupModes.indexOf(groupMode);
  groupMode = groupModes[(idx + 1) % groupModes.length];
  document.getElementById('group-label').textContent = groupLabels[groupMode];
  renderTasks();
}

// ── Actions ────────────────────────────────────
function toggleDone(id, checked) {
  const t = activeTasks.find(t => t.id === id);
  if (t) {
    t.status = checked ? 'done' : 'todo';
    renderStats();
    renderTasks();
    showToast(checked ? 'Task complete! ✅' : 'Task reopened', checked ? 'success' : 'info');
  }
}

function deleteTask(id) {
  confirmAction('Delete this task? This cannot be undone.', () => {
    const idx = activeTasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      activeTasks.splice(idx, 1);
      renderStats(); renderTasks();
      showToast('Task deleted', 'success');
    }
  });
}

function addTaskInGroup(groupId) {
  editingId = null;
  document.getElementById('task-modal-title').textContent = 'New Task';
  document.getElementById('task-form').reset();
  // Pre-fill status or priority based on group
  if (['todo','inprogress','review','done'].includes(groupId)) {
    document.getElementById('t-status').value = groupId;
  }
  if (['urgent','high','medium','low'].includes(groupId)) {
    document.getElementById('t-priority').value = groupId;
  }
  openModal('new-task-modal');
}

function openEdit(id) {
  const t = activeTasks.find(t => t.id === id);
  if (!t) return;
  editingId = id;
  document.getElementById('task-modal-title').textContent = 'Edit Task';
  document.getElementById('t-title').value    = t.title;
  document.getElementById('t-desc').value     = t.description || '';
  document.getElementById('t-status').value   = t.status;
  document.getElementById('t-priority').value = t.priority;
  document.getElementById('t-due').value      = t.dueDate || '';
  document.getElementById('t-project').value  = t.projectId || '';
  openModal('new-task-modal');
}

function openDetail(id) {
  const t = activeTasks.find(t => t.id === id);
  if (!t) return;
  const proj = Mock.projects.find(p => p.id === t.projectId);
  const isOverdue = t.dueDate && t.status !== 'done' && new Date(t.dueDate) < new Date();

  document.getElementById('task-detail-body').innerHTML = `
    <div style="display:flex;flex-direction:column;gap:1.2rem">
      <div>
        <div style="font-family:'Syne',sans-serif;font-size:1.25rem;font-weight:700;margin-bottom:.5rem">${t.title}</div>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap">
          ${statusBadge(t.status)}
          ${priorityBadge(t.priority)}
          ${proj ? `<span class="badge" style="background:${proj.color}18;color:${proj.color};border:1px solid ${proj.color}30">${proj.name}</span>` : ''}
        </div>
      </div>
      ${t.description ? `
        <div>
          <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);margin-bottom:.4rem">Description</div>
          <p style="font-size:.9rem;line-height:1.7;color:var(--text-2)">${t.description}</p>
        </div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:1rem">
        <div>
          <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);margin-bottom:.3rem">Due Date</div>
          <div style="font-size:.9rem;color:${isOverdue ? 'var(--rose)' : 'var(--text-1)'}">
            ${t.dueDate ? (isOverdue ? '⚠ ' : '') + formatDate(t.dueDate) : 'No due date'}
          </div>
        </div>
        <div>
          <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);margin-bottom:.3rem">Assignee</div>
          <div style="display:flex;align-items:center;gap:.5rem">
            <div class="avatar avatar-sm av-blue">${t.assignee || 'JD'}</div>
            <span style="font-size:.9rem">You</span>
          </div>
        </div>
        <div>
          <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);margin-bottom:.3rem">Created</div>
          <div style="font-size:.9rem;color:var(--text-2)">${formatDate(t.createdAt)}</div>
        </div>
        <div>
          <div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:var(--text-3);margin-bottom:.3rem">Task ID</div>
          <div style="font-size:.85rem;font-family:'JetBrains Mono',monospace;color:var(--text-3)">#${t.id}</div>
        </div>
      </div>
      <div style="display:flex;gap:.75rem;justify-content:flex-end;border-top:1px solid var(--border);padding-top:1rem">
        <button class="btn btn-ghost" onclick="closeModal('task-detail-modal')">Close</button>
        <button class="btn btn-secondary" onclick="closeModal('task-detail-modal');openEdit(${t.id})">✏️ Edit</button>
        ${t.status !== 'done'
          ? `<button class="btn btn-primary" onclick="toggleDone(${t.id},true);closeModal('task-detail-modal')">Mark Complete ✅</button>`
          : `<button class="btn btn-ghost" onclick="toggleDone(${t.id},false);closeModal('task-detail-modal')">Reopen</button>`}
      </div>
    </div>
  `;
  openModal('task-detail-modal');
}

// ── Form Submit ────────────────────────────────
document.getElementById('task-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('save-task-btn');
  const title = document.getElementById('t-title').value.trim();
  if (!title) return;

  btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
  await new Promise(r => setTimeout(r, 400));

  if (editingId) {
    const t = activeTasks.find(t => t.id === editingId);
    if (t) {
      t.title       = title;
      t.description = document.getElementById('t-desc').value.trim();
      t.status      = document.getElementById('t-status').value;
      t.priority    = document.getElementById('t-priority').value;
      t.dueDate     = document.getElementById('t-due').value || null;
      t.projectId   = parseInt(document.getElementById('t-project').value) || null;
    }
    showToast('Task updated ✏️', 'success');
  } else {
    activeTasks.unshift({
      id:          Date.now(),
      title,
      description: document.getElementById('t-desc').value.trim(),
      status:      document.getElementById('t-status').value,
      priority:    document.getElementById('t-priority').value,
      projectId:   parseInt(document.getElementById('t-project').value) || null,
      assignee:    'JD',
      dueDate:     document.getElementById('t-due').value || null,
      createdAt:   new Date().toISOString()
    });
    showToast('Task created ✅', 'success');
  }

  closeModal('new-task-modal');
  renderStats(); renderTasks();
  this.reset(); editingId = null;
  btn.disabled = false; btn.innerHTML = editingId ? 'Save Changes' : 'Create Task';
});

// ── Helpers ────────────────────────────────────
function populateProjectSelect() {
  const sel = document.getElementById('t-project');
  if (!sel) return;
  Mock.projects.forEach(p => {
    const o = document.createElement('option');
    o.value = p.id; o.textContent = p.name;
    sel.appendChild(o);
  });
}

function clearFilters() {
  activeFilter = 'all'; activePriority = null;
  document.querySelectorAll('.filter-btn').forEach(b => {
    b.style.background = ''; b.style.color = ''; b.style.borderColor = '';
  });
  document.querySelector('[data-filter="all"]').style.background = 'var(--blue)';
  document.querySelector('[data-filter="all"]').style.color = '#fff';
  document.querySelectorAll('.priority-btn').forEach(b => { b.style.background=''; b.style.borderColor=''; });
  toggleClearBtn(); renderTasks();
}

function toggleClearBtn() {
  const show = activeFilter !== 'all' || activePriority !== null;
  document.getElementById('clear-filters-btn').style.display = show ? 'inline-flex' : 'none';
}
