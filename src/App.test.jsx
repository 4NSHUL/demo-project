import { render, screen } from '@testing-library/react'
import { beforeEach, expect, test } from 'vitest'
import App from './App.jsx'

beforeEach(() => localStorage.clear())

test('renders the complaint register, dependent form, and seeded ledger', async () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'Complaint Register' })).toBeVisible()
  expect(screen.getByLabelText(/Flat Number/)).toBeDisabled()
  expect(await screen.findByText('CR-2026-0008')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Add to register' })).toBeVisible()
})
