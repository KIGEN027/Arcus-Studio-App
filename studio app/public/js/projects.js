/* ════════════════════════════════════════════
   ARCUS — Projects Logic
   ════════════════════════════════════════════ */

requireAuth();
let selectedColor = '#6378ff';
let allProjects = [...Mock.projects];

document.addEventListener('DOMContentLoaded', () => {
  renderProjects();
  initColorPicker();
  document.getElementById('proj-search')?.addEventListener('input', filterProjects);
  document.getElementById('proj-status-filter')?.addEventListener('change', filterProjects);
  document.querySelectorAll('.view-toggle').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.view-toggle').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      renderProjects(this.dataset.view);
    });
  });
});

function renderProjects(view = 'grid') {
  const grid = document.getElementById('projects-grid');
  const empty = document.getElementById('projects-empty');
  if (!grid) return;

  if (allProjects.length === 0) {
    grid.innerHTML = ''; empty.style.display = 'block'; return;
  }
  empty.style.display = 'none';

  if (view === 'list') {
    grid.style.gridTemplateColumns = '1fr';
    grid.innerHTML = allProjects.map(p => projectListItem(p)).join('');
  } else {
    grid.style.gridTemplateColumns = 'repeat(3, 1fr)';
    grid.innerHTML = allProjects.map(p => projectCard(p)).join('');
  }

  // Animate in
  grid.querySelectorAll('.project-item').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.06}s`;
    el.classList.add('animate-fade-up');
  });
}

function projectCard(p) {
  const daysLeft = daysUntil(p.dueDate);
  const dueStr = daysLeft === null ? '—' : daysLeft < 0 ? 'Overdue' : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`;
  const dueColor = !daysLeft ? 'var(--text-3)' : daysLeft < 0 ? 'var(--rose)' : daysLeft <= 3 ? 'var(--amber)' : 'var(--text-3)';
  const memberAvatarColors = ['av-blue','av-violet','av-emerald','av-amber','av-cyan'];

  return `
    <div class="project-item" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);
      overflow:hidden;cursor:pointer;transition:border-color var(--t-med),transform var(--t-med),box-shadow var(--t-med)"
      onmouseenter="this.style.borderColor='${p.color}40';this.style.transform='translateY(-3px)';this.style.boxShadow='var(--shadow-md)'"
      onmouseleave="this.style.borderColor='';this.style.transform='';this.style.boxShadow=''">

      <!-- Color bar -->
      <div style="height:4px;background:${p.color}"></div>

      <div style="padding:1.25rem">
        <!-- Header -->
        <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.9rem">
          <div>
            <div style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:var(--text-1);margin-bottom:.3rem">${p.name}</div>
            <div class="text-sm" style="color:var(--text-3);line-height:1.5">${p.description}</div>
          </div>
          <div class="dropdown">
            <button class="btn btn-ghost btn-icon btn-sm" data-dropdown style="flex-shrink:0">⋯</button>
            <div class="dropdown-menu">
              <div class="dropdown-item" onclick="openProjectDetail(${p.id})">📋 Open</div>
              <div class="dropdown-item" onclick="editProject(${p.id})">✏️ Edit</div>
              <div class="dropdown-item" onclick="duplicateProject(${p.id})">📄 Duplicate</div>
              <div class="dropdown-divider"></div>
              <div class="dropdown-item danger" onclick="deleteProject(${p.id})">🗑 Delete</div>
            </div>
          </div>
        </div>

        <!-- Progress -->
        <div style="margin-bottom:1rem">
          <div style="display:flex;justify-content:space-between;margin-bottom:.4rem">
            <span class="text-xs text-muted">Progress</span>
            <span class="text-xs font-bold" style="color:${p.color}">${p.progress}%</span>
          </div>
          <div class="progress">
            <div class="progress-fill" style="width:${p.progress}%;background:${p.color}"></div>
          </div>
        </div>

        <!-- Footer -->
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div style="display:flex;gap:1rem">
            <div>
              <div style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:var(--text-1)">${p.completedTasks}</div>
              <div class="text-xs text-muted">of ${p.tasks} tasks</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:.5rem">
            ${statusBadge(p.status)}
          </div>
        </div>

        <div class="border-t" style="margin-top:.9rem;padding-top:.9rem;display:flex;align-items:center;justify-content:space-between">
          <!-- Members -->
          <div style="display:flex;gap:-6px">
            ${p.members.map((m,i) => `<div class="avatar avatar-sm ${memberAvatarColors[i % memberAvatarColors.length]}" style="margin-left:${i?'-6px':'0'};border:2px solid var(--surface)">${m}</div>`).join('')}
          </div>
          <span style="font-size:.73rem;color:${dueColor};font-family:'JetBrains Mono',monospace">${dueStr}</span>
        </div>
      </div>
    </div>
  `;
}

function projectListItem(p) {
  return `
    <div class="project-item" style="background:var(--surface);border:1px solid var(--border);border-radius:var(--r-lg);
      padding:1rem 1.25rem;display:flex;align-items:center;gap:1rem;cursor:pointer;
      transition:border-color var(--t-med),background var(--t-med)"
      onmouseenter="this.style.borderColor=var(--border-md);this.style.background='var(--surface-2)'"
      onmouseleave="this.style.borderColor='';this.style.background=''">
      <div style="width:12px;height:12px;border-radius:50%;background:${p.color};flex-shrink:0"></div>
      <div style="font-family:'Syne',sans-serif;font-weight:700;color:var(--text-1);min-width:180px">${p.name}</div>
      <div class="text-sm text-muted flex-1">${p.description}</div>
      ${statusBadge(p.status)}
      <div style="min-width:130px">
        <div class="progress"><div class="progress-fill" style="width:${p.progress}%;background:${p.color}"></div></div>
        <div class="text-xs text-muted mt-1">${p.progress}%</div>
      </div>
      <div class="text-sm text-muted" style="min-width:100px">${formatDate(p.dueDate)}</div>
    </div>
  `;
}

function filterProjects() {
  const search = document.getElementById('proj-search')?.value.toLowerCase() || '';
  const status = document.getElementById('proj-status-filter')?.value || '';
  allProjects = Mock.projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search) || p.description.toLowerCase().includes(search);
    const matchStatus = !status || p.status === status;
    return matchSearch && matchStatus;
  });
  renderProjects();
}

function initColorPicker() {
  document.querySelectorAll('.color-opt').forEach(opt => {
    opt.addEventListener('click', function() {
      document.querySelectorAll('.color-opt').forEach(o => o.style.borderColor = 'transparent');
      this.style.borderColor = '#fff';
      selectedColor = this.dataset.color;
      document.getElementById('proj-color').value = selectedColor;
    });
  });
  // Select first by default
  const first = document.querySelector('.color-opt');
  if (first) { first.style.borderColor = '#fff'; }
}

// ── New Project Modal ─────────────────────────
function openNewProjectModal() { openModal('project-modal'); }

document.getElementById('new-project-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const name = document.getElementById('proj-name').value.trim();
  if (!name) return;

  const btn = this.querySelector('[type=submit]');
  btn.disabled = true; btn.innerHTML = '<div class="spinner"></div>';
  await new Promise(r => setTimeout(r, 700));

  const proj = {
    id: Date.now(),
    name,
    description: document.getElementById('proj-desc').value.trim() || 'No description',
    status: 'active',
    color: document.getElementById('proj-color').value || '#6378ff',
    progress: 0,
    tasks: 0, completedTasks: 0,
    dueDate: document.getElementById('proj-due').value,
    members: ['JD'],
    priority: 'medium'
  };
  Mock.projects.unshift(proj);
  allProjects = [...Mock.projects];
  closeModal('project-modal');
  renderProjects();
  showToast(`Project "${name}" created! 📁`, 'success');
  this.reset();
  btn.disabled = false; btn.innerHTML = 'Create Project';
});

function openProjectDetail(id) { showToast(`Project detail page coming soon (id: ${id})`, 'info'); }
function editProject(id)       { showToast(`Edit project ${id}`, 'info'); }
function duplicateProject(id) {
  const p = Mock.projects.find(p => p.id === id);
  if (p) {
    Mock.projects.push({ ...p, id: Date.now(), name: p.name + ' (Copy)' });
    allProjects = [...Mock.projects];
    renderProjects();
    showToast('Project duplicated 📄', 'success');
  }
}
function deleteProject(id) {
  confirmAction('Delete this project? All tasks will be lost.', () => {
    const idx = Mock.projects.findIndex(p => p.id === id);
    if (idx !== -1) {
      Mock.projects.splice(idx, 1);
      allProjects = [...Mock.projects];
      renderProjects();
      showToast('Project deleted', 'success');
    }
  });
}
