// useFetch.test.js
// Tests the happy path (initial load + refetch) and an error case.
// I stub global.fetch so these tests don't rely on a real server.

import { renderHook, act } from '@testing-library/react'
import useFetch from '../hooks/useFetch'
import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('useFetch', () => {
  const URL = 'http://localhost:4000/products'

  beforeEach(() => {
    vi.resetAllMocks()
    // default: resolve with one product
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([{ id: 1, name: 'Forza Horizon 5' }]),
      })
    )
  })

  it('loads data on mount and exposes helpers', async () => {
    const { result } = renderHook(() => useFetch(URL))

    // Initially loading and no error
    expect(result.current.loading).toBe(true)
    expect(result.current.error).toBeNull()

    // Let the effect finish
    await act(async () => {})
    expect(global.fetch).toHaveBeenCalledWith(URL)
    expect(result.current.loading).toBe(false)
    expect(result.current.data).toEqual([{ id: 1, name: 'Forza Horizon 5' }])

    // Manual refetch should call fetch again
    await act(async () => {
      await result.current.refetch()
    })
    expect(global.fetch).toHaveBeenCalledTimes(2)
  })

  it('surfaces fetch errors', async () => {
    // Simulate HTTP 500; the hook should capture & expose the error message
    global.fetch = vi.fn(() => Promise.resolve({ ok: false, status: 500 }))
    const { result } = renderHook(() => useFetch(URL))
    await act(async () => {})
    expect(result.current.error).toContain('HTTP')
    expect(result.current.loading).toBe(false)
  })
})
