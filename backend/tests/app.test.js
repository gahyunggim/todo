import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp, STATUSES } from '../src/app.js';

describe('Todo API', () => {
  it('목록을 반환한다', async () => {
    const app = createApp();
    const response = await request(app).get('/api/tasks');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it('새 작업을 생성한다', async () => {
    const app = createApp();
    const response = await request(app)
      .post('/api/tasks')
      .send({ title: '테스트 작성', status: STATUSES.TODO });

    expect(response.status).toBe(201);
    expect(response.body.title).toBe('테스트 작성');
    expect(response.body.status).toBe(STATUSES.TODO);
  });

  it('상태를 변경한다', async () => {
    const app = createApp();
    const created = await request(app)
      .post('/api/tasks')
      .send({ title: '상태 변경 테스트' });

    const updated = await request(app)
      .patch(`/api/tasks/${created.body.id}`)
      .send({ status: STATUSES.DONE });

    expect(updated.status).toBe(200);
    expect(updated.body.status).toBe(STATUSES.DONE);
  });
});
