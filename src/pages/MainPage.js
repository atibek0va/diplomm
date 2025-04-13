import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import '../styles/MainPage.css';



function Header() {
  const navigate = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignUpModal, setIsSignUpModal] = useState(false);
  const [isForgotPasswordModal, setIsForgotPasswordModal] = useState(false);
  const [isCodeModal, setIsCodeModal] = useState(false);
  const [isNewPasswordModal, setIsNewPasswordModal] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  const openSignUpModal = () => setIsSignUpModal(true);
  const closeeModal = () => setIsSignUpModal(false);
  const openForgotPasswordModal = () => setIsForgotPasswordModal(true);
  const closeForgotPasswordModal = () => setIsForgotPasswordModal(false);
  const openCodeModal = () => setIsCodeModal(true);
  const closeCodeModal = () => setIsCodeModal(false);
  const openNewModal = () => setIsNewPasswordModal(true);
  const closeNewModal = () => setIsNewPasswordModal(false);

  const history = useHistory();

const handleLoginClick = (e) => {
  e.preventDefault();
  history.push('/homePage');
  closeModal();
};


  const testimonialsData = [
    {
      name: 'Kemalova Assel',
      image: '/img/assel1.png',
      review:
        '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt”',
      rating: 5,
    },
    {
      name: 'Kemalova Assel',
      image: '/img/assel2.png',
      review:
        '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt”',
      rating: 5,
    },
    {
      name: 'Kemalova Assel',
      image: '/img/assel3.png',
      review:
        '“Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt”',
      rating: 5,
    },
  ];
  
  const StarRating = ({ rating }) => {
    return (
      <div className="star-rating">
        {[...Array(5)].map((_, i) => (
          <span key={i} className={i < rating ? 'filled-star' : 'empty-star'}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const recipes = [
    {
      title: 'Beshbarmaq(Et)',
      image: 'img/recipes1.png',
      description: `A dish consisting of boiled horse or mutton meat is the most popular Kazakh dish, and the national dish of Kazakhstan. It is also called "five fingers" because of the way it is eaten.`,
      prepTime: '2h',
    },
    {
      title: 'Shrimp & Arugula Gourmet Salad',
      image: 'img/recipes2.png',
      description: `The salad consists of arugula, shrimp, cherry tomatoes, avocado, and cottage cheese. The salad is dressed with lemon juice, olive oil, and garnished with balsamic cream. Served fresh.`,
      prepTime: '2h',
    },
    {
      title: 'Creamy Tomato Penne',
      image: 'img/recipes3.png',
      description: `Penne pasta in a rich and creamy tomato sauce with aromatic spices. The dish is garnished with fresh herbs, adding a touch of freshness and an appetizing look.`,
      prepTime: '2h',
    },
  ];

  const [liked, setLiked] = useState(Array(recipes.length).fill(false));

  const toggleLike = (index) => {
    const updatedLikes = [...liked];
    updatedLikes[index] = !updatedLikes[index];
    setLiked(updatedLikes);
  };

  return (
    <div>
      <header className="header">
        <img src="/img/logo.svg" alt="Logo" className="logo" />

        <nav>
          <ul>
            <li><a href="#hero">Home</a></li>
            <li><a href="#features">Features</a></li> 
            <li><a href="#reviews">Review</a></li>
            <li><a href="#contact">Contact</a></li>
          </ul>
        </nav>

        <img src="./img/211817_search_strong_icon 1.png" alt="Search" className="icon" />

        <div className="btns">
          <button id="loginBtn" className="log" onClick={openModal}>Login</button>
          <button className="sign" onClick={openSignUpModal}>Sign up</button>
        </div>

        {isModalOpen && (
         <div className="modal-overlay">
         <div className="modal-content">
           <button className="close-btn" onClick={closeModal}>&times;</button>
           <h2>Welcome to NutriMind</h2>
           <form>
             <label htmlFor="email">Email address:</label>
             <input type="email" id="email" name="email" placeholder="Enter your email address" required />
 
             <label htmlFor="password">Password:</label>
             <input type="password" id="password" name="password" placeholder="Enter your password" required />
 
             <a href="#" onClick={(e) => { e.preventDefault();  closeModal(); openForgotPasswordModal(); }}>Forgot Password?</a>
             <button type="submit" style={{marginTop:"20px"}} className="login-btn" onClick={handleLoginClick}>Login</button>
 
             <p style={{marginTop:"20px"}}>OR</p>
 
             <button className="social-login facebook">Login with Facebook</button>
             <button className="social-login google"><img src='img/google.png' style={{marginRight:'10px'}}/>Login with Google</button>
             <p class="con">By continuing, you agree to NutriMind’s Terms of Service and acknowledge that you have read our Privacy Policy. Notice</p>
           </form>
           
           <p className="signup-link">Don't have an account? <a href="#" onClick={(e) => { e.preventDefault();  closeModal(); openSignUpModal(); }}>Sign Up</a></p>
         </div>
       </div>
      )}

      {isSignUpModal &&(
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-btn" onClick={closeeModal}>&times;</button>
            <h2>Welcome to NutriMind</h2>
            <form>
              <label htmlFor="email">Email address:</label>
              <input type="email" id="email" name="email" placeholder="Enter your email address" required />

              <label htmlFor="password">Password:</label>
              <input type="password" id="password" name="password" placeholder="Create a password" required />

              <label htmlFor="dob">Date of birth:</label>
              <input type="date" id="dob" name="dob" placeholder="DD.MM.YYYY" required />

              <button type="submit" className="login-btn">Sign Up</button>

              <p style={{marginTop:"20px"}}>OR</p>

              <button className="social-login google"><img src='img/google.png' style={{marginRight:'10px'}}/>Login with Google</button>
              <p className="con">
                By continuing, you agree to NutriMind’s Terms of Service and acknowledge that you have read our Privacy Policy. Notice
              </p>
            </form>

            <p className="signup-link">Already registered? <a href="#" onClick={(e) => { e.preventDefault();  closeeModal(); openModal(); }}>Login</a></p>
          </div>
        </div>
      )}

      {isForgotPasswordModal && (
              <div className="modal-overlay">
                <div className="modal-content1">
                  <button className="close-btn" onClick={closeForgotPasswordModal}>&times;</button>
                  <h2>Forgot your Password</h2>
                  <form>
                    <p>We will send a verification code to your email so you can reset your password.</p>

                    <label htmlFor="email">Email address:</label>
                    <input type="email" id="email" name="email" placeholder="Enter your email address" required />

                    <button type="submit" className="login-btn" onClick={(e) => { e.preventDefault();  closeForgotPasswordModal(); openCodeModal(); }}>Get Code</button>
                  </form>

                  <p className="signup-link">Remember your password? <a href="#" onClick={(e) => { e.preventDefault(); closeForgotPasswordModal(); openModal(); }}>Login</a></p>
                </div>
              </div>
            )}


      {isCodeModal && (
              <div className="modal-overlay">
                <div className="modal-content1">
                  <button className="close-btn" onClick={closeCodeModal}>&times;</button>
                  <h2>Forgot your Password</h2>
                  <form>
                    <p>We will send a verification code to your email so you can reset your password.</p>

                    <label htmlFor="number">Enter Code</label>
                    <input type="number" id="number" name="email" placeholder="Enter your verification code" required />

                    <button type="submit" className="login-btn" onClick={(e) => { e.preventDefault();  closeCodeModal(); openNewModal(); }}>Verify</button>
                  </form>

                  <p className="signup-link"><a href="#">Resend code</a></p>
                </div>
              </div>
            )}

      {isNewPasswordModal && (
              <div className="modal-overlay">
                <div className="modal-content1">
                  <button className="close-btn" onClick={closeCodeModal}>&times;</button>
                  <h2>Create new password</h2>
                  <form>
                    <label htmlFor="new">New password</label>
                    <input type="password" id="new" name="email" placeholder="Enter your password" required />

                    <label htmlFor="new">Repeat new password</label>
                    <input type="password" id="new" name="email" placeholder="Repeat new password" required />

                    <button type="submit" className="login-btn">Verify</button>
                  </form>

                  <p className="signup-link"><a href="#">Resend code</a></p>
                </div>
              </div>
            )}

      </header>

      <section className="hero">
        <div className="hero-text">
          <h2>Discover New <br /> <span className="gr">Recipes</span> <br /> Effortlessly!</h2>
          <p>Scan, analyze, and cook with your ingredients. Track your pantry and make healthy, informed shopping choices.</p>
          <button className="cta-btn">Get Started</button>
        </div>
        <div className="hero-image">
          <img src="img/mainphoto.png" alt="Hero" />
        </div>
      </section>

      <section className="features">
      <img src="./img/line.png" alt="line"/>
      <h2>Our <span style={{color:"#376326"}}>Smart</span> Features</h2>
      <div className="feature">
        <div className="feature-text">
          <img src="./img/feature1.png" alt="Feature 1" />
          <p>Scan <span style={{color:"#376326"}}>analyse</span> ingridients with <br></br><span style={{color:"#376326"}}>our</span> platform</p>
        </div>
        <div className="feature-text">
          <img src="./img/feature2.png" alt="Feature 2" />
          <p>Recipe <span style={{color:"#376326"}}>Generation</span> with <span style={{color:"#376326"}}>our</span> <br></br> platform</p>
        </div>
        <div className="feature-text">
          <img src="./img/feature3.png" alt="Feature 3" />
          <p>Recipe <span style={{color:"#376326"}}>Generation</span> with <span style={{color:"#376326"}}>our</span> <br></br> platform</p>
        </div>
        <div className="feature-text">
          <img src="./img/feature4.png" alt="Feature 4" />
          <p>Create <span style={{color:"#376326"}}>Your</span> Recipe & Daily <span style={{color:"#376326"}}>Menu</span> <br></br> Calendar</p>
        </div>
      </div>
      <img src="./img/line.png" alt="line"/>
      </section>

      <section className="recipes-container">
      <h2 className="title">Recipes <span style={{color:"black"}}>in</span> Life</h2>
      <div className="card-group">
        {recipes.map((recipe, index) => (
          <div className="card" key={index}>
            <img src={recipe.image} alt={recipe.title} className="card-image" />
            <h3 className="card-title">{recipe.title}</h3>
            <p className="card-description">{recipe.description}</p>
            <div className="card-footer">
            <span>⏱ Prep: {recipe.prepTime}</span>
            <button
                className={`like-button ${liked[index] ? 'liked' : ''}`}
                onClick={() => toggleLike(index)}
              >
                {liked[index] ? '❤️ Liked' : '🤍 Like'}
              </button>
              <button className="update-button">✏️ Update</button>
            </div>
          </div>
        ))}
      </div>
      <img src="img/line.png" className='lini'></img>
    </section>

    <section className="ratings-container">
      <h2 className="ratings-title">
        What <span className="highlight">Our</span> Client <span className="highlight">Say</span>
      </h2>
      <div className="ratings-cards">
        {testimonialsData.map((item, index) => (
          <div className="ratings-card" key={index}>
            <div className="ratings-image-wrapper">
              <img src={item.image} alt={item.name} className="ratings-image" />
            </div>
            <h3 className="ratings-name">{item.name}</h3>
            <p className="ratings-review">{item.review}</p>
            <StarRating rating={item.rating} />
          </div>
        ))}
      </div>
      <img src="img/line.png" className='lini'></img>
    </section>


    <section className="contact-container">
      <div className="contact-info">
        <h2>Contact Information</h2>
        <p>Say something to start a live chat!</p>
        <div className="info-details" style={{marginTop: "110px"}}>
        <img src='img/loc3.png'/> <p>+77473644672</p>
        </div>
        <div className="info-details">
        <img src='img/loc2.png'/> <p>nutrimind@gmail.com</p>
        </div>
        <div className="info-details">
        <img src='img/loc3.png'/> <p>Kaskelen city. Abylaykhan 1/1</p>
        </div>
        <div className="social-icons">
          <a href="#" target="_blank" rel="noopener noreferrer">
            <img src="img/twit.png" alt="Twitter"/>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <img style={{marginTop: "20px"}} src="img/insta.png" alt="Instagram"/>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer">
            <img src="img/discord.png" alt="Discord"/>
          </a>
        </div>
      </div>

      <div className="contact-form">
        <form>
            <div className="form-group">
              <label htmlFor="first-name">First Name</label>
              <input type="text" id="first-name" name="first-name" />
            </div>
            <div className="form-group">
              <label htmlFor="last-name">Last Name</label>
              <input type="text" id="last-name" name="last-name" />
            </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" />
          </div>
          <div className="form-group">
            <label htmlFor="message" style={{marginTop:"145px"}}>Message</label>
            <textarea id="message" name="message" className='ff' placeholder='Write your message..'></textarea>
          </div>
          <button type="submit">Send Message</button>
        </form>
      </div>
    </section>

    <footer>
  <div className="footer-content">
    <div className='reach'>
    <p className='r'>Reach us</p>
    <div className="info-details">
        <img src='img/loc3.png'/> <p>+77473644672</p>
        </div>
        <div className="info-details">
        <img src='img/loc2.png'/> <p>nutrimind@gmail.com</p>
        </div>
        <div className="info-details">
        <img src='img/loc3.png'/> <p>132 Dartmouth Street Boston, <br/> Massachusetts 02156 United States</p>
        </div>
         </div>
    <p>&copy; 2025 Your Company. All rights reserved.</p>
  </div>
</footer>

    </div>
  );
}

export default Header;
