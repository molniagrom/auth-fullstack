import { RegistrationForm } from './components/RegistrationForm'
import { VerifyEmailForm } from './components/VerifyEmailForm'
import './App.css'

type ViewMode = 'register' | 'verify'

function App() {
  const viewMode: ViewMode =
    window.location.pathname === '/verify-email' ? 'verify' : 'register'

  return (
    <main className="page-shell">
      <section className="panel hero-panel">
        <p className="eyebrow">Auth Fullstack</p>
        <h1>Email verification learning flow</h1>
        <p className="lead">
          This project does not send real emails. The backend logs a verification
          link to the console through an SMTP mock adapter.
        </p>
      </section>

      {viewMode === 'register' ? <RegistrationForm /> : <VerifyEmailForm />}
    </main>
  )
}

export default App
