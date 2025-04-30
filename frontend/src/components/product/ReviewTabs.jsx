import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../shop/ProductCard';
import { API_ENDPOINTS } from '../../config/api';
import './ReviewTabs.css';

const ReviewTabs = ({ productId }) => {
  // Remove activeTab state since we'll show both sections
  const [reviews, setReviews] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Log what we're trying to fetch
        console.log('Attempting to fetch reviews and related products for:', productId);
        
        // Safer fetch with proper error handling
        const fetchWithErrorHandling = async (url) => {
          try {
            console.log('Fetching from URL:', url);
            const response = await fetch(url);
            
            if (!response.ok) {
              console.error('Error response:', response.status, response.statusText);
              return { error: `Server returned ${response.status}: ${response.statusText}` };
            }
            
            // Check content type before parsing
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              console.error('Non-JSON response received:', contentType);
              return { error: 'Server returned non-JSON response' };
            }
            
            const data = await response.json();
            return { data };
          } catch (err) {
            console.error('Fetch error:', err);
            return { error: err.message };
          }
        };

        // Use the correct API endpoints
        // Temporarily use placeholder data if endpoints don't exist yet
        let reviewsResult = { data: { reviews: [] } };
        let relatedResult = { data: { products: [] } };
        
        try {
          // For now, we only fetch related products as we haven't implemented reviews yet
          // reviewsResult = await fetchWithErrorHandling(`${API_ENDPOINTS.PRODUCTS}/${productId}/reviews`);
          relatedResult = await fetchWithErrorHandling(`${API_ENDPOINTS.PRODUCTS}/${productId}/related`);
          
          // Debug - log the related products response
          console.log('Related products API response:', relatedResult);
        } catch (err) {
          console.warn('API endpoints for reviews/related not implemented yet:', err);
        }
        
        // Set data or empty arrays if error
        setReviews(reviewsResult.data?.reviews || []);
        
        // Handle different possible structures for related products
        let relatedProductsData = [];
        console.log('Processing relatedResult:', relatedResult);
        
        if (relatedResult.data) {
          // Log full data structure for debugging
          console.log('Full related data structure:', JSON.stringify(relatedResult.data));
          
          // Check all possible nesting levels
          if (relatedResult.data.data && Array.isArray(relatedResult.data.data.products)) {
            // Structure: relatedResult.data.data.products
            console.log('Found products at data.data.products');
            relatedProductsData = relatedResult.data.data.products;
          } else if (relatedResult.data.data && Array.isArray(relatedResult.data.data)) {
            // Structure: relatedResult.data.data
            console.log('Found products at data.data');
            relatedProductsData = relatedResult.data.data;
          } else if (Array.isArray(relatedResult.data.products)) {
            // Structure: relatedResult.data.products
            console.log('Found products at data.products');
            relatedProductsData = relatedResult.data.products;
          } else if (Array.isArray(relatedResult.data)) {
            // Structure: relatedResult.data
            console.log('Found products at data');
            relatedProductsData = relatedResult.data;
          }
        }
        
        console.log('Related products data after extraction:', relatedProductsData);
        setRelatedProducts(relatedProductsData);
        
        if (reviewsResult.error || relatedResult.error) {
          console.warn('Some data could not be loaded:', reviewsResult.error, relatedResult.error);
        }
      } catch (err) {
        console.error('Review tabs error:', err);
        setError('Could not load product information. ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    } else {
      setLoading(false);
      setError('No product ID available');
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading additional product information...</p>
      </div>
    );
  }

  return (
    <div className="product-sections">
      {error && (
        <div className="error-message info-message">
          <p>{error}</p>
        </div>
      )}
      
      {/* Reviews Section */}
      <div className="section reviews-section">
        <h2 className="section-title">Reviews</h2>
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.review_id || review.id} className="review-card">
                <div className="review-header">
                  <div className="reviewer-info">
                    <img 
                      src={review.user_profile_picture || '/default-avatar.png'} 
                      alt={review.user_name || 'Reviewer'}
                      className="reviewer-avatar"
                    />
                    <div>
                      <h4>{review.user_name || 'Anonymous'}</h4>
                      <div className="review-rating">
                        {[...Array(5)].map((_, index) => (
                          <span
                            key={index}
                            className={`star ${index < (review.rating || 0) ? 'filled' : ''}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="review-date">
                    {review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Unknown date'}
                  </span>
                </div>
                <p className="review-content">{review.content || review.text || 'No comment'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Related Products Section */}
      <div className="section related-products-section">
        <h2 className="section-title">Related Products</h2>
        {console.log('Rendering related products section with data:', relatedProducts)}
        {relatedProducts.length === 0 ? (
          <p className="no-related">No related products found.</p>
        ) : (
          <div className="related-products-grid">
            {relatedProducts.map((product) => {
              console.log('Rendering related product:', product);
              return (
                <ProductCard key={product.product_id} product={product} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewTabs; 