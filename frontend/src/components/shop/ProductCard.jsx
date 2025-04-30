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
    description,
    price,
    image_url,
    category_id,
    quantity
  } = product;

  // Safety check for required fields
  if (!product_id) {
    console.error('Product missing ID:', product);
    return null;
  }

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product);
  };

  // Format price safely, ensuring it's a number
  const formatPrice = (price) => {
    // Convert to number if it's a string, or default to 0 if invalid
    const numericPrice = typeof price === 'string' ? parseFloat(price) : (typeof price === 'number' ? price : 0);
    return isNaN(numericPrice) ? '0.00' : numericPrice.toFixed(2);
  };

  // Log product info on render to help debug
  console.log('ProductCard rendering product:', {
    id: product_id,
    name, 
    category_id
  });

  return (
    <div className="product-card">
      <Link to={`/product/${product_id}`} className="product-link">
        <div className="product-image">
          <img src={image_url || '/placeholder-product.jpg'} alt={name || 'Product'} />
          {(quantity === 0 || quantity === undefined) && (
            <div className="out-of-stock-badge">Out of Stock</div>
          )}
        </div>
        <div className="product-info">
          <h3 className="product-name">{name || 'Unnamed Product'}</h3>
          <p className="product-description">{description || 'No description available'}</p>
          <div className="product-price">${formatPrice(price)}</div>
        </div>
      </Link>
      <button
        className="add-to-cart-button"
        onClick={handleAddToCart}
        disabled={quantity === 0 || quantity === undefined}
      >
        {quantity === 0 || quantity === undefined ? 'Out of Stock' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default ProductCard; 