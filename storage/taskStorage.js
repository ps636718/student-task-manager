const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial seed tasks for Pawan Suman (BT24CSD054)
const initialSeedTasks = [
  {
    id: 'task-101',
    title: 'Containerize Web App with Docker',
    description: 'Write Dockerfile, build student-task-manager image and run on port 3000.',
    category: 'Labs',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2026-10-26',
    assignedTo: 'Pawan Suman (BT24CSD054)',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-102',
    title: 'Cloud Deployment on Render / AWS',
    description: 'Push git repository to GitHub and trigger automatic Docker cloud deployment.',
    category: 'Projects',
    priority: 'High',
    status: 'Pending',
    dueDate: '2026-10-28',
    assignedTo: 'Pawan Suman (BT24CSD054)',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-103',
    title: 'Design Responsive Bootstrap 5 Dashboard',
    description: 'Create modern UI with student badge, metrics counters, filter tabs, and CRUD modals.',
    category: 'Assignments',
    priority: 'Medium',
    status: 'Completed',
    dueDate: '2026-10-25',
    assignedTo: 'Pawan Suman (BT24CSD054)',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'task-104',
    title: 'Operating Systems & Virtualization Quiz',
    description: 'Review Docker containerization vs VMs, cgroups, namespaces, and image layers.',
    category: 'Exams',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2026-11-02',
    assignedTo: 'Pawan Suman (BT24CSD054)',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function readTasksFromFile() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeedTasks, null, 2), 'utf-8');
      return initialSeedTasks;
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    if (!raw.trim()) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(initialSeedTasks, null, 2), 'utf-8');
      return initialSeedTasks;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading tasks file:', err);
    return [];
  }
}

function writeTasksToFile(tasks) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing tasks file:', err);
    return false;
  }
}

const taskStorage = {
  getAll({ status, priority, category, search } = {}) {
    let tasks = readTasksFromFile();

    if (status && status !== 'All') {
      tasks = tasks.filter(t => t.status.toLowerCase() === status.toLowerCase());
    }
    if (priority && priority !== 'All') {
      tasks = tasks.filter(t => t.priority.toLowerCase() === priority.toLowerCase());
    }
    if (category && category !== 'All') {
      tasks = tasks.filter(t => t.category.toLowerCase() === category.toLowerCase());
    }
    if (search && search.trim() !== '') {
      const q = search.trim().toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Sort: Pending/In Progress first, then newest
    return tasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getById(id) {
    const tasks = readTasksFromFile();
    return tasks.find(t => t.id === id) || null;
  },

  create(taskData) {
    const tasks = readTasksFromFile();
    const newTask = {
      id: 'task-' + crypto.randomUUID().slice(0, 8),
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      category: taskData.category || 'General',
      priority: taskData.priority || 'Medium',
      status: taskData.status || 'Pending',
      dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
      assignedTo: taskData.assignedTo || 'Pawan Suman (BT24CSD054)',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    tasks.unshift(newTask);
    writeTasksToFile(tasks);
    return newTask;
  },

  update(id, updates) {
    const tasks = readTasksFromFile();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;

    const existing = tasks[index];
    const updated = {
      ...existing,
      ...updates,
      id: existing.id, // prevent id change
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString()
    };

    tasks[index] = updated;
    writeTasksToFile(tasks);
    return updated;
  },

  delete(id) {
    const tasks = readTasksFromFile();
    const initialLen = tasks.length;
    const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === initialLen) return false;

    writeTasksToFile(filtered);
    return true;
  },

  getStats() {
    const tasks = readTasksFromFile();
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inProgress = tasks.filter(t => t.status === 'In Progress').length;
    const highPriority = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;

    return {
      total,
      completed,
      pending,
      inProgress,
      highPriority,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
};

module.exports = taskStorage;
