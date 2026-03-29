/* ════════════════════════════════════════════
   ARCUS — Backend Server (Node.js / Express)
   ════════════════════════════════════════════ */

const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const path       = require('path');
const rateLimit  = require('express-rate-limit');

const authRoutes     = require('./routes/auth');
const projectRoutes  = require('./routes/projects');
const taskRoutes     = require('./routes/tasks');
const teamRoutes     = require('./routes/team');
const statsRoutes    = require('./routes/stats');
const activityRoutes = require('./routes/activity');

const { errorHandler }  = require('./middleware/errorHandler');
const { authMiddleware } = require('./middleware/auth');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Security & Middleware ─────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({
  origin: ['http://localhost:5500', 'http://127.0.0.1:5500', 'null', '*'],
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ── Rate Limiting ─────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  message: { success: false, message: 'Too many requests. Try again later.' }
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many auth attempts. Try again later.' }
});
app.use('/api/', limiter);
app.use('/api/auth', authLimiter);

// ── Static Files ──────────────────────────────
app.use(express.static(path.join(__dirname, '../public')));

// ── Health Check ──────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ── API Routes ────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/tasks',    authMiddleware, taskRoutes);
app.use('/api/team',     authMiddleware, teamRoutes);
app.use('/api/stats',    authMiddleware, statsRoutes);
app.use('/api/activity', authMiddleware, activityRoutes);

// ── API 404 ───────────────────────────────────
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── SPA fallback ──────────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/login.html'));
});

// ── Error Handler ─────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────
app.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════╗');
  console.log('║      ARCUS Server  — Running         ║');
  console.log(`║  http://localhost:${PORT}               ║`);
  console.log('╚══════════════════════════════════════╝\n');
});

module.exports = app;
