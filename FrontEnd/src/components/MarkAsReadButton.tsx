'use client';

import React, { useState, useTransition } from 'react';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/Check';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation'; // Import useRouter

interface MarkAsReadButtonProps {
  articleId: number;
  isReadInitially?: boolean;
  onMarkedRead?: (articleId: number) => void;
}

const MarkAsReadButton: React.FC<MarkAsReadButtonProps> = ({
    articleId,
    isReadInitially = false,
    onMarkedRead
}) => {
  // session is not used directly, only status is needed
  const { status } = useSession(); 
  const router = useRouter(); // Initialize router
  const [isRead, setIsRead] = useState(isReadInitially);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleClick = async () => {
    if (isRead || isLoading) return; // Prevent multiple clicks or if already read

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/articles/read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ articleId }),
      });

      if (!response.ok) {
        // Try to parse error message from API response
        let errorMessage = 'Échec du marquage comme lu';
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
        } catch (parseError) {
            // Log the parsing error for debugging, but use the generic message
            console.error("Failed to parse error response from mark as read API:", parseError); 
        }
        throw new Error(errorMessage);
      }

      // Successfully marked as read
      startTransition(() => { // Wrap state update that triggers UI change
        setIsRead(true);
      });

      if (onMarkedRead) {
         onMarkedRead(articleId);
      }

      // Navigate back after successful marking
      // Adding a small delay to let the user see the state change, then navigate back
      setTimeout(() => {
        router.back();
      }, 500); // 500ms delay

    } catch (err) { // Type the error
      const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
      console.error("Erreur lors du marquage comme lu :", typedError);
      setError(typedError.message);
    } finally {
      // Set loading to false slightly after the potential navigation starts
      // to avoid button re-enabling flicker if navigation is instant
      setTimeout(() => setIsLoading(false), 100);
    }
  };

  if (status !== 'authenticated') {
    // Don't render button if user is not logged in or session is loading
    return null;
  }

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <Button
        variant="contained"
        onClick={handleClick}
        disabled={isRead || isLoading || isPending}
        startIcon={isRead ? <CheckIcon /> : null}
        sx={{ transition: 'background-color 0.3s ease' }} // Smooth transition for visual feedback
      >
        {isRead ? 'Marqué comme lu' : 'Marquer comme lu'}
      </Button>
      {(isLoading || isPending) && (
        <CircularProgress
          size={24}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginTop: '-12px',
            marginLeft: '-12px',
          }}
        />
      )}
       {error && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 1 }}>{error}</Typography>}
    </Box>
  );
};

export default MarkAsReadButton;
