import { Routes, Route } from 'react-router-dom'
import Users from './pages/Users.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Users />} />
    </Routes>
  )
}
