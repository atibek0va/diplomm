import React,  { useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import '../styles/RecipeDetailPage.css'

const RecipeDetailPage = () => {
  const { recipeId, fromList, fromFavorite } = useParams(); // Getting recipeId, fromList, and fromFavorite from the URL
  const history = useHistory();

  const [isLiked, setIsLiked] = useState(fromFavorite === 'true'); 
  const [isEditing, setIsEditing] = useState(false);


  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const recipes = [
    {
      id: 1,
      name: 'Besbarmaq',
      region: 'Asia',
      image: '/img/recipes.png',
      description: 'A dish consisting of boiled horse and mutton meat is the most popular Kazakh dish, and the national dish of Kazakhstan. It is also called five fingers because of the way it is eaten.',
      ingredients: [
        { name: 'Beef', amount: '400 grams' },
        { name: 'Peppercorns', amount: '1.33 pieces' },
        { name: 'Eggs', amount: '1.33 pieces' },
        { name: 'Water', amount: '133.33 ml' },
        { name: 'Flour', amount: '400 grams' },
        { name: 'Onion', amount: '1.33 pieces' },
        { name: 'Salt and pepper to taste.', amount: '' },
      ],
      steps: [
        {
          stepTitle: 'Step 1. Boil the Meat',
          description: `Place the meat in a large pot and cover it with cold water.
          Bring to a boil, then reduce the heat and skim off the foam.
          Add salt, bay leaves, and black pepper. Let it simmer for about 2-3 hours until tender.`
        },
        {
          stepTitle: 'Step 2. Prepare the Broth',
          description: `Once the meat is cooked, remove it from the pot and strain the broth.
          Keep the broth warm.`
        },
        {
          stepTitle: 'Step 3. Cook the Noodles',
          description: `Boil the homemade or store-bought Beshbarmak noodles in the broth for a few minutes until soft.`
        },
        {
          stepTitle: 'Step 4. Prepare the Onion Sauce',
          description: `In a separate pan, heat some of the broth and add the thinly sliced onions.
          Let them simmer for 5-7 minutes until soft and translucent.`
        },
        {
          stepTitle: 'Step 5. Assemble the Dish',
          description: `Arrange the cooked noodles on a large serving plate.
          Slice the meat into small pieces and place it on top.
          Pour the onion sauce over the meat.`
        },
        {
          stepTitle: 'Step 6. Serve',
          description: `Garnish with fresh parsley or dill.
          Serve with a bowl of broth on the side.`
        }
      ], 
      prepTime: '30 min',
      cookTime:'30 min',
    },
  ];

  const recipe = recipes.find((r) => r.id === parseInt(recipeId));

  if (!recipe) {
    return <div>Recipe not found</div>;
  }

  const goToMain = () => {
    history.push('/main');
  };

  return (
    <div className="recipe-detail">
      <div className='head'>
        <img src="/img/logo.svg" alt="NutriMind" className='logoo' onClick={goToMain}/>
        <div className="search-container">
          <input type="text" className="search-input" placeholder="Search" />
          <button className="search-button">
            <img src='/img/search.png' alt="search" />
          </button>
        </div>
        <button className="notification-button">
          <img src='/img/notify.png' alt="notification" />
        </button>
        <button className='account'>A</button>
      </div>
  
      <div className="sidebar">
        <nav className='nav'>
          <ul>
            <li><a href="/home"><img src='/img/side1.png' alt="home" />Home</a></li>
            <li><a href="/recipes"><img src='/img/side2.png' alt="recipes" />Recipes</a></li>
            <li><a href="/ai-scanner"><img src='/img/side3.png' alt="scan ai" />Scan AI</a></li>
            <li><a href="#"><img src='/img/side4.png' alt="my products" />My Products</a></li>
            <li><a href="/profile"><img src='/img/side5.png' alt="my profile" />My Profile</a></li>
            <li><a href="/calendar"><img src='/img/side6.png' alt="calendar" />Calendar</a></li>
            <li style={{marginTop:'175px'}}><a href="#"><img src='/img/side7.png' alt="settings"/>Settings</a></li>
            <li><a href="#"><img src='/img/side8.png' alt="sign out" />Sign Out</a></li>
          </ul>
        </nav>
  
        {isEditing ? (
          <div className="update-recipe-form">
            <h2>Update Recipe</h2>
            <form className='form-container'>
              <input type="text" defaultValue={recipe.image} />
              <label>Meal name</label>
              <input type="text" defaultValue={recipe.name} />
              <label>Description</label>
              <textarea defaultValue={recipe.description} />
              <label>Preparation time</label>
              <input type="text" defaultValue={recipe.prepTime} />
              <label>Cooking time</label>
              <input type="text" defaultValue={recipe.cookTime} />
              <button type="submit" className='save-button'>Save</button>
            </form>
          </div>
        ) : (
          <div className="recipe-infos">
            <div className="recipe-header">
              <img src={recipe.image} alt={recipe.name} className="recipe-image" />
              <div className="recipe-infoo">
                <h1>{recipe.name}</h1>
                <p className="recipe-region">{recipe.region}</p>
                <p className="recipe-description">{recipe.description}</p>
                <div className="time-info">
                  <span> <img src='/img/clockk.png'/><strong>Prep:</strong> {recipe.prepTime}</span>
                  <span><img src='/img/clockk.png'/><strong>Cook:</strong> {recipe.cookTime}</span>
                </div>
              </div>
              <div className='btnss'>
                <button 
                  className={`like-button ${isLiked ? 'liked' : ''}`} 
                  onClick={toggleLike}>
                  {isLiked ? '♥' : '♡'}
                </button>
                {fromList === 'true' && (
                  <>
                    <button className="ediit-button" onClick={toggleEdit}><img src='/img/edit.png' alt="edit"/></button>
                    <button className="delete-button"><img src='/img/trash.png'/></button>
                  </>
                )}
              </div>
            </div>
  
            <div className="ingredients-steps-container">
              <div className="ingredients">
                <h3>Ingredients</h3>
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index}>
                    <ul>
                      <li>{ingredient.name}</li>
                      <li>{ingredient.amount}</li>
                    </ul>
                  </li>
                ))}
              </div>
  
              <div className="steps">
                <ol>
                  {recipe.steps.map((step, index) => (
                    <li key={index}>
                      <strong>{step.stepTitle}</strong>
                      <p>{step.description}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
  
            <div className="add-to-plan">
              <button className="add-to-plan-button">Add to Plan</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );  
};

export default RecipeDetailPage;
