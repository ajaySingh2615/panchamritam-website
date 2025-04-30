import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/shop/ProductCard';
import CategoryFilter from '../components/shop/CategoryFilter';
import PriceSlider from '../components/shop/PriceSlider';
import Breadcrumb from '../components/layout/Breadcrumb';
import { API_ENDPOINTS } from '../config/api';
import './Shop.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const productsPerPage = 9;
  
  const location = useLocation();
  const navigate = useNavigate();

  // Parse URL search params
  const searchParams = new URLSearchParams(location.search);
  const categoryParam = searchParams.get('category');
  const categoryName = categoryParam 
    ? categories.find(cat => cat.category_id.toString() === categoryParam)?.name 
    : '';

  // Breadcrumb items
  const breadcrumbItems = categoryParam 
    ? [
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shop' },
        { label: categoryName || 'Category', path: `/shop?category=${categoryParam}` }
      ]
    : [
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shop' }
      ];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const searchParams = new URLSearchParams(location.search);
        const requestUrl = `${API_ENDPOINTS.PRODUCTS}?${searchParams.toString()}`;
        
        const response = await fetch(requestUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }

        const data = await response.json();
        
        if (data.data && data.data.products) {
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
        const response = await fetch(API_ENDPOINTS.CATEGORIES);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Received non-JSON response from server');
        }

        const data = await response.json();
        
        if (data.data && data.data.categories) {
          setCategories(data.data.categories);
        } else {
          console.warn('Unexpected API response structure:', data);
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, [location.search]);

  // Filter products by search term
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle sort change
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    
    // Implement sorting logic
    const sortValue = e.target.value;
    let sortedProducts = [...products];
    
    switch (sortValue) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-desc':
        sortedProducts.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        // Default sorting (by id or whatever default is)
        sortedProducts.sort((a, b) => a.product_id - b.product_id);
    }
    
    setProducts(sortedProducts);
  };

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    // Scroll to top of products
    document.querySelector('.shop-main').scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="shop-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-page">
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button 
            className="retry-button"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate the range of products being shown
  const firstProductShown = filteredProducts.length ? indexOfFirstProduct + 1 : 0;
  const lastProductShown = Math.min(indexOfLastProduct, filteredProducts.length);

  return (
    <div className="shop-page">
      <div className="shop-container">
        {/* Left Sidebar with Filters */}
        <aside className="shop-sidebar">
          <div className="search-filter">
            <h3>Search Products</h3>
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
              <button className="search-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                </svg>
              </button>
            </div>
          </div>
          
          <CategoryFilter categories={categories} />
          <PriceSlider minPrice={0} maxPrice={1000} />
        </aside>

        {/* Main Content Area */}
        <main className="shop-main">
          {/* Breadcrumb */}
          <Breadcrumb items={breadcrumbItems} />
          
          {/* Category Title */}
          <h1 className="category-title">
            {categoryParam 
              ? categoryName || 'Category' 
              : 'Shop'
            }
          </h1>
          
          {/* Shop Header */}
          <div className="shop-header">
            <p className="product-count">
              Showing {firstProductShown}–{lastProductShown} of {filteredProducts.length} results
            </p>
            
            <div className="shop-sort">
              <select 
                className="sort-select" 
                value={sortOption}
                onChange={handleSortChange}
              >
                <option value="default">Default sorting</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No products found matching your criteria.</p>
            </div>
          ) : (
            <div className="products-grid">
              {currentProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
            <div className="pagination">
              <button
                className={`pagination-button ${currentPage === 1 ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Prev
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index}
                  className={`pagination-button ${currentPage === index + 1 ? 'active' : ''}`}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                className={`pagination-button ${currentPage === totalPages ? 'disabled' : ''}`}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Shop; 