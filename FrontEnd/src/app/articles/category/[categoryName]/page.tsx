'use client';

import React, { useState, useEffect, useCallback, Suspense, use } from 'react'; // Import 'use'
import { useSearchParams } from 'next/navigation'; 
import ArticleCard from '@/components/ArticleCard';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Pagination from '@mui/material/Pagination';
import { useSession } from 'next-auth/react'; 
import ToggleReadFilterButton from '@/components/ToggleReadFilterButton';
import Button from '@mui/material/Button';
import Link from 'next/link';

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

// Interface for page props including dynamic route params
// The params prop itself might be a Promise now
interface CategoryPageProps {
  params: Promise<{ categoryName: string }>; 
}

// Inner component that uses hooks requiring Suspense
function CategoryPageContent({ params: paramsPromise }: CategoryPageProps) {
  // --- Unwrap the params Promise --- 
  const params = use(paramsPromise); // Use React.use() to get the params object
  // --- ----------------------- --- 

  const { status } = useSession(); // Get session status
  const searchParams = useSearchParams(); // Hook requires Suspense
  const includeRead = searchParams.get('includeRead') === 'true';
  
  // Now access categoryName from the resolved params object
  const categoryName = decodeURIComponent(params.categoryName || ''); 
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchArticles = useCallback(async (category: string, page: number, shouldIncludeRead: boolean) => {
    if (!category) return;
    setLoading(true);
    setError(null);
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
        const errorData = await response.json().catch(() => ({})); 
        throw new Error(`Échec de la récupération des articles (${response.status}): ${errorData.error || response.statusText}`);
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
  }, []); 

  useEffect(() => {
    if (categoryName && status !== 'loading') {
      fetchArticles(categoryName, currentPage, includeRead);
    }
  }, [categoryName, currentPage, includeRead, status, fetchArticles]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
  };

  // Restore the original return block since the parsing error is gone
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}> 
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Articles dans: {categoryName}
        </Typography>
         <Button variant="contained" component={Link} href="/categories">
          Voir toutes les catégories
        </Button>
      </Box>

      {status === 'authenticated' && (
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <ToggleReadFilterButton />
          </Box>
      )} 

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
      )}

      {!loading && !error && (
        <>
          <Grid container spacing={3}> 
            {articles.length > 0 ? (
              articles.map((article) => (
                <Grid key={article.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }} >
                  <ArticleCard article={article} />
                </Grid>
              ))
            ) : (
                <Grid size={{ xs: 12 }}>
                    <Typography sx={{ textAlign: 'center', width: '100%', my: 5 }}>
                        Aucun article trouvé dans cette catégorie pour le moment.
                        {status === 'authenticated' && includeRead && ' (Essayez "Show Only Unread")'}
                    </Typography>
                </Grid>
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
    </Container>
  );
}

// Main export wraps the content in Suspense and passes params
export default function CategoryArticlesPage(props: CategoryPageProps) {
    // Adjust the type of the prop being passed down if necessary
    return (
        <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>}>
            <CategoryPageContent params={props.params} />
        </Suspense>
    );
}
