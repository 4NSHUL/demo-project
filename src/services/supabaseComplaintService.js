import { createDisplayId } from '../utils/register.js'

function mapComplaint(record) {
  return {
    id: record.id,
    displayId: record.display_id,
    residentName: record.resident_name,
    blockNumber: record.block_number,
    flatNumber: record.flat_number,
    phoneNumber: record.phone_number ?? '',
    complaintCategory: record.complaint_category,
    complaintType: record.complaint_type,
    createdDate: record.created_date,
    status: record.status,
    estimatedResolutionDate: record.estimated_resolution_date ?? '',
    comment: record.comment ?? '',
    closedAt: record.closed_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

function mapHistory(record) {
  return {
    id: record.id,
    complaintId: record.complaint_id,
    fromStatus: record.from_status,
    toStatus: record.to_status,
    note: record.note ?? '',
    createdAt: record.created_at,
  }
}

function toDatabasePatch(values) {
  const mapping = {
    displayId: 'display_id',
    residentName: 'resident_name',
    blockNumber: 'block_number',
    flatNumber: 'flat_number',
    phoneNumber: 'phone_number',
    complaintCategory: 'complaint_category',
    complaintType: 'complaint_type',
    createdDate: 'created_date',
    status: 'status',
    estimatedResolutionDate: 'estimated_resolution_date',
    comment: 'comment',
    closedAt: 'closed_at',
  }

  return Object.fromEntries(
    Object.entries(values)
      .filter(([key]) => mapping[key])
      .map(([key, value]) => [mapping[key], value === '' ? null : value]),
  )
}

export function createSupabaseComplaintService({ url, anonKey, fetcher = fetch }) {
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
  }

  async function request(path, options = {}) {
    const response = await fetcher(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    })
    if (!response.ok) throw new Error(`Complaint register request failed (${response.status}).`)
    if (response.status === 204) return []
    return response.json()
  }

  async function listComplaints() {
    const records = await request('complaints?select=*&order=updated_at.desc')
    return records.map(mapComplaint)
  }

  return {
    listComplaints,

    async createComplaint(values) {
      const complaints = await listComplaints()
      const year = Number(values.createdDate.slice(0, 4)) || new Date().getFullYear()
      const timestamp = new Date().toISOString()
      const payload = toDatabasePatch({
        ...values,
        displayId: createDisplayId(complaints, year),
        closedAt: values.status === 'Closed' ? timestamp : null,
      })
      const [record] = await request('complaints', {
        method: 'POST',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(payload),
      })
      await request('complaint_status_history', {
        method: 'POST',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({
          complaint_id: record.id,
          from_status: null,
          to_status: record.status,
          note: 'Complaint entered in the community register.',
        }),
      })
      return mapComplaint(record)
    },

    async updateComplaint(id, patch) {
      const currentRecords = await request(`complaints?id=eq.${encodeURIComponent(id)}&select=*`)
      const current = currentRecords[0]
      if (!current) throw new Error('Complaint not found')

      const timestamp = new Date().toISOString()
      const databasePatch = toDatabasePatch({
        ...patch,
        ...(patch.status === 'Closed'
          ? { closedAt: timestamp }
          : patch.status && current.status === 'Closed'
            ? { closedAt: null }
            : {}),
      })
      const [updated] = await request(`complaints?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=representation' },
        body: JSON.stringify(databasePatch),
      })

      if (patch.status && patch.status !== current.status) {
        await request('complaint_status_history', {
          method: 'POST',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({
            complaint_id: id,
            from_status: current.status,
            to_status: patch.status,
            note: updated.comment ?? '',
          }),
        })
      }

      return mapComplaint(updated)
    },

    async deleteComplaint(id) {
      await request(`complaints?id=eq.${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { Prefer: 'return=minimal' },
      })
    },

    async listComplaintHistory(complaintId) {
      const records = await request(
        `complaint_status_history?complaint_id=eq.${encodeURIComponent(complaintId)}&select=*&order=created_at.asc`,
      )
      return records.map(mapHistory)
    },
  }
}
