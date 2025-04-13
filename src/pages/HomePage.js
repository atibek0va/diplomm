// Combined HomePage: logic from original + UI style from second
import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import '../styles/home.css';
import { useHistory } from 'react-router-dom';
import { AuthContext } from '../App';
// import { ThemeContext } from '../contexts/ThemeContext';

function HomePage() {
  // const { theme } = useContext(ThemeContext);
  const history = useHistory();
  const { refreshAuth } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mealPlan, setMealPlan] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: []
  });
  const [meals, setMeals] = useState({
    breakfast: {
      img: 'img/meal.png',
      name: 'Beshbarmak',
      time: '175min',
      calories: '235'
    },
    lunch: {
      img: 'img/meal.png',
      name: 'Lagman',
      time: '120min',
      calories: '310'
    }
  });
  
  const [recipes, setRecipes] = useState([]);
  const [isChecked, setIsChecked] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => setIsChecked(!isChecked);
  const hclick = () => setIsChecked(!isChecked);
  const handleAddMealClick = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
      const goToMain = () => {
          history.push('/main');
        };

  useEffect(() => {
    axios.get('http://localhost:8080/profile', { withCredentials: true })
      .then(res => setUser(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const dateStr = selectedDate.toISOString().split('T')[0];
    axios.get('http://localhost:8080/meal-plan', {
      params: { date: dateStr },
      withCredentials: true
    }).then(res => {
      const grouped = { breakfast: [], lunch: [], dinner: [], snack: [] };
      res.data.forEach(meal => grouped[meal.meal_type]?.push(meal));
      setMealPlan(grouped);
    }).catch(err => console.error(err));
  }, [selectedDate]);

  useEffect(() => {
    axios.get('http://localhost:8080/recipes', { withCredentials: true })
      .then(res => setRecipes(res.data))
      .catch(err => console.error(err));
  }, []);

  const currentDate = new Date();
  const currentDayIndex = currentDate.getDay();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const daysOfCurrentWeek = Array.from({ length: 7 }, (_, index) => {
    const offset = index - currentDayIndex;
    return new Date(currentYear, currentMonth, currentDate.getDate() + offset);
  });

  const handleDayClick = (day) => setSelectedDate(day);

  const getRecipeName = (id) => recipes.find(r => r.id === id)?.name || `Recipe #${id}`;

  return (
    <div className="homepage">
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
      <nav className="nav">
          <ul>
            <li><a href="#"><img src="img/side1.png" alt="home" />Home</a></li>
            <li><a href="/recipes"><img src="img/side2.png" alt="recipes" />Recipes</a></li>
            <li><a href="/ai-scanner"><img src="img/side3.png" alt="scan ai" />Scan AI</a></li>
            <li><a href="#"><img src="img/side4.png" alt="my products" />My Products</a></li>
            <li><a href="/profile"><img src="img/side5.png" alt="my profile" />My Profile</a></li>
            <li><a href="/calendar"><img src="img/side6.png" alt="calendar" />Calendar</a></li>
            <li style={{marginTop: '175px'}}><a href="/settings"><img src="img/side7.png" alt="settings"/>Settings</a></li>
            <li><a href="/"><img src="img/side8.png" alt="sign out" />Sign Out</a></li>
          </ul>
        </nav>

        <div className='mainpart'>
          <div className="calendar-container">
          <div className="calendar-header">
            <div className="calendar-week">
              {daysOfWeek.map((day, index) => {
                const date = daysOfCurrentWeek[index];
                const isSelected = date.getDate() === selectedDate.getDate();
                return (
                  <div
                    key={index}
                    className={`calendar-day-block ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleDayClick(date)}
                    >
                    <div className="calendar-weekday">{day}</div>
                    <div className="calendar-date-circle">
                      {date.getDate()}
                    </div>
                    </div>
                    );
                    })}
                    </div>
        </div>

          </div>

          <div className="meal-title">Breakfast</div>
          <div className="meal-section">
          <div className="meal-details">
          <img 
              src={meals.breakfast.img} 
              alt={meals.breakfast.name} 
              className="meal-img"
            />
            <div className='det'>
            <div className="meal-name">{meals.breakfast.name}</div>
            <div className="meal-info">
              <span>{meals.breakfast.time} - </span>
              <span>{meals.breakfast.calories} calories</span>
            </div>
            </div>
            <button className="circle-button" onClick={handleClick}>
            {isChecked ? (
              <span className="checkmark">✔</span>
            ) : (
              ''
            )}
          </button>
          </div>
          </div>
          <div className="meal-title">Lunch</div>
          <div className="meal-section">
          <div className="meal-details">
          <img 
              src={meals.breakfast.img} 
              alt={meals.breakfast.name} 
              className="meal-img"
            />
            <div className='det'>
            <div className="meal-name">{meals.breakfast.name}</div>
            <div className="meal-info">
              <span>{meals.breakfast.time} - </span>
              <span>{meals.breakfast.calories} calories</span>
            </div>
            </div>
            <button className="circle-button" onClick={hclick}>
            {isChecked ? (
              <span className="checkmark">✔</span>
            ) : (
              ''
            )}
          </button>
          </div>
          </div>
          <div className="add-meal">
            <button className="add-meal-button" onClick={handleAddMealClick}>
              <p className='plus'>+</p>
              <p>Add Meal</p>
            </button>
          </div>
          {isModalOpen && (
            <div className="modal_home">
              <div className="modal-content">
                <button className="close-button" onClick={handleCloseModal}>&times;</button>
                <h2>Add Meal</h2>
                <div className="meal-options">
                  <div className="meal-option"><img src="img/m1.png" alt="Breakfast" /></div>
                  <div className="meal-option"><img src="img/m2.png" alt="Lunch" /></div>
                  <div className="meal-option"><img src="img/m3.png" alt="Dinner" /></div>
                  <div className="meal-option"><img src="img/m4.png" alt="Snacks" /></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
