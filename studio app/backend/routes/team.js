/* ════════════════════════════════════════════
   ARCUS — Team Routes
   ════════════════════════════════════════════ */

const router = require('express').Router();
const { members, addActivity, incMemberId } = require('../data/store');
const { asyncWrap, createError } = require('../middleware/errorHandler');

router.get('/', asyncWrap(async (req, res) => {
  const { role, search, status } = req.query;
  let result = [...members];
  if (role)   result = result.filter(m => m.role === role);
  if (status) result = result.filter(m => m.status === status);
  if (search) {
    const s = search.toLowerCase();
    result = result.filter(m =>
      `${m.firstName} ${m.lastName} ${m.email}`.toLowerCase().includes(s)
    );
  }
  res.json({ success: true, count: result.length, data: result });
}));

router.get('/stats', asyncWrap(async (req, res) => {
  res.json({
    success: true,
    data: {
      total:   members.length,
      online:  members.filter(m => m.status === 'online').length,
      away:    members.filter(m => m.status === 'away').length,
      offline: members.filter(m => m.status === 'offline').length,
      byRole:  members.reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc; }, {}),
    }
  });
}));

router.post('/invite', asyncWrap(async (req, res) => {
  const { email, role, message } = req.body;
  if (!email) throw createError(400, 'Email is required');
  if (!/\S+@\S+\.\S+/.test(email)) throw createError(400, 'Invalid email');

  const exists = members.find(m => m.email.toLowerCase() === email.toLowerCase());
  if (exists) throw createError(409, 'Member already exists');

  addActivity('📬', `<b>${req.user.firstName}</b> invited <b>${email}</b> as ${role || 'member'}`);
  res.status(201).json({ success: true, message: `Invite sent to ${email}` });
}));

router.delete('/:id', asyncWrap(async (req, res) => {
  const idx = members.findIndex(m => m.id === parseInt(req.params.id));
  if (idx === -1) throw createError(404, 'Member not found');
  if (members[idx].role === 'admin') throw createError(403, 'Cannot remove admin');

  const [removed] = members.splice(idx, 1);
  addActivity('🚪', `<b>${removed.firstName} ${removed.lastName}</b> was removed`);
  res.json({ success: true, message: 'Member removed' });
}));

router.patch('/:id/role', asyncWrap(async (req, res) => {
  const { role } = req.body;
  const validRoles = ['admin','manager','developer','designer'];
  if (!validRoles.includes(role)) throw createError(400, 'Invalid role');

  const member = members.find(m => m.id === parseInt(req.params.id));
  if (!member) throw createError(404, 'Member not found');

  member.role = role;
  res.json({ success: true, data: member });
}));

module.exports = router;
