import { describe, expect, it, vi } from 'vitest'
import { createSupabaseComplaintService } from './supabaseComplaintService.js'

const response = (body, ok = true, status = 200) => ({
  ok,
  status,
  json: vi.fn().mockResolvedValue(body),
})

const databaseComplaint = {
  id: 'record-1',
  display_id: 'CR-2026-0001',
  resident_name: 'Aarav Mehta',
  block_number: 'Block A',
  flat_number: 'A-101',
  phone_number: '9876543210',
  complaint_category: 'Individual',
  complaint_type: 'Flat Maintenance',
  created_date: '2026-07-11',
  status: 'Open',
  estimated_resolution_date: '2026-07-14',
  comment: 'Kitchen tap is leaking.',
  closed_at: null,
  created_at: '2026-07-11T08:00:00.000Z',
  updated_at: '2026-07-11T08:00:00.000Z',
}

describe('Supabase complaint service', () => {
  it('maps database complaint fields into the UI contract', async () => {
    const fetcher = vi.fn().mockResolvedValue(response([databaseComplaint]))
    const service = createSupabaseComplaintService({
      url: 'https://demo.supabase.co',
      anonKey: 'demo-key',
      fetcher,
    })

    await expect(service.listComplaints()).resolves.toEqual([
      expect.objectContaining({
        displayId: 'CR-2026-0001',
        residentName: 'Aarav Mehta',
        estimatedResolutionDate: '2026-07-14',
      }),
    ])
    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining('/rest/v1/complaints?select=*'),
      expect.objectContaining({
        headers: expect.objectContaining({ apikey: 'demo-key' }),
      }),
    )
  })

  it('writes status history after changing a complaint status', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response([databaseComplaint]))
      .mockResolvedValueOnce(response([{ ...databaseComplaint, status: 'Closed' }]))
      .mockResolvedValueOnce(response([]))
    const service = createSupabaseComplaintService({
      url: 'https://demo.supabase.co',
      anonKey: 'demo-key',
      fetcher,
    })

    const updated = await service.updateComplaint('record-1', { status: 'Closed' })

    expect(updated.status).toBe('Closed')
    expect(fetcher).toHaveBeenCalledTimes(3)
    expect(fetcher.mock.calls[2][0]).toContain('/rest/v1/complaint_status_history')
    expect(JSON.parse(fetcher.mock.calls[2][1].body)).toMatchObject({
      complaint_id: 'record-1',
      from_status: 'Open',
      to_status: 'Closed',
    })
  })

  it('surfaces failed Supabase responses with the status code', async () => {
    const fetcher = vi.fn().mockResolvedValue(response({}, false, 503))
    const service = createSupabaseComplaintService({
      url: 'https://demo.supabase.co',
      anonKey: 'demo-key',
      fetcher,
    })

    await expect(service.listComplaints()).rejects.toThrow('503')
  })
})
