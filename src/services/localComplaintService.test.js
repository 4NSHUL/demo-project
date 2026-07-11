import { beforeEach, describe, expect, it } from 'vitest'
import { createLocalComplaintService } from './localComplaintService.js'

function createMemoryStorage() {
  const values = new Map()
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: (key) => values.delete(key),
    clear: () => values.clear(),
  }
}

const validValues = {
  residentName: 'Aarav Mehta',
  blockNumber: 'Block A',
  flatNumber: 'A-101',
  phoneNumber: '98765 43210',
  complaintCategory: 'Individual',
  complaintType: 'Flat Maintenance',
  createdDate: '2026-07-11',
  status: 'Open',
  estimatedResolutionDate: '2026-07-14',
  comment: 'Kitchen tap is leaking.',
}

describe('local complaint service', () => {
  let storage
  let service

  beforeEach(() => {
    storage = createMemoryStorage()
    service = createLocalComplaintService(storage)
  })

  it('seeds eight complaints on first use and returns newest activity first', async () => {
    const complaints = await service.listComplaints()

    expect(complaints).toHaveLength(8)
    expect(new Date(complaints[0].updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(complaints[1].updatedAt).getTime(),
    )
  })

  it('creates a normalized complaint and initial history entry', async () => {
    const created = await service.createComplaint(validValues)

    expect(created).toMatchObject({
      displayId: expect.stringMatching(/^CR-\d{4}-\d{4}$/),
      residentName: 'Aarav Mehta',
      status: 'Open',
      closedAt: null,
    })
    expect(created.id).toEqual(expect.any(String))
    expect(await service.listComplaintHistory(created.id)).toEqual([
      expect.objectContaining({ fromStatus: null, toStatus: 'Open' }),
    ])
  })

  it('records status changes and close or reopen timestamps', async () => {
    const created = await service.createComplaint(validValues)
    const closed = await service.updateComplaint(created.id, { status: 'Closed' })

    expect(closed.closedAt).toEqual(expect.any(String))
    expect(await service.listComplaintHistory(created.id)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ fromStatus: 'Open', toStatus: 'Closed' }),
      ]),
    )

    const reopened = await service.updateComplaint(created.id, { status: 'Open' })
    expect(reopened.closedAt).toBeNull()
  })

  it('updates the estimated date without adding status history', async () => {
    const created = await service.createComplaint(validValues)
    const historyBefore = await service.listComplaintHistory(created.id)

    const updated = await service.updateComplaint(created.id, {
      estimatedResolutionDate: '2026-07-20',
    })

    expect(updated.estimatedResolutionDate).toBe('2026-07-20')
    expect(await service.listComplaintHistory(created.id)).toHaveLength(historyBefore.length)
  })

  it('deletes a complaint and its history', async () => {
    const created = await service.createComplaint(validValues)

    await service.deleteComplaint(created.id)

    expect((await service.listComplaints()).some((item) => item.id === created.id)).toBe(false)
    expect(await service.listComplaintHistory(created.id)).toEqual([])
  })

  it('rejects updates for stale complaint IDs', async () => {
    await expect(service.updateComplaint('missing', { status: 'Closed' })).rejects.toThrow(
      'Complaint not found',
    )
  })
})
