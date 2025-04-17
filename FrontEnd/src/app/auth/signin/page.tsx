'use client';

import React, { useState, useEffect, Suspense } from 'react'; // Import Suspense
import { signIn, getCsrfToken, getProviders } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Link from 'next/link';
import Grid from '@mui/material/Grid';

// Define provider structure
type Provider = {
    id: string;
    name: string;
    type: string;
    signinUrl: string;
    callbackUrl: string;
};

// Extracted component that uses useSearchParams
function SignInFormContent() {
  const [name, setName] = useState(''); // Changed from email to name (pseudo)
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);

  const router = useRouter();
  const searchParams = useSearchParams(); // This hook triggers the Suspense requirement
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const authError = searchParams.get('error');

  useEffect(() => {
    const fetchCsrfToken = async () => {
      const token = await getCsrfToken();
      setCsrfToken(token || null);
    };
    const fetchProviders = async () => {
        const provs = await getProviders();
        setProviders(provs);
    };

    fetchCsrfToken();
    fetchProviders();
  }, []);

   useEffect(() => {
    if (authError) {
      switch (authError) {
        case 'CredentialsSignin':
          setError('Pseudo ou mot de passe invalide. Veuillez réessayer.'); // Updated error message
          break;
        case 'Callback':
        case 'OAuthAccountNotLinked':
            setError('La connexion a échoué. Si vous vous êtes inscrit avec une méthode différente, veuillez utiliser celle-ci.');
            break;
        default:
          setError("Une erreur inattendue s'est produite lors de la connexion.");
      }
       // Prevent infinite loop by replacing only if authError exists
       // Also check if the URL already has the error param to avoid unnecessary replaces
       if (window.location.search.includes('error=')) {
           router.replace('/auth/signin', undefined);
       }
    }
  }, [authError, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    // Validate name and password
    if (!name || !password) { 
        setError("Veuillez saisir le pseudo et le mot de passe.");
        setLoading(false);
        return;
    }

    const result = await signIn('credentials', {
      redirect: false,
      name, // Send name (pseudo) instead of email
      password,
      callbackUrl: callbackUrl, 
    });

    setLoading(false);

    if (result?.error) {
      console.error('Erreur de connexion:', result.error);
      // Updated error message
      setError(result.error === 'CredentialsSignin' ? 'Pseudo ou mot de passe invalide.' : 'La connexion a échoué. Veuillez réessayer.'); 
    } else if (result?.ok) {
      router.push('/');
    } else {
         setError('Un problème inattendu est survenu.');
    }
  };

  // Render the actual form UI
  return (
     <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Se connecter
        </Typography>
        
        {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                {error}
            </Alert>
        )}

        {/* Show loading indicator while fetching providers/CSRF */} 
        {!providers || !csrfToken ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                 <CircularProgress />
            </Box>
        ) : (
            <> 
                {/* Credentials Form */} 
                {providers.credentials && (
                    <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                    <input name="csrfToken" type="hidden" defaultValue={csrfToken || ''} />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="name" // Changed id
                        label="Pseudo" // Changed label
                        name="name" // Changed name attribute
                        autoComplete="username" // Changed autoComplete
                        autoFocus
                        value={name} // Bind to name state
                        onChange={(e) => setName(e.target.value)} // Update name state
                        disabled={loading}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Mot de passe"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Connexion'}
                    </Button>
                    <Grid container justifyContent="flex-end">
                        <Grid>
                        <Link href="/auth/register" >
                            {"Pas encore de compte ? S'inscrire"}
                        </Link>
                        </Grid>
                    </Grid> 
                    </Box>
                )}

                {/* Optional: Add buttons for other providers like Google, GitHub etc. */} 
                {/* ... other provider buttons ... */} 
             </>
        )}
      </Box>
  );
}

// Main page component that wraps the content in Suspense
export default function SignInPage() {
  return (
    <Container maxWidth="xs">
       {/* Wrap the component using useSearchParams in Suspense */}
       <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}><CircularProgress /></Box>}>
         <SignInFormContent />
       </Suspense>
    </Container>
  );
}
