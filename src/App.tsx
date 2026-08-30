import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, AuthProvider, AudioProvider, SfxProvider } from './contexts';
import { AppRoutes } from './routes';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AudioProvider>
            <SfxProvider>
              <AppRoutes />
            </SfxProvider>
          </AudioProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}


