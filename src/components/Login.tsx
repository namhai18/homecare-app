
import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  InputAdornment,
  IconButton,
  Checkbox,
  FormControlLabel,
  Link,
  Divider
} from '@mui/material';
import { Person, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface LoginProps {
  onLogin: (email: string, password: string) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else if (data?.user) {
        onLogin(email, password);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      // Remove background color here for a plain look
    }}>
      <Container maxWidth="sm" sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Logo and title */}
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box sx={{ mb: 1 }}>
            <img src="/vite.svg" alt="Logo" style={{ width: 56, height: 56 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#3c3c3c' }}>Your Social Campaigns</Typography>
        </Box>
  <Paper elevation={8} sx={{ p: 4, borderRadius: 4, width: '100%', maxWidth: 400, background: 'none', boxShadow: 3 }}>
          <Typography component="h1" variant="h4" sx={{ mb: 2, fontWeight: 600, color: '#333', textAlign: 'center' }}>
            Sign In
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mb: 2 }}>
              <Typography component="label" htmlFor="email" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                Username
              </Typography>
              <TextField
              margin="normal"
              required
              fullWidth
                id="email"
                label=""
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: '#fff',
                  },
                }}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person color="primary" />
                  </InputAdornment>
                ),
              }}
              />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography component="label" htmlFor="password" sx={{ fontWeight: 500, fontSize: '1rem', color: '#222', mb: 0.5, display: 'block' }}>
                Password
              </Typography>
              <TextField
              margin="normal"
              required
              fullWidth
              name="password"
                label=""
                sx={{
                  '& .MuiInputBase-root': {
                    backgroundColor: '#fff',
                  },
                }}
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="primary" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, mb: 2 }}>
              <FormControlLabel
                control={<Checkbox checked={remember} onChange={e => setRemember(e.target.checked)} color="primary" />}
                label={<Typography variant="body2">Remember this Device</Typography>}
              />
              <Link href="#" variant="body2" underline="hover" sx={{ color: 'primary.main', fontWeight: 500 }}>
                Forgot Password ?
              </Link>
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 2,
                mb: 2,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                textTransform: 'none',
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #764ba2 30%, #667eea 90%)',
                },
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" sx={{ color: '#888' }}>
                New to Modernize?
                <Link href="#" underline="hover" sx={{ ml: 1, color: 'primary.main', fontWeight: 500 }}>
                  Create an account
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
