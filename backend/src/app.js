import express from 'express';
import cors from 'cors';

export const STATUSES = {
  TODO: 'todo',
  IN_PROGRESS: 'inProgress',
  DONE: 'done',
};

export const createApp = () => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  let nextId = 1;
  const tasks = [
    { id: nextId++, title: '요구사항 정리', status: STATUSES.TODO },
    { id: nextId++, title: '칸반 UI 구현', status: STATUSES.IN_PROGRESS },
  ];

  app.get('/api/tasks', (_req, res) => {
    res.json(tasks);
  });

  app.post('/api/tasks', (req, res) => {
    const { title, status = STATUSES.TODO } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'title은 필수 문자열입니다.' });
    }

    if (!Object.values(STATUSES).includes(status)) {
      return res.status(400).json({ message: '유효하지 않은 status입니다.' });
    }

    const task = { id: nextId++, title: title.trim(), status };
    tasks.push(task);
    return res.status(201).json(task);
  });

  app.patch('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!Object.values(STATUSES).includes(status)) {
      return res.status(400).json({ message: '유효하지 않은 status입니다.' });
    }

    const task = tasks.find((item) => item.id === id);
    if (!task) {
      return res.status(404).json({ message: '작업을 찾을 수 없습니다.' });
    }

    task.status = status;
    return res.json(task);
  });

  return app;
};
