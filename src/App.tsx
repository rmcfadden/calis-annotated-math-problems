import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell.tsx'
import { Author } from './pages/Author.tsx'
import { Home } from './pages/Home.tsx'
import { ProblemPage } from './pages/ProblemPage.tsx'

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/topic/:slug" element={<Home />} />
          <Route path="/problem/:id" element={<ProblemPage />} />
          <Route
            path="/author"
            element={import.meta.env.DEV ? <Author /> : <Navigate to="/" replace />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
