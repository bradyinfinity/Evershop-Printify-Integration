import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
} from '@mui/material';
import { useQuery } from 'urql';
import { CATEGORY_QUERY, ATTRIBUTE_QUERY } from '../../../../services/queries';
import '../styles/VariantList.scss';

const VariantList = ({ product, handleSubmit, groupIds }) => {
  const groupId = groupIds?.[product.id] ?? -2;
  const [formDataList, setFormDataList] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedVisibleIndex, setSelectedVisibleIndex] = useState(0); // Track visible variant index

  const [{ data: categoryData }] = useQuery({
    query: CATEGORY_QUERY,
    variables: { filters: [] },
  });

  const [{ data: attributeData }] = useQuery({
    query: ATTRIBUTE_QUERY,
    variables: { filters: [] },
  });

  console.log("attributeData:", attributeData)

  useEffect(() => {
    const initialFormDataList = product.variants
      .map(formatVariant)
      .filter(Boolean);

    setFormDataList(initialFormDataList);
  }, [product, groupId, selectedCategoryId]);

  const formatVariant = (variant) => {
    if (!variant.is_enabled) return null;

    const formattedTitle = variant.title
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();

    const formattedMeta = {
      title: `${product.title} ${variant.title}`
        .replace(/[^\w\s-]/g, '')
        .replace(/\s\s+/g, ' '),
      description: `${product.title} ${variant.title}`
        .replace(/[^\w\s-]/g, '')
        .replace(/\s\s+/g, ' '),
      keywords: `${product.tags.join(', ')}, ${variant.title.replace(/[^\w\s]/g, '')}`,
    };

    console.log("variant:", variant)
    console.log("product:", product)
    console.log("attributeData:", attributeData)

    return {
      name: product.title,
      description:
        new DOMParser().parseFromString(product.description, 'text/html').body
          .textContent || '',
      short_description:
        new DOMParser()
          .parseFromString(product.description, 'text/html')
          .body.textContent?.match(/[^.!?]*[.!?]/)?.toString() || '',
      url_key: `${product.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')}-${formattedTitle}`,
      meta_title: formattedMeta.title,
      meta_description: formattedMeta.description,
      meta_keywords: formattedMeta.keywords,
      status: '1',
      sku: variant.sku ? variant.sku.toString() : '',
      price: variant.price / 100,
      weight: variant.grams / 100,
      qty: variant.qty !== undefined ? variant.qty.toString() : '0',
      manage_stock: '0',
      stock_availability: '1',
      group_id: groupId ? groupId.toString() : '1',
      visibility: '0', // Default visibility to 0
      images: product.images
        .filter(
          (obj) =>
            Array.isArray(obj.variant_ids) && obj.variant_ids.includes(variant.id)
        )
        .map((obj) => obj.src),
      category_id: selectedCategoryId?.toString(),
      attributes: 
      product.options
      .filter(
        (option) =>
          Array.isArray(option.values) &&
          option.values.some((value) => variant.options.includes(value.id))
      )
      .map((option) => {
        const attributeInData = attributeData?.attributes?.items.find(
          (attr) =>
            attr.attributeCode === option.type
        );

        if (!attributeInData) return null;

        const matchingValue = option.values.find((value) =>
          variant.options.includes(value.id)
        );

        if (!matchingValue) return null;

        const matchingOption = attributeInData.options.find(
          (opt) => opt.optionText === matchingValue.title
        );

        return matchingOption
          ? {
              attribute_code: attributeInData.attributeCode,
              value: matchingOption.attributeOptionId,
            }
          : null;
      })
      .filter(Boolean),

    };
  };

  const handleVariantChange = (index, key, value) => {
    setFormDataList((prevData) => {
      const updatedData = [...prevData];
      updatedData[index] = { ...updatedData[index], [key]: value };
      return updatedData;
    });
  };

  const handleCategoryChange = (event) => {
    const newCategoryId = event.target.value;
    setSelectedCategoryId(newCategoryId);

    setFormDataList((prevData) =>
      prevData.map((formData) => ({
        ...formData,
        categoryId: newCategoryId,
      }))
    );
  };

  const handleVisibilityChange = (index) => {
    setSelectedVisibleIndex(index);

    setFormDataList((prevData) =>
      prevData.map((formData, idx) => ({
        ...formData,
        visibility: idx === index ? '1' : '0',
      }))
    );
  };

  const handleCreateAllProducts = (event) => {
    event.preventDefault();
    formDataList.forEach((formData) =>
      handleSubmit(event, formData, product.id)
    );
  };

  const firstEnabledVariant = formDataList[0];

  return (
    <div className="variant-list-container">
      {firstEnabledVariant && (
        <div className="shared-attributes">
          <h4>Shared Attributes</h4>
          <div className="form-group">
            <label>Name:</label>
            <p>{firstEnabledVariant.name}</p>
          </div>
          <div className="form-group">
            <label>Description:</label>
            <p>{firstEnabledVariant.description}</p>
          </div>
          <div className="form-group">
            <label>Short Description:</label>
            <p>{firstEnabledVariant.short_description}</p>
          </div>
          <div className="form-group">
            <label>Quantity:</label>
            <p>{firstEnabledVariant.qty}</p>
          </div>
          <div className="form-group">
            <label>Status:</label>
            <p>{firstEnabledVariant.status}</p>
          </div>
          <div className="form-group">
            <label>Manage Stock:</label>
            <p>{firstEnabledVariant.manage_stock}</p>
          </div>
          <div className="form-group">
            <label>Stock Availability:</label>
            <p>{firstEnabledVariant.stock_availability}</p>
          </div>
          <div className="form-group">
            <label>Group ID:</label>
            <p>{groupId}</p>
          </div>
          <div className="form-group">
            <label>Visibility:</label>
            <p>{firstEnabledVariant.visibility}</p>
          </div>
          <div className="form-group">
            <label>Category ID:</label>
            <FormControl fullWidth>
              <Select
                labelId="category-select-label"
                value={selectedCategoryId || ''}
                onChange={handleCategoryChange}
              >
                {categoryData?.categories?.items.map((category) => (
                  <MenuItem key={category.categoryId} value={category.categoryId}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        </div>
      )}

      <div className="variant-grid">
        {formDataList.map((formData, index) => (
          <Card variant="outlined" key={index} className="variant-card">
            <CardContent>
              <Typography variant="h5">Variant: {formData.sku}</Typography>
              <Grid container spacing={2}>
                {[
                  'url_key',
                  'meta_title',
                  'meta_description',
                  'meta_keywords',
                  'sku',
                  'price',
                  'weight',
                ].map((key) => (
                  <Grid item xs={12} key={key}>
                    <TextField
                      label={key
                        .replace('_', ' ')
                        .replace(/\b\w/g, (char) => char.toUpperCase())}
                      variant="outlined"
                      value={formData[key] || ''}
                      onChange={(e) =>
                        handleVariantChange(
                          index,
                          key,
                          key === 'price' || key === 'weight'
                            ? parseFloat(e.target.value)
                            : e.target.value
                        )
                      }
                      required
                      fullWidth
                      type={key === 'price' || key === 'weight' ? 'number' : 'text'}
                    />
                  </Grid>
                ))}
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Radio
                        checked={selectedVisibleIndex === index}
                        onChange={() => handleVisibilityChange(index)}
                      />
                    }
                    label="Set as Primary"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="contained" size="small" onClick={handleCreateAllProducts}>
        Create All Products
      </Button>
    </div>
  );
};

VariantList.propTypes = {
  product: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  groupIds: PropTypes.object.isRequired,
};

export default VariantList;
