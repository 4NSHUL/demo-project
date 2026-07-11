import { BLOCK_FLATS, STATUSES } from '../../data/registerConfig.js'

const statusClass = (status) => status.toLowerCase().replaceAll(' ', '-')
const displayDate = (value) => value ? new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : 'Not set'

function StatusStamp({ status }) {
  return <span className={`status-stamp status-${statusClass(status)}`}><span aria-hidden="true">●</span>{status}</span>
}

export function ComplaintLedger({ complaints, filters, onFilters, onUpdate, onDelete, hasRecords }) {
  const remove = (complaint) => {
    if (window.confirm(`Delete ${complaint.displayId}? This cannot be undone.`)) onDelete(complaint.id)
  }

  return (
    <section className="register-panel ledger-panel" aria-labelledby="ledger-title">
      <div className="section-heading ledger-heading"><div><span className="section-kicker">Live ledger</span><h2 id="ledger-title">Complaint records</h2></div><span className="record-count">{complaints.length} shown</span></div>
      <div className="ledger-tools">
        <label className="search-field"><span className="sr-only">Search register</span><input type="search" value={filters.search} onChange={(e) => onFilters({ ...filters, search: e.target.value })} placeholder="Search name or complaint type…" aria-label="Search register" /></label>
        <label><span className="sr-only">Filter by block</span><select value={filters.block} onChange={(e) => onFilters({ ...filters, block: e.target.value })} aria-label="Filter by block"><option value="">All blocks</option>{Object.keys(BLOCK_FLATS).map((block) => <option key={block}>{block}</option>)}</select></label>
        <label><span className="sr-only">Filter by status</span><select value={filters.status} onChange={(e) => onFilters({ ...filters, status: e.target.value })} aria-label="Filter by status"><option value="">All statuses</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
        {(filters.search || filters.block || filters.status) && <button className="text-button" onClick={() => onFilters({ search: '', block: '', status: '' })}>Clear filters</button>}
      </div>

      {!complaints.length ? <div className="empty-state"><div className="empty-seal">0</div><h3>{hasRecords ? 'No matching records' : 'The register is empty'}</h3><p>{hasRecords ? 'Clear or adjust the filters to see more complaints.' : 'Use the form above to add the first complaint.'}</p></div> :
        <div className="ledger-list">{complaints.map((complaint) => <article className="ledger-row" key={complaint.id} data-testid="complaint-record">
          <div className="record-id"><span>{complaint.displayId}</span><small>Entered {displayDate(complaint.createdDate)}</small></div>
          <div className="resident-cell"><strong>{complaint.residentName}</strong><span>{complaint.blockNumber} · {complaint.flatNumber}</span><small>{complaint.phoneNumber || 'No phone provided'}</small></div>
          <div className="type-cell"><span className="category-tag">{complaint.complaintCategory}</span><strong>{complaint.complaintType}</strong><p>{complaint.comment || 'No additional comment'}</p></div>
          <div className="status-cell"><StatusStamp status={complaint.status} /><label><span>Status</span><select aria-label={`Status for ${complaint.displayId}`} value={complaint.status} onChange={(e) => onUpdate(complaint.id, { status: e.target.value })}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label></div>
          <div className="estimate-cell"><label><span>Estimated resolution</span><input aria-label={`Estimated resolution for ${complaint.displayId}`} type="date" min={complaint.createdDate} value={complaint.estimatedResolutionDate || ''} onChange={(e) => onUpdate(complaint.id, { estimatedResolutionDate: e.target.value })} /></label><small>{displayDate(complaint.estimatedResolutionDate)}</small></div>
          <button className="delete-button" aria-label={`Delete ${complaint.displayId}`} onClick={() => remove(complaint)} title="Delete complaint">×</button>
        </article>)}</div>}
    </section>
  )
}
