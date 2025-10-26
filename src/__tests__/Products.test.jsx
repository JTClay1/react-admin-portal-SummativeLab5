// Products.test.jsx
// Verifies the list UI renders normal and sale pricing correctly.
// I scope queries to each card to avoid false positives across the grid.

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Products from '../pages/Products'

const URL = 'http://localhost:4000/products'

describe('<Products />', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    // Force two rows: one full price, one discounted with salePercent.
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            { id: 1, name: 'Forza Horizon 5', genre: 'Racing', platform: 'PC', price: 59.99, quantity: 10 },
            // sale item: price already discounted; salePercent tells UI to show crossed-out base
            { id: 12, name: 'EA Sports FC 26', genre: 'Sports', platform: 'PC', price: 47.99, salePercent: 0.2, quantity: 7 },
          ]),
      })
    )
  })

  it('renders titles and prices, including SALE display', async () => {
    render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>
    )

    // Forza card (no sale) — scope to its article and assert plain price
    const forzaHeading = await screen.findByRole('heading', { name: /Forza Horizon 5/i })
    const forzaCard = forzaHeading.closest('article')
    expect(forzaCard).toBeInTheDocument()
    expect(within(forzaCard).getByText('$59.99')).toBeInTheDocument()

    // FC26 card (sale) — scope to its article and assert crossed-out + sale price label
    const saleHeading = screen.getByRole('heading', { name: /EA Sports FC 26/i })
    const saleCard = saleHeading.closest('article')
    expect(saleCard).toBeInTheDocument()

    // crossed-out original (computed by component) and visible SALE PRICE current
    expect(within(saleCard).getByText('$59.99')).toBeInTheDocument() // crossed-out span
    expect(within(saleCard).getByText(/\$47\.99\s+SALE PRICE/i)).toBeInTheDocument()
  })
})
