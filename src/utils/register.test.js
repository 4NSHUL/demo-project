import { describe, expect, it } from 'vitest'
import { BLOCK_FLATS, COMPLAINT_TYPES } from '../data/registerConfig.js'
import {
  createDisplayId,
  createInitialForm,
  filterComplaints,
  getSummary,
  validateComplaint,
} from './register.js'

const records = [
  {
    displayId: 'CR-2026-0001',
    residentName: 'Aarav Mehta',
    blockNumber: 'Block A',
    complaintType: 'Water Supply',
    status: 'Open',
  },
  {
    displayId: 'CR-2026-0002',
    residentName: 'Diya Rao',
    blockNumber: 'Block B',
    complaintType: 'Flat Maintenance',
    status: 'In Progress',
  },
  {
    displayId: 'CR-2026-0003',
    residentName: 'Kabir Singh',
    blockNumber: 'Block C',
    complaintType: 'Security',
    status: 'Resolved',
  },
  {
    displayId: 'CR-2026-0004',
    residentName: 'Meera Iyer',
    blockNumber: 'Block B',
    complaintType: 'Parking',
    status: 'Closed',
  },
]

describe('register configuration', () => {
  it('provides block-specific flats and the approved complaint types', () => {
    expect(BLOCK_FLATS['Block A']).toContain('A-101')
    expect(BLOCK_FLATS['Block B']).toContain('B-404')
    expect(COMPLAINT_TYPES.Individual).toContain('Flat Maintenance')
    expect(COMPLAINT_TYPES.Community).toContain('Water Supply')
  })
})

describe('createInitialForm', () => {
  it('uses local date and safe defaults', () => {
    expect(createInitialForm(new Date(2026, 6, 11, 8))).toMatchObject({
      blockNumber: '',
      flatNumber: '',
      complaintCategory: 'Individual',
      complaintType: '',
      createdDate: '2026-07-11',
      status: 'Open',
    })
  })
})

describe('validateComplaint', () => {
  it('returns errors for missing required values', () => {
    expect(validateComplaint({})).toMatchObject({
      residentName: expect.any(String),
      blockNumber: expect.any(String),
      flatNumber: expect.any(String),
      complaintCategory: expect.any(String),
      complaintType: expect.any(String),
      createdDate: expect.any(String),
      status: expect.any(String),
    })
  })

  it('rejects an estimated date before the created date', () => {
    expect(
      validateComplaint({
        residentName: 'Aarav Mehta',
        blockNumber: 'Block A',
        flatNumber: 'A-101',
        complaintCategory: 'Individual',
        complaintType: 'Flat Maintenance',
        createdDate: '2026-07-11',
        status: 'Open',
        estimatedResolutionDate: '2026-07-10',
      }),
    ).toHaveProperty('estimatedResolutionDate')
  })
})

describe('filterComplaints', () => {
  it('searches resident name and complaint type case-insensitively', () => {
    expect(filterComplaints(records, { search: 'water', block: '', status: '' })).toHaveLength(1)
    expect(filterComplaints(records, { search: 'DIYA', block: '', status: '' })).toHaveLength(1)
  })

  it('combines search, block, and status filters', () => {
    expect(
      filterComplaints(records, { search: '', block: 'Block B', status: 'Closed' }),
    ).toEqual([records[3]])
  })
})

describe('getSummary', () => {
  it('counts the requested register statuses', () => {
    expect(getSummary(records)).toEqual({ total: 4, open: 1, inProgress: 1, resolved: 1 })
  })
})

describe('createDisplayId', () => {
  it('increments the highest ID for the requested year', () => {
    expect(createDisplayId([{ displayId: 'CR-2026-0009' }], 2026)).toBe('CR-2026-0010')
  })

  it('starts at one when the year has no records', () => {
    expect(createDisplayId(records, 2027)).toBe('CR-2027-0001')
  })
})
