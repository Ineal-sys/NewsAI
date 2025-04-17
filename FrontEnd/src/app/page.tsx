// src/app/page.tsx
'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import ArticleCard from '@/components/ArticleCard';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Link from 'next/link';
import Box from '@mui/material/Box';
import Pagination from '@mui/material/Pagination';
import { useSession } from 'next-auth/react';
import ToggleReadFilterButton from '@/components/ToggleReadFilterButton'; // Import the new button

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

// Inner component that uses hooks requiring Suspense
function HomePageContent() {
  const { status } = useSession();
  const searchParams = useSearchParams(); // Hook requires Suspense boundary
  const includeRead = searchParams.get('includeRead') === 'true';

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = useCallback(async (page: number, shouldIncludeRead: boolean) => {
    setLoading(true);
    setError(null);
    try {
      // Construct API URL
      const apiUrl = new URL(`/api/articles`, window.location.origin);
      apiUrl.searchParams.set('rating', '6');
      apiUrl.searchParams.set('sortBy', 'created_at');
      apiUrl.searchParams.set('order', 'desc');
      apiUrl.searchParams.set('page', page.toString());
      apiUrl.searchParams.set('limit', ARTICLES_PER_PAGE.toString());
      // Add includeRead only if true (API defaults to false behaviour)
      if (shouldIncludeRead) {
        apiUrl.searchParams.set('includeRead', 'true');
      }

      const response = await fetch(apiUrl.toString());
      if (!response.ok) {
        throw new Error(`Échec de la récupération des articles : ${response.statusText}`);
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
  // Keep dependency array minimal for useCallback
  }, []);

  useEffect(() => {
    // Fetch articles when status is determined, page changes, or includeRead changes
    if (status !== 'loading') {
      fetchArticles(currentPage, includeRead);
    }
  // Depend on status, currentPage, includeRead, and the fetch function itself
  }, [status, currentPage, includeRead, fetchArticles]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    // Update currentPage state, which triggers useEffect to refetch
    setCurrentPage(value);
  };

  // Wrap the return in a React Fragment
  return (
    <>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ mb: { xs: 2, md: 0 } }}>
            Articles récents
          </Typography>
          <Button variant="contained" component={Link} href="/categories">
            Parcourir les catégories
          </Button>
        </Box>

        {/* Conditionally render the toggle button for logged-in users */} 
        {status === 'authenticated' && (
            <Box sx={{ mb: 2 }}>
              <ToggleReadFilterButton />
            </Box>
        )}

        {(loading || status === 'loading') && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" sx={{ textAlign: 'center', my: 5 }}>
            Erreur lors du chargement des articles: {error}
          </Typography>
        )}

        {/* Ensure Grid container is rendered when not loading and no error */} 
        {status !== 'loading' && !loading && !error && (
          <>
            <Grid container spacing={3}> {/* Grid container for article cards */}
              {articles.length > 0 ? (
                articles.map((article) => (
                  <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}> {/* Grid item for each card - Uses V2 syntax */}
                    <ArticleCard article={article} />
                  </Grid>
                ))
              ) : (
                <Grid size={{ xs: 12 }}> {/* Grid item for message - Uses V2 syntax */}
                  <Typography sx={{ textAlign: 'center', width: '100%', my: 5 }}>
                    {status === 'authenticated' && !includeRead
                      ? 'Aucun nouvel article non lu trouvé correspondant aux critères.'
                      : 'Aucun article trouvé correspondant aux critères.'
                    }
                    {status === 'authenticated' && includeRead && ' (Essayez "Show Only Unread")'}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {/* Pagination */} 
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
      </Container>
    </> // Closing fragment tag
  );
}

// Main export wraps the content in Suspense
export default function HomePage() {
    return (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>}>
            <HomePageContent />
        </Suspense>
    );
}
