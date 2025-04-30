import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import ReviewTabs from '../components/product/ReviewTabs';
import Breadcrumb from '../components/common/Breadcrumb';
import { API_ENDPOINTS } from '../config/api';
import './ProductDetails.css';

const ProductDetails = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log('Attempting to fetch product with ID:', productId);
        const requestUrl = `${API_ENDPOINTS.PRODUCTS}/${productId}`;
        console.log('Fetching product details from:', requestUrl);
        
        const response = await fetch(requestUrl);
        
        if (!response.ok) {
          console.error('Product API error status:', response.status);
          throw new Error(`Failed to fetch product details: ${response.status} ${response.statusText}`);
        }

        // Check if the content type is application/json
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }

        const data = await response.json();
        console.log('Product API full response:', data);
        
        // Try to extract product from different possible locations in the response
        let productData = null;
        
        if (data.data && data.data.product) {
          // Standard API structure from getProductById controller
          productData = data.data.product;
        } else if (data.product) {
          // Alternative structure
          productData = data.product;
        } else if (data.data) {
          // Maybe the product is directly in data.data
          productData = data.data;
        }
        
        if (!productData) {
          console.error('Product not found in API response:', data);
          throw new Error('Product not found in API response');
        }
        
        console.log('Extracted product data:', productData);
        setProduct(productData);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err.message || 'Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setError('No product ID provided');
      setLoading(false);
    }
  }, [productId]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.quantity) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product.quantity > 0) {
      addToCart({ ...product, quantity });
      navigate('/cart');
    }
  };

  // Format price safely, ensuring it's a number
  const formatPrice = (price) => {
    // Convert to number if it's a string, or default to 0 if invalid
    const numericPrice = typeof price === 'string' ? parseFloat(price) : (typeof price === 'number' ? price : 0);
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container">
        <p className="error-message">{error || 'Product not found'}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/shop' },
    { label: product.name, path: `/product/${product.product_id}` }
  ];

  return (
    <div className="product-details-page">
      <div className="product-details-container">
        <Breadcrumb items={breadcrumbItems} />

        <div className="product-details-content">
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={product.image_url || '/placeholder-product.jpg'} 
                alt={product.name} 
              />
            </div>
            <div className="thumbnail-list">
              {product.images?.map((image, index) => (
                <button
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} - ${index + 1}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="product-info">
            <h1 className="product-name">{product.name}</h1>
            <div className="product-price">${formatPrice(product.price)}</div>
            
            <div className="product-meta">
              <span className="availability">
                {product.quantity > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              <span className="category">Category: {product.category_name}</span>
            </div>

            <div className="product-description">
              <h2>Description</h2>
              <p>{product.description}</p>
            </div>

            {product.quantity > 0 && (
              <div className="add-to-cart-section">
                <div className="quantity-selector">
                  <label htmlFor="quantity">Quantity:</label>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={product.quantity}
                    value={quantity}
                    onChange={handleQuantityChange}
                  />
                </div>
                <button 
                  className="add-to-cart-button"
                  onClick={handleAddToCart}
                >
                  Add to Cart
                </button>
              </div>
            )}

            <div className="product-features">
              <h2>Features</h2>
              <ul>
                {product.features?.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <ReviewTabs productId={productId} />
      </div>
    </div>
  );
};

export default ProductDetails; 