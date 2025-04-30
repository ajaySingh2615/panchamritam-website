import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import CategoryFilter from '../components/shop/CategoryFilter';
import PriceSlider from '../components/shop/PriceSlider';
import { API_ENDPOINTS } from '../config/api';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const requestUrl = `${API_ENDPOINTS.PRODUCTS}?${searchParams.toString()}`;
        console.log('Fetching products from:', requestUrl);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        
        const response = await fetch(requestUrl);
        
        // Check if the response is not ok
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }

        // Check if the content type is application/json
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }

        const data = await response.json();
        console.log('Products API response:', data); // Debug log
        
        // Extract products from the data.data.products structure
        if (data.data && data.data.products) {
          // Check data structure of the first product if available
          if (data.data.products.length > 0) {
            console.log('Sample product structure:', data.data.products[0]);
            console.log('Price type:', typeof data.data.products[0].price);
          } else {
            console.log('No products returned from API');
          }
          
          // Ensure all products have proper numeric prices
          const processedProducts = data.data.products.map(product => ({
            ...product,
            price: typeof product.price === 'string' ? parseFloat(product.price) : product.price
          }));
          
          setProducts(processedProducts);
        } else {
          console.warn('Unexpected API response structure:', data);
          setProducts([]);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        console.log('Fetching categories from:', API_ENDPOINTS.CATEGORIES);
        const response = await fetch(API_ENDPOINTS.CATEGORIES);
        
        // Check if the response is not ok
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        // Check if the content type is application/json
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }

        const data = await response.json();
        console.log('Categories API response:', data); // Debug log
        
        // Extract categories from the data.data.categories structure
        if (data.data && data.data.categories) {
          console.log('Categories with counts:', data.data.categories);
          setCategories(data.data.categories);
        } else {
          console.warn('Unexpected API response structure:', data);
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        // We don't set the main error state here to allow products to still show
      }
    };

    fetchProducts();
    fetchCategories();
  }, [location.search]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="shop-page">
      <div className="shop-container">
        <aside className="shop-sidebar">
          <CategoryFilter categories={categories} />
          <PriceSlider minPrice={0} maxPrice={1000} />
        </aside>

        <main className="shop-main">
          <div className="shop-header">
            <h1>Shop</h1>
            <p className="product-count">{products.length} products found</p>
          </div>

          {products.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop; 