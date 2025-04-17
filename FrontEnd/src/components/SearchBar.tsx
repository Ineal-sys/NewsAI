'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) {
      // Navigate to a dedicated search results page
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <Box component="form" onSubmit={handleSearch} sx={{ width: '100%', maxWidth: '400px' }}>
      <TextField
        variant="outlined"
        size="small"
        placeholder="Rechercher des articles..."
        fullWidth
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton type="submit" aria-label="search">
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
