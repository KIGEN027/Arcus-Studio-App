/* ════════════════════════════════════════════
   ARCUS — Auth Logic
   ════════════════════════════════════════════ */

// Password toggle
document.getElementById('pw-toggle')?.addEventListener('click', function() {
  const input = document.getElementById('password');
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  this.textContent = isText ? '👁' : '🙈';
});

// ── LOGIN ───────────────────────────────────────
const loginForm = document.getElementById('login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('login-btn');
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    hideError();

    if (!email || !password) { showError('Please fill in all fields.'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { showError('Please enter a valid email.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Signing in…';

    try {
      // Try real API first
      const result = await API.post('/auth/login', { email, password });

      if (result) {
        Store.set('user', result.user);
        Store.set('token', result.token);
        showToast('Welcome back! 👋', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
        return;
      }

      // Demo mode: accept demo credentials
      await new Promise(r => setTimeout(r, 900)); // simulate latency
      const demoUsers = [
        { email: 'jane@acme.com', password: 'demo123', firstName: 'Jane', lastName: 'Doe', role: 'admin' },
        { email: 'demo@arcus.app', password: 'demo123', firstName: 'Demo', lastName: 'User', role: 'manager' },
      ];
      const user = demoUsers.find(u => u.email === email && u.password === password);
      if (user) {
        Store.set('user', user);
        Store.set('token', 'demo_token_' + Date.now());
        showToast('Welcome back, ' + user.firstName + '! 👋', 'success');
        setTimeout(() => window.location.href = 'dashboard.html', 800);
      } else {
        showError('Invalid email or password. Try jane@acme.com / demo123');
      }
    } catch {
      showError('Something went wrong. Please try again.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
  });
}

// ── REGISTER ────────────────────────────────────
const registerForm = document.getElementById('register-form');
if (registerForm) {
  registerForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btn = document.getElementById('register-btn');
    const firstName  = document.getElementById('first-name')?.value.trim();
    const lastName   = document.getElementById('last-name')?.value.trim();
    const email      = document.getElementById('email').value.trim();
    const workspace  = document.getElementById('workspace')?.value.trim();
    const password   = document.getElementById('password').value;

    hideError();

    if (!firstName || !lastName || !email || !workspace || !password) {
      showError('Please fill in all required fields.'); return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) { showError('Invalid email address.'); return; }
    if (password.length < 8) { showError('Password must be at least 8 characters.'); return; }

    btn.disabled = true;
    btn.innerHTML = '<div class="spinner"></div> Creating account…';

    await new Promise(r => setTimeout(r, 1200));

    const user = { firstName, lastName, email, workspace, role: 'admin' };
    Store.set('user', user);
    Store.set('token', 'token_' + Date.now());
    showToast('Account created! Welcome to Arcus 🚀', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 900);

    btn.disabled = false;
    btn.innerHTML = 'Create Free Account →';
  });
}

// ── Error display ───────────────────────────────
function showError(msg) {
  const box = document.getElementById('auth-error');
  const msgEl = document.getElementById('auth-error-msg');
  if (box && msgEl) {
    msgEl.textContent = msg;
    box.style.display = 'flex';
    box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
function hideError() {
  const box = document.getElementById('auth-error');
  if (box) box.style.display = 'none';
}

// ── OAuth stubs ─────────────────────────────────
function oauthLogin(provider) {
  showToast(`${provider} OAuth is not configured in demo mode.`, 'warning');
}

// ── Hint for demo ───────────────────────────────
if (loginForm) {
  const hint = document.createElement('p');
  hint.style.cssText = 'text-align:center;font-size:.78rem;color:var(--text-3);margin-top:1.2rem;font-family:"JetBrains Mono",monospace';
  hint.innerHTML = '🔑 Demo: <b>jane@acme.com</b> / <b>demo123</b>';
  loginForm.insertAdjacentElement('afterend', hint);
}
