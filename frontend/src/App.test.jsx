import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('칸반 컬럼을 렌더링한다', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => [],
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('앞으로 해야 할 일')).toBeInTheDocument();
      expect(screen.getByText('현재 진행 중인 일')).toBeInTheDocument();
      expect(screen.getByText('완료한 일')).toBeInTheDocument();
    });
  });

  it('작업을 추가한다', async () => {
    const fetchMock = vi
      .spyOn(global, 'fetch')
      .mockResolvedValueOnce({ ok: true, json: async () => [] })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 3, title: '새 작업', status: 'todo' }) })
      .mockResolvedValueOnce({ ok: true, json: async () => [{ id: 3, title: '새 작업', status: 'todo' }] });

    render(<App />);
    fireEvent.change(screen.getByLabelText('새 작업'), { target: { value: '새 작업' } });
    fireEvent.click(screen.getByRole('button', { name: '작업 추가' }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/api/tasks'), expect.objectContaining({ method: 'POST' }));
    });
  });
});
