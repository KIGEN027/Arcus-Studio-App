/* ════════════════════════════════════════════
   ARCUS — Dashboard Logic
   ════════════════════════════════════════════ */

const user = requireAuth();

// ── Init ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Greeting
  const greetEl = document.getElementById('greeting');
  if (greetEl) greetEl.textContent = greetingText(user.firstName || 'Jane');

  // Sidebar user
  const sbName = document.getElementById('sb-user-name');
  if (sbName) sbName.textContent = `${user.firstName} ${user.lastName}`;

  await loadStats();
  await loadProjects();
  loadActivity();
  loadTasks();
  initCharts();
  populateProjectSelect();
});

// ── Stats ─────────────────────────────────────
async function loadStats() {
  // Try API, fall back to mock
  const data = await API.get('/stats') || {
    projects: Mock.projects.filter(p => p.status === 'active').length,
    tasks: Mock.tasks.filter(t => t.status === 'done').length,
    members: Mock.members.length,
    hours: 248
  };

  const targets = {
    's-projects': data.projects,
    's-tasks': data.tasks,
    's-members': data.members,
    's-hours': data.hours
  };

  const suffixes = { 's-projects': '', 's-tasks': '', 's-members': '', 's-hours': 'h' };

  Object.entries(targets).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) setTimeout(() => animateCount(el, val, suffixes[id] || ''), 300);
  });
}

// ── Projects table ─────────────────────────────
async function loadProjects() {
  const projects = await API.get('/projects') || Mock.projects;
  const tbody = document.getElementById('projects-tbody');
  if (!tbody) return;

  const recent = projects.slice(0, 5);
  tbody.innerHTML = recent.map(p => {
    const memberAvatars = p.members.map(m =>
      `<div class="avatar avatar-sm av-blue" style="background:${p.color}20;color:${p.color};border:1px solid ${p.color}40">${m}</div>`
    ).join('');
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:.6rem">
            <div style="width:10px;height:10px;border-radius:50%;background:${p.color};flex-shrink:0"></div>
            <span style="font-weight:600;color:var(--text-1)">${p.name}</span>
          </div>
        </td>
        <td>${statusBadge(p.status)}</td>
        <td style="min-width:120px">
          <div style="display:flex;align-items:center;gap:.6rem">
            <div class="progress flex-1" style="min-width:80px">
              <div class="progress-fill" style="width:${p.progress}%;background:${p.color}"></div>
            </div>
            <span class="text-xs text-muted">${p.progress}%</span>
          </div>
        </td>
        <td>${dueDateBadge(p.dueDate)}</td>
        <td>
          <div style="display:flex;gap:-4px">
            ${memberAvatars}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ── Activity Feed ──────────────────────────────
function loadActivity() {
  const feed = document.getElementById('activity-feed');
  if (!feed) return;
  feed.innerHTML = Mock.activity.map(item => `
    <div style="display:flex;align-items:flex-start;gap:.75rem;padding:.6rem .5rem;border-radius:var(--r);transition:background var(--t-fast)"
         onmouseenter="this.style.background='var(--surface-2)'" onmouseleave="this.style.background=''">
      <div style="width:30px;height:30px;border-radius:50%;background:var(--surface-3);display:flex;align-items:center;justify-content:center;font-size:.85rem;flex-shrink:0">
        ${item.icon}
      </div>
      <div style="flex:1;min-width:0">
        <p style="font-size:.83rem;color:var(--text-2);line-height:1.4;margin:0">${item.text}</p>
        <span style="font-size:.72rem;color:var(--text-3);font-family:'JetBrains Mono',monospace">${item.time}</span>
      </div>
    </div>
  `).join('');
}

// ── Tasks Table ────────────────────────────────
function loadTasks(filter = '') {
  const tbody = document.getElementById('tasks-tbody');
  if (!tbody) return;

  let tasks = Mock.tasks;
  if (filter) tasks = tasks.filter(t => t.status === filter);

  if (tasks.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-3);padding:2rem">No tasks found</td></tr>`;
    return;
  }

  tbody.innerHTML = tasks.map(t => {
    const proj = Mock.projects.find(p => p.id === t.projectId);
    const memberMap = { JD:'av-blue', AK:'av-violet', SC:'av-emerald', MG:'av-amber', LM:'av-cyan' };
    return `
      <tr>
        <td>
          <div style="display:flex;align-items:center;gap:.5rem">
            <input type="checkbox" ${t.status === 'done' ? 'checked' : ''} 
              style="accent-color:var(--blue);width:15px;height:15px;cursor:pointer"
              onchange="toggleTask(${t.id}, this.checked)"/>
            <span style="${t.status === 'done' ? 'text-decoration:line-through;color:var(--text-3)' : ''}">${t.title}</span>
          </div>
        </td>
        <td>
          <div style="display:flex;align-items:center;gap:.4rem">
            <div style="width:8px;height:8px;border-radius:50%;background:${proj?.color || 'var(--text-3)'}"></div>
            <span class="text-sm">${proj?.name || '—'}</span>
          </div>
        </td>
        <td>${priorityBadge(t.priority)}</td>
        <td>${avatarDiv(t.assignee, 'avatar-sm', memberMap[t.assignee] || 'av-blue')}</td>
        <td>${dueDateBadge(t.dueDate)}</td>
        <td>${statusBadge(t.status)}</td>
        <td>
          <div class="dropdown">
            <button class="btn btn-ghost btn-icon btn-sm" data-dropdown>⋯</button>
            <div class="dropdown-menu">
              <div class="dropdown-item" onclick="editTask(${t.id})">✏️ Edit</div>
              <div class="dropdown-item" onclick="duplicateTask(${t.id})">📋 Duplicate</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item danger" onclick="deleteTask(${t.id})">🗑 Delete</div>
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

document.getElementById('task-filter')?.addEventListener('change', function() {
  loadTasks(this.value);
});

// ── Charts ─────────────────────────────────────
function initCharts() {
  Chart.defaults.color = '#5a6490';
  Chart.defaults.font.family = "'DM Sans', sans-serif";

  // Task line chart
  const taskCtx = document.getElementById('chart-tasks');
  if (taskCtx) {
    const labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    new Chart(taskCtx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Completed', data: [5, 8, 6, 12, 9, 4, 7],
            borderColor: '#6378ff', backgroundColor: 'rgba(99,120,255,0.08)',
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4,
            pointBackgroundColor: '#6378ff'
          },
          {
            label: 'Created', data: [7, 5, 9, 8, 11, 3, 6],
            borderColor: '#a855f7', backgroundColor: 'rgba(168,85,247,0.05)',
            borderWidth: 2, fill: true, tension: 0.4, pointRadius: 4,
            pointBackgroundColor: '#a855f7'
          }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: 'rgba(99,120,255,0.06)' }, border: { display: false } },
          y: { grid: { color: 'rgba(99,120,255,0.06)' }, border: { display: false }, beginAtZero: true }
        }
      }
    });
  }

  // Project doughnut
  const projCtx = document.getElementById('chart-projects');
  if (projCtx) {
    const active = Mock.projects.filter(p => p.status === 'active').length;
    const completed = Mock.projects.filter(p => p.status === 'completed').length;
    const onHold = Mock.projects.filter(p => p.status === 'on-hold').length;
    new Chart(projCtx, {
      type: 'doughnut',
      data: {
        labels: ['Active', 'Completed', 'On Hold'],
        datasets: [{
          data: [active, completed, onHold],
          backgroundColor: ['#6378ff', '#10b981', '#f59e0b'],
          borderWidth: 0, hoverOffset: 6
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'right',
            labels: { padding: 18, usePointStyle: true, pointStyleWidth: 10 }
          }
        }
      }
    });
  }
}

// ── Task actions ───────────────────────────────
function toggleTask(id, checked) {
  const task = Mock.tasks.find(t => t.id === id);
  if (task) {
    task.status = checked ? 'done' : 'todo';
    showToast(checked ? 'Task marked complete ✅' : 'Task reopened', checked ? 'success' : 'info');
    setTimeout(() => loadTasks(document.getElementById('task-filter')?.value || ''), 300);
  }
}
function editTask(id)      { showToast(`Edit task ${id} (coming soon)`, 'info'); }
function duplicateTask(id) { showToast('Task duplicated 📋', 'success'); }
function deleteTask(id) {
  confirmAction('Delete this task? This cannot be undone.', () => {
    const idx = Mock.tasks.findIndex(t => t.id === id);
    if (idx !== -1) { Mock.tasks.splice(idx, 1); loadTasks(); showToast('Task deleted', 'success'); }
  });
}

// ── New Task Modal ─────────────────────────────
function openNewTaskModal() { openModal('task-modal'); }

function populateProjectSelect() {
  const sel = document.getElementById('task-project');
  if (!sel) return;
  Mock.projects.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id; opt.textContent = p.name;
    sel.appendChild(opt);
  });
}

document.getElementById('new-task-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('create-task-btn');
  const title = document.getElementById('task-title').value.trim();
  if (!title) return;

  btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
  await new Promise(r => setTimeout(r, 600));

  const newTask = {
    id: Date.now(),
    title,
    projectId: parseInt(document.getElementById('task-project').value) || 1,
    status: 'todo',
    priority: document.getElementById('task-priority').value,
    assignee: 'JD',
    dueDate: document.getElementById('task-due').value
  };
  Mock.tasks.unshift(newTask);
  closeModal('task-modal');
  loadTasks();
  showToast('Task created successfully! ✅', 'success');
  this.reset();
  btn.disabled = false; btn.innerHTML = 'Create Task';
});
