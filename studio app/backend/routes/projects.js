/* ════════════════════════════════════════════
   ARCUS — Projects Routes
   GET    /api/projects
   POST   /api/projects
   GET    /api/projects/:id
   PUT    /api/projects/:id
   PATCH  /api/projects/:id
   DELETE /api/projects/:id
   GET    /api/projects/:id/tasks
   GET    /api/projects/:id/stats
   ════════════════════════════════════════════ */

const router = require('express').Router();
const { projects, tasks, addActivity, incProjectId } = require('../data/store');
const { asyncWrap, createError } = require('../middleware/errorHandler');

// ── GET /api/projects ─────────────────────────
router.get('/', asyncWrap(async (req, res) => {
  const { status, search, sort = 'createdAt', order = 'desc' } = req.query;

  let result = [...projects];

  if (status)  result = result.filter(p => p.status === status);
  if (search)  result = result.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  // Sort
  result.sort((a, b) => {
    let va = a[sort], vb = b[sort];
    if (typeof va === 'string') va = va.toLowerCase(), vb = vb.toLowerCase();
    if (order === 'asc') return va > vb ? 1 : -1;
    return va < vb ? 1 : -1;
  });

  res.json({ success: true, count: result.length, data: result });
}));

// ── POST /api/projects ────────────────────────
router.post('/', asyncWrap(async (req, res) => {
  const { name, description, color, dueDate, priority } = req.body;

  if (!name?.trim()) throw createError(400, 'Project name is required');

  const project = {
    id:             incProjectId(),
    name:           name.trim(),
    description:    description?.trim() || '',
    status:         'active',
    color:          color || '#6378ff',
    progress:       0,
    tasks:          0,
    completedTasks: 0,
    dueDate:        dueDate || null,
    priority:       priority || 'medium',
    members:        [req.user.avatar],
    createdBy:      req.user.id,
    createdAt:      new Date().toISOString(),
    updatedAt:      new Date().toISOString()
  };

  projects.unshift(project);
  addActivity('📁', `<b>${req.user.firstName}</b> created project <b>${project.name}</b>`);

  res.status(201).json({ success: true, message: 'Project created', data: project });
}));

// ── GET /api/projects/:id ─────────────────────
router.get('/:id', asyncWrap(async (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) throw createError(404, 'Project not found');
  res.json({ success: true, data: project });
}));

// ── PUT /api/projects/:id ─────────────────────
router.put('/:id', asyncWrap(async (req, res) => {
  const idx = projects.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) throw createError(404, 'Project not found');

  const { name, description, status, color, dueDate, priority, progress } = req.body;
  const project = projects[idx];

  if (name !== undefined)        project.name        = name.trim();
  if (description !== undefined) project.description = description.trim();
  if (status !== undefined)      project.status      = status;
  if (color !== undefined)       project.color       = color;
  if (dueDate !== undefined)     project.dueDate     = dueDate;
  if (priority !== undefined)    project.priority    = priority;
  if (progress !== undefined)    project.progress    = Math.min(100, Math.max(0, Number(progress)));
  project.updatedAt = new Date().toISOString();

  addActivity('✏️', `<b>${req.user.firstName}</b> updated project <b>${project.name}</b>`);
  res.json({ success: true, message: 'Project updated', data: project });
}));

// ── PATCH /api/projects/:id ───────────────────
router.patch('/:id', asyncWrap(async (req, res) => {
  const project = projects.find(p => p.id === parseInt(req.params.id));
  if (!project) throw createError(404, 'Project not found');

  Object.assign(project, req.body, { updatedAt: new Date().toISOString() });
  res.json({ success: true, data: project });
}));

// ── DELETE /api/projects/:id ──────────────────
router.delete('/:id', asyncWrap(async (req, res) => {
  const idx = projects.findIndex(p => p.id === parseInt(req.params.id));
  if (idx === -1) throw createError(404, 'Project not found');

  const [removed] = projects.splice(idx, 1);
  addActivity('🗑', `<b>${req.user.firstName}</b> deleted project <b>${removed.name}</b>`);
  res.json({ success: true, message: 'Project deleted' });
}));

// ── GET /api/projects/:id/tasks ───────────────
router.get('/:id/tasks', asyncWrap(async (req, res) => {
  const projId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projId);
  if (!project) throw createError(404, 'Project not found');

  const projectTasks = tasks.filter(t => t.projectId === projId);
  res.json({ success: true, count: projectTasks.length, data: projectTasks });
}));

// ── GET /api/projects/:id/stats ───────────────
router.get('/:id/stats', asyncWrap(async (req, res) => {
  const projId = parseInt(req.params.id);
  const project = projects.find(p => p.id === projId);
  if (!project) throw createError(404, 'Project not found');

  const projectTasks = tasks.filter(t => t.projectId === projId);
  const byStatus = {
    todo:       projectTasks.filter(t => t.status === 'todo').length,
    inprogress: projectTasks.filter(t => t.status === 'inprogress').length,
    review:     projectTasks.filter(t => t.status === 'review').length,
    done:       projectTasks.filter(t => t.status === 'done').length,
  };
  const byPriority = {
    low:    projectTasks.filter(t => t.priority === 'low').length,
    medium: projectTasks.filter(t => t.priority === 'medium').length,
    high:   projectTasks.filter(t => t.priority === 'high').length,
    urgent: projectTasks.filter(t => t.priority === 'urgent').length,
  };

  res.json({
    success: true,
    data: {
      project,
      taskCount: projectTasks.length,
      completedTasks: byStatus.done,
      progress: projectTasks.length > 0
        ? Math.round((byStatus.done / projectTasks.length) * 100)
        : 0,
      byStatus,
      byPriority
    }
  });
}));

module.exports = router;
