import React, { useState } from 'react';
import { Container, Typography, TextField, Button } from '@mui/material';

const API_BASE_URL = 'http://localhost:3000';
const ATTRIBUTE_API_URL = `${API_BASE_URL}/api/products`;

export default function BulkDeleteProducts() {
  const [inputValue, setInputValue] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    setSuccess(null);

    // Split the text area input into lines and filter out empty ones
    const ids = inputValue
      .split('\n')
      .map((id) => id.trim().replace(/"/g, ''))
      .filter((id) => id);

    try {
      for (const id of ids) {
        const response = await fetch(`${ATTRIBUTE_API_URL}/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(`Failed to delete ${id}: ${data.message || response.statusText}`);
        }
      }

      setSuccess(`Successfully deleted ${ids.length} products.`);
      setInputValue(''); // Clear the input on success
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Bulk Delete Products
      </Typography>
      <TextField
        label="Enter UUIDs (one per line)"
        placeholder={`"371bffb8-3847-46aa-9b80-4fc8b8f588ae"\n"930cd93d-f1ed-435d-9f80-833eabb4425b"`}
        multiline
        rows={10}
        variant="outlined"
        fullWidth
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        disabled={deleting}
      />
      <Button
        variant="contained"
        color="secondary"
        onClick={handleDelete}
        disabled={deleting || !inputValue.trim()}
        style={{ marginTop: '16px' }}
      >
        {deleting ? 'Deleting...' : 'Delete Products'}
      </Button>
      {success && (
        <Typography color="success.main" style={{ marginTop: '16px' }}>
          {success}
        </Typography>
      )}
      {error && (
        <Typography color="error" style={{ marginTop: '16px' }}>
          {error}
        </Typography>
      )}
    </Container>
  );
}
