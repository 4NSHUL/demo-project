import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import App from './App.jsx'
import { ComplaintForm } from './components/register/ComplaintForm.jsx'
import { playCartoonBoing } from './utils/cartoonBoing.js'

vi.mock('./utils/cartoonBoing.js', () => ({ playCartoonBoing: vi.fn() }))

beforeEach(() => {
  localStorage.clear()
  playCartoonBoing.mockClear()
})
afterEach(cleanup)

test('renders the complaint register, dependent form, and seeded ledger', async () => {
  render(<App />)

  expect(screen.getByRole('heading', { name: 'Complaint Register' })).toBeVisible()
  expect(screen.getByText('Ignis community')).toBeVisible()
  expect(screen.queryByText('RWA/CR/2026')).not.toBeInTheDocument()
  expect(screen.getByText("We promise, we won't ghost your complaint 😉")).toBeVisible()
  expect(screen.getByLabelText(/Flat Number/)).toBeDisabled()
  expect(await screen.findByText('CR-2026-0008')).toBeVisible()
  expect(screen.getByRole('button', { name: 'Add to register' })).toBeVisible()
})

async function completeRequiredComplaintFields(user) {
  await user.type(screen.getByLabelText(/Resident Name/), 'Aarav Mehta')
  await user.selectOptions(screen.getByLabelText(/Block Number/), 'Block A')
  await user.selectOptions(screen.getByLabelText(/Flat Number/), 'A-101')
  await user.selectOptions(screen.getByLabelText(/Complaint Type/), 'Flat Maintenance')
}

test('plays a cartoon boing after a complaint saves successfully', async () => {
  const user = userEvent.setup()
  const onCreate = vi.fn().mockResolvedValue(true)
  render(<ComplaintForm onCreate={onCreate} />)
  await completeRequiredComplaintFields(user)

  await user.click(screen.getByRole('button', { name: 'Add to register' }))

  await waitFor(() => expect(onCreate).toHaveBeenCalledOnce())
  expect(playCartoonBoing).toHaveBeenCalledOnce()
})

test('does not play a sound when complaint persistence fails', async () => {
  const user = userEvent.setup()
  const onCreate = vi.fn().mockResolvedValue(false)
  render(<ComplaintForm onCreate={onCreate} />)
  await completeRequiredComplaintFields(user)

  await user.click(screen.getByRole('button', { name: 'Add to register' }))

  await waitFor(() => expect(onCreate).toHaveBeenCalledOnce())
  expect(playCartoonBoing).not.toHaveBeenCalled()
})
