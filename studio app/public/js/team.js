/* ════════════════════════════════════════════
   ARCUS — Team Logic
   ════════════════════════════════════════════ */

requireAuth();

document.addEventListener('DOMContentLoaded', () => {
  renderTeamStats();
  renderMembers();

  document.getElementById('member-search')?.addEventListener('input', filterMembers);
  document.getElementById('role-filter')?.addEventListener('change', filterMembers);
});

function renderTeamStats() {
  const total   = Mock.members.length;
  const online  = Mock.members.filter(m => m.status === 'online').length;
  const pending = 2; // simulated

  const anims = [['st-total', total, ''], ['st-online', online, ''], ['st-pending', pending, '']];
  anims.forEach(([id, val, sfx]) => {
    const el = document.getElementById(id);
    if (el) setTimeout(() => animateCount(el, val, sfx), 300);
  });
}

function renderMembers(members = Mock.members) {
  const grid = document.getElementById('members-grid');
  if (!grid) return;

  grid.innerHTML = members.map(m => memberCard(m)).join('');
  grid.querySelectorAll('.member-card').forEach((el, i) => {
    el.style.animationDelay = `${i * 0.07}s`;
    el.classList.add('animate-fade-up');
  });
}

function memberCard(m) {
  const roleColors = { admin:'blue', manager:'violet', developer:'emerald', designer:'amber' };
  const projectCount = Mock.projects.filter(p => p.members.includes(m.avatar)).length;

  return `
    <div class="member-card card" style="cursor:pointer;transition:border-color var(--t-med),transform var(--t-med)"
      onmouseenter="this.style.borderColor='var(--border-md)';this.style.transform='translateY(-2px)'"
      onmouseleave="this.style.borderColor='';this.style.transform=''">

      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.2rem">
        <div style="position:relative">
          <div class="avatar avatar-xl ${m.color}">${m.avatar}</div>
          <div class="status-dot ${m.status}" style="position:absolute;bottom:2px;right:2px;border:2px solid var(--surface)"></div>
        </div>
        <div class="dropdown">
          <button class="btn btn-ghost btn-icon btn-sm" data-dropdown>⋯</button>
          <div class="dropdown-menu">
            <div class="dropdown-item" onclick="viewProfile(${m.id})">👤 View Profile</div>
            <div class="dropdown-item" onclick="sendMessage(${m.id})">💬 Message</div>
            <div class="dropdown-item" onclick="changeRole(${m.id})">🔑 Change Role</div>
            <div class="dropdown-divider"></div>
            ${m.role !== 'admin' ? `<div class="dropdown-item danger" onclick="removeMember(${m.id})">🚪 Remove</div>` : ''}
          </div>
        </div>
      </div>

      <div style="font-family:'Syne',sans-serif;font-size:1rem;font-weight:700;color:var(--text-1);margin-bottom:.15rem">
        ${m.firstName} ${m.lastName}
      </div>
      <div style="font-size:.83rem;color:var(--text-3);margin-bottom:.8rem">${m.email}</div>

      <span class="badge badge-${roleColors[m.role] || 'muted'}" style="margin-bottom:1rem">${m.role}</span>

      <div class="border-t" style="padding-top:.9rem;display:grid;grid-template-columns:1fr 1fr;gap:.75rem;text-align:center">
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:var(--text-1)">${m.tasks}</div>
          <div class="text-xs text-muted">Tasks</div>
        </div>
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:1.1rem;font-weight:700;color:var(--text-1)">${projectCount}</div>
          <div class="text-xs text-muted">Projects</div>
        </div>
      </div>
    </div>
  `;
}

function filterMembers() {
  const search = document.getElementById('member-search')?.value.toLowerCase() || '';
  const role = document.getElementById('role-filter')?.value || '';
  const filtered = Mock.members.filter(m => {
    const name = `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase();
    return (!search || name.includes(search)) && (!role || m.role === role);
  });
  renderMembers(filtered);
}

// ── Invite Modal ───────────────────────────────
function openInviteModal() { openModal('invite-modal'); }

document.getElementById('invite-form')?.addEventListener('submit', async function(e) {
  e.preventDefault();
  const email = document.getElementById('invite-email').value.trim();
  const role  = document.getElementById('invite-role').value;
  if (!email) return;

  const btn = this.querySelector('[type=submit]');
  btn.disabled = true; btn.innerHTML = '<div class="spinner"></div> Sending…';
  await new Promise(r => setTimeout(r, 900));

  closeModal('invite-modal');
  showToast(`Invite sent to ${email} ✉`, 'success');
  this.reset();
  btn.disabled = false; btn.innerHTML = 'Send Invite ✉';
});

function viewProfile(id) { showToast(`Profile view coming soon (id: ${id})`, 'info'); }
function sendMessage(id) { showToast(`Messaging coming soon`, 'info'); }
function changeRole(id)  { showToast(`Role management coming soon`, 'info'); }
function removeMember(id) {
  const m = Mock.members.find(m => m.id === id);
  confirmAction(`Remove ${m?.firstName} from the workspace?`, () => {
    const idx = Mock.members.findIndex(m => m.id === id);
    if (idx !== -1) {
      Mock.members.splice(idx, 1);
      renderTeamStats();
      renderMembers();
      showToast('Member removed', 'success');
    }
  });
}
