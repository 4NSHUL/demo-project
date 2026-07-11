import { BLOCK_FLATS, COMPLAINT_TYPES, STATUSES } from '../data/registerConfig.js'

const requiredMessages = {
  residentName: 'Resident name is required.',
  blockNumber: 'Block number is required.',
  flatNumber: 'Flat number is required.',
  complaintCategory: 'Complaint category is required.',
  complaintType: 'Complaint type is required.',
  createdDate: 'Created date is required.',
  status: 'Status is required.',
}

export function toLocalDateInput(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function createInitialForm(date = new Date()) {
  return {
    residentName: '',
    blockNumber: '',
    flatNumber: '',
    phoneNumber: '',
    complaintCategory: 'Individual',
    complaintType: '',
    createdDate: toLocalDateInput(date),
    status: 'Open',
    estimatedResolutionDate: '',
    comment: '',
  }
}

export function validateComplaint(values) {
  const errors = {}

  Object.entries(requiredMessages).forEach(([field, message]) => {
    if (!String(values?.[field] ?? '').trim()) errors[field] = message
  })

  const phone = String(values?.phoneNumber ?? '').trim()
  if (phone && !/^\+?[0-9][0-9\s-]{7,14}$/.test(phone)) {
    errors.phoneNumber = 'Enter a valid phone number.'
  }

  if (
    values?.blockNumber &&
    values?.flatNumber &&
    !BLOCK_FLATS[values.blockNumber]?.includes(values.flatNumber)
  ) {
    errors.flatNumber = 'Select a flat belonging to the chosen block.'
  }

  if (
    values?.complaintCategory &&
    values?.complaintType &&
    !COMPLAINT_TYPES[values.complaintCategory]?.includes(values.complaintType)
  ) {
    errors.complaintType = 'Select a complaint type from the chosen category.'
  }

  if (values?.status && !STATUSES.includes(values.status)) {
    errors.status = 'Select a valid complaint status.'
  }

  if (
    values?.createdDate &&
    values?.estimatedResolutionDate &&
    values.estimatedResolutionDate < values.createdDate
  ) {
    errors.estimatedResolutionDate = 'Estimated resolution cannot be before the created date.'
  }

  return errors
}

export function filterComplaints(records, filters) {
  const search = String(filters?.search ?? '').trim().toLowerCase()

  return records.filter((record) => {
    const matchesSearch =
      !search ||
      record.residentName.toLowerCase().includes(search) ||
      record.complaintType.toLowerCase().includes(search)
    const matchesBlock = !filters?.block || record.blockNumber === filters.block
    const matchesStatus = !filters?.status || record.status === filters.status
    return matchesSearch && matchesBlock && matchesStatus
  })
}

export function getSummary(records) {
  return records.reduce(
    (summary, record) => {
      summary.total += 1
      if (record.status === 'Open') summary.open += 1
      if (record.status === 'In Progress') summary.inProgress += 1
      if (record.status === 'Resolved') summary.resolved += 1
      return summary
    },
    { total: 0, open: 0, inProgress: 0, resolved: 0 },
  )
}

export function createDisplayId(records, year = new Date().getFullYear()) {
  const prefix = `CR-${year}-`
  const highest = records.reduce((current, record) => {
    if (!record.displayId?.startsWith(prefix)) return current
    const sequence = Number(record.displayId.slice(prefix.length))
    return Number.isFinite(sequence) ? Math.max(current, sequence) : current
  }, 0)

  return `${prefix}${String(highest + 1).padStart(4, '0')}`
}
