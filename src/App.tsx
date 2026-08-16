import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, AuthProvider, AudioProvider } from './contexts';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AudioProvider>
            <AppRoutes />
          </AudioProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}


