import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../styles/profile.css';

const ProfilePage = () => {
      const history = useHistory();
      const [isEditing, setIsEditing] = useState(false);

      const handleEditClick = () => {
        setIsEditing(!isEditing);
      };
  
      const goToMain = () => {
          history.push('/main');
        };
  return (
    <div className="profiles">
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

        <div className="profile-container">
          <h1>My Profile</h1>
          <p>Track your weight, monitor weekly calorie intake, and improve your mental well-being with personalized insights. <br/> Stay on top of your health and progress.</p>
          <img src='/img/line.png' className='line' />
          <div className="profile">
            <div className="profile-header">
              <img
                src="/img/profile.png"
                alt="Profile"
                className="profile-img"
              />
              <div className="profile-info">
                <h2>Assel Kemalova</h2>
                <p>asselkamalova@gmail.com</p>
              </div>
            </div>

            <div className="profile-detail">
            <div className="profile-info">
              <div className="profile-info-row">
                <div className="profile-info-item">
                  <label>Full Name</label>
                  <input type="text" placeholder="Your First Name" />
                </div>
                <div className="profile-info-item">
                  <label>Nick Name</label>
                  <input type="text" placeholder="Your First Name" />
                </div>
    </div>

    <div className="profile-info-row">
      <div className="profile-info-item">
        <label>Gender</label>
        <select>
          <option>Male</option>
          <option>Female</option>
        </select>
      </div>
      <div className="profile-info-item">
        <label>Goal weight</label>
        <select>
          {[...Array(111)].map((_, i) => {
            const weight = i + 40;
            return <option key={weight}>{weight} kg</option>;
          })}
        </select>
      </div>
    </div>

    <div className="profile-info-row">
      <div className="profile-info-item">
        <label>Language</label>
        <select>
          <option>Kazakh</option>
          <option>Russian</option>
          <option>English</option>
        </select>
      </div>
      <div className="profile-info-item">
        <label>Weight</label>
        <select>
          {[...Array(111)].map((_, i) => {
            const weight = i + 40;
            return <option key={weight}>{weight} kg</option>;
          })}
        </select>
      </div>
    </div>

    <div className="profile-info-item">
      <label>My email Address</label>
      <span>asselkemail@example.com</span>
    </div>
  </div>
</div>
          </div>
          <div className="weight-tracker">
            <div className="header">
              <div>
              <h2>Today 14.02.2025</h2>
              <p>
                You've set a goal to lose 3kg, tracked 5,000+ calories, and maintained a balanced diet. Keep going and stay healthy!
              </p>
              </div>
              <div className="weight-info-container">
            <div className="weight-info">
              <h3>Weight</h3>
              <p className="current-weight">68kg</p>
              <div className="goal-info">
                <div>
                  <span>-6kg</span>
                </div>
                <div>
                  <span>-3kg</span>
                </div>
              </div>
            </div>
            <div className="pie-chart">
              <svg width="100" height="100" viewBox="0 0 32 32">
                <circle cx="16" cy="16" r="15.9" fill="#470A0A" />
                
                <path
                  d="M 16,16 L 16,0 A 16,16 0 0,1 32,16 Z"
                  fill="#944141"
                />
              </svg>
            </div>

          </div>
            </div>
            <div className="main-content">
              <div className="graph-container">
                <svg viewBox="0 0 720 350" xmlns="http://www.w3.org/2000/svg" className="graph">
                  {/* Background grid */}
                  <g className="grid-lines">
                    <line x1="0" y1="50" x2="720" y2="50" stroke="#eee" strokeWidth="1" />
                    <line x1="0" y1="100" x2="720" y2="100" stroke="#eee" strokeWidth="1" />
                    <line x1="0" y1="150" x2="720" y2="150" stroke="#eee" strokeWidth="1" />
                    <line x1="0" y1="200" x2="720" y2="200" stroke="#eee" strokeWidth="1" />
                    <line x1="0" y1="250" x2="720" y2="250" stroke="#eee" strokeWidth="1" />
                    <line x1="0" y1="300" x2="720" y2="300" stroke="#eee" strokeWidth="1" />
                  </g>

                  {/* Weights graph line */}
                  <path
                    d="M 40 300 C 100 250, 200 200, 300 250 C 400 200, 500 150, 600 180 C 650 220, 700 180, 720 150"
                    fill="transparent"
                    stroke="#6e2c2c"
                    strokeWidth="2"
                  />

                  {/* Labels for days */}
                  <text x="40" y="320" fontSize="12" textAnchor="middle">Mon</text>
                  <text x="120" y="320" fontSize="12" textAnchor="middle">Tue</text>
                  <text x="200" y="320" fontSize="12" textAnchor="middle">Wed</text>
                  <text x="280" y="320" fontSize="12" textAnchor="middle">Thu</text>
                  <text x="360" y="320" fontSize="12" textAnchor="middle">Fri</text>
                  <text x="440" y="320" fontSize="12" textAnchor="middle">Sat</text>
                  <text x="520" y="320" fontSize="12" textAnchor="middle">Sun</text>

                  {/* Labels for weights on the left */}
                  <text x="10" y="50" fontSize="12" textAnchor="middle">68kg</text>
                  <text x="10" y="100" fontSize="12" textAnchor="middle">67kg</text>
                  <text x="10" y="150" fontSize="12" textAnchor="middle">66kg</text>
                  <text x="10" y="200" fontSize="12" textAnchor="middle">65kg</text>
                  <text x="10" y="250" fontSize="12" textAnchor="middle">64kg</text>
                  <text x="10" y="300" fontSize="12" textAnchor="middle">63kg</text>
                </svg>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProfilePage;
