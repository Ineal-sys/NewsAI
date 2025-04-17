import React from 'react';
import { prisma } from '@/lib/prisma';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import MarkAsReadButton from '@/components/MarkAsReadButton';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/lib/auth';
import Button from '@mui/material/Button'; // Import Button
import Tooltip from '@mui/material/Tooltip'; // Import Tooltip
import type { Metadata } from 'next';
import type { articles as Article } from '@prisma/client';

interface Props {
  params: { articleId: string };
  searchParams?: { [key: string]: string | string[] | undefined };
}

async function getArticleDetails(id: number): Promise<Article | null> {
  try {
    const article = await prisma.articles.findUnique({ where: { id } });
    return article;
  } catch (error) {
    console.error(`(getArticleDetails) Échec de la récupération de l'article ${id}:`, error);
    return null;
  }
}

async function getReadStatus(userId: string, articleId: number): Promise<boolean> {
  if (!userId) return false;
  try {
    const readEntry = await prisma.readArticle.findUnique({
      where: {
        userId_articleId: { userId, articleId }
      },
    });
    return !!readEntry;
  } catch (error) {
    console.error(`(getReadStatus) Échec de la récupération du statut de lecture pour l'article ${articleId}:`, error);
    return false;
  }
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const id = parseInt(params.articleId, 10);
  if (isNaN(id)) return { title: 'Article invalide' };
  const article = await getArticleDetails(id);
  return {
    title: article?.title || 'Article non trouvé',
    description: article?.summary?.substring(0, 150) || "Détails de l&apos;article",
  };
}

async function ArticlePage(props: Props) {
  const params = await props.params;
  const articleId = parseInt(params.articleId, 10);
  if (isNaN(articleId)) notFound();

  const [article, session] = await Promise.all([
    getArticleDetails(articleId),
    getServerSession(authOptions)
  ]);

  if (!article) notFound();

  const userId = session?.user?.id;
  const isRead = userId ? await getReadStatus(userId, article.id) : false;

  return (
    <>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, mt: 2 }}>
          {/* ... (rest of the article details remain the same) ... */}
          <Typography variant="h4" component="h1" gutterBottom>
            {article.title || 'Sans titre'}
          </Typography>

          {article.image_url ? (
            <Box sx={{ my: 3, position: 'relative', width: '100%', paddingTop: '56.25%' }}>
               <Image
                  src={article.image_url}
                  alt={article.title || "Image de l&apos;article"}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
               />
            </Box>
          ) : (
            <Box sx={{ my: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200, backgroundColor: '#f0f0f0' }}>
              <Typography>Pas d&apos;image disponible</Typography>
            </Box>
          )}

          {article.category && (
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Catégorie : {article.category}
            </Typography>
          )}
          {article.Date_Feed && (
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Date du flux : {typeof article.Date_Feed === 'string' ? article.Date_Feed : new Date(article.Date_Feed).toLocaleDateString()}
            </Typography>
          )}
          {article.created_at && (
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Ajouté le : {new Date(article.created_at).toLocaleDateString()}
            </Typography>
          )}
          {article.summary && (
            <Typography variant="body1" paragraph sx={{ mt: 3, whiteSpace: 'pre-wrap' }}>
              {article.summary}
            </Typography>
          )}
          {article.url && (
            <Link href={article.url} target="_blank" rel="noopener noreferrer" sx={{ mt: 2, display: 'inline-block' }}>
              Lire l&apos;article original
            </Link>
          )}
          
          {/* --- Modified Mark as Read Button Section --- */}
          <Box sx={{ mt: 3 }}>
            {session ? (
              // User is logged in: show the functional button
              <MarkAsReadButton
                articleId={article.id}
                isReadInitially={isRead}
              />
            ) : (
              // User is not logged in: show a disabled button with a tooltip
              <Tooltip title="Vous devez être connecté pour marquer un article comme lu.">
                <span> {/* Tooltip requires a wrapping element for disabled buttons */}
                  <Button variant="outlined" disabled>
                    Marquer comme lu
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Paper>
      </Container>
    </>
  );
}

export default ArticlePage;
