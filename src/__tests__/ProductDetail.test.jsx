// ProductDetail.test.jsx
// Covers both branches of the detail price UI: plain price vs. sale (base + SALE PRICE).
// I use a tiny helper to mock only the expected GET by id.

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProductDetail from '../pages/ProductDetail'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('<ProductDetail />', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  function mockDetail(product) {
    global.fetch = vi.fn((url) => {
      if (String(url).includes(`/products/${product.id}`)) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(product),
        })
      }
      return Promise.reject(new Error('unexpected url ' + url))
    })
  }

  it('shows name and plain price when no sale', async () => {
    const prod = { id: '5', name: 'RDR2', platform: 'PC', genre: 'RPG', price: 39.99, quantity: 5 }
    mockDetail(prod)

    render(
      <MemoryRouter initialEntries={[`/products/${prod.id}`]}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: /RDR2/i })).toBeInTheDocument()
    expect(screen.getByText('$39.99')).toBeInTheDocument()
    expect(screen.queryByText(/SALE PRICE/i)).not.toBeInTheDocument()
  })

  it('shows crossed-out base + SALE PRICE when salePercent is set', async () => {
    const prod = { id: '9', name: 'Spider-Man Remastered', platform: 'PC', genre: 'Action', price: 41.99, salePercent: 0.3, quantity: 27 }
    mockDetail(prod)

    render(
      <MemoryRouter initialEntries={[`/products/${prod.id}`]}>
        <Routes>
          <Route path="/products/:id" element={<ProductDetail />} />
        </Routes>
      </MemoryRouter>
    )

    expect(await screen.findByRole('heading', { name: /Spider-Man Remastered/i })).toBeInTheDocument()
    const base = prod.price / (1 - prod.salePercent)
    expect(screen.getByText(`$${base.toFixed(2)}`, { exact: false })).toBeInTheDocument()
    expect(screen.getByText(`$${prod.price.toFixed(2)} SALE PRICE`, { exact: false })).toBeInTheDocument()
  })
})
