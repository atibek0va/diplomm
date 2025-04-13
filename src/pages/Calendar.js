import React, {useState} from 'react';
import { useHistory } from 'react-router-dom';
import '../styles/Calendar.css';

const Calendar = () => {
  const history = useHistory(); // Call useHistory inside the component

  const goToMain = () => {
    history.push('/main'); // Redirect to /main route
  };

  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // Current month
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear()); // Current year
  const [selectedDay, setSelectedDay] = useState(null); // Store selected day
  const [selectedRecipe, setSelectedRecipe] = useState(null); // Store recipe for the selected day
  

  // Function to change the month
  const handleChangeMonth = (direction) => {
    if (direction === 'prev') {
      if (currentMonth === 0) {
        setCurrentMonth(11);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else if (direction === 'next') {
      if (currentMonth === 11) {
        setCurrentMonth(0);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };
  const getMonthName = (monthIndex) => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    return months[monthIndex];
  };
  

  // Function to handle the day click and display meals for the selected day
  const handleDayClick = (day) => {
    setSelectedDay(day);
    // Set sample recipe for the selected day (can be dynamic later)
    if (day === 18) {
      setSelectedRecipe({
        breakfast: 'Besbarmaq',
        dinner: 'Sirne',
      });
    } else {
      setSelectedRecipe(null); // Clear recipe for other days
    }
  };


  // This function is to generate a simple calendar grid for a given month
  const generateDays = () => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    
    // Ensure the first day is between 0 (Sunday) and 6 (Saturday)
    const calendarDays = [];

    // Add empty days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(null);  // Empty cells for previous month days
    }

    // Add the actual days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      calendarDays.push(i);
    }

    // Fill remaining cells after the last day of the month, to complete the grid (35 days)
    while (calendarDays.length < 35) {
      calendarDays.push(null);  // Empty cells for next month days
    }

    return calendarDays;
  };


  return (
    <div className="calendar-containerr">
      <div className="head">
        <img src="img/logo.svg" alt="NutriMind" className="logoo" onClick={goToMain} />
        <div className="search-container">
          <input type="text" className="search-input" placeholder="Search" />
          <button className="search-button">
            <img src="img/search.png" alt="search" />
          </button>
        </div>
        <button className="notification-button">
          <img src="img/notify.png" alt="notification" />
        </button>
        <button className="account">A</button>
      </div>

      <div className="sidebar">
        <nav className="nav">
          <ul>
            <li><a href="/home"><img src="img/side1.png" alt="home" />Home</a></li>
            <li><a href="/recipes"><img src="img/side2.png" alt="recipes" />Recipes</a></li>
            <li><a href="/ai-scanner"><img src="img/side3.png" alt="scan ai" />Scan AI</a></li>
            <li><a href="#"><img src="img/side4.png" alt="my products" />My Products</a></li>
            <li><a href="/profile"><img src="img/side5.png" alt="my profile" />My Profile</a></li>
            <li><a href="/calendar"><img src="img/side6.png" alt="calendar" />Calendar</a></li>
            <li style={{marginTop: '175px'}}><a href="/settings"><img src="img/side7.png" alt="settings"/>Settings</a></li>
            <li><a href="/"><img src="img/side8.png" alt="sign out" />Sign Out</a></li>
          </ul>
        </nav>
        

        <div className="calen">
        <div className="calendar-header">
        <h2>My calendar</h2>
        <p>
          View your daily and weekly menu, monitor nutrition, and get personalized meal suggestions.
          Stay organized with meal reminders and shopping list integration.
        </p>
        <img src='/img/line.png' className='lines'/>
      </div>
      <div className='cale'>
      <div className="calendar-header-month">
            <span>{`${getMonthName(currentMonth)} ${currentYear}`}</span>

            <div className="calendar-nav">
                <button className="prev-month" onClick={() => handleChangeMonth('prev')}>{"<"}</button>
                <button className="next-month" onClick={() => handleChangeMonth('next')}>{">"}</button>
            </div>
            </div>

            <div className="calendar-grid">
            {/* Week Days */}
            <div className="calendar-days">
                <div className="day">Mo</div>
                <div className="day">Tu</div>
                <div className="day">We</div>
                <div className="day">Th</div>
                <div className="day">Fr</div>
                <div className="day">Sa</div>
                <div className="day">Su</div>
            </div>

            {/* Days of the Month */}
            <div className="calendar-days-content">
                {generateDays().map((day, index) => {
                const isAfterMonthEnd = day === null;
                return (
                    <div
                    key={index}
                    className={`day-box ${day === selectedDay ? 'day-selected' : ''} ${isAfterMonthEnd ? 'after-month-end' : ''}`}
                    onClick={() => day && handleDayClick(day)}
                    >
                    <span>{day || ''}</span>
                    </div>
                );
                })}
            </div>
            </div>

            {selectedRecipe && (
        <div className="dayrecipe">
          <p>Breakfast</p>
          <h6>{selectedRecipe.breakfast}</h6>
          <p>Dinner</p>
          <h6>{selectedRecipe.dinner}</h6>
        </div>
      )}
      </div>
      </div>
      </div>
    </div>
  );
};

export default Calendar;
