import { SEED_COMPLAINTS, SEED_HISTORY } from '../data/seedComplaints.js'
import { createDisplayId } from '../utils/register.js'

const COMPLAINTS_KEY = 'rwa-complaint-register:v1:complaints'
const HISTORY_KEY = 'rwa-complaint-register:v1:history'

const clone = (value) => JSON.parse(JSON.stringify(value))

const makeId = () =>
  globalThis.crypto?.randomUUID?.() ??
  `demo-${Date.now()}-${Math.random().toString(16).slice(2)}`

function read(storage, key, fallback) {
  const saved = storage.getItem(key)
  if (saved) return JSON.parse(saved)
  const initial = clone(fallback)
  storage.setItem(key, JSON.stringify(initial))
  return initial
}

function write(storage, key, value) {
  storage.setItem(key, JSON.stringify(value))
}

function normalizeInput(values) {
  return {
    residentName: values.residentName.trim(),
    blockNumber: values.blockNumber,
    flatNumber: values.flatNumber,
    phoneNumber: values.phoneNumber?.trim() ?? '',
    complaintCategory: values.complaintCategory,
    complaintType: values.complaintType,
    createdDate: values.createdDate,
    status: values.status,
    estimatedResolutionDate: values.estimatedResolutionDate || '',
    comment: values.comment?.trim() ?? '',
  }
}

export function createLocalComplaintService(storage) {
  const getComplaints = () => read(storage, COMPLAINTS_KEY, SEED_COMPLAINTS)
  const getHistory = () => read(storage, HISTORY_KEY, SEED_HISTORY)

  return {
    async listComplaints() {
      return getComplaints().sort(
        (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
      )
    },

    async createComplaint(values) {
      const complaints = getComplaints()
      const history = getHistory()
      const timestamp = new Date().toISOString()
      const createdYear = Number(values.createdDate?.slice(0, 4)) || new Date().getFullYear()
      const complaint = {
        id: makeId(),
        displayId: createDisplayId(complaints, createdYear),
        ...normalizeInput(values),
        closedAt: values.status === 'Closed' ? timestamp : null,
        createdAt: timestamp,
        updatedAt: timestamp,
      }
      const historyEntry = {
        id: makeId(),
        complaintId: complaint.id,
        fromStatus: null,
        toStatus: complaint.status,
        note: 'Complaint entered in the community register.',
        createdAt: timestamp,
      }

      write(storage, COMPLAINTS_KEY, [...complaints, complaint])
      write(storage, HISTORY_KEY, [...history, historyEntry])
      return clone(complaint)
    },

    async updateComplaint(id, patch) {
      const complaints = getComplaints()
      const index = complaints.findIndex((complaint) => complaint.id === id)
      if (index === -1) throw new Error('Complaint not found')

      const previous = complaints[index]
      const timestamp = new Date().toISOString()
      const statusChanged = patch.status && patch.status !== previous.status
      const updated = {
        ...previous,
        ...patch,
        closedAt:
          patch.status === 'Closed'
            ? timestamp
            : patch.status && previous.status === 'Closed'
              ? null
              : previous.closedAt,
        updatedAt: timestamp,
      }
      complaints[index] = updated
      write(storage, COMPLAINTS_KEY, complaints)

      if (statusChanged) {
        const history = getHistory()
        history.push({
          id: makeId(),
          complaintId: id,
          fromStatus: previous.status,
          toStatus: updated.status,
          note: updated.comment || '',
          createdAt: timestamp,
        })
        write(storage, HISTORY_KEY, history)
      }

      return clone(updated)
    },

    async deleteComplaint(id) {
      const complaints = getComplaints()
      if (!complaints.some((complaint) => complaint.id === id)) {
        throw new Error('Complaint not found')
      }
      write(
        storage,
        COMPLAINTS_KEY,
        complaints.filter((complaint) => complaint.id !== id),
      )
      write(
        storage,
        HISTORY_KEY,
        getHistory().filter((entry) => entry.complaintId !== id),
      )
    },

    async listComplaintHistory(complaintId) {
      return getHistory()
        .filter((entry) => entry.complaintId === complaintId)
        .sort(
          (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
        )
    },
  }
}
