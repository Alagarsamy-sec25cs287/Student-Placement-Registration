import { useEffect, useState } from 'react'
import './App.css'

const companies = [
  { name: 'TCS', category: 'Technology', initials: 'T', tone: 'blue' },
  { name: 'Infosys', category: 'Technology', initials: 'I', tone: 'cyan' },
  { name: 'Wipro', category: 'Technology', initials: 'W', tone: 'violet' },
  { name: 'Accenture', category: 'Consulting', initials: 'A', tone: 'plum' },
  { name: 'Cognizant', category: 'Technology', initials: 'C', tone: 'green' },
  { name: 'Capgemini', category: 'Consulting', initials: 'C', tone: 'sky' },
  { name: 'IBM', category: 'Technology', initials: 'I', tone: 'navy' },
  { name: 'HCLTech', category: 'Technology', initials: 'H', tone: 'orange' },
  { name: 'Microsoft', category: 'Technology', initials: 'M', tone: 'red' },
  { name: 'Amazon', category: 'Technology', initials: 'a', tone: 'gold' },
]

const emptyStudent = {
  name: '',
  studentId: '',
  department: '',
  year: '',
  section: '',
  bloodGroup: '',
  phone: '',
  fatherName: '',
  motherName: '',
  email: '',
  arrears: '',
}

function App() {
  const [view, setView] = useState('student')
  const [students, setStudents] = useState([])
  const [student, setStudent] = useState(emptyStudent)
  const [step, setStep] = useState(1)
  const [selectedCompanies, setSelectedCompanies] = useState([])
  const [activeCompany, setActiveCompany] = useState('All companies')
  const [notice, setNotice] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let isMounted = true

    const loadRegistrations = async () => {
      try {
        const response = await fetch('/api/registrations')
        const result = await response.json()
        if (!response.ok) throw new Error(result.message || 'Unable to load registrations.')
        if (isMounted) setStudents(result.registrations)
      } catch (error) {
        if (isMounted) setNotice(error.message || 'Unable to connect to the registration server.')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadRegistrations()
    return () => { isMounted = false }
  }, [])

  const updateStudent = (event) => {
    const { name, value } = event.target
    setStudent((current) => ({ ...current, [name]: value }))
  }

  const continueRegistration = (event) => {
    event.preventDefault()
    if (Number(student.arrears) === 0) {
      setStep(2)
      setNotice('')
      return
    }
    saveRegistration([]).then((saved) => {
      if (saved) setNotice('Registration saved. Students with standing arrears are not eligible for company preferences.')
    })
  }

  const saveRegistration = async (preferences) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...student, arrears: Number(student.arrears), companies: preferences }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Unable to save registration.')

      const registration = result.registration
      setStudents((current) => [registration, ...current.filter((item) => item.studentId !== registration.studentId)])
      setStudent(emptyStudent)
      setSelectedCompanies([])
      setStep(1)
      setNotice('')
      return true
    } catch (error) {
      setNotice(error.message || 'Unable to connect to the registration server.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCompany = (companyName) => {
    setSelectedCompanies((current) => {
      if (current.includes(companyName)) return current.filter((name) => name !== companyName)
      if (current.length === 4) return current
      return [...current, companyName]
    })
  }

  const submitPreferences = (event) => {
    event.preventDefault()
    if (selectedCompanies.length !== 4) return
    saveRegistration(selectedCompanies).then((saved) => {
      if (saved) setNotice('Your registration and four company preferences have been saved.')
    })
  }

  const eligibleStudents = students.filter((item) => item.companies?.length)
  const visibleStudents = activeCompany === 'All companies'
    ? eligibleStudents
    : eligibleStudents.filter((item) => item.companies.includes(activeCompany))

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#home" onClick={() => { setView('student'); setStep(1) }}>
          <span className="brand-mark">P</span>
          <span>pathway<span className="brand-dot">.</span><small>CAREER SERVICES</small></span>
        </a>
        <nav className="view-switch" aria-label="Choose a view">
          <button className={view === 'student' ? 'nav-button active' : 'nav-button'} onClick={() => { setView('student'); setNotice('') }}>
            Student portal
          </button>
          <button className={view === 'admin' ? 'nav-button active' : 'nav-button'} onClick={() => { setView('admin'); setNotice('') }}>
            Admin view <span className="nav-count">{students.length}</span>
          </button>
        </nav>
        <div className="academic-year"><span className="live-dot" /> PLACEMENTS 2025–26</div>
      </header>

      {view === 'student' ? (
        <main className="student-page">
          <section className="intro">
            <div className="intro-copy">
              <div className="eyebrow"><span /> CAMPUS PLACEMENT REGISTRATION</div>
              <h1>Your next chapter<br /><em>starts here.</em></h1>
              <p>Tell us a little about yourself. Eligible students can then choose the companies they’re excited to meet.</p>
            </div>
            <div className="intro-art" aria-hidden="true">
              <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
              <div className="art-sun" /><div className="art-column column-one" /><div className="art-column column-two" />
              <span className="art-caption">A GOOD PLACE<br />TO BEGIN</span>
              <span className="art-number">01 / 02</span>
            </div>
          </section>

          <section className="registration-layout">
            <aside className="step-rail" aria-label="Registration progress">
              <div className={step === 1 ? 'step-item current' : 'step-item complete'}>
                <span className="step-index">{step === 1 ? '01' : '✓'}</span>
                <span><strong>Your details</strong><small>Student information</small></span>
              </div>
              <div className="step-line" />
              <div className={step === 2 ? 'step-item current' : 'step-item'}>
                <span className="step-index">02</span>
                <span><strong>Company choices</strong><small>Pick four companies</small></span>
              </div>
              <div className="rail-note"><span className="note-icon">i</span><p>Company preferences are available to students with <strong>zero standing arrears.</strong></p></div>
            </aside>

            <div className="form-panel">
              {step === 1 ? (
                <form onSubmit={continueRegistration}>
                  <div className="panel-heading">
                    <div><span className="section-kicker">STEP 01 <i /> YOUR PROFILE</span><h2>Student details</h2></div>
                    <span className="required-note"><b>*</b> Required fields</span>
                  </div>
                  <div className="form-grid">
                    <label className="field span-two">Student name <b>*</b><input autoComplete="name" name="name" value={student.name} onChange={updateStudent} placeholder="e.g. Ananya Sharma" required /></label>
                    <label className="field">Student ID <b>*</b><input name="studentId" value={student.studentId} onChange={updateStudent} placeholder="e.g. 23CS104" required /></label>
                    <label className="field">Department <b>*</b><select name="department" value={student.department} onChange={updateStudent} required><option value="">Select department</option><option>Computer Science</option><option>Information Technology</option><option>Electronics & Communication</option><option>Electrical & Electronics</option><option>Mechanical Engineering</option><option>Civil Engineering</option><option>Other</option></select></label>
                    <label className="field">Year <b>*</b><select name="year" value={student.year} onChange={updateStudent} required><option value="">Select year</option><option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option></select></label>
                    <label className="field">Section <b>*</b><input name="section" value={student.section} onChange={updateStudent} placeholder="e.g. A" required /></label>
                    <label className="field">Blood group <b>*</b><select name="bloodGroup" value={student.bloodGroup} onChange={updateStudent} required><option value="">Select blood group</option>{['A+', 'A−', 'B+', 'B−', 'AB+', 'AB−', 'O+', 'O−'].map((group) => <option key={group}>{group}</option>)}</select></label>
                    <label className="field">Phone number <b>*</b><input autoComplete="tel" inputMode="numeric" name="phone" value={student.phone} onChange={updateStudent} placeholder="10-digit mobile number" pattern="[0-9]{7,15}" required /></label>
                    <label className="field">Email ID <b>*</b><input autoComplete="email" type="email" name="email" value={student.email} onChange={updateStudent} placeholder="you@college.edu" required /></label>
                    <label className="field">Father’s name <b>*</b><input name="fatherName" value={student.fatherName} onChange={updateStudent} placeholder="Full name" required /></label>
                    <label className="field">Mother’s name <b>*</b><input name="motherName" value={student.motherName} onChange={updateStudent} placeholder="Full name" required /></label>
                    <label className="field span-two arrear-field">Standing arrears <b>*</b><span className="field-hint">Enter the number of current standing arrears</span><input type="number" name="arrears" value={student.arrears} onChange={updateStudent} placeholder="0" min="0" step="1" required /></label>
                  </div>
                  {notice && <p className="notice" role="status">{notice}</p>}
                  <div className="form-actions"><span>All information is kept private by your placement office.</span><button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Continue'} <span>→</span></button></div>
                </form>
              ) : (
                <form onSubmit={submitPreferences}>
                  <div className="panel-heading choices-heading">
                    <div><span className="section-kicker">STEP 02 <i /> COMPANY PREFERENCES</span><h2>Where will you go?</h2><p className="heading-description">Choose exactly four companies. You can change your selection before submitting.</p></div>
                    <span className="choice-count"><strong>{selectedCompanies.length}</strong> / 4 selected</span>
                  </div>
                  <div className="company-grid">
                    {companies.map((company) => {
                      const isSelected = selectedCompanies.includes(company.name)
                      return <button className={`company-option ${isSelected ? 'selected' : ''}`} type="button" key={company.name} onClick={() => toggleCompany(company.name)} aria-pressed={isSelected}>
                        <span className={`company-logo ${company.tone}`}>{company.initials}</span><span className="company-copy"><strong>{company.name}</strong><small>{company.category}</small></span><span className="company-check">{isSelected ? '✓' : '+'}</span>
                      </button>
                    })}
                  </div>
                  <div className="form-actions choice-actions"><button className="back-button" type="button" onClick={() => setStep(1)}>← Back to details</button><button className="primary-button" type="submit" disabled={selectedCompanies.length !== 4 || isSubmitting}>{isSubmitting ? 'Saving…' : 'Submit preferences'} <span>→</span></button></div>
                </form>
              )}
            </div>
          </section>
        </main>
      ) : (
        <main className="admin-page">
          <div className="admin-heading">
            <div><div className="eyebrow"><span /> PLACEMENT OFFICE</div><h1>Registration overview</h1><p>Review eligible student preferences by company.</p></div>
            <div className="admin-term">ACADEMIC YEAR <strong>2025—26</strong></div>
          </div>
          <section className="stats-row" aria-label="Registration totals">
            <div className="stat-block"><span>TOTAL REGISTERED</span><strong>{students.length.toString().padStart(2, '0')}</strong><small>students</small></div>
            <div className="stat-block"><span>ELIGIBLE STUDENTS</span><strong>{eligibleStudents.length.toString().padStart(2, '0')}</strong><small>with company preferences</small></div>
            <div className="stat-block"><span>COMPANIES LISTED</span><strong>10</strong><small>placement partners</small></div>
            <div className="stat-aside"><span className="live-dot" /> DATA FROM DATABASE</div>
          </section>
          <section className="admin-content">
            <div className="company-sidebar">
              <div className="sidebar-title"><strong>COMPANIES</strong><span>{companies.length}</span></div>
              <button className={activeCompany === 'All companies' ? 'company-filter active' : 'company-filter'} onClick={() => setActiveCompany('All companies')}><span className="filter-glyph">▦</span>All companies<span className="filter-total">{eligibleStudents.length}</span></button>
              {companies.map((company) => {
                const total = eligibleStudents.filter((item) => item.companies.includes(company.name)).length
                return <button key={company.name} className={activeCompany === company.name ? 'company-filter active' : 'company-filter'} onClick={() => setActiveCompany(company.name)}><span className={`mini-logo ${company.tone}`}>{company.initials}</span>{company.name}<span className="filter-total">{total}</span></button>
              })}
            </div>
            <div className="student-list-panel">
              <div className="list-heading"><div><span className="section-kicker">STUDENT DIRECTORY</span><h2>{activeCompany}</h2></div><span className="result-count">{visibleStudents.length} {visibleStudents.length === 1 ? 'student' : 'students'}</span></div>
              {visibleStudents.length ? <div className="table-scroll"><table><thead><tr><th>STUDENT</th><th>STUDENT ID</th><th>DEPARTMENT</th><th>YEAR / SEC</th><th>PHONE</th><th>PREFERENCES</th></tr></thead><tbody>{visibleStudents.map((item) => <tr key={item.studentId}><td><strong>{item.name}</strong><small>{item.email}</small></td><td className="id-cell">{item.studentId}</td><td>{item.department}</td><td>{item.year} · {item.section}</td><td>{item.phone}</td><td><div className="preference-list">{item.companies.map((companyName) => <span key={companyName}>{companyName}</span>)}</div></td></tr>)}</tbody></table></div> : <div className="empty-state"><span className="empty-mark">{isLoading ? '…' : '—'}</span><h3>{isLoading ? 'Loading registrations' : 'No registrations to show'}</h3><p>{isLoading ? 'Connecting to the registration database.' : 'Student registrations with company preferences will appear here.'}</p>{!isLoading && <button type="button" onClick={() => setView('student')}>Go to student portal <span>→</span></button>}</div>}
              <div className="list-footer">Showing eligible students only <span>·</span> Updated as registrations are submitted</div>
            </div>
          </section>
        </main>
      )}
      <footer className="page-footer"><span>PATHWAY <b>·</b> CAMPUS PLACEMENT PORTAL</span><span>MADE FOR WHAT COMES NEXT</span></footer>
    </div>
  )
}

export default App
