import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell.tsx'
import { routerBasename } from './lib/router-basename.ts'
import { Author } from './pages/Author.tsx'
import { Home } from './pages/Home.tsx'
import { ProblemPage } from './pages/ProblemPage.tsx'

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Home />} />
        <Route path="/topic/:slug" element={<Home />} />
        <Route path="/problem/:id" element={<ProblemPage />} />
        <Route path="/author" element={<Author />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter basename={routerBasename(import.meta.env.BASE_URL)}>
      <AppRoutes />
    </BrowserRouter>
  )
}
