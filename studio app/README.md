# ARCUS — Project Management SaaS

A beautiful, full-stack project management application built with HTML/CSS/JS (frontend) and Node.js/Express (backend).

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- npm ≥ 9

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Start the backend server
npm start
# or for hot reload:
npm run dev

# 3. Open in browser
# http://localhost:3000/pages/login.html
```

### Demo Credentials
```
Email:    jane@acme.com
Password: demo123
```

---

## 📁 Project Structure

```
arcus/
├── public/                  # Frontend (HTML/CSS/JS)
│   ├── css/
│   │   ├── tokens.css       # Design tokens / CSS variables
│   │   ├── global.css       # Reset, components, utilities
│   │   ├── dashboard.css    # Dashboard layout & components
│   │   └── auth.css         # Login / Register pages
│   ├── js/
│   │   ├── utils.js         # Shared utilities, API client, mock data
│   │   ├── auth.js          # Login & register logic
│   │   ├── dashboard.js     # Dashboard: stats, charts, tasks
│   │   ├── projects.js      # Projects CRUD
│   │   ├── board.js         # Kanban board + drag & drop
│   │   ├── team.js          # Team management
│   │   └── settings.js      # Settings panels
│   └── pages/
│       ├── login.html       # Login page
│       ├── register.html    # Register page
│       ├── dashboard.html   # Main dashboard
│       ├── projects.html    # Projects list / grid
│       ├── board.html       # Kanban board
│       ├── team.html        # Team members
│       └── settings.html    # Account & workspace settings
│
├── backend/
│   ├── server.js            # Express app entry point
│   ├── data/
│   │   └── store.js         # In-memory data store (replace with DB)
│   ├── middleware/
│   │   ├── auth.js          # JWT authentication middleware
│   │   └── errorHandler.js  # Global error handler
│   └── routes/
│       ├── auth.js          # POST /api/auth/login, /register, etc.
│       ├── projects.js      # CRUD /api/projects
│       ├── tasks.js         # CRUD /api/tasks
│       ├── team.js          # /api/team
│       ├── stats.js         # /api/stats
│       └── activity.js      # /api/activity
│
├── package.json
└── README.md
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint                  | Auth | Description        |
|--------|---------------------------|------|--------------------|
| POST   | /api/auth/login           | No   | Sign in            |
| POST   | /api/auth/register        | No   | Create account     |
| POST   | /api/auth/logout          | Yes  | Sign out           |
| GET    | /api/auth/me              | Yes  | Get current user   |
| PATCH  | /api/auth/me              | Yes  | Update profile     |
| POST   | /api/auth/change-password | Yes  | Change password    |

### Projects
| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| GET    | /api/projects                | List all projects    |
| POST   | /api/projects                | Create project       |
| GET    | /api/projects/:id            | Get project          |
| PUT    | /api/projects/:id            | Update project       |
| DELETE | /api/projects/:id            | Delete project       |
| GET    | /api/projects/:id/tasks      | Get project tasks    |
| GET    | /api/projects/:id/stats      | Get project stats    |

### Tasks
| Method | Endpoint                     | Description          |
|--------|------------------------------|----------------------|
| GET    | /api/tasks                   | List tasks (filters) |
| POST   | /api/tasks                   | Create task          |
| GET    | /api/tasks/:id               | Get task             |
| PUT    | /api/tasks/:id               | Update task          |
| PATCH  | /api/tasks/:id/status        | Update status only   |
| DELETE | /api/tasks/:id               | Delete task          |

### Team
| Method | Endpoint                | Description         |
|--------|-------------------------|---------------------|
| GET    | /api/team               | List members        |
| GET    | /api/team/stats         | Member stats        |
| POST   | /api/team/invite        | Invite member       |
| DELETE | /api/team/:id           | Remove member       |
| PATCH  | /api/team/:id/role      | Change role         |

### Other
| Method | Endpoint        | Description       |
|--------|-----------------|-------------------|
| GET    | /api/stats      | Workspace stats   |
| GET    | /api/activity   | Activity feed     |
| GET    | /health         | Health check      |

---

## 🎨 Design System

The frontend uses a cohesive dark design system with:
- **Colors**: Deep navy backgrounds (#06080d) with electric blue (#6378ff) & violet (#a855f7) accents
- **Fonts**: Syne (headings) + DM Sans (body) + JetBrains Mono (code/data)
- **Components**: Buttons, inputs, badges, cards, modals, toasts, dropdowns, avatars
- **Pages**: Auth, Dashboard, Projects, Kanban Board, Team, Settings

---

## 🔧 Environment Variables

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=your_super_secret_key_here
```

---

## 🏗 Production Checklist

- [ ] Replace in-memory store with PostgreSQL / MongoDB
- [ ] Use real JWT_SECRET (min 64 chars, from env)
- [ ] Enable HTTPS / TLS
- [ ] Set up proper CORS origins
- [ ] Add email service for invites (SendGrid / Resend)
- [ ] Add file upload (S3 / Cloudflare R2) for avatars
- [ ] Enable logging (Winston / Pino)
- [ ] Add database migrations (Prisma / Knex)
- [ ] Set up CI/CD pipeline

---

## 📄 License

MIT © 2026 Arcus Studio
