package main

import (
	"encoding/json"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"net/smtp"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"bytes"
	"context"
	"encoding/base64"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/url"

	"github.com/gin-contrib/cors"
	"github.com/gin-contrib/sessions"
	"github.com/gin-contrib/sessions/cookie"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID             uint    `json:"id" gorm:"primaryKey"`
	Email          string  `json:"email" gorm:"unique;not null"`
	Username       string  `json:"username"`
	Password       string  `json:"password"`
	Role           string  `json:"role"`
	FullName       string  `json:"full_name"`
	Gender         string  `json:"gender"`
	Weight         float64 `json:"weight"`
	GoalWeight     float64 `json:"goal_weight"`
	ProfilePicture string  `json:"profile_picture"`
}

type Recipe struct {
	ID          uint            `json:"id" gorm:"primaryKey"`
	Description string          `json:"description"`
	Serving     int             `json:"serving"`
	Name        string          `json:"name"`
	Image       string          `json:"image"`
	CookingTime int             `json:"cooking_time"`
	Calories    int             `json:"calories"`
	Ingredients json.RawMessage `json:"ingredients" gorm:"type:jsonb"`
	Steps       json.RawMessage `json:"steps" gorm:"type:jsonb"`
	UserID      uint            `json:"user_id"`
}

type Product struct {
	ID     int    `json:"id" gorm:"primaryKey"`
	Name   string `json:"name"`
	Image  string `json:"image"`
	Number string `json:"number"`
}

type MealPlan struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	RecipeID  uint      `json:"recipe_id"`
	Date      string    `json:"date"`
	MealType  string    `json:"meal_type"`
	CreatedAt time.Time `json:"created_at"`
}

type WeightRecord struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	Weight    float64   `json:"weight"`
	Date      string    `json:"date"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

type UserSettings struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id" gorm:"uniqueIndex"`
	Theme     string    `json:"theme" gorm:"default:'light'"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

type FavoriteRecipe struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	UserID    uint      `json:"user_id"`
	RecipeID  uint      `json:"recipe_id"`
	CreatedAt time.Time `json:"created_at" gorm:"autoCreateTime"`
}

type GoogleUser struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

type OpenAIRequest struct {
	Model     string    `json:"model"`
	Messages  []Message `json:"messages"`
	MaxTokens int       `json:"max_tokens,omitempty"`
}

type Message struct {
	Role    string    `json:"role"`
	Content []Content `json:"content"`
}

type Content struct {
	Type     string    `json:"type"`
	Text     string    `json:"text,omitempty"`
	ImageURL *ImageURL `json:"image_url,omitempty"`
}

type ImageURL struct {
	URL string `json:"url"`
}

type OpenAIResponse struct {
	ID      string   `json:"id"`
	Object  string   `json:"object"`
	Created int      `json:"created"`
	Model   string   `json:"model"`
	Choices []Choice `json:"choices"`
	Usage   Usage    `json:"usage"`
}

type Choice struct {
	Index        int     `json:"index"`
	Message      Message `json:"message"`
	FinishReason string  `json:"finish_reason"`
}

type Usage struct {
	PromptTokens     int `json:"prompt_tokens"`
	CompletionTokens int `json:"completion_tokens"`
	TotalTokens      int `json:"total_tokens"`
}

type OpenAIResponseMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type OpenAIResponseChoice struct {
	Index        int                   `json:"index"`
	Message      OpenAIResponseMessage `json:"message"`
	FinishReason string                `json:"finish_reason"`
}

type OpenAIResponseData struct {
	ID      string                 `json:"id"`
	Object  string                 `json:"object"`
	Created int                    `json:"created"`
	Model   string                 `json:"model"`
	Choices []OpenAIResponseChoice `json:"choices"`
	Usage   Usage                  `json:"usage"`
}

var db *gorm.DB
var resetCodes = make(map[string]string)
var googleOauthConfig *oauth2.Config
var oauthStateString string

func generateCode() string {
	rand.Seed(time.Now().UnixNano())
	return fmt.Sprintf("%06d", rand.Intn(1000000))
}

func sendEmail(to, code string) error {
	auth := smtp.PlainAuth("", "ymeirkhan@mail.ru", "K1rdTt89ewT1nrbVddmm", "smtp.mail.ru")
	msg := []byte("Subject: Код для восстановления пароля\n\nВаш код: " + code)
	return smtp.SendMail("smtp.mail.ru:587", auth, "ymeirkhan@mail.ru", []string{to}, msg)
}

func resetPassword(c *gin.Context) {
	var request struct {
		Email string `json:"email"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный запрос"})
		return
	}

	var user User
	if err := db.Where("email = ?", request.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email не найден"})
		return
	}

	code := generateCode()
	resetCodes[request.Email] = code
	sendEmail(request.Email, code)

	c.JSON(http.StatusOK, gin.H{"message": "Код отправлен на email"})
}

func verifyCode(c *gin.Context) {
	var request struct {
		Email string `json:"email"`
		Code  string `json:"code"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный запрос"})
		return
	}

	if resetCodes[request.Email] != request.Code {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный код"})
		return
	}

	delete(resetCodes, request.Email)
	c.JSON(http.StatusOK, gin.H{"message": "Код подтвержден"})
}

func updatePassword(c *gin.Context) {
	var request struct {
		Email       string `json:"email"`
		NewPassword string `json:"newPassword"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный запрос"})
		return
	}

	var user User
	if err := db.Where("email = ?", request.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Email не найден"})
		return
	}

	if len(request.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Пароль должен содержать не менее 8 символов"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(request.NewPassword), 14)
	user.Password = string(hashedPassword)

	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления пароля"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Пароль успешно изменен"})
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}

	googleOauthConfig = &oauth2.Config{
		RedirectURL:  "http://localhost:8080/auth/google/callback",
		ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
		ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
		Scopes:       []string{"https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"},
		Endpoint:     google.Endpoint,
	}
	oauthStateString = generateStateToken()

	dsn := os.Getenv("DATABASE_URL")
	var err error
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Error connecting to database: %v", err)
	}
	db.AutoMigrate(&User{}, &Recipe{}, &Product{}, &MealPlan{}, &WeightRecord{}, &UserSettings{}, &FavoriteRecipe{}, &GoogleUser{})

	server := gin.Default()

	store := cookie.NewStore([]byte("secret"))
	store.Options(sessions.Options{
		Path:     "/",
		MaxAge:   30 * 60,
		HttpOnly: true,
		Secure:   false,
		SameSite: http.SameSiteLaxMode,
	})
	server.Use(sessions.Sessions("mysession", store))

	server.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Content-Type", "Authorization", "X-Requested-With"},
		AllowCredentials: true,
		ExposeHeaders:    []string{"Content-Length", "Set-Cookie"},
		MaxAge:           12 * time.Hour,
	}))

	server.Static("/uploads", "./uploads")

	server.POST("/signup", signUp)
	server.POST("/signin", signIn)
	server.POST("/signout", signOut)
	server.GET("/check-auth", CheckAuth)
	server.GET("/auth/success", handleAuthSuccess)

	server.POST("/reset-password", resetPassword)
	server.POST("/verify-code", verifyCode)
	server.POST("/update-password", updatePassword)

	server.GET("/recipes", getRecipes)
	server.GET("/recipes/:id", getRecipeByID)
	server.POST("/my-recipes", authMiddleware(), createRecipe)
	server.GET("/my-recipes", authMiddleware(), getMyRecipes)
	server.PUT("/my-recipes/:id", authMiddleware(), updateRecipe)
	server.DELETE("/my-recipes/:id", authMiddleware(), deleteRecipe)

	server.POST("/products", addProduct)
	server.GET("/products", getProducts)
	server.DELETE("/products/:id", authMiddleware(), deleteProduct)
	server.POST("/search-recipes", searchRecipesByProducts)

	server.POST("/meal-plan", authMiddleware(), addToMealPlan)
	server.GET("/meal-plan", authMiddleware(), getMealPlanByDate)

	server.GET("/profile", authMiddleware(), getProfile)
	server.PUT("/profile", authMiddleware(), updateProfile)

	server.POST("/weight-records", authMiddleware(), addWeightRecord)
	server.GET("/weight-records", authMiddleware(), getWeightRecords)

	server.GET("/settings", authMiddleware(), getUserSettings)
	server.PUT("/settings", authMiddleware(), updateUserSettings)
	server.POST("/change-password", authMiddleware(), changePassword)

	server.POST("/favorite-recipes/:id", authMiddleware(), addToFavorites)
	server.DELETE("/favorite-recipes/:id", authMiddleware(), removeFromFavorites)
	server.GET("/favorite-recipes", authMiddleware(), getFavoriteRecipes)
	server.GET("/search-recipes", getRecipesByName)

	server.GET("/auth/google", handleGoogleLogin)
	server.GET("/auth/google/callback", handleGoogleCallback)

	server.POST("/analyze-product", authMiddleware(), analyzeProduct)

	server.Run(":8080")
}

func signUp(c *gin.Context) {
	var user User
	if err := c.ShouldBindJSON(&user); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if len(user.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password must be at least 8 characters"})
		return
	}

	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(user.Password), 14)
	user.Password = string(hashedPassword)
	user.Role = "user"

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "User created successfully"})
}

func signIn(c *gin.Context) {
	var input User
	var user User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := db.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}

	session := sessions.Default(c)
	session.Options(sessions.Options{
		MaxAge: 30 * 60,
	})
	session.Set("user_id", user.ID)
	session.Set("user_role", user.Role)
	session.Save()

	c.JSON(http.StatusOK, gin.H{"message": "Login successful"})
}

func signOut(c *gin.Context) {
	session := sessions.Default(c)
	session.Clear()
	session.Options(sessions.Options{MaxAge: -1})
	session.Save()

	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

func handleAuthSuccess(c *gin.Context) {
	redirectURL := c.DefaultQuery("redirect", "http://localhost:3000")

	session := sessions.Default(c)
	userID := session.Get("user_id")

	log.Printf("Проверка успешной аутентификации, userID=%v", userID)

	if userID == nil {
		log.Println("Сессия не установлена, перенаправление на страницу входа")
		c.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/signin?error=session_failed")
		return
	}

	c.Redirect(http.StatusTemporaryRedirect, redirectURL+"?login_success=true")
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		session := sessions.Default(c)
		userID := session.Get("user_id")
		userRole := session.Get("user_role")

		if userID == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			c.Abort()
			return
		}

		c.Set("user_id", userID.(uint))
		c.Set("user_role", userRole.(string))
		c.Next()
	}
}

func CheckAuth(c *gin.Context) {
	session := sessions.Default(c)
	userID := session.Get("user_id")

	log.Printf("CheckAuth: userID=%v", userID)

	if userID == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var user User
	if err := db.First(&user, userID).Error; err != nil {
		log.Printf("Ошибка получения данных пользователя: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения данных пользователя"})
		return
	}

	user.Password = ""

	log.Printf("Пользователь авторизован: ID=%d, Email=%s", user.ID, user.Email)

	c.JSON(http.StatusOK, gin.H{
		"message": "Авторизован",
		"user":    user,
	})
}

func getRecipes(c *gin.Context) {
	var recipes []Recipe
	if err := db.Find(&recipes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения рецептов"})
		return
	}
	c.JSON(http.StatusOK, recipes)
}

func getRecipeByID(c *gin.Context) {
	id := c.Param("id")
	var recipe Recipe
	if err := db.First(&recipe, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Рецепт не найден"})
		return
	}
	c.JSON(http.StatusOK, recipe)
}

func getMyRecipes(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var recipes []Recipe
	if err := db.Where("user_id = ?", userID).Find(&recipes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения рецептов"})
		return
	}

	c.JSON(http.StatusOK, recipes)
}

func createRecipe(c *gin.Context) {
	var recipe Recipe

	recipe.Name = c.PostForm("name")
	recipe.Description = c.PostForm("description")
	recipe.Serving, _ = strconv.Atoi(c.PostForm("serving"))
	recipe.CookingTime, _ = strconv.Atoi(c.PostForm("cooking_time"))
	recipe.Calories, _ = strconv.Atoi(c.PostForm("calories"))

	if err := json.Unmarshal([]byte(c.PostForm("ingredients")), &recipe.Ingredients); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ingredients format"})
		return
	}
	if err := json.Unmarshal([]byte(c.PostForm("steps")), &recipe.Steps); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid steps format"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}
	recipe.UserID = userID.(uint)

	file, err := c.FormFile("image")
	if err == nil {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Only .jpg, .jpeg and .png files are allowed"})
			return
		}

		if err := os.MkdirAll("uploads", 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create upload directory"})
			return
		}

		filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
		filepath := filepath.Join("uploads", filename)

		if err := c.SaveUploadedFile(file, filepath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
			return
		}

		recipe.Image = "/uploads/" + filename
	}

	if err := db.Create(&recipe).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания рецепта"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Рецепт успешно создан", "recipe": recipe})
}

func updateRecipe(c *gin.Context) {
	id := c.Param("id")
	var existingRecipe Recipe

	if err := db.First(&existingRecipe, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Рецепт не найден"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists || existingRecipe.UserID != userID.(uint) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Вы не можете редактировать этот рецепт"})
		return
	}

	contentType := c.GetHeader("Content-Type")
	if strings.Contains(contentType, "multipart/form-data") {
		name := c.PostForm("name")
		description := c.PostForm("description")
		serving, _ := strconv.Atoi(c.PostForm("serving"))
		cookingTime, _ := strconv.Atoi(c.PostForm("cooking_time"))
		calories, _ := strconv.Atoi(c.PostForm("calories"))

		existingRecipe.Name = name
		existingRecipe.Description = description
		existingRecipe.Serving = serving
		existingRecipe.CookingTime = cookingTime
		existingRecipe.Calories = calories

		ingredientsStr := c.PostForm("ingredients")
		if ingredientsStr != "" {
			if err := json.Unmarshal([]byte(ingredientsStr), &existingRecipe.Ingredients); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат ингредиентов"})
				return
			}
		}

		stepsStr := c.PostForm("steps")
		if stepsStr != "" {
			if err := json.Unmarshal([]byte(stepsStr), &existingRecipe.Steps); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат шагов"})
				return
			}
		}

		file, err := c.FormFile("image")
		if err == nil {
			ext := strings.ToLower(filepath.Ext(file.Filename))
			if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Допустимые форматы: .jpg, .jpeg и .png"})
				return
			}

			if err := os.MkdirAll("uploads", 0755); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания директории"})
				return
			}

			filename := fmt.Sprintf("%d%s", time.Now().UnixNano(), ext)
			filepath := filepath.Join("uploads", filename)

			if err := c.SaveUploadedFile(file, filepath); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения файла"})
				return
			}

			existingRecipe.Image = "/uploads/" + filename
		}
	} else {
		originalUserID := existingRecipe.UserID
		originalImage := existingRecipe.Image

		if err := c.ShouldBindJSON(&existingRecipe); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
			return
		}

		existingRecipe.UserID = originalUserID

		if existingRecipe.Image == "" {
			existingRecipe.Image = originalImage
		}
	}

	if err := db.Save(&existingRecipe).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления рецепта"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Рецепт успешно обновлен", "recipe": existingRecipe})
}

func deleteRecipe(c *gin.Context) {
	id := c.Param("id")
	var recipe Recipe

	if err := db.First(&recipe, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Рецепт не найден"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists || recipe.UserID != userID.(uint) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Вы не можете удалить этот рецепт"})
		return
	}

	if err := db.Delete(&recipe).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления рецепта"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Рецепт успешно удален"})
}

func addProduct(c *gin.Context) {
	name := c.PostForm("name")
	number := c.PostForm("number")

	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ошибка загрузки файла"})
		return
	}

	filePath := filepath.Join("uploads", file.Filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения файла"})
		return
	}

	product := Product{
		Name:   name,
		Number: number,
		Image:  "/" + filePath,
	}

	if err := db.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка добавления продукта"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Продукт успешно добавлен", "product": product})
}

func getProducts(c *gin.Context) {
	var products []Product
	if err := db.Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения списка продуктов"})
		return
	}
	c.JSON(http.StatusOK, products)
}

func deleteProduct(c *gin.Context) {
	productID := c.Param("id")

	var product Product
	if err := db.First(&product, productID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Продукт не найден"})
		return
	}

	if product.Image != "" {
		imagePath := "." + product.Image
		if err := os.Remove(imagePath); err != nil {
			log.Printf("Не удалось удалить изображение: %v", err)
		}
	}

	if err := db.Delete(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка удаления продукта"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Продукт успешно удален"})
}

func searchRecipesByProducts(c *gin.Context) {
	var selectedProducts []string

	if err := c.ShouldBindJSON(&selectedProducts); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	productsJSON, err := json.Marshal(selectedProducts)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обработки данных"})
		return
	}

	var recipes []Recipe
	if err := db.Where("ingredients @> ?", productsJSON).Find(&recipes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка поиска рецептов"})
		return
	}

	c.JSON(http.StatusOK, recipes)
}

func addToMealPlan(c *gin.Context) {
	var request struct {
		RecipeID uint   `json:"recipe_id"`
		Date     string `json:"date"`
		MealType string `json:"meal_type"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	mealPlan := MealPlan{
		UserID:   userID.(uint),
		RecipeID: request.RecipeID,
		Date:     request.Date,
		MealType: request.MealType,
	}

	if err := db.Create(&mealPlan).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка добавления в план"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Рецепт добавлен в план", "meal_plan": mealPlan})
}

func getMealPlanByDate(c *gin.Context) {
	date := c.Query("date")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var mealPlans []MealPlan
	if err := db.Where("user_id = ? AND date = ?", userID, date).Find(&mealPlans).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения плана"})
		return
	}

	c.JSON(http.StatusOK, mealPlans)
}

func getProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var user User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных пользователя"})
		return
	}

	user.Password = ""

	c.JSON(http.StatusOK, user)
}

func updateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var user User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных пользователя"})
		return
	}

	currentPassword := user.Password

	fullName := c.PostForm("full_name")
	gender := c.PostForm("gender")

	weightStr := c.PostForm("weight")
	weight, err := strconv.ParseFloat(weightStr, 64)
	if err != nil && weightStr != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Вес должен быть числом"})
		return
	}

	goalWeightStr := c.PostForm("goal_weight")
	goalWeight, err := strconv.ParseFloat(goalWeightStr, 64)
	if err != nil && goalWeightStr != "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Целевой вес должен быть числом"})
		return
	}

	user.FullName = fullName
	user.Gender = gender

	if weightStr != "" {
		user.Weight = weight
	}

	if goalWeightStr != "" {
		user.GoalWeight = goalWeight
	}

	file, err := c.FormFile("profile_picture")
	if err == nil {
		ext := strings.ToLower(filepath.Ext(file.Filename))
		if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Допустимые форматы: .jpg, .jpeg и .png"})
			return
		}

		if err := os.MkdirAll("uploads/profiles", 0755); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания директории"})
			return
		}

		filename := fmt.Sprintf("profile_%d%s", time.Now().UnixNano(), ext)
		filepath := filepath.Join("uploads/profiles", filename)

		if err := c.SaveUploadedFile(file, filepath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения файла"})
			return
		}

		user.ProfilePicture = "/uploads/profiles/" + filename
	}

	user.Password = currentPassword

	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления профиля"})
		return
	}

	user.Password = ""

	c.JSON(http.StatusOK, gin.H{"message": "Профиль успешно обновлен", "user": user})
}

func addWeightRecord(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var request struct {
		Weight float64 `json:"weight"`
		Date   string  `json:"date"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	var existingRecord WeightRecord
	result := db.Where("user_id = ? AND date = ?", userID, request.Date).First(&existingRecord)

	if result.RowsAffected > 0 {
		existingRecord.Weight = request.Weight
		if err := db.Save(&existingRecord).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления записи о весе"})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Запись о весе обновлена", "record": existingRecord})
		return
	}

	record := WeightRecord{
		UserID: userID.(uint),
		Weight: request.Weight,
		Date:   request.Date,
	}

	if err := db.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка создания записи о весе"})
		return
	}

	var user User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения данных пользователя"})
		return
	}

	goalAchieved := false
	if user.GoalWeight > 0 {
		if (user.Weight > user.GoalWeight && request.Weight <= user.GoalWeight) ||
			(user.Weight < user.GoalWeight && request.Weight >= user.GoalWeight) {
			goalAchieved = true
		}
	}

	user.Weight = request.Weight
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления веса пользователя"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":       "Запись о весе добавлена",
		"record":        record,
		"goal_achieved": goalAchieved,
	})
}

func getWeightRecords(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	period := c.DefaultQuery("period", "month")

	var records []WeightRecord
	query := db.Where("user_id = ?", userID)

	if period == "month" {
		startDate := time.Now().AddDate(0, -1, 0).Format("2006-01-02")
		query = query.Where("date >= ?", startDate)
	} else if period == "year" {
		startDate := time.Now().AddDate(-1, 0, 0).Format("2006-01-02")
		query = query.Where("date >= ?", startDate)
	}

	if err := query.Order("date asc").Find(&records).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения записей о весе"})
		return
	}

	c.JSON(http.StatusOK, records)
}

func getUserSettings(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var settings UserSettings
	result := db.Where("user_id = ?", userID).First(&settings)

	if result.RowsAffected == 0 {
		settings = UserSettings{
			UserID: userID.(uint),
			Theme:  "light",
		}
		db.Create(&settings)
	}

	c.JSON(http.StatusOK, settings)
}

func updateUserSettings(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var requestData struct {
		Theme string `json:"theme"`
	}

	if err := c.ShouldBindJSON(&requestData); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	if requestData.Theme != "light" && requestData.Theme != "dark" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Недопустимое значение темы"})
		return
	}

	var settings UserSettings
	result := db.Where("user_id = ?", userID).First(&settings)

	if result.RowsAffected == 0 {
		settings = UserSettings{
			UserID: userID.(uint),
			Theme:  requestData.Theme,
		}
		if err := db.Create(&settings).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения настроек"})
			return
		}
	} else {
		settings.Theme = requestData.Theme
		if err := db.Save(&settings).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления настроек"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{"message": "Настройки успешно обновлены", "settings": settings})
}

func changePassword(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var request struct {
		CurrentPassword string `json:"current_password"`
		NewPassword     string `json:"new_password"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверный формат данных"})
		return
	}

	if len(request.NewPassword) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Новый пароль должен содержать не менее 8 символов"})
		return
	}

	var user User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при получении данных пользователя"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(request.CurrentPassword)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Неверный текущий пароль"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(request.NewPassword), 14)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка при обработке пароля"})
		return
	}

	user.Password = string(hashedPassword)
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка обновления пароля"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Пароль успешно изменен"})
}

func addToFavorites(c *gin.Context) {
	recipeID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var recipe Recipe
	if err := db.First(&recipe, recipeID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Рецепт не найден"})
		return
	}

	var existingFav FavoriteRecipe
	result := db.Where("user_id = ? AND recipe_id = ?", userID, recipeID).First(&existingFav)
	if result.RowsAffected > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Рецепт уже в избранном"})
		return
	}

	favorite := FavoriteRecipe{
		UserID:   userID.(uint),
		RecipeID: recipe.ID,
	}

	if err := db.Create(&favorite).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка добавления в избранное"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Рецепт добавлен в избранное"})
}

func removeFromFavorites(c *gin.Context) {
	recipeID := c.Param("id")
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	result := db.Where("user_id = ? AND recipe_id = ?", userID, recipeID).Delete(&FavoriteRecipe{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Рецепт не найден в избранном"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Рецепт удален из избранного"})
}

func getFavoriteRecipes(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Не авторизован"})
		return
	}

	var favorites []FavoriteRecipe
	if err := db.Where("user_id = ?", userID).Find(&favorites).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения избранных рецептов"})
		return
	}

	if len(favorites) == 0 {
		c.JSON(http.StatusOK, []Recipe{})
		return
	}

	var recipeIDs []uint
	for _, fav := range favorites {
		recipeIDs = append(recipeIDs, fav.RecipeID)
	}

	var recipes []Recipe
	if err := db.Where("id IN ?", recipeIDs).Find(&recipes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка получения рецептов"})
		return
	}

	c.JSON(http.StatusOK, recipes)
}

func getRecipesByName(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Поисковый запрос не указан"})
		return
	}

	var recipes []Recipe
	if err := db.Where("name ILIKE ?", "%"+query+"%").Find(&recipes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка поиска рецептов"})
		return
	}

	c.JSON(http.StatusOK, recipes)
}

func generateStateToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.StdEncoding.EncodeToString(b)
}

func handleGoogleLogin(c *gin.Context) {
	redirectType := c.DefaultQuery("type", "signin")
	stateWithRedirect := fmt.Sprintf("%s:%s", oauthStateString, redirectType)
	url := googleOauthConfig.AuthCodeURL(stateWithRedirect)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func handleGoogleCallback(c *gin.Context) {
	state := c.Query("state")
	stateParts := strings.Split(state, ":")

	if len(stateParts) != 2 || stateParts[0] != oauthStateString {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Неверное состояние"})
		return
	}

	redirectType := stateParts[1]

	code := c.Query("code")
	googleUser, err := getGoogleUserInfo(code)
	if err != nil {
		log.Printf("Ошибка получения информации о пользователе Google: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Не удалось получить информацию пользователя"})
		return
	}

	log.Printf("Получены данные от Google: email=%s, name=%s", googleUser.Email, googleUser.Name)

	var user User
	result := db.Where("email = ?", googleUser.Email).First(&user)

	if redirectType == "signin" {
		if result.RowsAffected == 0 {
			log.Printf("Пользователь с email %s не найден", googleUser.Email)
			c.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/signin?error=user_not_found")
			return
		}

		session := sessions.Default(c)
		session.Set("user_id", user.ID)
		session.Set("user_role", user.Role)

		if err := session.Save(); err != nil {
			log.Printf("Ошибка сохранения сессии: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения сессии"})
			return
		}

		log.Printf("Сессия установлена для пользователя ID=%d", user.ID)

		c.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000?login_success=true")
	} else {
		if result.RowsAffected > 0 {
			c.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/signup?error=email_exists")
			return
		}

		randomPassword := generateRandomPassword()
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(randomPassword), 14)

		newUser := User{
			Email:    googleUser.Email,
			Username: googleUser.Name,
			Password: string(hashedPassword),
			FullName: googleUser.Name,
			Role:     "user",
		}

		if googleUser.Picture != "" {
			if err := downloadAndSaveProfilePicture(&newUser, googleUser.Picture); err != nil {
				log.Printf("Ошибка сохранения фото профиля: %v", err)
			}
		}

		if err := db.Create(&newUser).Error; err != nil {
			log.Printf("Ошибка создания пользователя: %v", err)
			c.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000/signup?error=registration_failed")
			return
		}

		session := sessions.Default(c)
		session.Set("user_id", newUser.ID)
		session.Set("user_role", newUser.Role)

		if err := session.Save(); err != nil {
			log.Printf("Ошибка сохранения сессии: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка сохранения сессии"})
			return
		}

		log.Printf("Сессия установлена для нового пользователя ID=%d", newUser.ID)

		c.Redirect(http.StatusTemporaryRedirect, "http://localhost:3000?login_success=true")
	}
}

func getGoogleUserInfo(code string) (*GoogleUser, error) {
	token, err := googleOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("код обмена: %s", err.Error())
	}

	resp, err := http.Get("https://www.googleapis.com/oauth2/v2/userinfo?access_token=" + url.QueryEscape(token.AccessToken))
	if err != nil {
		return nil, fmt.Errorf("получение пользовательских данных: %s", err.Error())
	}
	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("чтение ответа: %s", err.Error())
	}

	var user GoogleUser
	if err := json.Unmarshal(data, &user); err != nil {
		return nil, fmt.Errorf("парсинг данных пользователя: %s", err.Error())
	}

	return &user, nil
}

func generateRandomPassword() string {
	const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+{}[]"
	password := make([]byte, 16)
	for i := range password {
		password[i] = chars[rand.Intn(len(chars))]
	}
	return string(password)
}

func downloadAndSaveProfilePicture(user *User, imageURL string) error {
	resp, err := http.Get(imageURL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	data, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	if err := os.MkdirAll("uploads/profiles", 0755); err != nil {
		return err
	}

	filename := fmt.Sprintf("google_profile_%d.jpg", time.Now().UnixNano())
	filepath := filepath.Join("uploads/profiles", filename)

	if err := ioutil.WriteFile(filepath, data, 0644); err != nil {
		return err
	}

	user.ProfilePicture = "/uploads/profiles/" + filename
	return nil
}

func extractJSONFromMarkdown(content string) string {
	if strings.HasPrefix(content, "```") {
		jsonStartIndex := strings.Index(content, "```json")
		if jsonStartIndex != -1 {
			jsonStartIndex = jsonStartIndex + 7
			jsonEndIndex := strings.Index(content[jsonStartIndex:], "```")
			if jsonEndIndex != -1 {
				return strings.TrimSpace(content[jsonStartIndex : jsonStartIndex+jsonEndIndex])
			}
		}

		codeBlockStart := strings.Index(content, "```") + 3
		nextLineIndex := strings.Index(content[codeBlockStart:], "\n")
		if nextLineIndex != -1 {
			codeBlockStart = codeBlockStart + nextLineIndex + 1
			codeBlockEnd := strings.Index(content[codeBlockStart:], "```")
			if codeBlockEnd != -1 {
				return strings.TrimSpace(content[codeBlockStart : codeBlockStart+codeBlockEnd])
			}
		}
	}

	jsonStartIndex := strings.Index(content, "{")
	if jsonStartIndex != -1 {
		bracketCount := 1
		for i := jsonStartIndex + 1; i < len(content); i++ {
			if content[i] == '{' {
				bracketCount++
			} else if content[i] == '}' {
				bracketCount--
				if bracketCount == 0 {
					return content[jsonStartIndex : i+1]
				}
			}
		}
	}

	return content
}

func analyzeProductWithAI(imageData []byte) (map[string]interface{}, error) {
	base64Image := base64.StdEncoding.EncodeToString(imageData)

	systemPrompt := `Ты эксперт по анализу продуктов питания. Проанализируй изображение продукта и предоставь:
    1. Название продукта
    2. Является ли продукт халяльным (да/нет)
    3. Предполагаемый состав ингредиентов с пометкой халяльности для каждого
    4. Предполагаемые пищевую ценность (калории, белки, жиры, углеводы)
    5. Если продукт не является халяльным, укажи причины.
    
    ВАЖНО: Отвечай ТОЛЬКО в следующем JSON формате:
    {
        "productName": "Название продукта",
        "isHalal": true/false,
        "ingredients": [
            {"name": "Ингредиент 1", "isHalal": true/false},
            {"name": "Ингредиент 2", "isHalal": true/false}
        ],
        "calories": число,
        "proteins": число,
        "fats": число,
        "carbohydrates": число,
        "warnings": ["Предупреждение 1", "Предупреждение 2"]
    }`

	request := OpenAIRequest{
		Model: "gpt-4o-mini",
		Messages: []Message{
			{
				Role: "system",
				Content: []Content{
					{
						Type: "text",
						Text: systemPrompt,
					},
				},
			},
			{
				Role: "user",
				Content: []Content{
					{
						Type: "image_url",
						ImageURL: &ImageURL{
							URL: "data:image/jpeg;base64," + base64Image,
						},
					},
					{
						Type: "text",
						Text: "Анализируй это изображение продукта. Проверь есть ли E-добавки, желатин или другие неразрешенные компоненты по стандартам халяль.",
					},
				},
			},
		},
		MaxTokens: 1000,
	}

	requestBody, err := json.Marshal(request)
	if err != nil {
		return nil, fmt.Errorf("ошибка формирования запроса: %v", err)
	}

	apiKey := os.Getenv("OPENAI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("OPENAI_API_KEY не настроен")
	}

	client := &http.Client{}
	req, err := http.NewRequest("POST", "https://api.openai.com/v1/chat/completions", bytes.NewBuffer(requestBody))
	if err != nil {
		return nil, fmt.Errorf("ошибка создания запроса: %v", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+apiKey)

	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("ошибка отправки запроса: %v", err)
	}
	defer resp.Body.Close()

	var openAIResp OpenAIResponseData
	if err := json.NewDecoder(resp.Body).Decode(&openAIResp); err != nil {
		return nil, fmt.Errorf("ошибка чтения ответа: %v", err)
	}

	if len(openAIResp.Choices) == 0 {
		return nil, fmt.Errorf("нет ответа от API")
	}

	assistantResponse := openAIResp.Choices[0].Message.Content

	cleanJSON := extractJSONFromMarkdown(assistantResponse)

	var result map[string]interface{}
	if err := json.Unmarshal([]byte(cleanJSON), &result); err != nil {
		log.Printf("Ошибка при разборе JSON: %v. Исходный ответ: %s", err, assistantResponse)

		return map[string]interface{}{
			"productName":   "Неизвестный продукт",
			"isHalal":       false,
			"ingredients":   []map[string]interface{}{{"name": "Не удалось определить", "isHalal": false}},
			"calories":      0,
			"proteins":      0,
			"fats":          0,
			"carbohydrates": 0,
			"warnings":      []string{"Не удалось распознать продукт: " + assistantResponse},
		}, nil
	}

	return result, nil
}

func analyzeProduct(c *gin.Context) {
	file, err := c.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Изображение не найдено"})
		return
	}

	if file.Size > 10*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Размер файла превышает 10MB"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	if ext != ".jpg" && ext != ".jpeg" && ext != ".png" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Поддерживаются только JPG, JPEG и PNG форматы"})
		return
	}

	openedFile, err := file.Open()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка открытия файла"})
		return
	}
	defer openedFile.Close()

	imageData, err := io.ReadAll(openedFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Ошибка чтения файла"})
		return
	}

	result, err := analyzeProductWithAI(imageData)

	if err != nil {
		log.Printf("Ошибка анализа изображения: %v", err)

		isHalal := rand.Intn(2) == 1

		ingredients := []map[string]interface{}{
			{"name": "Вода", "isHalal": true},
			{"name": "Сахар", "isHalal": true},
			{"name": "Пшеничная мука", "isHalal": true},
			{"name": "Растительное масло", "isHalal": true},
		}

		warnings := []string{"Не удалось выполнить анализ через ИИ: " + err.Error()}

		if !isHalal {
			nonHalalIngredients := []string{
				"Желатин животного происхождения",
				"E120 (кармин)",
				"Этиловый спирт",
			}

			randomNonHalal := nonHalalIngredients[rand.Intn(len(nonHalalIngredients))]
			ingredients = append(ingredients, map[string]interface{}{
				"name":    randomNonHalal,
				"isHalal": false,
			})

			warnings = append(warnings, "Продукт может содержать запрещенные компоненты")
		}

		result = map[string]interface{}{
			"productName":   "Неизвестный продукт",
			"isHalal":       isHalal,
			"calories":      250 + rand.Intn(200),
			"proteins":      4 + rand.Intn(12),
			"fats":          2 + rand.Intn(15),
			"carbohydrates": 20 + rand.Intn(30),
			"ingredients":   ingredients,
			"warnings":      warnings,
		}
	}

	if err := os.MkdirAll("uploads/scanned", 0755); err != nil {
		log.Printf("Ошибка создания директории: %v", err)
	} else {
		filename := fmt.Sprintf("scan_%d%s", time.Now().UnixNano(), ext)
		filepath := filepath.Join("uploads/scanned", filename)

		if err := saveMultipartFile(file, filepath); err != nil {
			log.Printf("Ошибка сохранения файла: %v", err)
		}
	}

	c.JSON(http.StatusOK, result)
}

func saveMultipartFile(file *multipart.FileHeader, dst string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	out, err := os.Create(dst)
	if err != nil {
		return err
	}
	defer out.Close()

	_, err = io.Copy(out, src)
	return err
}
