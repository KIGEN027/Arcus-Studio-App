/* ════════════════════════════════════════════
   ARCUS — Tasks Routes
   GET    /api/tasks
   POST   /api/tasks
   GET    /api/tasks/:id
   PUT    /api/tasks/:id
   PATCH  /api/tasks/:id/status
   DELETE /api/tasks/:id
   ════════════════════════════════════════════ */

const router = require('express').Router();
const { tasks, projects, addActivity, incTaskId } = require('../data/store');
const { asyncWrap, createError } = require('../middleware/errorHandler');

// ── GET /api/tasks ────────────────────────────
router.get('/', asyncWrap(async (req, res) => {
  const { status, priority, assignee, projectId, search, sort = 'createdAt', order = 'desc' } = req.query;

  let result = [...tasks];

  if (status)    result = result.filter(t => t.status === status);
  if (priority)  result = result.filter(t => t.priority === priority);
  if (assignee)  result = result.filter(t => t.assignee === assignee);
  if (projectId) result = result.filter(t => t.projectId === parseInt(projectId));
  if (search)    result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));

  result.sort((a, b) => {
    let va = a[sort] ?? '', vb = b[sort] ?? '';
    if (typeof va === 'string') va = va.toLowerCase(), vb = vb.toLowerCase();
    if (order === 'asc') return va > vb ? 1 : -1;
    return va < vb ? 1 : -1;
  });

  // Enrich with project name
  const enriched = result.map(t => {
    const proj = projects.find(p => p.id === t.projectId);
    return { ...t, projectName: proj?.name || null, projectColor: proj?.color || null };
  });

  res.json({ success: true, count: enriched.length, data: enriched });
}));

// ── POST /api/tasks ───────────────────────────
router.post('/', asyncWrap(async (req, res) => {
  const { title, description, projectId, status, priority, assignee, dueDate } = req.body;

  if (!title?.trim()) throw createError(400, 'Task title is required');

  const task = {
    id:          incTaskId(),
    title:       title.trim(),
    description: description?.trim() || '',
    projectId:   projectId ? parseInt(projectId) : null,
    status:      status || 'todo',
    priority:    priority || 'medium',
    assignee:    assignee || req.user.avatar,
    dueDate:     dueDate || null,
    createdBy:   req.user.id,
    createdAt:   new Date().toISOString(),
    updatedAt:   new Date().toISOString()
  };

  tasks.unshift(task);

  // Update project task count
  if (task.projectId) {
    const proj = projects.find(p => p.id === task.projectId);
    if (proj) proj.tasks = (proj.tasks || 0) + 1;
  }

  addActivity('✅', `<b>${req.user.firstName}</b> created task <b>${task.title}</b>`);
  res.status(201).json({ success: true, message: 'Task created', data: task });
}));

// ── GET /api/tasks/:id ────────────────────────
router.get('/:id', asyncWrap(async (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) throw createError(404, 'Task not found');
  res.json({ success: true, data: task });
}));

// ── PUT /api/tasks/:id ────────────────────────
router.put('/:id', asyncWrap(async (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) throw createError(404, 'Task not found');

  const { title, description, status, priority, assignee, dueDate, projectId } = req.body;
  const prevStatus = task.status;

  if (title !== undefined)       task.title       = title.trim();
  if (description !== undefined) task.description = description.trim();
  if (status !== undefined)      task.status      = status;
  if (priority !== undefined)    task.priority    = priority;
  if (assignee !== undefined)    task.assignee    = assignee;
  if (dueDate !== undefined)     task.dueDate     = dueDate;
  if (projectId !== undefined)   task.projectId   = parseInt(projectId);
  task.updatedAt = new Date().toISOString();

  // Update project progress when task completed
  if (status === 'done' && prevStatus !== 'done' && task.projectId) {
    const proj = projects.find(p => p.id === task.projectId);
    if (proj) {
      proj.completedTasks = (proj.completedTasks || 0) + 1;
      proj.progress = proj.tasks > 0
        ? Math.round((proj.completedTasks / proj.tasks) * 100) : 0;
    }
  }

  addActivity('✏️', `<b>${req.user.firstName}</b> updated task <b>${task.title}</b>`);
  res.json({ success: true, message: 'Task updated', data: task });
}));

// ── PATCH /api/tasks/:id/status ───────────────
router.patch('/:id/status', asyncWrap(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['todo','inprogress','review','done'];
  if (!validStatuses.includes(status)) throw createError(400, 'Invalid status');

  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) throw createError(404, 'Task not found');

  const prevStatus = task.status;
  task.status = status;
  task.updatedAt = new Date().toISOString();

  // Sync project completedTasks
  if (task.projectId) {
    const proj = projects.find(p => p.id === task.projectId);
    if (proj) {
      const doneTasks = tasks.filter(t => t.projectId === task.projectId && t.status === 'done').length;
      proj.completedTasks = doneTasks;
      proj.progress = proj.tasks > 0 ? Math.round((doneTasks / proj.tasks) * 100) : 0;
    }
  }

  if (status === 'done' && prevStatus !== 'done') {
    addActivity('✅', `<b>${req.user.firstName}</b> completed <b>${task.title}</b>`);
  }

  res.json({ success: true, data: task });
}));

// ── DELETE /api/tasks/:id ─────────────────────
router.delete('/:id', asyncWrap(async (req, res) => {
  const idx = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (idx === -1) throw createError(404, 'Task not found');

  const [removed] = tasks.splice(idx, 1);

  if (removed.projectId) {
    const proj = projects.find(p => p.id === removed.projectId);
    if (proj) proj.tasks = Math.max(0, (proj.tasks || 1) - 1);
  }

  res.json({ success: true, message: 'Task deleted' });
}));

module.exports = router;
