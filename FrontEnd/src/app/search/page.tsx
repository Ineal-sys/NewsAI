// src/app/search/page.tsx
'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ArticleCard from '@/components/ArticleCard';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import { useSession } from 'next-auth/react'; // Import useSession
import ToggleReadFilterButton from '@/components/ToggleReadFilterButton'; // Import the button

// Define the Article type
interface Article {
  id: number;
  url?: string | null;
  image_url?: string | null;
  title?: string | null;
  summary?: string | null;
  rating?: number | null;
  category?: string | null;
  Date_Feed?: string | null;
  created_at?: Date | null;
}

// Define the structure of the API response
interface ApiResponse {
  articles: Article[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

const ARTICLES_PER_PAGE = 15;

function SearchResults() {
  const { status } = useSession(); // Get session status
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const includeRead = searchParams.get('includeRead') === 'true'; // Read the new param

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSearchResults = useCallback(async (searchTerm: string, page: number, shouldIncludeRead: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = new URL(`/api/search`, window.location.origin);
      apiUrl.searchParams.set('q', searchTerm);
      apiUrl.searchParams.set('page', page.toString());
      apiUrl.searchParams.set('limit', ARTICLES_PER_PAGE.toString());
      if (shouldIncludeRead) {
        apiUrl.searchParams.set('includeRead', 'true');
      }

      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        throw new Error(`Échec de la récupération des résultats de recherche : ${response.statusText}`);
      }
      const data: ApiResponse = await response.json();
      setArticles(data.articles);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
    } catch (err) {
      const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
      setError(typedError.message);
      setArticles([]);
      setTotalPages(1);
      console.error(typedError);
    } finally {
      setLoading(false);
       if (typeof window !== 'undefined') {
           window.scrollTo({ top: 0, behavior: 'smooth' });
       }
    }
  // Pass shouldIncludeRead to the function, no need for it in deps array
  }, []);

  // Effect to handle changes in query, page, or includeRead filter
  useEffect(() => {
    if (!query || status === 'loading') {
        setError(null);
        setLoading(false);
        setArticles([]);
        setTotalPages(1);
        // Optionally reset currentPage if query is cleared
        // setCurrentPage(1);
        return; // No query or session loading, don't fetch
    }
    // Fetch when query, currentPage, or includeRead changes (and session is ready)
    fetchSearchResults(query, currentPage, includeRead);
  // Depend on all factors that should trigger a refetch
  }, [query, currentPage, includeRead, status, fetchSearchResults]);

  // This useEffect handles resetting to page 1 when the query *or* includeRead changes
  useEffect(() => {
     setCurrentPage(1);
     setTotalPages(1);
     // Don't clear articles here, let the main fetch effect handle it
  }, [query, includeRead]); 


  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, md: 0 } }}>
            Résultats de recherche {query ? `pour "${query}"` : ''}
          </Typography>
           {/* Conditionally render the toggle button for logged-in users */} 
           {status === 'authenticated' && query && <ToggleReadFilterButton />} 
      </Box>

      {(loading || status === 'loading') && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>Erreur lors du chargement des résultats : {error}</Alert>
      )}

      {!loading && !error && query && status !== 'loading' && (
        <>
          <Grid container spacing={3}>
            {articles.length > 0 ? (
              articles.map((article) => (
                <Grid key={article.id}  size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                  <ArticleCard article={article} />
                </Grid>
              ))
            ) : (
                 <Typography sx={{ textAlign: 'center', width: '100%', my: 5 }}>
                     {status === 'authenticated' && !includeRead
                      ? 'Aucun article non lu trouvé correspondant à votre recherche.'
                      : 'Aucun article trouvé correspondant à votre recherche.'
                     }
                     {status === 'authenticated' && includeRead && ' (Essayez "Show Only Unread")'}
                 </Typography>
            )}
          </Grid>

          {totalPages > 1 && (
             <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                 <Pagination
                     count={totalPages}
                     page={currentPage}
                     onChange={handlePageChange}
                     color="primary"
                     disabled={loading}
                 />
             </Box>
          )}
        </>
      )}
       {!loading && !error && !query && status !== 'loading' && (
            <Typography sx={{ textAlign: 'center', width: '100%', my: 5 }}>
                Veuillez entrer un terme de recherche.
            </Typography>
       )} 
    </Container>
  );
}

// Wrap SearchResults in Suspense
export default function SearchPage() {
    return (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>}>
            <SearchResults />
        </Suspense>
    )
}
