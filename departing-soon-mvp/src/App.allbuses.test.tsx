/**
 * All buses tab + weighted Shift promise
 */
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('All buses mode', () => {
  it('shows later departures when All buses is selected', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /search buses/i }))
    await user.click(screen.getByRole('tab', { name: /all buses/i }))
    expect(screen.getByText(/orange travels/i)).toBeInTheDocument()
    expect(screen.getAllByText(/standard cancel/i).length).toBeGreaterThan(0)
    expect(screen.queryByText(/how to read this list/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/red border = departing soon/i)).not.toBeInTheDocument()
    expect(screen.getByText(/departs 21:00/i)).toBeInTheDocument()
    expect(document.querySelectorAll('.card.ds').length).toBeGreaterThan(0)
    expect(document.querySelectorAll('.card.regular').length).toBeGreaterThan(0)
  })

  it('returns to Departing Soon board on tab click', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /search buses/i }))
    await user.click(screen.getByRole('tab', { name: /all buses/i }))
    await user.click(screen.getByRole('tab', { name: /departing soon/i }))
    expect(screen.getByText(/next 4 hours/i)).toBeInTheDocument()
    expect(screen.queryByText(/departs 21:00/i)).not.toBeInTheDocument()
  })
})

describe('Seat Shift promise weight', () => {
  it('shows high-weight free shift callout on Departing Soon seat screen', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /search buses/i }))
    await user.click(screen.getAllByRole('button', { name: /leaves in/i })[0])
    expect(screen.getByText(/free shift if plans slip/i)).toBeInTheDocument()
    expect(screen.getByText(/change free till/i)).toBeInTheDocument()
  })
})
