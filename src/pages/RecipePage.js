import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../styles/recipes.css'

const recipes = [
  { id: 1,name: 'Besbarmaq', region: 'Asia', image: 'img/recipes.png' },
  { id: 2,name: 'Sirne', region: 'Asia', image: 'img/recipes11.png' },
  { id: 3,name: 'Besbarmaq', region: 'Asia', image: 'img/recipes.png' },
  { id: 4,name: 'Besbarmaq', region: 'Asia', image: 'img/recipes.png' },
  { id: 5,name: 'Besbarmaq', region: 'Asia', image: 'img/recipes.png' },
  { id: 6,name: 'Besbarmaq', region: 'Asia', image: 'img/recipes.png' },
  { id: 7,name: 'Sirne', region: 'Asia', image: 'img/recipes11.png' },
  { id: 8,name: 'Besbarmaq', region: 'Asia', image: 'img/recipes.png' },
  { id: 9,name: 'Besbarmaq', region: 'Asia', image: 'img/recipes.png' },
  { id: 10,name: 'Sirne', region: 'Asia', image: 'img/recipes11.png' },
  
];
const myRecipes = [
    { name: 'Besbarmaq', region: 'Asia', image: 'img/recipes.png' },
    { name: 'Sirne', region: 'Asia', image: 'img/recipes11.png' },
    { name: 'Shashlik', region: 'Asia', image: 'img/recipes.png' },
    { name: 'Sirne', region: 'Asia', image: 'img/recipes11.png' },
    { name: 'Shashlik', region: 'Asia', image: 'img/recipes.png' },
  ];
  const favoriteRecipes = [
    { id:1, name: 'Manti', region: 'Asia', image: 'img/recipes.png' },
    { id:2, name: 'Pilaf', region: 'Asia', image: 'img/recipes11.png' },
    { id:3, name: 'Borscht', region: 'Asia', image: 'img/recipes.png' },
  ];
  

const RecipeGrid = () => {
    const [activeTab, setActiveTab] = useState('curated');
    const [showAddForm, setShowAddForm] = useState(false);
    const history = useHistory();
    

    const goToMain = () => {
        history.push('/main');
      };

      const handleClickRecipe = (recipeId, fromList, fromFavorite) => {
        history.push(`/recipe/${recipeId}/${fromList}/${fromFavorite}`);
      };

        const handleTabClick = (tab) => {
        setActiveTab(tab);
        };
        const myRecipes = recipes.slice(0, 3); 
        const favoriteRecipes = recipes.slice(3, 6); 

  return (
    <div className="recipes">
      <div className='head'>
        <img src="img/logo.svg" alt="NutriMind" className='logoo' onClick={goToMain}/>
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
            <li><a href="/homePage"><img src='img/side1.png' alt="home" />Home</a></li>
            <li><a href="/recipes"><img src='img/side2.png' alt="recipes" />Recipes</a></li>
            <li><a href="/ai-scanner"><img src='img/side3.png' alt="scan ai" />Scan AI</a></li>
            <li><a href="#"><img src='img/side4.png' alt="my products" />My Products</a></li>
            <li><a href="/profile"><img src='img/side5.png' alt="my profile" />My Profile</a></li>
            <li><a href="/calendar"><img src='img/side6.png' alt="calendar" />Calendar</a></li>
            <li style={{marginTop:'175px'}}><a href="#"><img src='img/side7.png' alt="settings"/>Settings</a></li>
            <li><a href="#"><img src='img/side8.png' alt="sign out" />Sign Out</a></li>
          </ul>
        </nav>

        <div className='mainpart'>
  {showAddForm ? (
    <div className="add-recipe-form">
      <h2>Add Recipe</h2>
      <form className="form-container">
        <label>Meal name</label>
        <input type="text" placeholder="Enter your meal name" />

        <label>Description</label>
        <input type="text" placeholder="Enter your meal description" />

        <label>Meal photo</label>
        <input type="file" />

        <label>Number of servings</label>
        <input type="number" placeholder="Enter number of servings" />

        <div className='b'>
        <label>Preparation time, m</label>
        <label>Cooking time, m</label>
        </div>
        <div className="time-inputs">
          <input type="number" placeholder="0 min" />
          <input type="number" placeholder="0 min" />
        </div>

        <label>Ingredients</label>
        <input type="text" placeholder="Add ingredient" />

        <label>Directions</label>
        <input type="text" placeholder="Add step" />

        <button type="submit" className="save-button">Save</button>
      </form>
    </div>
  ) : (
    <>
      <div className="header">
        <h2>Recipes</h2>
        <div className="tabs">
  <button
    className={`tab ${activeTab === 'curated' ? 'active' : ''}`}
    onClick={() => setActiveTab('curated')}
  >
    curated
  </button>
  <button
    className={`tab ${activeTab === 'my' ? 'active' : ''}`}
    onClick={() => setActiveTab('my')}
  >
    my list
  </button>
  <button
    className={`tab ${activeTab === 'favorite' ? 'active' : ''}`}
    onClick={() => setActiveTab('favorite')}
  >
    favorite
  </button>
</div>

      </div>

      <div className="recipe-grid">
      {activeTab === 'curated' && (
        <div className="recipe-grid">
          {recipes.map((recipe, index) => (
            <div className="recipe-card" key={index}>
              <img src={recipe.image} alt={recipe.name} className="recipe-image"  onClick={() => handleClickRecipe(recipe.id, 'false', 'false')}/>
              <div className="recipe-info">
                <div className="recipe-title">{recipe.name}</div>
                <div className="recipe-region">{recipe.region}</div>
              </div>
            </div>
          ))}
        </div>
      )}
        {activeTab === 'my' && myRecipes.map((recipe, index) => (
                <div className="recipe-card" key={index}>
                  <img src={recipe.image} alt={recipe.name} className="recipe-image" onClick={() => handleClickRecipe(recipe.id, 'true', 'false')}/>
                  <div className="recipe-info">
                    <div className="recipe-title">{recipe.name}</div>
                    <div className="recipe-region">{recipe.region}</div>
                  </div>
                </div>
              ))}

              {activeTab === 'favorite' && favoriteRecipes.map((recipe, index) => (
                <div className="recipe-card" key={index}>
                  <img src={recipe.image} alt={recipe.name} className="recipe-image" onClick={() => handleClickRecipe(recipe.id, 'false', 'true')}/>
                  <div className="recipe-info">
                    <div className="recipe-title">{recipe.name}</div>
                    <div className="recipe-region">{recipe.region}</div>
                  </div>
                </div>
              ))}

      </div>


      <div className="add-recipe">
        <button className="add-recipe-button" onClick={() => setShowAddForm(true)}>
          <p className='plus'>+</p>
          <p>Add Meal</p>
        </button>
      </div>
    </>
  )}
</div>

      </div>
    </div>
  );
};

export default RecipeGrid;