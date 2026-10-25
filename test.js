// Automated API & Storage Verification Test
const assert = require('assert');
const taskStorage = require('./storage/taskStorage');

console.log('--- Starting Automated Tests for Student Task Manager ---');
console.log('Student: Pawan Suman (BT24CSD054)\n');

// 1. Test Initial Stats & Retrieval
const initialStats = taskStorage.getStats();
console.log('✓ Initial Stats Loaded:', initialStats);
assert(typeof initialStats.total === 'number', 'Total tasks should be a number');

// 2. Test Task Creation (POST CRUD)
const newTask = taskStorage.create({
  title: 'Automated Test Task for Docker',
  description: 'Verifying task creation in local storage',
  category: 'Labs',
  priority: 'High',
  status: 'Pending',
  assignedTo: 'Pawan Suman (BT24CSD054)'
});
console.log('✓ Task Created with ID:', newTask.id);
assert(newTask.title === 'Automated Test Task for Docker', 'Task title mismatch');

// 3. Test Retrieval by ID (GET CRUD)
const fetched = taskStorage.getById(newTask.id);
assert(fetched !== null, 'Created task should be fetchable by ID');
console.log('✓ Task Fetched by ID:', fetched.id);

// 4. Test Task Update (PUT / PATCH CRUD)
const updated = taskStorage.update(newTask.id, {
  status: 'Completed',
  description: 'Updated description during test'
});
assert(updated.status === 'Completed', 'Task status should be Completed');
console.log('✓ Task Updated Successfully, new status:', updated.status);

// 5. Test Filters
const completedTasks = taskStorage.getAll({ status: 'Completed' });
assert(completedTasks.some(t => t.id === newTask.id), 'Task should appear in completed filter');
console.log('✓ Status Filtering verified. Found:', completedTasks.length, 'completed tasks');

// 6. Test Task Deletion (DELETE CRUD)
const deleteResult = taskStorage.delete(newTask.id);
assert(deleteResult === true, 'Delete operation should return true');
const checkDeleted = taskStorage.getById(newTask.id);
assert(checkDeleted === null, 'Task should not exist after deletion');
console.log('✓ Task Deleted Successfully');

console.log('\n======================================================');
console.log('ALL STORAGE & CRUD TESTS PASSED SUCCESSFULLY! (6/6)');
console.log('======================================================');
