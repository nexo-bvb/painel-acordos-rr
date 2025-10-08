import { TermosTable } from './components/TermosTable'
import { Banner } from './components/Banner'
import './App.css'

function App() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      {/* Banner no topo - fora de qualquer container */}
      <Banner />
      
      {/* Conteúdo principal */}
      <div style={{ padding: '2rem 0' }}>
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
