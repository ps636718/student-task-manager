const express = require('express');
const router = express.Router();
const taskStorage = require('../storage/taskStorage');

// GET /api/tasks - list tasks with optional filters
router.get('/', (req, res) => {
  try {
    const { status, priority, category, search } = req.query;
    const tasks = taskStorage.getAll({ status, priority, category, search });
    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/tasks/:id - get single task
router.get('/:id', (req, res) => {
  try {
    const task = taskStorage.getById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tasks - create new task
router.post('/', (req, res) => {
  try {
    const { title, description, category, priority, status, dueDate, assignedTo } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const newTask = taskStorage.create({
      title,
      description,
      category,
      priority,
      status,
      dueDate,
      assignedTo: assignedTo || 'Pawan Suman (BT24CSD054)'
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: newTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/tasks/:id - update existing task
router.put('/:id', (req, res) => {
  try {
    const { title, description, category, priority, status, dueDate, assignedTo } = req.body;
    if (title !== undefined && (!title || !title.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Task title cannot be empty'
      });
    }

    const updatedTask = taskStorage.update(req.params.id, {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(priority !== undefined && { priority }),
      ...(status !== undefined && { status }),
      ...(dueDate !== undefined && { dueDate }),
      ...(assignedTo !== undefined && { assignedTo })
    });

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PATCH /api/tasks/:id/status - toggle or quick update status
router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const updatedTask = taskStorage.update(req.params.id, { status });
    if (!updatedTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      message: 'Task status updated',
      data: updatedTask
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/tasks/:id - delete a task
router.delete('/:id', (req, res) => {
  try {
    const deleted = taskStorage.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
