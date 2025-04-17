'use client';

import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import { useSession, signIn, signOut } from 'next-auth/react';
import SearchBar from './SearchBar';
import NextLink from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation'; // Import useRouter

export default function Header() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';
  const router = useRouter(); // Get router instance

  // Removed the unused 'e' parameter
  const handleHomeClick = () => {
    // Prevent default link behavior if needed, though NextLink handles it
    // e.preventDefault(); 
    
    // Refresh data for the current route (or the route we are navigating to)
    router.refresh(); 
    
    // Optional: Explicitly navigate if router.refresh() doesn't trigger navigation on its own
    // router.push('/'); 
  };

  return (
    <AppBar position="static">
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        {/* Logo and Site Name Area */}
        <Box 
          component={NextLink} 
          href="/" 
          onClick={handleHomeClick} // Add onClick handler to the logo area as well
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1, 
            color: 'inherit', 
            textDecoration: 'none' 
          }}
        >
          <Image 
            src="/logo.png" 
            alt="NewsAI Logo" 
            width={40} 
            height={40} 
            style={{ objectFit: 'contain', marginRight: '8px' }} 
          />
          <Typography variant="h6" component="span">
            News AI
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', px: 2 }}>
            <SearchBar />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {/* Update the Accueil button */}
            <Button 
              color="inherit" 
              component={NextLink} // Keep NextLink for SPA navigation benefits
              href="/" 
              onClick={handleHomeClick} // Add the onClick handler
            >
              Accueil
            </Button>
            <Button color="inherit" component={NextLink} href="/categories">Catégories</Button>
            
            {!loading && !session && (
              <Button color="inherit" onClick={() => signIn()} >
                Se connecter
              </Button>
            )}
            {!loading && session?.user && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                 <Button color="inherit" onClick={() => signOut()}>Se déconnecter</Button>
              </Box>
            )}
             {loading && <Button color="inherit" disabled>...</Button>}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
