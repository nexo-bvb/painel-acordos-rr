import { TermosTable } from './components/TermosTable'
import './App.css'

function App() {
  const lastUpdated = new Date()
  const nextUpdated = new Date(lastUpdated)
  nextUpdated.setDate(lastUpdated.getDate() + 7)

  const formatDate = (date: Date) =>
    date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  return (
    <div className="app-shell">
      <header className="page-header">
        <div className="page-header-copy">
          <p className="page-kicker">Painel de consulta</p>
          <h1>Termos de Cooperacao tecnica</h1>
        </div>

        <div className="update-card" aria-label="Informacoes de atualizacao">
          <div className="update-block update-block-highlight">
            <div className="update-icon" aria-hidden="true">
              <span className="update-icon-face"></span>
            </div>
            <div>
              <span className="update-label">Ultima atualizacao</span>
              <strong className="update-date">{formatDate(lastUpdated)}</strong>
            </div>
          </div>

          <div className="update-divider" aria-hidden="true"></div>

          <div className="update-status">
            <span className="status-dot" aria-hidden="true"></span>
            <span>Status: Em dia</span>
          </div>

          <div className="update-divider" aria-hidden="true"></div>

          <div className="update-block">
            <div>
              <span className="update-label">Proxima atualizacao</span>
              <strong className="update-date">{formatDate(nextUpdated)}</strong>
            </div>
          </div>
        </div>
      </header>

      <div className="page-content">
        <div className="container">
          <main>
            <TermosTable />
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
