import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import APIInput from './pages/APIInput'
import Optimizer from './pages/Optimizer'
import Connectors from './pages/Connectors'
import Agent from './pages/Agent'

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/optimizer" element={<Optimizer />} />
        <Route path="/agent" element={<Agent />} />
        <Route path="/api-input" element={<APIInput />} />
        <Route path="/connectors" element={<Connectors />} />
      </Routes>
    </Layout>
  )
}
