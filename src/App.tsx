import { Login } from './components/Login'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
  },
});

function App() {
  const handleLogin = (email: string, password: string) => {
    console.log('Login successful:', { email, password: '***' });
    // TODO: Add navigation or other post-login logic here
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Login onLogin={handleLogin} />
    </ThemeProvider>
  )
}

export default App
