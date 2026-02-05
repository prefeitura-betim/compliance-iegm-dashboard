import { Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import Layout from './components/Layout'

function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/sobre" element={<About />} />
            </Route>
        </Routes>
    )
}

export default App
