/**
 * Phase 5 — End-to-end happy paths before deploy
 * Run: npm run test:phase5
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('Phase 5 · full flows', () => {
  it('shift upgrade path lands on Trip shifted', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /search buses/i }))
    await user.click(screen.getAllByRole('button', { name: /leaves in/i })[0])
    await user.click(screen.getByRole('button', { name: /select boarding/i }))
    await user.click(screen.getByRole('button', { name: /google pay/i }))
    await user.click(screen.getByRole('button', { name: /shift bus/i }))
    await user.click(screen.getAllByRole('button', { name: /shift here/i })[1]) // pay more KSRTC
    expect(screen.getByText(/trip shifted/i)).toBeInTheDocument()
    expect(screen.getByText(/new pnr/i)).toBeInTheDocument()
  })

  it('cancel confirm refunds and returns home', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /search buses/i }))
    await user.click(screen.getAllByRole('button', { name: /leaves in/i })[0])
    await user.click(screen.getByRole('button', { name: /select boarding/i }))
    await user.click(screen.getByRole('button', { name: /paytm/i }))
    await user.click(screen.getByRole('button', { name: /^cancel$/i }))
    expect(screen.getByText(/cancel ticket/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /confirm cancel/i }))
    expect(screen.getByRole('button', { name: /search buses/i })).toBeInTheDocument()
  })
})
