// src/__tests__/NewProduct.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import NewProduct from '../pages/NewProduct'

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  return {
    ...actual,
    useNavigate: () => vi.fn(), // we just need it not to blow up
  }
})

describe('<NewProduct />', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ id: '99' }) })
    )
  })

  it('submits minimal valid form and POSTs correct payload', async () => {
    render(
      <MemoryRouter initialEntries={['/admin/new']}>
        <Routes>
          <Route path="/admin/new" element={<NewProduct />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.change(screen.getByLabelText(/Game Name/i), { target: { value: 'Test Game' } })
    fireEvent.change(screen.getByLabelText(/^Genre\*/i), { target: { value: 'Sports' } })
    fireEvent.change(screen.getByLabelText(/Price \(USD\)\*/i), { target: { value: '19.99' } })
    fireEvent.click(screen.getByRole('button', { name: /save game/i }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'http://localhost:4000/products',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringMatching(/"name":"Test Game"/),
        })
      )
    })
  })
})
