/**
 * Phase 4 — UI polish / both CTAs visible
 * Run: npm run test:phase4
 */
import { describe, expect, it } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

async function bookFirstBus() {
  const user = userEvent.setup()
  const { container } = render(<App />)
  await user.click(screen.getByRole('button', { name: /search buses/i }))
  const cards = screen.getAllByRole('button', { name: /leaves in/i })
  await user.click(cards[0])
  await user.click(screen.getByRole('button', { name: /select boarding/i }))
  await user.click(screen.getByRole('button', { name: /phonepe/i }))
  return { user, container }
}

describe('Phase 4 · thank-you shows Shift AND Cancel buttons', () => {
  it('renders SHIFT BUS and CANCEL as buttons after booking', async () => {
    await bookFirstBus()
    expect(screen.getByRole('button', { name: /shift bus/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^cancel$/i })).toBeInTheDocument()
    expect(screen.getByText(/booking confirmed/i)).toBeInTheDocument()
  })

  it('shift board keeps CANCEL TICKET · GET REFUND visible', async () => {
    const { user } = await bookFirstBus()
    await user.click(screen.getByRole('button', { name: /shift bus/i }))
    expect(screen.getByRole('button', { name: /cancel ticket/i })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /shift here/i }).length).toBeGreaterThan(0)
  })
})

describe('Phase 4 · shift fare labels on board', () => {
  it('shows pay more / back / same fare paths', async () => {
    const { user } = await bookFirstBus()
    await user.click(screen.getByRole('button', { name: /shift bus/i }))
    const heading = screen.getByText(/shift your trip/i)
    const board = heading.closest('.screen') as HTMLElement
    expect(within(board).getByText(/₹30 back to you/i)).toBeInTheDocument()
    expect(within(board).getByText(/pay ₹39 more/i)).toBeInTheDocument()
    expect(within(board).getByText(/same fare/i)).toBeInTheDocument()
  })
})
