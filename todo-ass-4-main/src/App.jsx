import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import "./App.css";

function App() {
  const [tasks, setTasks] = useState(
    JSON.parse(localStorage.getItem("tasks")) || []
  );
  const [text, setText] = useState("");
  const [deadline, setDeadline] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      tasks.forEach((task) => {
        const diff = new Date(task.deadline) - now;
        if (diff > 0 && diff < 60000) {
          alert(`Reminder: "${task.text}" is due soon!`);
        }
      });
    }, 30000);
    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = () => {
    if (!text || !deadline) return;
    const newTask = {
      id: Date.now().toString(),
      text,
      deadline,
      done: false,
    };
    setTasks([...tasks, newTask]);
    setText("");
    setDeadline("");
  };

  const deleteTask = (id) =>
    setTasks(tasks.filter((task) => task.id !== id));

  const editTask = (id) => {
    const newText = prompt("Edit task:");
    if (newText)
      setTasks(tasks.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  };

  const toggleDone = (id) =>
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const isOverdue = (task) =>
    !task.done && new Date(task.deadline) < new Date();

  const visibleTasks = tasks.filter((t) => {
    if (filter === "active") return !t.done && !isOverdue(t);
    if (filter === "overdue") return isOverdue(t);
    if (filter === "done") return t.done;
    return true;
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(visibleTasks);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);

    const movedIds = new Set(items.map((t) => t.id));
    const rest = tasks.filter((t) => !movedIds.has(t.id));

    setTasks([...items, ...rest]);
  };

  const overdueCount = tasks.filter(isOverdue).length;
  const doneCount = tasks.filter((t) => t.done).length;

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <div className="container">

        {/* Dark Mode */}
        <div className="dark-toggle">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <h1>My Tasks</h1>
        <p className="subtitle">
          {tasks.length} total · {doneCount} done
          {overdueCount > 0 && ` · ${overdueCount} overdue`}
        </p>

        {/* Input */}
        <div className="input-section">
          <input
            type="text"
            placeholder="What needs to be done?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
          />
          <input
            type="datetime-local"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />
          <button className="add-btn" onClick={addTask}>
            + Add
          </button>
        </div>

        {/* Filters */}
        <div className="filters">
          {["all", "active", "overdue", "done"].map((f) => (
            <button
              key={f}
              className={filter === f ? "active" : ""}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Task List */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <ul ref={provided.innerRef} {...provided.droppableProps}>
                {visibleTasks.length === 0 && (
                  <div className="empty">
                    ✨ {filter === "done"
                      ? "Nothing completed yet."
                      : filter === "overdue"
                      ? "No overdue tasks!"
                      : "All clear! Add a task above."}
                  </div>
                )}

                {visibleTasks.map((task, index) => (
                  <Draggable key={task.id} draggableId={task.id} index={index}>
                    {(provided, snapshot) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        style={provided.draggableProps.style}
                        className={`${isOverdue(task) ? "overdue" : ""} ${task.done ? "done" : ""} ${snapshot.isDragging ? "dragging" : ""}`}
                      >
                        <span className="drag-handle" {...provided.dragHandleProps}>
                          ⠿
                        </span>

                        <button
                          className={`check-btn ${task.done ? "checked" : ""}`}
                          onClick={() => toggleDone(task.id)}
                        >
                          {task.done ? "✓" : ""}
                        </button>

                        <div className="task-content">
                          <span className="task-text">{task.text}</span>
                          <span className="task-due">
                            {isOverdue(task) ? "⚠️ " : "🕐 "}
                            {new Date(task.deadline).toLocaleString()}
                          </span>
                        </div>

                        <div className="actions">
                          <button onClick={() => editTask(task.id)}>Edit</button>
                          <button className="delete" onClick={() => deleteTask(task.id)}>
                            Delete
                          </button>
                        </div>
                      </li>
                    )}
                  </Draggable>
                ))}

                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>

      </div>
    </div>
  );
}

export default App;