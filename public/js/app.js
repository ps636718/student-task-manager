// Student Task Manager Client-Side Controller
// Student: Pawan Suman (BT24CSD054)

let tasks = [];
let activeStatusFilter = 'All';
let activePriorityFilter = 'All';
let activeCategoryFilter = 'All';
let searchQuery = '';
let taskModalInstance = null;
let currentEditingId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Bootstrap Modals
  const modalEl = document.getElementById('taskModal');
  if (modalEl) {
    taskModalInstance = new bootstrap.Modal(modalEl);
  }

  // Set default due date to today in form
  const dueDateInput = document.getElementById('taskDueDate');
  if (dueDateInput) {
    dueDateInput.value = new Date().toISOString().split('T')[0];
  }

  // Event Listeners
  setupEventListeners();

  // Initial Data Load
  loadInitialData();

  // Periodic health check & ping (every 30 seconds)
  setInterval(checkHealth, 30000);
});

function setupEventListeners() {
  // Search input with debounce
  const searchInput = document.getElementById('searchInput');
  let searchTimeout;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        searchQuery = e.target.value.trim();
        fetchTasks();
      }, 300);
    });
  }

  // Filter Buttons (Status)
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatusFilter = btn.dataset.status || 'All';
      fetchTasks();
    });
  });

  // Priority Filter
  const priorityFilter = document.getElementById('priorityFilter');
  if (priorityFilter) {
    priorityFilter.addEventListener('change', (e) => {
      activePriorityFilter = e.target.value;
      fetchTasks();
    });
  }

  // Category Filter
  const categoryFilter = document.getElementById('categoryFilter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      activeCategoryFilter = e.target.value;
      fetchTasks();
    });
  }

  // Task Form Submit
  const taskForm = document.getElementById('taskForm');
  if (taskForm) {
    taskForm.addEventListener('submit', handleTaskFormSubmit);
  }

  // Refresh Button
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      loadInitialData();
      showToast('Dashboard refreshed with latest data', 'info');
    });
  }
}

async function loadInitialData() {
  await Promise.all([fetchTasks(), fetchStats(), checkHealth()]);
}

// Fetch tasks from Express REST API
async function fetchTasks() {
  const container = document.getElementById('tasksContainer');
  const loadingSpinner = document.getElementById('tasksLoading');

  try {
    const params = new URLSearchParams();
    if (activeStatusFilter !== 'All') params.append('status', activeStatusFilter);
    if (activePriorityFilter !== 'All') params.append('priority', activePriorityFilter);
    if (activeCategoryFilter !== 'All') params.append('category', activeCategoryFilter);
    if (searchQuery) params.append('search', searchQuery);

    const res = await fetch(`/api/tasks?${params.toString()}`);
    const data = await res.json();

    if (data.success) {
      tasks = data.data;
      renderTasks(tasks);
    } else {
      showToast(data.message || 'Error fetching tasks', 'danger');
    }
  } catch (err) {
    console.error('Fetch error:', err);
    showToast('Failed to connect to Node.js backend', 'danger');
  } finally {
    if (loadingSpinner) loadingSpinner.classList.add('d-none');
  }
}

// Fetch KPI statistics
async function fetchStats() {
  try {
    const res = await fetch('/api/stats');
    const result = await res.json();
    if (result.success) {
      const stats = result.data;
      document.getElementById('statTotal').innerText = stats.total;
      document.getElementById('statCompleted').innerText = stats.completed;
      document.getElementById('statPending').innerText = stats.pending;
      document.getElementById('statInProgress').innerText = stats.inProgress;
      
      const rateEl = document.getElementById('statCompletionRate');
      if (rateEl) rateEl.innerText = `${stats.completionRate}% Done`;
    }
  } catch (err) {
    console.error('Stats error:', err);
  }
}

// Health check endpoint
async function checkHealth() {
  try {
    const res = await fetch('/api/health');
    const data = await res.json();
    const badge = document.getElementById('healthStatusBadge');
    if (badge && data.status === 'healthy') {
      badge.innerHTML = `<span class="live-pulse me-1"></span> Docker App: Healthy (${data.uptime}s uptime)`;
      badge.className = 'badge bg-success-subtle text-success border border-success-subtle';
    }
  } catch (err) {
    const badge = document.getElementById('healthStatusBadge');
    if (badge) {
      badge.innerHTML = '⚠️ Server Offline';
      badge.className = 'badge bg-danger-subtle text-danger border border-danger-subtle';
    }
  }
}

// Render Tasks to DOM
function renderTasks(taskList) {
  const container = document.getElementById('tasksContainer');
  const emptyState = document.getElementById('emptyState');

  if (!container) return;

  if (taskList.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.classList.remove('d-none');
    return;
  }

  if (emptyState) emptyState.classList.add('d-none');

  container.innerHTML = taskList.map(task => {
    const isCompleted = task.status === 'Completed';
    const priorityClass = `badge-priority-${task.priority.toLowerCase()}`;
    const statusClass = `badge-status-${task.status.toLowerCase().replace(' ', '-')}`;

    // Category icon
    let catIcon = 'bi-folder2';
    if (task.category === 'Labs') catIcon = 'bi-cpu';
    if (task.category === 'Assignments') catIcon = 'bi-journal-code';
    if (task.category === 'Projects') catIcon = 'bi-kanban';
    if (task.category === 'Exams') catIcon = 'bi-award';

    return `
      <div class="col-12 col-md-6 col-lg-4 mb-3">
        <div class="task-item-card p-3 h-100 d-flex flex-column ${isCompleted ? 'completed' : ''}" data-id="${task.id}">
          <div class="priority-indicator ${task.priority}"></div>
          
          <div class="d-flex justify-content-between align-items-start mb-2 ps-2">
            <span class="badge ${priorityClass} px-2 py-1 rounded-pill small">
              <i class="bi bi-flag-fill me-1"></i>${task.priority} Priority
            </span>
            <span class="badge ${statusClass} px-2 py-1 rounded-pill small">
              ${task.status}
            </span>
          </div>

          <div class="ps-2 flex-grow-1">
            <h6 class="task-title fw-semibold mb-1 text-dark">${escapeHtml(task.title)}</h6>
            <p class="text-muted small mb-3 text-truncate-2">${escapeHtml(task.description || 'No detailed description provided.')}</p>
          </div>

          <div class="ps-2 pt-2 border-top border-light-subtle d-flex justify-content-between align-items-center mt-auto">
            <div class="d-flex align-items-center gap-2 text-muted small">
              <span><i class="bi ${catIcon} me-1"></i>${task.category}</span>
              <span>•</span>
              <span><i class="bi bi-calendar3 me-1"></i>${task.dueDate || 'No date'}</span>
            </div>
            
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-success btn-sm" title="${isCompleted ? 'Mark Pending' : 'Mark Completed'}" onclick="toggleTaskStatus('${task.id}', '${isCompleted ? 'Pending' : 'Completed'}')">
                <i class="bi ${isCompleted ? 'bi-arrow-counterclockwise' : 'bi-check-lg'}"></i>
              </button>
              <button class="btn btn-outline-primary btn-sm" title="Edit Task" onclick="openEditTaskModal('${task.id}')">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-sm" title="Delete Task" onclick="deleteTaskPrompt('${task.id}')">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Open modal to create a new task
function openCreateTaskModal() {
  currentEditingId = null;
  document.getElementById('taskModalTitle').innerText = 'Create New Student Task';
  document.getElementById('taskForm').reset();
  document.getElementById('taskId').value = '';
  document.getElementById('taskAssignedTo').value = 'Pawan Suman (BT24CSD054)';
  document.getElementById('taskDueDate').value = new Date().toISOString().split('T')[0];
  document.getElementById('taskPriority').value = 'Medium';
  document.getElementById('taskCategory').value = 'Labs';
  document.getElementById('taskStatus').value = 'Pending';
  taskModalInstance.show();
}

// Open modal to edit existing task
function openEditTaskModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  currentEditingId = id;
  document.getElementById('taskModalTitle').innerText = 'Edit Task Details';
  document.getElementById('taskId').value = task.id;
  document.getElementById('taskTitle').value = task.title;
  document.getElementById('taskDescription').value = task.description || '';
  document.getElementById('taskCategory').value = task.category || 'General';
  document.getElementById('taskPriority').value = task.priority || 'Medium';
  document.getElementById('taskStatus').value = task.status || 'Pending';
  document.getElementById('taskDueDate').value = task.dueDate || '';
  document.getElementById('taskAssignedTo').value = task.assignedTo || 'Pawan Suman (BT24CSD054)';

  taskModalInstance.show();
}

// Handle Form Submit (Create or Update)
async function handleTaskFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('taskTitle').value.trim();
  const description = document.getElementById('taskDescription').value.trim();
  const category = document.getElementById('taskCategory').value;
  const priority = document.getElementById('taskPriority').value;
  const status = document.getElementById('taskStatus').value;
  const dueDate = document.getElementById('taskDueDate').value;
  const assignedTo = document.getElementById('taskAssignedTo').value.trim();

  if (!title) {
    showToast('Task title is required', 'warning');
    return;
  }

  const payload = { title, description, category, priority, status, dueDate, assignedTo };

  try {
    let res;
    if (currentEditingId) {
      // Update
      res = await fetch(`/api/tasks/${currentEditingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      // Create
      res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (data.success) {
      taskModalInstance.hide();
      showToast(currentEditingId ? 'Task updated successfully! 🎉' : 'New task created successfully! 🚀', 'success');
      fetchTasks();
      fetchStats();
    } else {
      showToast(data.message || 'Operation failed', 'danger');
    }
  } catch (err) {
    console.error('Submit error:', err);
    showToast('Failed to save task. Check server status.', 'danger');
  }
}

// Quick toggle status
async function toggleTaskStatus(id, newStatus) {
  try {
    const res = await fetch(`/api/tasks/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Task status updated to "${newStatus}"`, 'success');
      fetchTasks();
      fetchStats();
    } else {
      showToast(data.message || 'Update failed', 'danger');
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to update status', 'danger');
  }
}

// Delete task with confirmation
async function deleteTaskPrompt(id) {
  const task = tasks.find(t => t.id === id);
  const title = task ? `"${task.title}"` : 'this task';
  
  if (!confirm(`Are you sure you want to delete ${title}?`)) {
    return;
  }

  try {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE'
    });
    const data = await res.json();
    if (data.success) {
      showToast('Task deleted successfully', 'info');
      fetchTasks();
      fetchStats();
    } else {
      showToast(data.message || 'Failed to delete task', 'danger');
    }
  } catch (err) {
    console.error(err);
    showToast('Failed to delete task', 'danger');
  }
}

// Toast notification helper
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const bgClasses = {
    success: 'bg-success text-white',
    danger: 'bg-danger text-white',
    warning: 'bg-warning text-dark',
    info: 'bg-primary text-white'
  };

  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center ${bgClasses[type] || 'bg-dark text-white'} border-0 shadow" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body fw-medium">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  const toastEl = document.getElementById(toastId);
  const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
  bsToast.show();

  toastEl.addEventListener('hidden.bs.toast', () => {
    toastEl.remove();
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
