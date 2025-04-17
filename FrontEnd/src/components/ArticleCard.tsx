'use client';

import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Chip } from '@mui/material'; 
import NextLink from 'next/link'; 
import Box from '@mui/material/Box';

interface Article {
  id: number;
  url?: string | null;
  image_url?: string | null;
  title?: string | null;
  summary?: string | null;
  rating?: number | null;
  category?: string | null;
  Date_Feed?: string | null; // Expecting format like '2025-04-16 09:00:00'
  created_at?: Date | null;
}

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const truncateSummary = (text: string | null | undefined, maxLength: number = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'Date inconnue';
    try {
      // Assuming the format is always 'YYYY-MM-DD HH:MM:SS'
      // Replace space with T for better ISO 8601 parsing compatibility
      const date = new Date(dateString.replace(' ', 'T')); 
      
      // Check if the date is valid after parsing
      if (isNaN(date.getTime())) {
         console.warn(`Invalid date format received: ${dateString}`);
         // Attempt to parse just the date part as a fallback
         const dateOnly = new Date(dateString.split(' ')[0]);
         if(isNaN(dateOnly.getTime())) return 'Date invalide';
         // Format the date-only part if successful
         return dateOnly.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
         });
      }
      
      // Format the full date if valid
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        // Optional: Add time formatting if needed
        // hour: '2-digit',
        // minute: '2-digit',
      });
    } catch (error) {
      console.error(`Error formatting date: ${dateString}`, error);
      return 'Date invalide'; // Return specific error message
    }
  };

  const defaultImageUrl = '/placeholder-image.png';

  const handleCategoryClick = (event: React.MouseEvent) => {
    event.stopPropagation(); 
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Link the Image to the article */}
      <NextLink href={`/articles/${article.id}`} passHref style={{ textDecoration: 'none' }}>
        <CardMedia
          component="img"
          height="140"
          image={article.image_url || defaultImageUrl}
          alt={article.title || 'Article image'}
          sx={{ objectFit: 'cover', cursor: 'pointer' }} 
        />
      </NextLink>
      
      {/* CardContent now uses flexbox to push date to the bottom */}
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Top part (Title, Category, Summary) */}
        <Box sx={{ flexGrow: 1 }}> 
            {/* Link the Title to the article */}
            <NextLink href={`/articles/${article.id}`} passHref style={{ textDecoration: 'none', color: 'inherit' }}>
            <Typography 
                gutterBottom 
                variant="h6" 
                component="div"
                sx={{ cursor: 'pointer' }} 
            >
                {article.title || 'No Title'}
            </Typography>
            </NextLink>

            {/* Separate Link for the Category Chip */}
            {article.category && (
            <Box onClick={handleCategoryClick} sx={{ mb: 1, alignSelf: 'flex-start' }}> 
                <NextLink href={`/articles/category/${encodeURIComponent(article.category)}`}>
                <Chip 
                    label={article.category} 
                    size="small" 
                    sx={{ cursor: 'pointer' }} 
                    clickable 
                />
                </NextLink>
            </Box>
            )}

            {/* Summary */}
            <Typography variant="body2" color="text.secondary">
            {truncateSummary(article.summary)}
            </Typography>
        </Box>

        {/* Footer part (Date) - pushed to bottom by flexGrow on the Box above */}
        {article.Date_Feed && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 2, alignSelf: 'flex-end' }}>
                {formatDate(article.Date_Feed)}
            </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ArticleCard;
