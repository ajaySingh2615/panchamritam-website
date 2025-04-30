import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PriceSlider.css';

const PriceSlider = ({ minPrice = 0, maxPrice = 1000 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const [priceRange, setPriceRange] = useState({
    min: parseInt(searchParams.get('minPrice')) || minPrice,
    max: parseInt(searchParams.get('maxPrice')) || maxPrice
  });

  useEffect(() => {
    const newSearchParams = new URLSearchParams(location.search);
    
    if (priceRange.min > minPrice) {
      newSearchParams.set('minPrice', priceRange.min);
    } else {
      newSearchParams.delete('minPrice');
    }

    if (priceRange.max < maxPrice) {
      newSearchParams.set('maxPrice', priceRange.max);
    } else {
      newSearchParams.delete('maxPrice');
    }

    navigate({
      pathname: location.pathname,
      search: newSearchParams.toString()
    });
  }, [priceRange, navigate, location.pathname, minPrice, maxPrice]);

  const handleMinChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => ({
      ...prev,
      min: Math.min(value, priceRange.max)
    }));
  };

  const handleMaxChange = (e) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => ({
      ...prev,
      max: Math.max(value, priceRange.min)
    }));
  };

  return (
    <div className="price-slider">
      <h3>Price Range</h3>
      <div className="price-inputs">
        <div className="price-input">
          <label htmlFor="minPrice">Min</label>
          <input
            type="number"
            id="minPrice"
            value={priceRange.min}
            onChange={handleMinChange}
            min={minPrice}
            max={maxPrice}
          />
        </div>
        <div className="price-input">
          <label htmlFor="maxPrice">Max</label>
          <input
            type="number"
            id="maxPrice"
            value={priceRange.max}
            onChange={handleMaxChange}
            min={minPrice}
            max={maxPrice}
          />
        </div>
      </div>
      <div className="slider-container">
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={priceRange.min}
          onChange={handleMinChange}
          className="slider min"
        />
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={priceRange.max}
          onChange={handleMaxChange}
          className="slider max"
        />
      </div>
    </div>
  );
};

export default PriceSlider; 