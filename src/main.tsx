import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';
import './index.css';

// Guard against browser/iframe lifecycle database closing and backgrounding rejections
if (typeof window !== 'undefined') {
  const isIgnorableDbError = (err: any) => {
    if (!err) return false;
    let msg = '';
    if (typeof err === 'string') {
      msg = err;
    } else {
      msg = `${err?.message || ''} ${err?.reason?.message || ''} ${err?.reason || ''} ${err?.name || ''} ${err?.code || ''} ${err?.type || ''} ${String(err)}`;
    }
    const lower = msg.toLowerCase();
    return (
      lower.includes('database is closing') ||
      lower.includes('database connection is closing') ||
      lower.includes('closing/hidden') ||
      lower.includes('the database is closed') ||
      lower.includes('client is offline') ||
      lower.includes('failed to get document from server') ||
      lower.includes('document hidden') ||
      lower.includes('database is closing/hidden') ||
      (lower.includes('indexeddb') &&
        (lower.includes('closing') ||
          lower.includes('hidden') ||
          lower.includes('abort') ||
          lower.includes('closed') ||
          lower.includes('unavailable') ||
          lower.includes('invalidstate'))) ||
      (lower.includes('database') &&
        (lower.includes('closing') || lower.includes('closed') || lower.includes('hidden')))
    );
  };

  window.addEventListener(
    'error',
    (event) => {
      if (
        isIgnorableDbError(event.error) ||
        isIgnorableDbError(event.message) ||
        isIgnorableDbError(event)
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return true;
      }
    },
    true
  );

  window.addEventListener('unhandledrejection', (event) => {
    if (
      isIgnorableDbError(event.reason) ||
      isIgnorableDbError(event.reason?.message) ||
      isIgnorableDbError(event)
    ) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
