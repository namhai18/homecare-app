import { useState } from 'react';
import { Login } from './components/Login'
import { MainPage } from './components/MainPage'
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#667eea',
    },
    secondary: {
      main: '#764ba2',
    },
  },
});


function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = async (email: string, _password: string) => {
    try {
      // TODO: Add actual authentication logic here
      console.log('Login successful:', { email });
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoggedIn ? <MainPage /> : <Login onLogin={handleLogin} />}
    </ThemeProvider>
  )
}

export default App
