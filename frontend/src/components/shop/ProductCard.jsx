import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  // Make sure we have a valid product object
  if (!product || typeof product !== 'object') {
    console.error('Invalid product data:', product);
    return null;
  }

  const { addToCart } = useCart();
  const {
    product_id,
    name,
    price,
    image_url,
    category_name,
    quantity
  } = product;

  // Safety check for required fields
  if (!product_id) {
    console.error('Product missing ID:', product);
    return null;
  }

  // Format price safely, ensuring it's a number
  const formatPrice = (price) => {
    // Convert to number if it's a string, or default to 0 if invalid
    const numericPrice = typeof price === 'string' ? parseFloat(price) : (typeof price === 'number' ? price : 0);
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  const displayCategory = category_name || "Groceries"; // Default to Groceries if no category
  const isOutOfStock = quantity === 0 || quantity === undefined;
  const isOnSale = price && price < 50; // Just an example condition for sale items

  // Handle add to cart
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <li className="product-card">
      <div className="product-thumbnail-wrap">
        {isOnSale && <span className="onsale">Sale!</span>}
        {isOutOfStock && <span className="out-of-stock">Out of Stock</span>}
        
        <Link to={`/product/${product_id}`} className="product-link">
          <img 
            src={image_url || '/placeholder-product.jpg'} 
            alt={name || 'Product'} 
            className="product-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-product.jpg';
            }}
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </Link>
      </div>
      
      <div className="product-summary-wrap">
        <span className="product-category">
          {displayCategory}
        </span>
        
        <Link to={`/product/${product_id}`} className="product-title-link">
          <h2 className="product-title">{name || 'Unnamed Product'}</h2>
        </Link>
        
        <div className="product-rating">
          <div className="star-rating">
            <span style={{ width: '0%' }}>★★★★★</span>
          </div>
        </div>
        
        <span className="product-price">
          <span className="price-amount">£{formatPrice(price)}</span>
        </span>
        
        <button 
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className="add-to-cart-button"
        >
          Add to cart
        </button>
      </div>
    </li>
  );
};

export default ProductCard; 