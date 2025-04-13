import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../styles/scanner.css';

const AiScannerPage = () => {
    const history = useHistory();

    const goToMain = () => {
        history.push('/main');
    };

    const [image, setImage] = useState(null);
    const [productData, setProductData] = useState(null); // Added state for product data

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setImage(URL.createObjectURL(file));

        setProductData({
            composition: [
                'Cow’s milk',
                'Bifidobacteria',
                'Lactobacilli',
                'Vitamin D',
                'Vitamin C',
                'Echinacea extract',
                'Natural sugar',
                'Natural flavorings',
            ],
            halalStatus: 'halal',
            additionalInfo: {
                allergens: ['Milk', 'Lactose'],
                nutrition: {
                    calories: '82.0 kcal',
                    protein: '2.8g',
                    fat: '3.2g',
                    carbohydrates: '10.5g',
                },
            },
        });
    };

    return (
        <div className="scanner">
            <div className='head'>
                <img src="img/logo.svg" alt="NutriMind" className='logoo' onClick={goToMain} />
                <div className="search-container">
                    <input type="text" className="search-input" placeholder="Search" />
                    <button className="search-button">
                        <img src='img/search.png' alt="search" />
                    </button>
                </div>
                <button className="notification-button">
                    <img src='img/notify.png' alt="notification" />
                </button>
                <button className='account'>A</button>
            </div>

            <div className="sidebar">
                <nav className='nav'>
                     <ul>
            <li><a href="/home"><img src='img/side1.png' alt="home" />Home</a></li>
            <li><a href="/recipes"><img src='img/side2.png' alt="recipes" />Recipes</a></li>
            <li><a href="#"><img src='img/side3.png' alt="scan ai" />Scan AI</a></li>
            <li><a href="#"><img src='img/side4.png' alt="my products" />My Products</a></li>
            <li><a href="/profile"><img src='img/side5.png' alt="my profile" />My Profile</a></li>
            <li><a href="/calendar"><img src='img/side6.png' alt="calendar" />Calendar</a></li>
            <li style={{marginTop:'175px'}}><a href="#"><img src='img/side7.png' alt="settings"/>Settings</a></li>
            <li><a href="#"><img src='img/side8.png' alt="sign out" />Sign Out</a></li>
          </ul>
                </nav>

                <div className="upload-container">
                    <h1>Check Ingredients & Halal Status</h1>
                    <p>Easily scan any product to view its ingredients and determine if it is halal. Get instant results and make <br />informed choices.</p>
                    <img src='/img/line.png' className='line' />
                    <div className='solid'>
                        <div className="upload-box">
                            <input
                                type="file"
                                accept="image/*"
                                id="upload-image"
                                onChange={handleImageUpload}
                                className="upload-input"
                            />
                            <label htmlFor="upload-image" className="upload-label">
                                <img src={image ? image : '/img/placeholder.png'} alt="Upload" className="uploaded-image" />
                                <span className="upload-text">Upload image</span>
                                <p>Scan the product to check its ingredients and verify if it is halal.</p>
                            </label>
                        </div>
                    </div>

                    {productData && (
                        <div className="pr-info">
                          <img src='/img/refresh.png' className='refresh'/>
                          <div className='product-info'>
                            <div className='img-box'>
                              <img src={image ? image : '/img/placeholder.png'} alt="Upload" className="uploaded-image" />
                            </div>
                            <div className='pr-infos'>
                            <h3>Product Composition:</h3>
                              <ul>
                                  {productData.composition.map((item, index) => (
                                      <li key={index}>{item}</li>
                                  ))}
                              </ul>
                              <img src='/img/line.png' className='inf'/>
                              <h3>Halal Status:</h3>
                              <p>{productData.halalStatus}</p>

                              <img src='/img/line.png' className='inf'/>

                              <h3>Additional Information:</h3>
                              <h5 className='v'><strong>Allergens:</strong> {productData.additionalInfo.allergens.join(', ')}</h5>
                              <img src='/img/line.png' className='inf'/>
                              <h5 className='v'><strong>Nutritional value:</strong></h5>
                              <ul className='v'>
                                  <li>Calories: {productData.additionalInfo.nutrition.calories}</li>
                                  <li>Protein: {productData.additionalInfo.nutrition.protein}</li>
                                  <li>Fat: {productData.additionalInfo.nutrition.fat}</li>
                                  <li>Carbohydrates: {productData.additionalInfo.nutrition.carbohydrates}</li>
                              </ul>
                            </div>
                          </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AiScannerPage;
