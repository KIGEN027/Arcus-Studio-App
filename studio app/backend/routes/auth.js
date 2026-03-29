/* ════════════════════════════════════════════
   ARCUS — Auth Routes
   POST /api/auth/login
   POST /api/auth/register
   POST /api/auth/logout
   GET  /api/auth/me
   ════════════════════════════════════════════ */

const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const { users, addActivity, incUserId } = require('../data/store');
const { generateToken, authMiddleware } = require('../middleware/auth');
const { asyncWrap, createError }        = require('../middleware/errorHandler');

// ── POST /api/auth/login ──────────────────────
router.post('/login', asyncWrap(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw createError(400, 'Email and password are required');
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw createError(401, 'Invalid email or password');

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) throw createError(401, 'Invalid email or password');

  const token = generateToken(user.id);
  const { passwordHash, ...safeUser } = user;

  addActivity('🔑', `<b>${user.firstName}</b> signed in`);

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: safeUser
  });
}));

// ── POST /api/auth/register ───────────────────
router.post('/register', asyncWrap(async (req, res) => {
  const { firstName, lastName, email, password, workspace } = req.body;

  if (!firstName || !lastName || !email || !password) {
    throw createError(400, 'All fields are required');
  }
  if (password.length < 8) {
    throw createError(400, 'Password must be at least 8 characters');
  }
  if (!/\S+@\S+\.\S+/.test(email)) {
    throw createError(400, 'Invalid email address');
  }

  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) throw createError(409, 'Email already registered');

  const passwordHash = await bcrypt.hash(password, 12);
  const initials = (firstName[0] + lastName[0]).toUpperCase();
  const colors = ['av-blue','av-violet','av-emerald','av-amber','av-cyan','av-rose'];

  const newUser = {
    id: incUserId(),
    firstName, lastName, email, passwordHash,
    role:        'admin',
    avatar:      initials,
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
    status:      'online',
    title:       '',
    timezone:    'UTC',
    bio:         '',
    workspace:   workspace || `${firstName}'s Workspace`,
    createdAt:   new Date().toISOString()
  };

  users.push(newUser);
  const token = generateToken(newUser.id);
  const { passwordHash: _ph, ...safeUser } = newUser;

  addActivity('👤', `<b>${firstName} ${lastName}</b> created an account`);

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: safeUser
  });
}));

// ── POST /api/auth/logout ─────────────────────
router.post('/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

// ── GET /api/auth/me ──────────────────────────
router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// ── PATCH /api/auth/me ────────────────────────
router.patch('/me', authMiddleware, asyncWrap(async (req, res) => {
  const { firstName, lastName, title, bio, timezone } = req.body;
  const user = users.find(u => u.id === req.user.id);
  if (!user) throw createError(404, 'User not found');

  if (firstName) user.firstName = firstName;
  if (lastName)  user.lastName  = lastName;
  if (title !== undefined) user.title = title;
  if (bio !== undefined)   user.bio   = bio;
  if (timezone)  user.timezone  = timezone;

  const { passwordHash, ...safeUser } = user;
  res.json({ success: true, message: 'Profile updated', user: safeUser });
}));

// ── POST /api/auth/change-password ───────────
router.post('/change-password', authMiddleware, asyncWrap(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = users.find(u => u.id === req.user.id);

  if (!currentPassword || !newPassword) throw createError(400, 'Both passwords required');
  if (newPassword.length < 8) throw createError(400, 'New password must be at least 8 characters');

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw createError(401, 'Current password is incorrect');

  user.passwordHash = await bcrypt.hash(newPassword, 12);
  res.json({ success: true, message: 'Password changed successfully' });
}));

module.exports = router;
