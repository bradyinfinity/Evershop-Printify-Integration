// extensions/printify_integration/pages/admin/printifyImport/components/ProductList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { CircularProgress, Pagination, Typography, Box, Card, CardContent } from '@mui/material';
import { fetchData } from '../../../../services/printify';
import AttributeForm from './AttributeForm';
import VariantList from './VariantList';
import '../styles/ProductList.scss';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [groupIds, setGroupIds] = useState({});
  const [variantGroupIds, setVariantGroupIds] = useState({});
  const productsPerPage = 10;

  // Effect to log changes to groupIds
  useEffect(() => {
    console.log('groupIds changed:', groupIds);
  }, [groupIds]); // Dependency array includes groupIds

  useEffect(() => {
    console.log('variantGroupIds changed:', variantGroupIds);
  }, [variantGroupIds]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await fetchData();
      const productData = Array.isArray(data) ? data : data?.products;
      if (productData) setProducts(productData);
      else throw new Error('Invalid data format');
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError('Failed to fetch products. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const currentProducts = products.slice((currentPage - 1) * productsPerPage, currentPage * productsPerPage);

  const handleSubmit = async (event, formData, productId) => {
    event.preventDefault();
    console.log("formData: ", formData)
    try {
      // Step 1: Create the product
      const productResponse = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
  
      if (!productResponse.ok) throw new Error('Failed to create product: ' + productResponse.statusText);
  
      const productResult = await productResponse.json();
      console.log('Product created successfully:', {productResult, formData});
  
      // Extract product_id from the response
      const product_uuid = productResult.data.uuid;
  
      // Step 2: Add product to variant group
      const variantGroupId = variantGroupIds?.[productId] ?? -2;
      if (variantGroupId) {
        const variantGroupResponse = await fetch(`http://localhost:3000/api/variantGroups/${variantGroupId}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: product_uuid.toString() }),
        });
  
        if (!variantGroupResponse.ok) throw new Error('Failed to add product to variant group: ' + variantGroupResponse.statusText);
  
        const variantGroupResult = await variantGroupResponse.json();
        console.log('Product added to variant group successfully:', variantGroupResult);
      } else {
        console.warn('Variant group ID not provided. Skipping variant group association.');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    }
  }  

  const ProductCard = ({ product }) => {
    const currentGroupId = groupIds?.[product.id] ?? -1;
    const currentVariantGroupId = variantGroupIds?.[product.id] ?? -1;
  
    return (
      <Card className="product-card">
        <CardContent>
          <Typography variant="h4" component="div">
            {product.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            ID: {product.id}
          </Typography>
  
          {product.images[0]?.src && (
            <img src={product.images[0].src} alt={product.title} className="product-image h-52 w-52" />
          )}
  
          {/* Pass currentGroupId and setGroupIds to AttributeForm */}
          <AttributeForm product={product} 
            groupId={currentGroupId} setGroupId={setGroupIds}
            variantGroupId={currentVariantGroupId} setVariantGroupId={setVariantGroupIds}
          />
  
          {/* Pass currentGroupId to VariantList */}
          <VariantList product={product} handleSubmit={handleSubmit} groupIds={groupIds} />
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {isLoading ? (
        <CircularProgress className="loading-spinner" />
      ) : error ? (
        <Typography className="error-message">{error}</Typography>
      ) : (
        <>
          <Box className="product-list">
            {currentProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </Box>
          <Pagination
            count={Math.ceil(products.length / productsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            className="pagination"
          />
        </>
      )}
    </Box>
  );
};

export default ProductList;
