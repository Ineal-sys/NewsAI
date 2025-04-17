'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react'; // Import signIn
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import Grid from '@mui/material/Grid';

export default function RegisterPage() {
  const [name, setName] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // Keep success state for feedback
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      setLoading(false);
      return;
    }
    
    if (!name) {
      setError('Veuillez saisir un pseudo.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        setLoading(false);
        return;
    }

    try {
      // 1. Attempt registration
      const registerResponse = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, password }), 
      });

      const registerData = await registerResponse.json();

      if (!registerResponse.ok) {
        // Handle registration errors
        let errorMessage = registerData.error || `L&apos;inscription a échoué (statut: ${registerResponse.status})`;
        if (registerResponse.status === 409) { // Specific handling for unique constraint
             errorMessage = 'Ce pseudo est déjà utilisé.';
        }
        // Add more specific error checks if needed
        throw new Error(errorMessage);
      }

      // 2. Registration successful, now attempt sign in
      setSuccess('Inscription réussie ! Connexion en cours...'); 

      const signInResult = await signIn('credentials', {
        name: name, // Use the same name used for registration
        password: password, // Use the same password
        redirect: false, // Prevent NextAuth from automatically redirecting
      });

      if (signInResult?.error) {
        // Handle sign-in errors (unlikely if registration just succeeded, but good practice)
        console.error("Sign-in after registration failed:", signInResult.error);
        // Show a generic error or redirect to sign-in page with error
        setError("L&apos;inscription a réussi, mais la connexion automatique a échoué. Veuillez vous connecter manuellement.");
        // Optionally redirect to signin page after a delay
        setTimeout(() => {
          router.push('/auth/signin');
        }, 3000);
      } else if (signInResult?.ok) {
        // 3. Sign-in successful, redirect to home page
        router.push('/'); 
        // No need for setTimeout, redirect immediately after successful sign-in
      } else {
        // Handle unexpected signIn result
         setError("Un problème inattendu est survenu après l&apos;inscription.");
      }

    } catch (err) {
      const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
      console.error("Échec de l&apos;inscription :", typedError);
      setError(typedError.message);
      setLoading(false); // Ensure loading stops on registration error
    }
    // No finally block needed here, loading is handled within try/catch
  };

  return (
    <>
      <Container maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5">
            S&apos;inscrire
          </Typography>
          
          {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                  {error}
              </Alert>
          )}
          {success && (
              <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
                  {success}
              </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
             <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Pseudo"
                  name="name"
                  autoComplete="username"
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading} // Only disable while loading
              />
              <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mot de passe"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
              />
              <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
              />
              <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  disabled={loading} // Disable button only when loading
              >
                  {loading ? <CircularProgress size={24} /> : "S'inscrire"}
              </Button>
              <Grid container justifyContent="flex-end">
                  <Grid>
                   <Link href="/auth/signin">
                      Déjà un compte ? Se connecter
                    </Link>
                  </Grid>
              </Grid>
              </Box>
        </Box>
      </Container>
    </> 
  );
}
