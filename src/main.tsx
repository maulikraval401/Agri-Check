import { createRoot } from 'react-dom/client';
import App from './App';
import { LanguageProvider } from '@/i18n/LanguageContext';
import './index.css';

createRoot(document.getElementById('root')!, {
  onCaughtError: (error, errorInfo) => {
    console.error(error, errorInfo.componentStack);
  },
}).render(
  <LanguageProvider>
    <App />
  </LanguageProvider>,
);
