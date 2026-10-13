import { lazy, StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
const Operation = lazy(() => import('./Operation'));
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {new URLSearchParams(location.search).get("app") === "operacao" ? <Suspense fallback={<div role="status" style={{padding:24}}>Carregando operação…</div>}><Operation /></Suspense> : <App />}
  </StrictMode>,
);
