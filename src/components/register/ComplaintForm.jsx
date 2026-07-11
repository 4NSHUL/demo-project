import { useState } from 'react'
import { BLOCK_FLATS, COMPLAINT_TYPES, STATUSES } from '../../data/registerConfig.js'
import { createInitialForm, validateComplaint } from '../../utils/register.js'

function FieldError({ id, message }) {
  return message ? <span id={id} className="field-error">{message}</span> : null
}

export function ComplaintForm({ onCreate }) {
  const [values, setValues] = useState(() => createInitialForm())
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const update = (field, value) => {
    setValues((current) => ({
      ...current,
      [field]: value,
      ...(field === 'blockNumber' ? { flatNumber: '' } : {}),
      ...(field === 'complaintCategory' ? { complaintType: '' } : {}),
    }))
    setErrors((current) => ({ ...current, [field]: '', ...(field === 'blockNumber' ? { flatNumber: '' } : {}) }))
  }

  const submit = async (event) => {
    event.preventDefault()
    const nextErrors = validateComplaint(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    setSaving(true)
    const saved = await onCreate(values)
    setSaving(false)
    if (saved) setValues(createInitialForm())
  }

  return (
    <section className="register-panel form-panel" aria-labelledby="new-entry-title">
      <div className="section-heading">
        <div><span className="section-kicker">Form CR–01</span><h2 id="new-entry-title">New complaint entry</h2></div>
        <span className="required-note">* Required fields</span>
      </div>
      <form className="complaint-form" onSubmit={submit} noValidate>
        <label className="field"><span>Resident Name *</span><input value={values.residentName} onChange={(e) => update('residentName', e.target.value)} aria-invalid={Boolean(errors.residentName)} aria-describedby="resident-error" placeholder="Full name" /><FieldError id="resident-error" message={errors.residentName} /></label>
        <label className="field"><span>Block Number *</span><select value={values.blockNumber} onChange={(e) => update('blockNumber', e.target.value)} aria-invalid={Boolean(errors.blockNumber)}><option value="">Select block</option>{Object.keys(BLOCK_FLATS).map((block) => <option key={block}>{block}</option>)}</select><FieldError message={errors.blockNumber} /></label>
        <label className="field"><span>Flat Number *</span><select value={values.flatNumber} onChange={(e) => update('flatNumber', e.target.value)} disabled={!values.blockNumber} aria-invalid={Boolean(errors.flatNumber)}><option value="">{values.blockNumber ? 'Select flat' : 'Select block first'}</option>{(BLOCK_FLATS[values.blockNumber] || []).map((flat) => <option key={flat}>{flat}</option>)}</select><FieldError message={errors.flatNumber} /></label>
        <label className="field"><span>Phone Number</span><input type="tel" value={values.phoneNumber} onChange={(e) => update('phoneNumber', e.target.value)} placeholder="e.g. 98765 43210" /><FieldError message={errors.phoneNumber} /></label>

        <fieldset className="field category-field"><legend>Complaint Category *</legend><div className="segment-control">{Object.keys(COMPLAINT_TYPES).map((category) => <label key={category}><input type="radio" name="category" value={category} checked={values.complaintCategory === category} onChange={(e) => update('complaintCategory', e.target.value)} /><span>{category}</span></label>)}</div></fieldset>
        <label className="field"><span>Complaint Type *</span><select value={values.complaintType} onChange={(e) => update('complaintType', e.target.value)}><option value="">Select type</option>{COMPLAINT_TYPES[values.complaintCategory].map((type) => <option key={type}>{type}</option>)}</select><FieldError message={errors.complaintType} /></label>
        <label className="field"><span>Created Date *</span><input type="date" value={values.createdDate} onChange={(e) => update('createdDate', e.target.value)} /><FieldError message={errors.createdDate} /></label>
        <label className="field"><span>Status *</span><select value={values.status} onChange={(e) => update('status', e.target.value)}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></label>
        <label className="field"><span>Estimated Resolution Date</span><input type="date" min={values.createdDate} value={values.estimatedResolutionDate} onChange={(e) => update('estimatedResolutionDate', e.target.value)} /><FieldError message={errors.estimatedResolutionDate} /></label>
        <label className="field comment-field"><span>Comment</span><textarea rows="3" value={values.comment} onChange={(e) => update('comment', e.target.value)} placeholder="Describe the issue or add an administrative note" /></label>
        <div className="form-actions"><span>Entries are saved to the shared register.</span><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Add to register'}</button></div>
      </form>
    </section>
  )
}
