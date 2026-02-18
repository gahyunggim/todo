import { useEffect, useMemo, useState } from 'react';

const COLUMNS = [
  { key: 'todo', label: '앞으로 해야 할 일' },
  { key: 'inProgress', label: '현재 진행 중인 일' },
  { key: 'done', label: '완료한 일' },
];

const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001';

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [draggingTaskId, setDraggingTaskId] = useState(null);
  const [activeDropColumn, setActiveDropColumn] = useState(null);

  const loadTasks = async () => {
    const response = await fetch(`${API_BASE}/api/tasks`);
    const data = await response.json();
    setTasks(data);
  };

  useEffect(() => {
    loadTasks();
  }, []);

  const grouped = useMemo(() => {
    return COLUMNS.reduce((acc, column) => {
      acc[column.key] = tasks.filter((task) => task.status === column.key);
      return acc;
    }, {});
  }, [tasks]);

  const addTask = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    const response = await fetch(`${API_BASE}/api/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: title.trim(), status: 'todo' }),
    });

    if (response.ok) {
      setTitle('');
      await loadTasks();
    }
  };

  const moveTask = async (taskId, nextStatus) => {
    await fetch(`${API_BASE}/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    });

    await loadTasks();
  };

  const handleDragStart = (event, taskId) => {
    event.dataTransfer.setData('text/plain', String(taskId));
    event.dataTransfer.effectAllowed = 'move';
    setDraggingTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingTaskId(null);
    setActiveDropColumn(null);
  };

  const handleDrop = async (event, columnKey) => {
    event.preventDefault();
    const dataTransferTaskId = Number(event.dataTransfer.getData('text/plain'));
    const taskId = Number.isNaN(dataTransferTaskId) ? draggingTaskId : dataTransferTaskId;
    const currentTask = tasks.find((task) => task.id === taskId);

    setActiveDropColumn(null);

    if (!currentTask || currentTask.status === columnKey) {
      return;
    }

    await moveTask(taskId, columnKey);
  };

  return (
    <main className="container">
      <header className="page-header">
        <h1>투두 칸반 보드</h1>
        <p>카드를 드래그해서 진행 상태를 직관적으로 바꿔보세요.</p>
      </header>

      <form className="task-form" onSubmit={addTask}>
        <input
          aria-label="새 작업"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="새로운 할 일을 입력하세요"
        />
        <button type="submit">작업 추가</button>
      </form>

      <section className="board">
        {COLUMNS.map((column) => (
          <article
            className={`column ${activeDropColumn === column.key ? 'column--active' : ''}`}
            key={column.key}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              if (activeDropColumn !== column.key) {
                setActiveDropColumn(column.key);
              }
            }}
            onDragLeave={() => {
              if (activeDropColumn === column.key) {
                setActiveDropColumn(null);
              }
            }}
            onDrop={(event) => handleDrop(event, column.key)}
          >
            <div className="column-header">
              <h2>{column.label}</h2>
              <span>{grouped[column.key]?.length ?? 0}</span>
            </div>
            <ul>
              {grouped[column.key]?.map((task) => (
                <li
                  key={task.id}
                  className={`task-card ${draggingTaskId === task.id ? 'task-card--dragging' : ''}`}
                  draggable
                  onDragStart={(event) => handleDragStart(event, task.id)}
                  onDragEnd={handleDragEnd}
                >
                  <p>{task.title}</p>
                  <small>드래그해서 다른 칸으로 이동</small>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </main>
  );
};

export default App;
