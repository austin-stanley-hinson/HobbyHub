import { Routes, Route } from 'react-router-dom';
import './App.css'
import Home from './pages/Home';

function App() {
  return (
    <main className="content">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<div className="page"><h1>Page not found</h1></div>} />
      </Routes>
    </main>
  )
}

export default App
