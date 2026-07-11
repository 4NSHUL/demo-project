import { useCallback, useEffect, useMemo, useState } from 'react'
import { complaintService } from '../services/complaintService.js'
import { EMPTY_FILTERS } from '../data/registerConfig.js'
import { filterComplaints, getSummary } from '../utils/register.js'

export function useComplaintRegister() {
  const [complaints, setComplaints] = useState([])
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [feedback, setFeedback] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      setComplaints(await complaintService.listComplaints())
    } catch (loadError) {
      setError(loadError.message || 'Unable to load the complaint register.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const runMutation = async (operation, successMessage) => {
    try {
      await operation()
      setComplaints(await complaintService.listComplaints())
      setFeedback({ type: 'success', message: successMessage })
      return true
    } catch (mutationError) {
      setFeedback({ type: 'error', message: mutationError.message || 'The update could not be saved.' })
      return false
    }
  }

  return {
    complaints,
    visibleComplaints: useMemo(
      () => filterComplaints(complaints, filters),
      [complaints, filters],
    ),
    summary: useMemo(() => getSummary(complaints), [complaints]),
    filters,
    setFilters,
    loading,
    error,
    feedback,
    dismissFeedback: () => setFeedback(null),
    retry: load,
    createComplaint: (values) =>
      runMutation(() => complaintService.createComplaint(values), 'Complaint added to the register.'),
    updateComplaint: (id, patch) =>
      runMutation(() => complaintService.updateComplaint(id, patch), 'Register updated.'),
    deleteComplaint: (id) =>
      runMutation(() => complaintService.deleteComplaint(id), 'Complaint removed from the register.'),
  }
}
