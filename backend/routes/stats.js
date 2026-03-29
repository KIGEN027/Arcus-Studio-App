/* ════════════════════════════════════════════
   ARCUS — Stats Route
   ════════════════════════════════════════════ */
const router = require('express').Router();
const { projects, tasks, members } = require('../data/store');

router.get('/', (req, res) => {
  const activeProjects   = projects.filter(p => p.status === 'active').length;
  const completedTasks   = tasks.filter(t => t.status === 'done').length;
  const totalMembers     = members.length;
  const onlineMembers    = members.filter(m => m.status === 'online').length;

  // Compute hours (simulated: sum of completedTasks * avg 2.5h)
  const hours = Math.round(completedTasks * 2.5 + Math.random() * 20);

  // Weekly task completion (last 7 days - simulated data)
  const weeklyLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const weeklyCompleted = [5,8,6,12,9,4,7];
  const weeklyCreated   = [7,5,9,8,11,3,6];

  // Tasks by status
  const tasksByStatus = {
    todo:       tasks.filter(t => t.status === 'todo').length,
    inprogress: tasks.filter(t => t.status === 'inprogress').length,
    review:     tasks.filter(t => t.status === 'review').length,
    done:       completedTasks,
  };

  // Projects by status
  const projectsByStatus = {
    active:    activeProjects,
    completed: projects.filter(p => p.status === 'completed').length,
    onHold:    projects.filter(p => p.status === 'on-hold').length,
  };

  res.json({
    success: true,
    data: {
      projects:       activeProjects,
      tasks:          completedTasks,
      members:        totalMembers,
      onlineMembers,
      hours,
      tasksByStatus,
      projectsByStatus,
      weekly: { labels: weeklyLabels, completed: weeklyCompleted, created: weeklyCreated }
    }
  });
});

module.exports = router;


/* ════════════════════════════════════════════
   ARCUS — Activity Route  (separate file below)
   ════════════════════════════════════════════ */
// Save activity.js separately:
