/* ════════════════════════════════════════════
   ARCUS — In-Memory Data Store
   Replaces a real DB for demo purposes.
   In production: swap with Postgres / MongoDB.
   ════════════════════════════════════════════ */

const bcrypt = require('bcryptjs');

// ── Users ──────────────────────────────────────
const users = [
  {
    id: 1,
    firstName: 'Jane',
    lastName:  'Doe',
    email:     'jane@acme.com',
    passwordHash: bcrypt.hashSync('demo123', 10),
    role:      'admin',
    avatar:    'JD',
    avatarColor: 'av-blue',
    status:    'online',
    title:     'Product Manager',
    timezone:  'Africa/Nairobi',
    bio:       'Leading product at Acme since 2022.',
    workspace: 'Acme Inc.',
    createdAt: '2022-01-15T09:00:00Z'
  },
  {
    id: 2,
    firstName: 'Demo',
    lastName:  'User',
    email:     'demo@arcus.app',
    passwordHash: bcrypt.hashSync('demo123', 10),
    role:      'manager',
    avatar:    'DU',
    avatarColor: 'av-violet',
    status:    'online',
    title:     'Project Manager',
    timezone:  'UTC',
    bio:       '',
    workspace: 'Arcus Demo',
    createdAt: '2023-06-01T09:00:00Z'
  }
];

// ── Projects ───────────────────────────────────
const projects = [
  { id:1, name:'Website Redesign',  description:'Full redesign of the company website', status:'active',    color:'#6378ff', progress:68,  tasks:24, completedTasks:16, dueDate:'2026-04-15', members:['JD','AK','SC'], priority:'high',   createdBy:1, createdAt:'2026-01-10T10:00:00Z' },
  { id:2, name:'Mobile App v2',     description:'Second version of the mobile app',      status:'active',    color:'#a855f7', progress:42,  tasks:38, completedTasks:16, dueDate:'2026-05-01', members:['JD','MG'],     priority:'high',   createdBy:1, createdAt:'2026-01-20T10:00:00Z' },
  { id:3, name:'Brand Refresh',     description:'Update brand identity and guidelines',  status:'active',    color:'#10b981', progress:89,  tasks:12, completedTasks:11, dueDate:'2026-03-30', members:['AK'],          priority:'medium', createdBy:1, createdAt:'2026-02-01T10:00:00Z' },
  { id:4, name:'Data Pipeline',     description:'Build ETL pipeline for analytics',      status:'on-hold',  color:'#f59e0b', progress:25,  tasks:18, completedTasks:4,  dueDate:'2026-06-01', members:['SC','JD'],     priority:'low',    createdBy:1, createdAt:'2026-02-15T10:00:00Z' },
  { id:5, name:'API Gateway',       description:'Design and implement API gateway',      status:'active',    color:'#22d3ee', progress:55,  tasks:31, completedTasks:17, dueDate:'2026-04-20', members:['SC'],          priority:'medium', createdBy:1, createdAt:'2026-03-01T10:00:00Z' },
  { id:6, name:'Q1 Campaign',       description:'Marketing campaign for Q1 2026',        status:'completed', color:'#f43f5e', progress:100, tasks:15, completedTasks:15, dueDate:'2026-01-31', members:['MG','JD'],     priority:'low',    createdBy:1, createdAt:'2025-12-01T10:00:00Z' },
];

// ── Tasks ──────────────────────────────────────
const tasks = [
  { id:1, title:'Design homepage hero section',  projectId:1, status:'inprogress', priority:'high',   assignee:'JD', dueDate:'2026-03-28', description:'',  createdBy:1, createdAt:'2026-03-01T10:00:00Z' },
  { id:2, title:'Implement auth middleware',      projectId:5, status:'todo',       priority:'urgent', assignee:'SC', dueDate:'2026-03-27', description:'',  createdBy:1, createdAt:'2026-03-02T10:00:00Z' },
  { id:3, title:'Write user stories for v2',     projectId:2, status:'todo',       priority:'medium', assignee:'JD', dueDate:'2026-03-30', description:'',  createdBy:1, createdAt:'2026-03-03T10:00:00Z' },
  { id:4, title:'Logo variations review',        projectId:3, status:'review',     priority:'medium', assignee:'AK', dueDate:'2026-03-28', description:'',  createdBy:1, createdAt:'2026-03-04T10:00:00Z' },
  { id:5, title:'Setup CI/CD pipeline',          projectId:5, status:'inprogress', priority:'high',   assignee:'SC', dueDate:'2026-04-02', description:'',  createdBy:1, createdAt:'2026-03-05T10:00:00Z' },
  { id:6, title:'Conduct user interviews',       projectId:2, status:'done',       priority:'low',    assignee:'MG', dueDate:'2026-03-20', description:'',  createdBy:1, createdAt:'2026-03-06T10:00:00Z' },
  { id:7, title:'Finalise colour palette',       projectId:3, status:'done',       priority:'low',    assignee:'AK', dueDate:'2026-03-22', description:'',  createdBy:1, createdAt:'2026-03-07T10:00:00Z' },
  { id:8, title:'API documentation draft',       projectId:5, status:'todo',       priority:'medium', assignee:'SC', dueDate:'2026-04-05', description:'',  createdBy:1, createdAt:'2026-03-08T10:00:00Z' },
];

// ── Team Members ───────────────────────────────
const members = [
  { id:1, firstName:'Jane',  lastName:'Doe',    email:'jane@acme.com',  role:'admin',     avatar:'JD', avatarColor:'av-blue',    status:'online',  tasks:12, joined:'2022-01-15' },
  { id:2, firstName:'Alex',  lastName:'Kim',    email:'alex@acme.com',  role:'designer',  avatar:'AK', avatarColor:'av-violet',  status:'online',  tasks:8,  joined:'2022-03-10' },
  { id:3, firstName:'Sam',   lastName:'Chen',   email:'sam@acme.com',   role:'developer', avatar:'SC', avatarColor:'av-emerald', status:'away',    tasks:15, joined:'2022-06-01' },
  { id:4, firstName:'Maria', lastName:'Garcia', email:'maria@acme.com', role:'manager',   avatar:'MG', avatarColor:'av-amber',   status:'offline', tasks:6,  joined:'2023-01-20' },
  { id:5, firstName:'Liam',  lastName:'Murphy', email:'liam@acme.com',  role:'developer', avatar:'LM', avatarColor:'av-cyan',    status:'online',  tasks:10, joined:'2023-09-05' },
];

// ── Activity ───────────────────────────────────
const activity = [
  { id:1, icon:'✅', text:'<b>Jane</b> completed <b>Homepage wireframe</b>',     time:'2m ago',    createdAt: new Date(Date.now()-2*60000).toISOString() },
  { id:2, icon:'💬', text:'<b>Alex</b> commented on <b>Logo variations</b>',    time:'14m ago',   createdAt: new Date(Date.now()-14*60000).toISOString() },
  { id:3, icon:'📁', text:'<b>Sam</b> created project <b>API Gateway</b>',      time:'1h ago',    createdAt: new Date(Date.now()-60*60000).toISOString() },
  { id:4, icon:'👤', text:'<b>Liam Murphy</b> joined the workspace',            time:'3h ago',    createdAt: new Date(Date.now()-3*3600000).toISOString() },
  { id:5, icon:'🔔', text:'<b>Website Redesign</b> is 68% complete',            time:'5h ago',    createdAt: new Date(Date.now()-5*3600000).toISOString() },
  { id:6, icon:'✏️', text:'<b>Maria</b> updated <b>Q1 Campaign</b> status',    time:'Yesterday', createdAt: new Date(Date.now()-24*3600000).toISOString() },
  { id:7, icon:'📎', text:'<b>Alex</b> uploaded <b>brand_kit_v3.zip</b>',       time:'Yesterday', createdAt: new Date(Date.now()-26*3600000).toISOString() },
  { id:8, icon:'🚀', text:'<b>Q1 Campaign</b> was marked complete',             time:'2d ago',    createdAt: new Date(Date.now()-2*86400000).toISOString() },
];

// ── Sessions (simple token map) ────────────────
const sessions = new Map(); // token -> userId

// ── Counters ───────────────────────────────────
let nextUserId    = users.length + 1;
let nextProjectId = projects.length + 1;
let nextTaskId    = tasks.length + 1;
let nextMemberId  = members.length + 1;
let nextActivityId = activity.length + 1;

// ── Helper: add activity ───────────────────────
function addActivity(icon, text) {
  activity.unshift({
    id: nextActivityId++,
    icon, text, time: 'Just now',
    createdAt: new Date().toISOString()
  });
  if (activity.length > 50) activity.pop(); // keep last 50
}

module.exports = {
  users, projects, tasks, members, activity, sessions,
  get nextUserId()    { return nextUserId; },
  get nextProjectId() { return nextProjectId; },
  get nextTaskId()    { return nextTaskId; },
  get nextMemberId()  { return nextMemberId; },
  incUserId()    { return nextUserId++; },
  incProjectId() { return nextProjectId++; },
  incTaskId()    { return nextTaskId++; },
  incMemberId()  { return nextMemberId++; },
  addActivity,
};
