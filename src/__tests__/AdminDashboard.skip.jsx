// Verifies the sale toggle sends the correct PATCH payload (20% -> price 40, salePercent 0.2)
// Zero reliance on global lifecycles; all setup is inside the test.

import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { test, expect, vi } from 'vitest'
import AdminDashboard from '../pages/AdminDashboard'

console.log('[AdminDashboard.test] file loaded');

test('applies 20% sale and PATCHes { price: 40, salePercent: 0.2 }', async () => {
  console.log('[AdminDashboard.test] test started');

  // Full setup INSIDE the test so there’s no dependency on beforeEach/globals
  vi.resetAllMocks()

  // Prevent dialogs from blocking the test run
  vi.spyOn(window, 'confirm').mockReturnValue(true)
  vi.spyOn(window, 'alert').mockImplementation(() => {})

  // Mock initial GET and subsequent PATCH exactly like the component calls them
  global.fetch = vi.fn((url, opts) => {
    // Log calls to see activity if something stalls
    // console.log('[fetch]', url, opts?.method)

    // Initial GET via useFetch (no opts)
    if (!opts) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 1, name: 'Forza Horizon 5', genre: 'Racing', price: 50, quantity: 5 },
          ]),
      })
    }
    // Sale toggle PATCH
    if (opts?.method === 'PATCH') {
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) })
    }
    return Promise.reject(new Error(`Unexpected fetch: ${url}`))
  })

  // Render admin page
  render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </MemoryRouter>
  )

  // Wait for the row (confirms GET finished)
  const nameCell = await screen.findByText(/Forza Horizon 5/i)
  expect(nameCell).toBeTruthy()
  const row = nameCell.closest('tr')
  expect(row).toBeTruthy()

  // Scope to this row, click the first checkbox (20%)
  const rowUtils = within(row)
  const checkboxes = rowUtils.getAllByRole('checkbox')
  expect(checkboxes.length).toBeGreaterThan(0)

  fireEvent.click(checkboxes[0])

  // Assert PATCH payload (20% off 50 = 40)
  await waitFor(() => {
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:4000/products/1',
      expect.objectContaining({
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: 40, salePercent: 0.2 }),
      })
    )
  })

  console.log('[AdminDashboard.test] assertions done')
})
