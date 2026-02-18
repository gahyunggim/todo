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

  return (
    <main className="container">
      <h1>투두 칸반 보드</h1>

      <form className="task-form" onSubmit={addTask}>
        <input
          aria-label="새 작업"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="새로운 할 일을 입력하세요"
        />
        <button type="submit">추가</button>
      </form>

      <section className="board">
        {COLUMNS.map((column, index) => (
          <article className="column" key={column.key}>
            <h2>{column.label}</h2>
            <ul>
              {grouped[column.key]?.map((task) => (
                <li key={task.id} className="task-card">
                  <p>{task.title}</p>
                  <div className="actions">
                    {index > 0 && (
                      <button onClick={() => moveTask(task.id, COLUMNS[index - 1].key)}>
                        ← 이전
                      </button>
                    )}
                    {index < COLUMNS.length - 1 && (
                      <button onClick={() => moveTask(task.id, COLUMNS[index + 1].key)}>
                        다음 →
                      </button>
                    )}
                  </div>
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
