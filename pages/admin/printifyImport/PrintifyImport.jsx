import React, { useState } from 'react';
import { Button, Box, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import './styles/PrintifyImport.scss';
import GroupManagerDialog from './components/GroupManagerDialog';
import DeleteProductsDialog from './components/DeleteProductsDialog';
import ProductList from './components/ProductList';

const PrintifyImport = () => {
  const [openGroupDialog, setOpenGroupDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  return (
    <Box className="printify-container">
      <Box className="button-container">
        <Button variant="contained" className="fetch-button" onClick={() => window.location.reload()}>
          Refresh Products
        </Button>
        <Button variant="contained" className="fetch-button" onClick={() => setOpenGroupDialog(true)}>
          Manage Groups
        </Button>
        <Button variant="contained" className="fetch-button" color="secondary" onClick={() => setOpenDeleteDialog(true)}>
        Batch Delete Products
        </Button>
      </Box>

      {/* Group Manager Dialog */}
      <Dialog open={openGroupDialog} onClose={() => setOpenGroupDialog(false)}>
        <DialogContent>
          <GroupManagerDialog />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenGroupDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Products Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Batch Delete Products</DialogTitle>
        <DialogContent>
          <DeleteProductsDialog />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <ProductList />
    </Box>
  );
};

export default PrintifyImport;

export const layout = {
  areaId: 'content',
  sortOrder: 10,
};
