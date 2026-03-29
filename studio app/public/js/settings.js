/* ════════════════════════════════════════════
   ARCUS — Settings Logic
   ════════════════════════════════════════════ */

requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  initTabs();
  initProfileForm();
  initNotifications();
  initBilling();
  initIntegrations();
});

// ── Tabs ───────────────────────────────────────
function initTabs() {
  document.querySelectorAll('.settings-tab').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.settings-tab').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const tab = this.dataset.tab;
      document.querySelectorAll('.settings-panel').forEach(p => p.style.display = 'none');
      const panel = document.getElementById('panel-' + tab);
      if (panel) { panel.style.display = 'block'; panel.classList.add('animate-fade-up'); }
    });
  });
}

// ── Profile Form ───────────────────────────────
function initProfileForm() {
  document.getElementById('profile-form')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = this.querySelector('[type=submit]');
    btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Saving…';
    await new Promise(r => setTimeout(r, 700));

    const firstName = document.getElementById('p-first').value;
    const lastName  = document.getElementById('p-last').value;
    const initials  = getInitials(`${firstName} ${lastName}`);
    document.getElementById('profile-avatar').textContent = initials;

    const user = Store.get('user') || {};
    Store.set('user', { ...user, firstName, lastName,
      email: document.getElementById('p-email').value });

    showToast('Profile updated successfully ✅', 'success');
    btn.disabled = false; btn.innerHTML = 'Save Changes';
  });
}

// ── Notifications ──────────────────────────────
function initNotifications() {
  const container = document.getElementById('notif-settings');
  if (!container) return;

  const prefs = [
    { id:'n-tasks',    label:'Task assignments', desc:'When a task is assigned to you', checked:true },
    { id:'n-comments', label:'Comments',         desc:'When someone comments on your task', checked:true },
    { id:'n-deadlines',label:'Deadline reminders',desc:'24h before a due date', checked:true },
    { id:'n-projects', label:'Project updates',  desc:'Status changes on your projects', checked:false },
    { id:'n-invites',  label:'Team invites',     desc:'When someone joins the workspace', checked:false },
    { id:'n-email',    label:'Email digest',     desc:'Weekly summary of activity', checked:true },
  ];

  container.innerHTML = prefs.map(p => `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:1rem;
      padding:1rem;background:var(--surface-2);border:1px solid var(--border);border-radius:var(--r-lg)">
      <div>
        <div style="font-weight:600;color:var(--text-1);margin-bottom:.2rem">${p.label}</div>
        <div class="text-sm" style="color:var(--text-3)">${p.desc}</div>
      </div>
      <label style="position:relative;display:inline-block;width:44px;height:24px;flex-shrink:0;cursor:pointer">
        <input type="checkbox" id="${p.id}" ${p.checked ? 'checked' : ''}
          style="opacity:0;width:0;height:0;position:absolute"
          onchange="toggleNotif('${p.id}', this.checked)"/>
        <div style="position:absolute;inset:0;background:${p.checked ? 'var(--blue)' : 'var(--surface-3)'};
          border-radius:99px;transition:background .2s" id="${p.id}-track"></div>
        <div style="position:absolute;width:18px;height:18px;border-radius:50%;background:#fff;
          top:3px;left:${p.checked ? '23px' : '3px'};transition:left .2s" id="${p.id}-thumb"></div>
      </label>
    </div>
  `).join('');
}

function toggleNotif(id, checked) {
  const track = document.getElementById(id + '-track');
  const thumb = document.getElementById(id + '-thumb');
  if (track) track.style.background = checked ? 'var(--blue)' : 'var(--surface-3)';
  if (thumb) thumb.style.left = checked ? '23px' : '3px';
}

// ── Billing ────────────────────────────────────
function initBilling() {
  const list = document.getElementById('invoices-list');
  if (!list) return;
  const invoices = [
    { date:'Mar 1, 2026', amount:'$29.00', status:'paid', id:'INV-2026-003' },
    { date:'Feb 1, 2026', amount:'$29.00', status:'paid', id:'INV-2026-002' },
    { date:'Jan 1, 2026', amount:'$29.00', status:'paid', id:'INV-2026-001' },
  ];
  list.innerHTML = invoices.map(inv => `
    <div style="display:flex;align-items:center;justify-content:space-between;
      padding:.85rem 1rem;background:var(--surface-2);border:1px solid var(--border);
      border-radius:var(--r);margin-bottom:.5rem">
      <div>
        <div style="font-weight:600;font-size:.88rem">${inv.id}</div>
        <div class="text-xs text-muted">${inv.date}</div>
      </div>
      <div style="display:flex;align-items:center;gap:.75rem">
        <span class="badge badge-emerald">${inv.status}</span>
        <span style="font-weight:600">${inv.amount}</span>
        <button class="btn btn-ghost btn-sm" onclick="downloadInvoice('${inv.id}')">⬇</button>
      </div>
    </div>
  `).join('');
}

function downloadInvoice(id) { showToast(`Downloading ${id}…`, 'info'); }

// ── Integrations ───────────────────────────────
function initIntegrations() {
  const list = document.getElementById('integrations-list');
  if (!list) return;
  const integrations = [
    { name:'GitHub', icon:'🐙', desc:'Sync issues and pull requests', connected:true  },
    { name:'Slack',  icon:'💬', desc:'Get notifications in Slack',    connected:true  },
    { name:'Figma',  icon:'🎨', desc:'Link designs to tasks',         connected:false },
    { name:'Notion', icon:'📓', desc:'Embed Notion docs in projects', connected:false },
    { name:'Jira',   icon:'📋', desc:'Import Jira tickets',          connected:false },
    { name:'Google Calendar', icon:'📅', desc:'Sync deadlines to calendar', connected:true },
  ];
  list.innerHTML = integrations.map(i => `
    <div style="display:flex;align-items:center;justify-content:space-between;
      padding:1rem 1.2rem;background:var(--surface-2);border:1px solid var(--border);
      border-radius:var(--r-lg)">
      <div style="display:flex;align-items:center;gap:1rem">
        <div style="font-size:1.6rem;width:40px;text-align:center">${i.icon}</div>
        <div>
          <div style="font-weight:700">${i.name}</div>
          <div class="text-sm text-muted">${i.desc}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:.75rem">
        ${i.connected ? '<span class="badge badge-emerald">Connected</span>' : ''}
        <button class="btn ${i.connected ? 'btn-ghost btn-sm' : 'btn-secondary btn-sm'}"
          onclick="toggleIntegration('${i.name}', ${i.connected})">
          ${i.connected ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  `).join('');
}

function toggleIntegration(name, connected) {
  showToast(`${name} ${connected ? 'disconnected' : 'connection coming soon'}`, connected ? 'info' : 'info');
}
