import React, { useState } from 'react';
import { Container, Typography, Button, Card, CardContent, CardActions, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useQuery } from 'urql';
import '../styles/GroupManagerDialog.scss';

const API_BASE_URL = 'http://localhost:3000';
const GROUP_API_URL = `${API_BASE_URL}/api/attributeGroups`;

const AttributeQuery = `
  query GetAttributeGroups($filters: [FilterInput!]) {
    groups: attributeGroups(filters: $filters) {
      items {
        uuid
        groupId: attributeGroupId
        groupName
      }
    }
  }
`;

export default function GroupManagerDialog() {
  const [openCreate, setOpenCreate] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [openEdit, setOpenEdit] = useState(false);
  const [editGroupUuid, setEditGroupUuid] = useState('');
  const [editGroupName, setEditGroupName] = useState('');

  const [result, reexecuteQuery] = useQuery({
    query: AttributeQuery,
    variables: { filters: [] },
  });

  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Error loading attribute groups: {error.message}</p>;

  const groups = data.groups.items;

  const handleClickOpenCreate = () => {
    setOpenCreate(true);
  };

  const handleCloseCreate = () => {
    setOpenCreate(false);
    setNewGroupName('');
  };

  const handleClickOpenEdit = (uuid, groupName) => {
    setEditGroupUuid(uuid);
    setEditGroupName(groupName);
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setEditGroupUuid('');
    setEditGroupName('');
  };

  const handleCreateGroup = async () => {
    try {
      const response = await fetch(GROUP_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ group_name: newGroupName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Error: ${response.statusText} - ${data.message}`);
  
      handleCloseCreate();
      reexecuteQuery({ requestPolicy: 'network-only' });
    } catch (error) {
      console.error('Error creating attribute group:', error);
    }
  };

  const handleUpdateGroup = async () => {
    try {
      const response = await fetch(`${GROUP_API_URL}/${editGroupUuid}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ group_name: editGroupName }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(`Error: ${response.statusText} - ${data.message}`);
      
      handleCloseEdit();
      reexecuteQuery({ requestPolicy: 'network-only' });
    } catch (error) {
      console.error('Error updating attribute group:', error);
    }
  };

  const handleDeleteGroup = async (uuid) => {
    try {
      const response = await fetch(`${GROUP_API_URL}/${uuid}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log(`Successfully deleted group with UUID: ${uuid}`);
    } catch (error) {
      console.error('Error deleting attribute group:', error);
    } finally {
      reexecuteQuery({ requestPolicy: 'network-only' });
    }
  };  

  return (
    <Container className="attribute-group-container">
      <Typography variant="h4" className="header-title">Attribute Groups</Typography>
      <Button variant="contained" color="primary" onClick={handleClickOpenCreate} className="create-button">
        Create New Group
      </Button>
      {groups.map((group) => (
        <Card key={group.uuid} className="group-card">
          <CardContent>
            <Typography variant="h5">{group.groupName}</Typography>
            <Typography color="textSecondary">Group ID: {group.groupId}</Typography>
          </CardContent>
          <CardActions>
            <Button size="small" color="primary" onClick={() => handleClickOpenEdit(group.uuid, group.groupName)}>Edit</Button>
            <Button size="small" color="secondary" onClick={() => handleDeleteGroup(group.uuid)}>Delete</Button>
          </CardActions>
        </Card>
      ))}

      {/* Create Group Dialog */}
      <Dialog open={openCreate} onClose={handleCloseCreate}>
        <DialogTitle>Create Attribute Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCreate} color="primary">
            Cancel
          </Button>
          <Button onClick={handleCreateGroup} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit}>
        <DialogTitle>Edit Attribute Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={editGroupName}
            onChange={(e) => setEditGroupName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} color="primary">
            Cancel
          </Button>
          <Button onClick={handleUpdateGroup} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
