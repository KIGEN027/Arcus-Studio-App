/* ════════════════════════════════════════════
   ARCUS — Utility Library
   ════════════════════════════════════════════ */

// ── API Base ──────────────────────────────────
const API = {
  base: 'http://localhost:3000/api',

  async request(method, path, body = null) {
    const token = localStorage.getItem('arcus_token');
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      }
    };
    if (body) opts.body = JSON.stringify(body);
    try {
      const res = await fetch(this.base + path, opts);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (err) {
      // Fallback to mock data when server not running
      console.warn('[API] Falling back to mock data:', err.message);
      return null;
    }
  },

  get(path)          { return this.request('GET', path); },
  post(path, body)   { return this.request('POST', path, body); },
  put(path, body)    { return this.request('PUT', path, body); },
  patch(path, body)  { return this.request('PATCH', path, body); },
  delete(path)       { return this.request('DELETE', path); },
};

// ── Local State (mock when API offline) ───────
const Store = {
  _data: {},
  get(key, def = null) {
    try { return JSON.parse(localStorage.getItem('arcus_' + key)) ?? def; }
    catch { return def; }
  },
  set(key, val) { localStorage.setItem('arcus_' + key, JSON.stringify(val)); },
  del(key) { localStorage.removeItem('arcus_' + key); }
};

// ── Mock Data ─────────────────────────────────
const Mock = {
  projects: [
    { id: 1, name: 'Website Redesign', description: 'Full redesign of the company website', status: 'active', color: '#6378ff', progress: 68, tasks: 24, completedTasks: 16, dueDate: '2026-04-15', members: ['JD','AK','SC'], priority: 'high' },
    { id: 2, name: 'Mobile App v2',    description: 'Second version of the mobile application', status: 'active', color: '#a855f7', progress: 42, tasks: 38, completedTasks: 16, dueDate: '2026-05-01', members: ['JD','MG'],     priority: 'high' },
    { id: 3, name: 'Brand Refresh',    description: 'Update brand identity and guidelines',   status: 'active', color: '#10b981', progress: 89, tasks: 12, completedTasks: 11, dueDate: '2026-03-30', members: ['AK'],          priority: 'medium' },
    { id: 4, name: 'Data Pipeline',    description: 'Build ETL pipeline for analytics',       status: 'on-hold', color: '#f59e0b', progress: 25, tasks: 18, completedTasks: 4,  dueDate: '2026-06-01', members: ['SC','JD'],    priority: 'low' },
    { id: 5, name: 'API Gateway',      description: 'Design and implement API gateway',       status: 'active', color: '#22d3ee', progress: 55, tasks: 31, completedTasks: 17, dueDate: '2026-04-20', members: ['SC'],          priority: 'medium' },
    { id: 6, name: 'Q1 Campaign',      description: 'Marketing campaign for Q1 2026',         status: 'completed', color: '#f43f5e', progress: 100, tasks: 15, completedTasks: 15, dueDate: '2026-01-31', members: ['MG','JD'], priority: 'low' },
  ],
  tasks: [
    { id: 1, title: 'Design homepage hero section',    projectId: 1, status: 'inprogress', priority: 'high',   assignee: 'JD', dueDate: '2026-03-28' },
    { id: 2, title: 'Implement auth middleware',        projectId: 5, status: 'todo',       priority: 'urgent', assignee: 'SC', dueDate: '2026-03-27' },
    { id: 3, title: 'Write user stories for v2',       projectId: 2, status: 'todo',        priority: 'medium', assignee: 'JD', dueDate: '2026-03-30' },
    { id: 4, title: 'Logo variations review',           projectId: 3, status: 'review',     priority: 'medium', assignee: 'AK', dueDate: '2026-03-28' },
    { id: 5, title: 'Setup CI/CD pipeline',             projectId: 5, status: 'inprogress', priority: 'high',   assignee: 'SC', dueDate: '2026-04-02' },
    { id: 6, title: 'Conduct user interviews',          projectId: 2, status: 'done',        priority: 'low',    assignee: 'MG', dueDate: '2026-03-20' },
    { id: 7, title: 'Finalise colour palette',          projectId: 3, status: 'done',        priority: 'low',    assignee: 'AK', dueDate: '2026-03-22' },
    { id: 8, title: 'API documentation draft',          projectId: 5, status: 'todo',       priority: 'medium', assignee: 'SC', dueDate: '2026-04-05' },
  ],
  members: [
    { id: 1, firstName:'Jane',  lastName:'Doe',    email:'jane@acme.com',  role:'admin',     avatar:'JD', color:'av-blue',    status:'online',  tasks:12, joined:'2022-01-15' },
    { id: 2, firstName:'Alex',  lastName:'Kim',    email:'alex@acme.com',  role:'designer',  avatar:'AK', color:'av-violet',  status:'online',  tasks:8,  joined:'2022-03-10' },
    { id: 3, firstName:'Sam',   lastName:'Chen',   email:'sam@acme.com',   role:'developer', avatar:'SC', color:'av-emerald', status:'away',    tasks:15, joined:'2022-06-01' },
    { id: 4, firstName:'Maria', lastName:'Garcia', email:'maria@acme.com', role:'manager',   avatar:'MG', color:'av-amber',   status:'offline', tasks:6,  joined:'2023-01-20' },
    { id: 5, firstName:'Liam',  lastName:'Murphy', email:'liam@acme.com',  role:'developer', avatar:'LM', color:'av-cyan',    status:'online',  tasks:10, joined:'2023-09-05' },
  ],
  activity: [
    { icon:'✅', text:'<b>Jane</b> completed <b>Homepage wireframe</b>', time:'2m ago' },
    { icon:'💬', text:'<b>Alex</b> commented on <b>Logo variations</b>', time:'14m ago' },
    { icon:'📁', text:'<b>Sam</b> created project <b>API Gateway</b>', time:'1h ago' },
    { icon:'👤', text:'<b>Liam Murphy</b> joined the workspace', time:'3h ago' },
    { icon:'🔔', text:'<b>Website Redesign</b> is 68% complete', time:'5h ago' },
    { icon:'✏️', text:'<b>Maria</b> updated <b>Q1 Campaign</b> status', time:'Yesterday' },
    { icon:'📎', text:'<b>Alex</b> uploaded <b>brand_kit_v3.zip</b>', time:'Yesterday' },
    { icon:'🚀', text:'<b>Q1 Campaign</b> was marked complete', time:'2d ago' },
  ],
};

// ── Toast ──────────────────────────────────────
function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const icons = { success:'✅', error:'❌', warning:'⚠️', info:'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icons[type]}</span>
    <span>${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  container.appendChild(toast);
  setTimeout(() => toast.style.opacity = '0', duration);
  setTimeout(() => toast.remove(), duration + 400);
}

// ── Modal ──────────────────────────────────────
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('open');
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('open');
}

// Close modal on backdrop click
document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
  }
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => m.classList.remove('open'));
  }
});

// ── Dropdown ───────────────────────────────────
document.addEventListener('click', e => {
  const toggle = e.target.closest('[data-dropdown]');
  const dd = toggle?.closest('.dropdown');
  document.querySelectorAll('.dropdown.open').forEach(d => { if (d !== dd) d.classList.remove('open'); });
  if (dd) dd.classList.toggle('open');
});

// ── Helpers ────────────────────────────────────
function formatDate(str) {
  if (!str) return '—';
  const d = new Date(str);
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
}

function daysUntil(str) {
  if (!str) return null;
  const diff = new Date(str) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function dueDateBadge(str) {
  const days = daysUntil(str);
  if (days === null) return '<span class="text-muted">—</span>';
  if (days < 0)  return `<span class="badge badge-rose">Overdue</span>`;
  if (days === 0) return `<span class="badge badge-amber">Today</span>`;
  if (days <= 3) return `<span class="badge badge-amber">${days}d left</span>`;
  return `<span class="text-sm" style="color:var(--text-3)">${formatDate(str)}</span>`;
}

function priorityBadge(p) {
  const map = { low:'muted', medium:'blue', high:'amber', urgent:'rose' };
  return `<span class="badge badge-${map[p] || 'muted'}">${p}</span>`;
}

function statusBadge(s) {
  const map = {
    todo:'muted', inprogress:'blue', review:'violet',
    done:'emerald', active:'emerald', 'on-hold':'amber', completed:'muted'
  };
  const labels = { inprogress:'In Progress', 'on-hold':'On Hold' };
  return `<span class="badge badge-${map[s] || 'muted'}">${labels[s] || s}</span>`;
}

const avColors = ['av-blue','av-violet','av-emerald','av-amber','av-rose','av-cyan'];
function avatarDiv(initials, cls = '', colorClass = '') {
  const c = colorClass || avColors[Math.floor(Math.random() * avColors.length)];
  return `<div class="avatar ${c} ${cls}">${initials}</div>`;
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
}

function animate(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

// ── Greeting ───────────────────────────────────
function greetingText(name = 'there') {
  const h = new Date().getHours();
  if (h < 12) return `Good morning, ${name} 👋`;
  if (h < 17) return `Good afternoon, ${name} 👋`;
  return `Good evening, ${name} 👋`;
}

// ── Auth Guard ─────────────────────────────────
function requireAuth() {
  const user = Store.get('user');
  if (!user && !window.location.pathname.includes('login') && !window.location.pathname.includes('register')) {
    // In demo mode, we allow all pages
    return { firstName: 'Jane', lastName: 'Doe', email: 'jane@acme.com', role: 'admin' };
  }
  return user || { firstName: 'Jane', lastName: 'Doe', email: 'jane@acme.com', role: 'admin' };
}

function handleLogout() {
  Store.del('user');
  Store.del('token');
  window.location.href = 'login.html';
}

// ── Count-up animation ─────────────────────────
function animateCount(el, target, suffix = '', duration = 1200) {
  const start = performance.now();
  const from = 0;
  function tick(now) {
    const p = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + ease * (target - from)) + suffix;
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ── Intersection reveal ────────────────────────
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.animation = 'fadeUp .45s ease both';
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

function observeReveal(selector) {
  document.querySelectorAll(selector).forEach(el => {
    el.style.opacity = '0';
    revealObserver.observe(el);
  });
}

// ── Confirm dialog ─────────────────────────────
function confirmAction(message, onConfirm) {
  if (window.confirm(message)) onConfirm();
}

// ── Export helpers ─────────────────────────────
function csvExport(rows, filename) {
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}
