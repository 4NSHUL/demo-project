import { ComplaintForm } from './components/register/ComplaintForm.jsx'
import { ComplaintLedger } from './components/register/ComplaintLedger.jsx'
import { storageMode } from './services/complaintService.js'
import { useComplaintRegister } from './hooks/useComplaintRegister.js'

const summaries = [
  ['total', 'Total records', 'All complaints'],
  ['open', 'Open', 'Awaiting action'],
  ['inProgress', 'In progress', 'Work underway'],
  ['resolved', 'Resolved', 'Ready to close'],
]

function App() {
  const register = useComplaintRegister()

  return (
    <main className="app-shell">
      <header className="registry-header">
        <div className="rwa-seal" aria-hidden="true"><span>RWA</span><small>EST. 2012</small></div>
        <div className="registry-title"><span className="document-label">Residents' Welfare Association · Official Record</span><h1>Complaint Register</h1><p>Community service, maintenance & resolution ledger</p></div>
        <div className="registry-meta"><strong>Ignis community</strong><span className={`mode-pill mode-${storageMode}`}>{storageMode === 'supabase' ? 'Shared community register' : 'Browser demo register'}</span></div>
      </header>

      <section className="summary-grid" aria-label="Complaint summary">
        {summaries.map(([key, label, note], index) => <article className={`summary-card summary-${key}`} key={key}><div className="summary-index">0{index + 1}</div><div><span>{label}</span><strong data-summary={key}>{register.summary[key]}</strong><small>{note}</small></div></article>)}
      </section>

      {register.feedback && <div className={`toast toast-${register.feedback.type}`} role="status"><span>{register.feedback.message}</span><button onClick={register.dismissFeedback} aria-label="Dismiss message">×</button></div>}
      <ComplaintForm onCreate={register.createComplaint} />

      {register.loading ? <section className="register-panel loading-state">Opening the community register…</section> : register.error ? <section className="register-panel error-state"><h2>Register unavailable</h2><p>{register.error}</p><button className="primary-button" onClick={register.retry}>Try again</button></section> : <ComplaintLedger complaints={register.visibleComplaints} filters={register.filters} onFilters={register.setFilters} onUpdate={register.updateComplaint} onDelete={register.deleteComplaint} hasRecords={Boolean(register.complaints.length)} />}

      <footer className="register-footer"><span>Complaint Register · Residents' Welfare Association</span><span>{storageMode === 'supabase' ? 'Shared Supabase demo storage' : 'Saved locally in this browser'}</span></footer>
    </main>
  )
}

export default App
