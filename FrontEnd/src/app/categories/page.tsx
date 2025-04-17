'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation'; // Import useSearchParams
import ArticleCard from '@/components/ArticleCard';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import { useSession } from 'next-auth/react'; // Import useSession
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

// Define the structure of the API response for category articles
interface CategoryApiResponse {
  articles: Article[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

const ARTICLES_PER_PAGE = 15;

// Inner component using hooks requiring Suspense
function CategoriesPageContent() {
  const { status } = useSession(); // Get session status
  const searchParams = useSearchParams(); // Hook requires Suspense
  const includeRead = searchParams.get('includeRead') === 'true';

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingArticles, setLoadingArticles] = useState(false);
  const [errorCategories, setErrorCategories] = useState<string | null>(null);
  const [errorArticles, setErrorArticles] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categories on initial load
  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      setErrorCategories(null);
      try {
        const response = await fetch('/api/categories');
        if (!response.ok) {
          throw new Error(`Échec de la récupération des catégories : ${response.statusText}`);
        }
        const data: string[] = await response.json();
        setCategories(data);
      } catch (err) {
        const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
        setErrorCategories(typedError.message);
        console.error(typedError);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Fetch articles when a category is selected, page changes, or includeRead changes
  const fetchArticlesByCategory = useCallback(async (category: string, page: number, shouldIncludeRead: boolean) => {
      setLoadingArticles(true);
      setErrorArticles(null);
      try {
        const encodedCategory = encodeURIComponent(category);
        const apiUrl = new URL(`/api/articles/category/${encodedCategory}`, window.location.origin);
        apiUrl.searchParams.set('sortBy', 'Date_Feed');
        apiUrl.searchParams.set('order', 'asc');
        apiUrl.searchParams.set('page', page.toString());
        apiUrl.searchParams.set('limit', ARTICLES_PER_PAGE.toString());
        if (shouldIncludeRead) {
          apiUrl.searchParams.set('includeRead', 'true');
        }

        const response = await fetch(apiUrl.toString());
        if (!response.ok) {
          throw new Error(`Échec de la récupération des articles pour ${category}: ${response.statusText}`);
        }
        const data: CategoryApiResponse = await response.json();
        setArticles(data.articles);
        setTotalPages(data.totalPages);
        setCurrentPage(data.currentPage);
      } catch (err) {
        const typedError = err instanceof Error ? err : new Error('An unknown error occurred');
        setErrorArticles(typedError.message);
        setArticles([]);
        setTotalPages(1);
        console.error(typedError);
      } finally {
        setLoadingArticles(false);
        if (typeof window !== 'undefined') {
            const element = document.getElementById('category-articles-section');
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
      }
    }, []); // Removed dependencies as they are passed as args

  useEffect(() => {
    if (!selectedCategory || status === 'loading') {
      setArticles([]);
      setTotalPages(1);
      setCurrentPage(1);
      return;
    }
    // Fetch when category, page, or includeRead changes, and session is loaded
    fetchArticlesByCategory(selectedCategory, currentPage, includeRead);
  }, [selectedCategory, currentPage, includeRead, status, fetchArticlesByCategory]);

  const handleCategoryClick = (category: string) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
    } else {
      setSelectedCategory(category);
      setCurrentPage(1);
      setTotalPages(1);
      setArticles([]);
    }
  };

   const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Parcourir par catégorie
      </Typography>

      {loadingCategories && <CircularProgress />}
      {errorCategories && <Alert severity="error">Erreur lors du chargement des catégories : {errorCategories}</Alert>}

      {!loadingCategories && categories.length > 0 && (
        <Stack direction="row" spacing={1} sx={{ mb: 4, flexWrap: 'wrap', gap: 1 }}>
          {categories.map((category) => (
            <Chip
              key={category}
              label={category}
              clickable
              onClick={() => handleCategoryClick(category)}
              color={selectedCategory === category ? 'primary' : 'default'}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>
      )}
      {!loadingCategories && categories.length === 0 && !errorCategories && (
         <Typography sx={{ my: 2 }}>Aucune catégorie trouvée.</Typography>
      )}

      {/* Anchor point */}
      <Box id="category-articles-section" sx={{ minHeight: '10px' }}/>

      {selectedCategory && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 2, mt: 2 }}>
            <Typography variant="h5" component="h2">
              Articles dans &quot;{selectedCategory}&quot;
            </Typography>
             {/* Conditionally render the toggle button */} 
             {status === 'authenticated' && <ToggleReadFilterButton />} 
          </Box>

          {loadingArticles && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          )}

          {errorArticles && (
            <Alert severity="error" sx={{ my: 2 }}>Erreur lors du chargement des articles : {errorArticles}</Alert>
          )}

          {!loadingArticles && !errorArticles && (
            <>
              <Grid container spacing={3}>
                {articles.length > 0 ? (
                  articles.map((article) => (
                    <Grid key={article.id}size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                      <ArticleCard article={article} />
                    </Grid>
                  ))
                ) : (
                  <Typography sx={{ textAlign: 'center', width: '100%', my: 5 }}>
                    {status === 'authenticated' && !includeRead
                      ? 'Aucun article non lu trouvé dans cette catégorie.'
                      : 'Aucun article trouvé dans cette catégorie.'
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
                        disabled={loadingArticles}
                    />
                </Box>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}

// Main export wraps the content in Suspense
export default function CategoriesPage() {
    return (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>}>
            <CategoriesPageContent />
        </Suspense>
    );
}
