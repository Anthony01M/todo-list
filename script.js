document.addEventListener('DOMContentLoaded', () => {
    const taskList = document.getElementById('task-list');
    const todoForm = document.getElementById('todo-form');
    const newTaskInput = document.getElementById('new-task');
    const taskDescInput = document.getElementById('task-desc');
    const taskDateInput = document.getElementById('task-date');
    const submitButton = todoForm.querySelector('button[type="submit"]');
    const modal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('modal-task-title');
    const modalDesc = document.getElementById('modal-task-desc');
    const modalDate = document.getElementById('modal-task-date');
    const modalCompleteButton = document.getElementById('modal-complete-button');
    const modalEditButton = document.getElementById('modal-edit-button');
    const modalDeleteButton = document.getElementById('modal-delete-button');
    const editModal = document.getElementById('edit-modal');
    const editForm = document.getElementById('edit-form');
    const editTaskTitle = document.getElementById('edit-task-title');
    const editTaskDesc = document.getElementById('edit-task-desc');
    const editTaskDate = document.getElementById('edit-task-date');
    const deleteModal = document.getElementById('delete-modal');
    const confirmDeleteButton = document.getElementById('confirm-delete-button');
    const cancelDeleteButton = document.getElementById('cancel-delete-button');
    const closeButton = document.querySelectorAll('.close-button');
    const STORAGE_KEY = 'todo-tasks';
    let editMode = false;
    let taskToEdit = null;
    let taskToDelete = null;

    function generateId() {
        return '_' + Math.random().toString(36).substr(2, 9);
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        taskList.innerHTML = '';
        tasks.forEach(task => addTaskToDOM(task));
    }

    function saveTasks(tasks) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    function addTaskToDOM(task) {
        const li = document.createElement('li');
        li.draggable = true;
        li.innerHTML = `
            <div class="task-info">
                <p><strong>${task.title}</strong></p>
                <div class="badges">
                    ${(task.badges || []).map(badge => `<span class="badge ${badge}">${badge}</span>`).join('')}
                </div>
            </div>
        `;

        li.addEventListener('click', () => {
            openModal(task);
        });

        li.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(task));
        });

        li.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        li.addEventListener('drop', (e) => {
            e.preventDefault();
            const droppedTask = JSON.parse(e.dataTransfer.getData('text/plain'));
            moveTask(droppedTask.id, task.id);
        });

        li.style.cursor = 'pointer';
        taskList.appendChild(li);
    }

    function addTask(task) {
        const tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        tasks.push(task);
        saveTasks(tasks);
        addTaskToDOM(task);
    }

    function updateTask(updatedTask) {
        let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const index = tasks.findIndex(t => t.id === updatedTask.id);
        tasks[index] = updatedTask;
        saveTasks(tasks);
        loadTasks();
        exitEditMode();
    }

    function deleteTask(taskId) {
        let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks(tasks);
        loadTasks();
    }

    function enterEditMode(task) {
        editTaskTitle.value = task.title;
        editTaskDesc.value = task.description;
        editTaskDate.value = task.date;
        editModal.style.setProperty('display', 'flex', 'important');
        taskToEdit = task;
    }

    function exitEditMode() {
        editTaskTitle.value = '';
        editTaskDesc.value = '';
        editTaskDate.value = '';
        editModal.style.display = 'none';
        taskToEdit = null;
    }

    function enterDeleteMode(task) {
        deleteModal.style.setProperty('display', 'flex', 'important');
        taskToDelete = task;
    }

    function exitDeleteMode() {
        deleteModal.style.display = 'none';
        taskToDelete = null;
    }

    function confirmDelete() {
        deleteTask(taskToDelete.id);
        exitDeleteMode();
        closeModal();
    }

    function cancelDelete() {
        exitDeleteMode();
    }

    function moveTask(droppedTaskId, targetTaskId) {
        let tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        const droppedIndex = tasks.findIndex(t => t.id === droppedTaskId);
        const targetIndex = tasks.findIndex(t => t.id === targetTaskId);
        const [droppedTask] = tasks.splice(droppedIndex, 1);
        tasks.splice(targetIndex, 0, droppedTask);
        saveTasks(tasks);
        loadTasks();
    }

    function markTaskComplete(task) {
        task.badges = task.badges || [];
        if (!task.badges.includes('complete')) {
            task.badges.push('complete');
        }
        updateTask(task);
        modalCompleteButton.textContent = '↩️';
        modalCompleteButton.className = 'undo-button';
    }

    function undoTaskComplete(task) {
        task.badges = task.badges || [];
        task.badges = task.badges.filter(badge => badge !== 'complete');
        updateTask(task);
        modalCompleteButton.textContent = '✅';
        modalCompleteButton.className = 'complete-button';
    }

    function openModal(task) {
        modalTitle.textContent = task.title;
        modalDesc.textContent = task.description;
        modalDate.textContent = task.date;
        modalCompleteButton.className = task.badges.includes('complete') ? 'undo-button' : 'complete-button';
        modalCompleteButton.textContent = task.badges.includes('complete') ? '↩️' : '✅';

        modalCompleteButton.onclick = () => {
            if (task.badges.includes('complete')) {
                undoTaskComplete(task);
            } else {
                markTaskComplete(task);
            }
        };

        modalEditButton.onclick = () => {
            enterEditMode(task);
        };

        modalDeleteButton.onclick = () => {
            enterDeleteMode(task);
        };

        modal.style.setProperty('display', 'flex', 'important');
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function closeEditModal() {
        editModal.style.display = 'none';
    }

    function closeDeleteModal() {
        deleteModal.style.display = 'none';
    }

    closeButton.forEach(button => {
        button.addEventListener('click', (e) => {
            if (e.target.closest('#edit-modal')) {
                closeEditModal();
            } else if (e.target.closest('#delete-modal')) {
                closeDeleteModal();
            } else {
                closeModal();
            }
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        } else if (e.target === editModal) {
            closeEditModal();
        } else if (e.target === deleteModal) {
            closeDeleteModal();
        }
    });

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newTask = {
            id: editMode ? taskToEdit.id : generateId(),
            title: newTaskInput.value.trim(),
            description: taskDescInput.value.trim(),
            date: taskDateInput.value,
            badges: editMode ? taskToEdit.badges : []
        };
        if (newTask.title) {
            if (editMode) {
                updateTask(newTask);
            } else {
                addTask(newTask);
            }
            exitEditMode();
        }
    });

    editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedTask = {
            ...taskToEdit,
            title: editTaskTitle.value.trim(),
            description: editTaskDesc.value.trim(),
            date: editTaskDate.value
        };
        if (updatedTask.title) {
            updateTask(updatedTask);
            exitEditMode();
        }
    });

    confirmDeleteButton.addEventListener('click', confirmDelete);
    cancelDeleteButton.addEventListener('click', cancelDelete);

    loadTasks();

    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#000000', '#FF5733', '#FF8C00', '#FFD700', '#ADFF2F', '#00FF7F', '#00CED1', '#1E90FF', '#9370DB', '#FF1493', '#000000'];
    let colorIndex = 0;

    setInterval(() => {
        document.body.style.backgroundColor = colors[colorIndex];
        colorIndex = (colorIndex + 1) % colors.length;
    }, 5000);
});