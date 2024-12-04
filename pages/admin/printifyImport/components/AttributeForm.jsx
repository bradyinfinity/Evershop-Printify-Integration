import React, { useState, useEffect } from 'react';
import {
  Button,
  Checkbox,
  FormControlLabel,
  TextField,
  Alert,
  AlertTitle,
  Typography,
} from '@mui/material';
import { useQuery } from 'urql';
import { ATTRIBUTE_GROUP_QUERY, ATTRIBUTE_QUERY } from '../../../../services/queries';
import '../styles/AttributeForm.scss';

const GROUP_API_URL = 'http://localhost:3000/api/attributeGroups';
const ATTRIBUTE_API_URL = 'http://localhost:3000/api/attributes';

const AttributeForm = ({ product, groupId, setGroupId, variantGroupId, setVariantGroupId }) => {
  const [groupName, setGroupName] = useState(`${product.id}`);
  const [groupExists, setGroupExists] = useState(false);
  const [attributeStates, setAttributeStates] = useState(
    product.options.map((option) => ({
      attributeName: option.type.toUpperCase(),
      isRequired: 1,
      displayOnFrontend: 1,
      isFilterable: 1,
    }))
  );
  const [alert, setAlert] = useState({ type: '', message: '', open: false });
  const [existingAttributes, setExistingAttributes] = useState([]);
  const [isAnyAttributeCreated, setIsAnyAttributeCreated] = useState(false);

  const [{ data, fetching, error }, reexecuteQuery] = useQuery({
    query: ATTRIBUTE_GROUP_QUERY,
    variables: { filters: [] },
  });

  const [{ data: attributeData }, reexecuteAttributeQuery] = useQuery({
    query: ATTRIBUTE_QUERY,
    variables: { filters: [] },
  });

  useEffect(() => {
    if (data) {
      const existingGroup = data.groups.items.find((group) => group.groupName === groupName);
      setGroupExists(Boolean(existingGroup));
  
      if (existingGroup && groupId[product.id] !== existingGroup.groupId) {
        // Set `groupId` only if it's different to avoid redundant updates
        setGroupId((prev) => {
          if (prev[product.id] === existingGroup.groupId) return prev; // Prevent unnecessary updates
          const updatedGroupIds = {
            ...prev,
            [product.id]: existingGroup.groupId,
          };
          return updatedGroupIds;
        });
      }
    }
  }, [data, groupName, product.id, setGroupId]);

  useEffect(() => {
    if (attributeData) {
      const attributes = attributeData.attributes.items;
      if (JSON.stringify(existingAttributes) !== JSON.stringify(attributes)) {
        setExistingAttributes(attributes);
      }
  
      const attributeCodes = product.options.map(option => option.type);
      const createdAttributes = attributes.some(attr => attributeCodes.includes(attr.attributeCode));
      setIsAnyAttributeCreated(createdAttributes);
    }
  }, [attributeData, product.options, existingAttributes]);

  const handleCreateGroup = async () => {
    if (groupExists) return;
  
    try {
      const response = await fetch(GROUP_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ group_name: groupName }),
      });
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error('Failed to create group: ' + errorMessage);
      }
  
      const newGroupData = await response.json();
      console.log("Group created successfully with ID:", newGroupData);
  
      setAlert({ type: 'success', message: 'Group created successfully', open: true });
  
      // Update groupExists immediately
      setGroupExists(true);
  
      // Update groupId with the new group ID
      setGroupId((prev) => ({
        ...prev,
        [product.id]: newGroupData.data.attribute_group_id,
      }));
  
      // Trigger re-fetch of group data for consistency
      reexecuteQuery({ requestPolicy: 'network-only' });
    } catch (error) {
      console.error('Error creating group:', error.message);
      setAlert({ type: 'error', message: 'Error creating group: ' + error.message, open: true });
    }
  };

  const handleCreateAllAttributes = async () => {
    if (!groupId) return;
  
    product.options.forEach(async (option, index) => {
      const attributeCode = option.type;
      const newOptions = option.values
        .filter(value =>
          product.variants.some(
            variant => variant.is_enabled && variant.options.includes(value.id)
          )
        )
        .map(value => ({
          option_text: value.title,
          option_id: value.id,
        }));
  
      // Check if attribute exists
      const existingAttribute = existingAttributes.find(
        attr => attr.attributeCode === attributeCode
      );
  
      if (existingAttribute) {
        // Compare existing options with new options
        const existingOptionTexts = new Set(
          existingAttribute.options.map(opt => opt.option_text)
        );
        const missingOptions = newOptions.filter(
          opt => !existingOptionTexts.has(opt.option_text)
        );
  
        if (missingOptions.length > 0) {
          // Update attribute with missing options
          await updateAttribute(existingAttribute.attributeId, {
            attribute_name: existingAttribute.attributeName,
            attribute_code: existingAttribute.attributeCode,
            options: [...existingAttribute.options, ...missingOptions],
            is_required: existingAttribute.isRequired,
            display_on_frontend: existingAttribute.displayOnFrontend,
            is_filterable: existingAttribute.isFilterable,
            groups: [groupId],
          });
        } else {
          console.log(`Attribute ${attributeCode} is already up-to-date.`);
        }
      } else {
        // Create a new attribute
        await createAttribute({
          attribute_name: option.type.toUpperCase(),
          attribute_code: attributeCode,
          is_required: attributeStates[index].isRequired,
          display_on_frontend: attributeStates[index].displayOnFrontend,
          is_filterable: attributeStates[index].isFilterable,
          groups: [groupId],
          type: 'select',
          options: newOptions,
        });
      }
    });
  
    reexecuteAttributeQuery({ requestPolicy: 'network-only' });
  };  
  
  // Function to update existing attribute
  const updateAttribute = async (attributeId, payload) => {
    try {
      const response = await fetch(`${ATTRIBUTE_API_URL}/${attributeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update attribute: ' + await response.text());
      }
  
      console.log(`Attribute ${attributeId} updated successfully.`, {attributeId, payload});
    } catch (error) {
      console.error('Error updating attribute:', error.message);
    }
  };
  
  // Function to create a new attribute
  const createAttribute = async (payload) => {
    try {
      const response = await fetch(ATTRIBUTE_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      if (!response.ok) {
        throw new Error('Failed to create attribute: ' + await response.text());
      }
  
      console.log('Attribute created successfully.', payload);
    } catch (error) {
      console.error('Error creating attribute:', error.message);
    }
    // console.log("ca:", payload)
  };

  const handleCreateVariantGroup = async () => {
    const payload = {
      attribute_codes: product.options.map(option => option.type),
      attribute_group_id: groupId,
    };
  
    try {
      const response = await fetch('http://localhost:3000/api/variantGroups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
  
      console.log('payload:', payload);
  
      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error('Failed to create variant group: ' + errorMessage);
      }
  
      const responseData = await response.json();
      console.log('Variant group created successfully:', responseData);
  
      // Update variantGroupIds in the parent state
      setVariantGroupId((prev) => ({
        ...prev,
        [product.id]: responseData.data.uuid,
      }));
  
      setAlert({ type: 'success', message: 'Variant group created successfully', open: true });
    } catch (error) {
      console.error('Error creating variant group:', error.message);
      setAlert({ type: 'error', message: 'Error creating variant group: ' + error.message, open: true });
    }
  };  

  const handleCheckboxChange = (index, field) => {
    setAttributeStates((prevStates) =>
      prevStates.map((state, idx) => 
        idx === index 
          ? { ...state, [field]: state[field] === 1 ? 0 : 1 } 
          : state
      )
    );
    console.log(`Checkbox state updated at index ${index} for ${field}`);
  };

  const handleAttributeNameChange = (index, newName) => {
    setAttributeStates((prevStates) =>
      prevStates.map((state, idx) =>
        idx === index ? { ...state, attributeName: newName } : state
      )
    );
  };

  return (
    <div className="attribute-form">
      {alert.open && (
        <Alert severity={alert.type} onClose={() => setAlert({ ...alert, open: false })}>
          <AlertTitle>{alert.type === 'success' ? 'Success' : 'Error'}</AlertTitle>
          {alert.message}
        </Alert>
      )}

      <div className="group-create-section">
        <TextField
          label="Group Name"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          variant="outlined"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateGroup}
          disabled={groupExists}
        >
          {groupExists ? 'Group Already Exists' : 'Create Group'}
        </Button>
      </div>

      <div className="attribute-grid">
        {product.options.map((option, index) => (
          <div key={index} className="attribute-option">
            <Typography
              variant="h6"
              sx={{
                color: 'black',
                padding: '4px',
                borderRadius: '6px',
                textAlign: 'center',
                boxSizing: 'border-box',
                textTransform: 'uppercase',
                fontWeight: 'bold',
                border: '2px solid white',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                margin: '0 auto',
                width: 'fit-content',
              }}
            >
              {option.type}
            </Typography>
            <TextField
              label="Attribute Name"
              value={attributeStates[index].attributeName}
              onChange={(e) => handleAttributeNameChange(index, e.target.value)}
              variant="outlined"
              fullWidth
            />
            <p><strong>Attribute Code:</strong> {option.type}</p>
            <p><strong>Group ID:</strong> [{groupId || 'N/A'}]</p>
            <p><strong>Type:</strong> Select</p>
            <div>
            <FormControlLabel
              control={
                <Checkbox
                  checked={attributeStates[index].isRequired === 1}
                  onChange={() => handleCheckboxChange(index, 'isRequired')}
                />
              }
              label="Required"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={attributeStates[index].displayOnFrontend === 1}
                  onChange={() => handleCheckboxChange(index, 'displayOnFrontend')}
                />
              }
              label="Display on Frontend"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={attributeStates[index].isFilterable === 1}
                  onChange={() => handleCheckboxChange(index, 'isFilterable')}
                />
              }
              label="Filterable"
            />
            </div>
          </div>
        ))}
      </div>

      <div className="create-attribute-button">
        <Button
          variant="contained"
          color="primary"
          onClick={handleCreateAllAttributes}
          disabled={isAnyAttributeCreated}
        >
          {isAnyAttributeCreated ? 'Attributes Already Created' : 'Create All Attributes'}
        </Button>
      </div>
      <div className="create-attribute-button">
        <Button
          variant="contained"
          color="secondary"
          onClick={handleCreateVariantGroup}
          disabled={!!(variantGroupId != -1)}
          style={{
            marginTop: '20px',
            backgroundColor: !!(variantGroupId != -1) ? '#b0bec5' : '#1e88e5',
            color: '#ffffff',
            cursor: !!(variantGroupId != -1) ? 'not-allowed' : 'pointer',
          }}
        >
          {(variantGroupId != -1) ? 'Variant Group Already Created' : 'Create Variant Group'}
        </Button>
      </div>
    </div>
  );
};

export default AttributeForm;