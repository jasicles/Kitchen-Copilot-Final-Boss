const mealsEls = document.getElementById('meals');
const favoriteContainer = document.getElementById('fav-meals');

const refreshBtn = document.getElementById('btn-refresh');

const searchTerm = document.getElementById('search-term');
const searchBtn = document.getElementById('search');

const mealPopup = document.getElementById('meal-popup');
const mealInfoEl = document.getElementById('meal-info');
const popupCloseBtn = document.getElementById('close-popup');

const areaFilterEl = document.getElementById('li-area');
const selectPopup = document.getElementById('select-popup');
const optionsEl = document.getElementById('options');
const selectPopupCloseBtn = document.getElementById('close-select-popup');

const categoryFilterEl = document.getElementById('li-category');

// Chatbot functionality
const chatbotContainer = document.getElementById('chatbot-container');
const chatBody = document.getElementById('chat-body');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-message');
const toggleChat = document.getElementById('toggle-chat');

// Community Feature
const communityFeed = document.getElementById('community-feed');
const postModal = document.getElementById('post-modal');
const postForm = document.getElementById('post-form');
const postPhotoBtn = document.getElementById('post-photo');
const closePostModal = document.getElementById('close-post-modal');
const mealTimeFilter = document.getElementById('meal-time');

// Add these variables at the top with your other constants
const dietaryFilters = document.getElementById('dietary-filters');
let selectedDietaryRestrictions = new Set();

// Gamification System
const gameState = {
    currentCity: 0,
    fruitTokens: 0,
    recipeCards: 0,
    xp: 0,
    lastDaily: null,
    cities: [
        { 
            name: "Tokyo",
            x: 82,
            y: 35,
            requiredXP: 1000,
            collectibles: ["Sushi Master Card", "Ramen Expert Badge", "Japanese Tea Set"],
            unlockedCollectibles: [],
            description: "Master the art of Japanese cuisine"
        },
        { 
            name: "Rome",
            x: 48,
            y: 32,
            requiredXP: 2000,
            collectibles: ["Pizza Chef Card", "Pasta Master Badge", "Italian Herbs Set"],
            unlockedCollectibles: [],
            description: "Experience the flavors of Italy"
        },
        { 
            name: "Paris",
            x: 45,
            y: 30,
            requiredXP: 3000,
            collectibles: ["Pastry Chef Card", "Wine Connoisseur Badge", "French Cuisine Set"],
            unlockedCollectibles: [],
            description: "Discover French culinary excellence"
        },
        { 
            name: "Bangkok",
            x: 75,
            y: 45,
            requiredXP: 4000,
            collectibles: ["Spice Master Card", "Street Food Badge", "Thai Curry Set"],
            unlockedCollectibles: [],
            description: "Explore the vibrant tastes of Thailand"
        }
    ],
    quests: [
        {
            id: 1,
            title: "Water Champion",
            description: "Log water intake 3 times",
            target: 3,
            progress: 0,
            reward: { type: "xp", amount: 50 },
            daily: true
        },
        {
            id: 2,
            title: "Fruit Explorer",
            description: "Add 2 fruit servings to your meals",
            target: 2,
            progress: 0,
            reward: { type: "tokens", amount: 5 },
            daily: true
        },
        {
            id: 3,
            title: "Home Chef",
            description: "Cook a meal at home",
            target: 1,
            progress: 0,
            reward: { type: "recipe", amount: 1 },
            daily: true
        },
        {
            id: 4,
            title: "Healthy Choice",
            description: "Choose a vegetarian meal",
            target: 1,
            progress: 0,
            reward: { type: "xp", amount: 100 },
            daily: true
        }
    ],
    achievements: []
};

// Initialize chatbot responses
let chatbotResponses = {
    "categories": {
        "recipes": {
            "resources": [
                {
                    "question": "What is My Healthy Plate?",
                    "answer": "My Healthy Plate is a visual guide developed by HPB to help you plan balanced meals. It recommends filling half your plate with fruit and vegetables, a quarter with wholegrains, and a quarter with meat or other proteins."
                  },
                  {
                    "question": "How many servings of vegetables should I eat daily?",
                    "answer": "You should eat at least 2 servings of vegetables and 2 servings of fruit daily for a balanced diet."
                  },
                  {
                    "question": "What are wholegrains and why are they important?",
                    "answer": "Wholegrains contain all parts of the grain and are rich in fibre, vitamins, and minerals. They help in digestion and reduce the risk of chronic diseases."
                  },
                  {
                    "question": "Why should I reduce sugar intake?",
                    "answer": "Consuming too much sugar can lead to weight gain and increase the risk of diabetes and heart disease. Opt for water or unsweetened beverages instead."
                  },
                  {
                    "question": "What are healthier cooking methods?",
                    "answer": "Healthier cooking methods include steaming, grilling, boiling, and baking. Avoid deep-frying or using excessive oil."
                  }
            ]
        }
    }
};

// Store posts in localStorage
let communityPosts = JSON.parse(localStorage.getItem('communityPosts')) || [];

getRandomMeal();
fetchFavMeals();

async function getRandomMeal() {
    let foundValidMeal = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!foundValidMeal && attempts < maxAttempts) {
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const resData = await res.json();
        const randomMeal = resData.meals[0];
        
        // Apply filters to the random meal
        const filteredMeals = await filterMeals([randomMeal]);
        
        if (filteredMeals.length > 0) {
            mealsEls.innerHTML = '';
            addMeal(filteredMeals[0], true);
            foundValidMeal = true;
        }
        
        attempts++;
    }

    if (!foundValidMeal) {
        mealsEls.innerHTML = '<p class="no-results">No meals found matching your dietary restrictions. Try adjusting your filters.</p>';
    }
}

async function getMealById(id) {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id);

    const resData = await res.json();

    const meal = resData.meals[0];

    return meal;
}

async function getMealsBySearch(term) {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term);

    const resData = await res.json();

    const meals = resData.meals;

    return meals;
}

async function getAreaList() {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?a=list');

    const resData = await res.json();

    const areaList = resData.meals;

    return areaList;
}

async function getCategoryList() {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/list.php?c=list');

    const resData = await res.json();

    const categoryList = resData.meals;

    return categoryList;
}

async function getMealsIdByArea(area) {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?a=' + area);

    const resData = await res.json();

    const mealsId = resData.meals;

    return mealsId;
}

async function getMealsIdByCategory(cate) {
    const res = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c=' + cate);

    const resData = await res.json();

    const mealsId = resData.meals;

    return mealsId;
}

// Add this function to check ingredients against dietary restrictions
function checkDietaryRestrictions(meal) {
    const restrictions = {
        halal: {
            forbidden: ['pork', 'bacon', 'ham', 'wine', 'beer', 'alcohol'],
            required: []
        },
        vegetarian: {
            forbidden: ['chicken', 'beef', 'pork', 'fish', 'meat', 'bacon', 'ham'],
            required: []
        },
        vegan: {
            forbidden: ['chicken', 'beef', 'pork', 'fish', 'meat', 'bacon', 'ham', 'milk', 'cream', 'cheese', 'egg', 'honey'],
            required: []
        },
        'gluten-free': {
            forbidden: ['flour', 'bread', 'pasta', 'wheat', 'barley', 'rye'],
            required: []
        },
        'dairy-free': {
            forbidden: ['milk', 'cream', 'cheese', 'butter', 'yogurt'],
            required: []
        },
        'nut-free': {
            forbidden: ['peanut', 'almond', 'cashew', 'walnut', 'pecan', 'pistachio'],
            required: []
        }
    };

    const dietaryTags = new Set();
    const ingredients = getIngredientsList(meal).map(ing => ing.toLowerCase());

    // Check each dietary restriction
    Object.entries(restrictions).forEach(([restriction, rules]) => {
        const hasForbiddenIngredients = rules.forbidden.some(forbidden => 
            ingredients.some(ing => ing.includes(forbidden.toLowerCase()))
        );
        
        const meetsRequirements = rules.required.every(required => 
            ingredients.some(ing => ing.includes(required.toLowerCase()))
        );

        if (!hasForbiddenIngredients && meetsRequirements) {
            dietaryTags.add(restriction);
        }
    });

    return Array.from(dietaryTags);
}

// Helper function to get ingredients list from meal
function getIngredientsList(meal) {
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
        if (meal[`strIngredient${i}`]) {
            ingredients.push(meal[`strIngredient${i}`]);
        }
    }
    return ingredients;
}

// Modify your addMeal function to include dietary tags
function addMeal(mealData, random = false) {
    const dietaryTags = checkDietaryRestrictions(mealData);
    
    // Check if meal meets selected dietary restrictions
    if (selectedDietaryRestrictions.size > 0) {
        const meetsRestrictions = Array.from(selectedDietaryRestrictions)
            .every(restriction => dietaryTags.includes(restriction));
        if (!meetsRestrictions) return;
    }

    // Clear random meal if needed
    if (random) {
        mealsEls.innerHTML = '';
    }

    const meal = document.createElement('div');
    meal.classList.add('meal');

    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `<span class="random">Random Recipe</span>` : ''}
            <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
        <div class="dietary-tags">
            ${dietaryTags.map(tag => `
                <span class="dietary-tag">${tag.replace('-', ' ')}</span>
            `).join('')}
        </div>
    `;

    const btn = meal.querySelector('.meal-body .fav-btn');
    btn.addEventListener('click', () => {
        if (btn.classList.contains('active')) {
            removeMealLS(mealData.idMeal)
            btn.classList.remove("active");
        } else {
            addMealLS(mealData.idMeal)
            btn.classList.add("active");
        }

        fetchFavMeals();
    });

    const mealHeader = meal.querySelector('.meal-header')
    mealHeader.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    mealsEls.appendChild(meal);
}

function addMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]));
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS();

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)));
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'));

    return mealIds === null ? [] : mealIds;
}

async function fetchFavMeals() {
    // clean the container
    favoriteContainer.innerHTML = "";
    const mealIds = getMealsLS();

    const meals = [];

    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];
        meal = await getMealById(mealId);

        addMealFav(meal);
    }
}

function addMealFav(mealData) {
    const favMeal = document.createElement('li');

    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>`;


    const btn = favMeal.querySelector('.clear');

    btn.addEventListener('click', () => {
        removeMealLS(mealData.idMeal);

        fetchFavMeals();
    })

    const mealThumb = favMeal.querySelector('img');
    mealThumb.addEventListener('click', () => {
        showMealInfo(mealData);
    })

    favoriteContainer.appendChild(favMeal);
}

function getCountryCodeFromName(name) {
    const countryMap = {
        'American': 'US',
        'British': 'GB',
        'Chinese': 'CN',
        'French': 'FR',
        'Indian': 'IN',
        'Italian': 'IT',
        'Japanese': 'JP',
        'Mexican': 'MX',
        'Thai': 'TH',
        'Turkish': 'TR',
        'Vietnamese': 'VN',
        'Unknown': 'EU',
        'Canadian': 'CA',
        'Dutch': 'NL',
        'Greek': 'GR',
        'Irish': 'IE',
        'Jamaican': 'JM',
        'Malaysian': 'MY',
        'Polish': 'PL',
        'Portuguese': 'PT',
        'Russian': 'RU',
        'Spanish': 'ES',
        'Tunisian': 'TN',
        'Croatian': 'HR',
        'Egyptian': 'EG',
        'Filipino': 'PH',
        'Korean': 'KR',
        'Lebanese': 'LB',
        'Moroccan': 'MA',
        'Norwegian': 'NO',
        'Peruvian': 'PE',
        'Swedish': 'SE',
        'Syrian': 'SY'
    };
    
    return countryMap[name] || 'EU';
}

// Function to get flag image URL with fallback options
function getFlagImageUrl(countryCode) {
    // Try multiple flag services with fallbacks
    const flagServices = [
        `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`,
        `https://flagcdn.com/48x36/${countryCode.toLowerCase()}.png`,
        `https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/3.5.0/flags/4x3/${countryCode.toLowerCase()}.svg`,
        `./images/flags/${countryCode.toLowerCase()}.png` // Local fallback
    ];
    
    return flagServices[0]; // Return the first service URL
}

function showMealInfo(mealData) {

    // clean it up
    mealInfoEl.innerHTML = "";

    // update meal info
    const mealEl = document.createElement('div');

    const ingredients = [];

    // add ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData['strIngredient' + i]) {
            ingredients.push(`${mealData['strIngredient' + i]} / ${mealData['strMeasure' + i]}`);
        } else {
            break;
        }
    }

    const countryCode = getCountryCodeFromName(mealData.strArea);

    mealEl.innerHTML = `
    <h1>${mealData.strMeal}</h1>
    <img src="${mealData.strMealThumb}" alt="${mealData.strMealThumb}">
        <h3>
            Country: ${mealData.strArea}
        </h3>
        <img src="${getFlagImageUrl(countryCode)}" alt="${mealData.strArea}">
        <h3>
            Category: ${mealData.strCategory}
        </h3>
    <p>
        ${mealData.strInstructions}
    </p>
    <h3>Ingredients:</h3>
    <ul>
        ${ingredients.map((ing) => `<li>${ing}</li>`).join("")}
    </ul>
    <h3>Source:</h3>
    <a href="${mealData.strSource}">${mealData.strMeal}</a>

    ${mealData.strYoutube ? `
        <h3>Video Recipe:</h3>
        <div class="videoWrapper">
            <iframe id="video-frame" width="100%" height="100%"
            src="https://www.youtube.com/embed/${mealData.strYoutube.slice(-11)}">
            </iframe>
        </div>` : ''}
    `;
    // Add that video wrapper cause warning 


    mealInfoEl.appendChild(mealEl);

    mealPopup.classList.remove('hidden');
}

searchBtn.addEventListener('click', async () => {
    // clear the container    
    mealsEls.innerHTML = "";

    const search = searchTerm.value;

    const meals = await getMealsBySearch(search);

    if (meals) {
        meals.forEach((meal) => {
            addMeal(meal);
        })
    }
})

async function showPopupArea(filter) {
    selectPopup.classList.remove('hidden');
    optionsEl.innerHTML = '';

    let list;
    if (filter === 'area') {
        list = await getAreaList();
    } else if (filter === 'category') {
        list = await getCategoryList();
    }

    list.forEach((item) => {
        const li = document.createElement('li');
        li.classList.add(filter === 'area' ? 'area-option' : 'category-option');
        
        // Create image element
        const img = document.createElement('img');
        if (filter === 'area') {
            // Get country code and use it for the flag
            const countryCode = getCountryCodeFromName(item.strArea);
            img.src = getFlagImageUrl(countryCode);
            img.alt = item.strArea;
            
            // Add error handling for flag images
            img.onerror = function() {
                // If the image fails to load, try the next service or use a default icon
                this.src = `./images/flags/default.png`;
                this.onerror = null; // Prevent infinite loop
            };
        } else {
            // For categories, use a default icon or specific category icon
            img.src = `./images/${item.strCategory.toLowerCase()}.png`;
            img.alt = item.strCategory;
            
            // Add error handling for category images
            img.onerror = function() {
                this.src = `./images/default-category.png`;
                this.onerror = null; // Prevent infinite loop
            };
        }
        
        // Create span for text
        const span = document.createElement('span');
        span.innerText = filter === 'area' ? item.strArea : item.strCategory;
        
        // Append elements to li
        li.appendChild(img);
        li.appendChild(span);
        
        li.addEventListener('click', async () => {
            selectPopup.classList.add('hidden');
            mealsEls.innerHTML = '';
            
            let meals;
            if (filter === 'area') {
                const mealsId = await getMealsIdByArea(item.strArea);
                meals = await Promise.all(mealsId.map(async (meal) => {
                    return await getMealById(meal.idMeal);
                }));
            } else if (filter === 'category') {
                const mealsId = await getMealsIdByCategory(item.strCategory);
                meals = await Promise.all(mealsId.map(async (meal) => {
                    return await getMealById(meal.idMeal);
                }));
            }
            
            // Apply dietary filters
            const filteredMeals = await filterMeals(meals);
            
            if (filteredMeals.length > 0) {
                filteredMeals.forEach((meal) => {
                    addMeal(meal);
                });
            } else {
                mealsEls.innerHTML = '<p class="no-results">No meals found matching your dietary restrictions. Try adjusting your filters.</p>';
            }
        });
        
        optionsEl.appendChild(li);
    });
}

popupCloseBtn.addEventListener('click', () => {

    // Stop the video player
    const frame = document.getElementById("video-frame");
    if (frame) {
        frame.setAttribute('src', "");
    }

    mealPopup.classList.add('hidden');
});

refreshBtn.addEventListener('click', () => {
    getRandomMeal();
});

areaFilterEl.addEventListener('click', () => {
    showPopupArea('area');
})

categoryFilterEl.addEventListener('click', () => {
    showPopupArea('category');
})

selectPopupCloseBtn.addEventListener('click', () => {
    selectPopup.classList.add('hidden');
});

// Toggle chat visibility
toggleChat.addEventListener('click', () => {
    chatBody.style.display = chatBody.style.display === 'none' ? 'flex' : 'none';
});

// Send message function
function sendMessage() {
    const message = chatInput.value.trim();
    if (message) {
        // Add user message
        addMessage(message, 'user');
        chatInput.value = '';

        // Find matching response
        const botResponse = findResponse(message);
        
        // Add bot response with a small delay
        setTimeout(() => {
            addMessage(botResponse, 'bot');
        }, 500);
    }
}

// Find matching response function
function findResponse(userMessage) {
    userMessage = userMessage.toLowerCase();
    
    // Search through all categories and their resources
    for (const category of Object.values(chatbotResponses.categories)) {
        for (const resource of category.resources) {
            if (userMessage.includes(resource.question.toLowerCase()) ||
                resource.question.toLowerCase().includes(userMessage)) {
                return resource.answer;
            }
        }
    }

    // Default response if no match is found
    return "I'm your cooking assistant! You can ask me about recipes, cooking techniques, or ingredients. Try asking 'How do I make pasta?' or 'What's a quick dinner recipe?'";
}

// Add message to chat
function addMessage(message, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.textContent = message;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Event listeners
sendButton.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize chatbot when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Show initial message
    setTimeout(() => {
        addMessage("Ask me about balanced diets, healthy recipes, or portion control – let's get started!", 'bot');
    }, 500);
});

// Show post modal
postPhotoBtn.addEventListener('click', () => {
    postModal.classList.remove('hidden');
});

// Close post modal
closePostModal.addEventListener('click', () => {
    postModal.classList.add('hidden');
});

// Handle post submission
postForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const dishName = document.getElementById('dish-name').value;
    const mealTime = document.getElementById('post-meal-time').value;
    const description = document.getElementById('dish-description').value;
    const photoFile = document.getElementById('dish-photo').files[0];
    const editId = postForm.dataset.editId;
    
    const handleSubmission = (imageData) => {
        if (editId) {
            // Editing existing post
            const postIndex = communityPosts.findIndex(p => p.id.toString() === editId);
            if (postIndex !== -1) {
                communityPosts[postIndex] = {
                    ...communityPosts[postIndex],
                    name: dishName,
                    mealTime: mealTime,
                    description: description,
                    ...(imageData ? { image: imageData } : {}),
                    timestamp: new Date().toISOString()
                };
            }
            // Clear edit ID
            delete postForm.dataset.editId;
        } else {
            // Creating new post
            const newPost = {
                id: Date.now(),
                name: dishName,
                mealTime: mealTime,
                description: description,
                image: imageData,
                timestamp: new Date().toISOString(),
                ratings: []
            };
            communityPosts.unshift(newPost);
        }
        
        localStorage.setItem('communityPosts', JSON.stringify(communityPosts));
        displayPosts();
        postForm.reset();
        postModal.classList.add('hidden');
    };
    
    if (photoFile) {
        const reader = new FileReader();
        reader.onload = function(event) {
            handleSubmission(event.target.result);
        };
        reader.readAsDataURL(photoFile);
    } else if (editId) {
        // If editing and no new photo, keep existing photo
        handleSubmission();
    }
});

// Filter posts by meal time
mealTimeFilter.addEventListener('change', displayPosts);

// Display posts
function displayPosts() {
    const selectedMealTime = mealTimeFilter.value;
    const filteredPosts = selectedMealTime === 'all' 
        ? communityPosts 
        : communityPosts.filter(post => post.mealTime === selectedMealTime);
    
    communityFeed.innerHTML = '';
    
    filteredPosts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.classList.add('community-post');
        
        // Calculate average rating
        const avgRating = post.ratings ? 
            (post.ratings.reduce((a, b) => a + b, 0) / post.ratings.length).toFixed(1) : 
            '0.0';
        
        postElement.innerHTML = `
            <div class="post-actions">
                <button class="edit-post" data-id="${post.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-post" data-id="${post.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <img src="${post.image}" alt="${post.name}" class="post-image">
            <div class="post-content">
                <div class="post-header">
                    <h3 class="post-title">${post.name}</h3>
                    <span class="post-time">${post.mealTime}</span>
                </div>
                <p class="post-description">${post.description}</p>
                <div class="post-footer">
                    <div class="rating-container">
                        <div class="stars" data-id="${post.id}">
                            ${generateStarRating(post.id, avgRating)}
                        </div>
                        <span class="rating-count">${avgRating} (${post.ratings ? post.ratings.length : 0} ratings)</span>
                    </div>
                    <small>${new Date(post.timestamp).toLocaleDateString()}</small>
                </div>
            </div>
        `;
        
        communityFeed.appendChild(postElement);
        
        // Add event listeners for edit and delete buttons
        const editBtn = postElement.querySelector('.edit-post');
        const deleteBtn = postElement.querySelector('.delete-post');
        const stars = postElement.querySelectorAll('.star');
        
        editBtn.addEventListener('click', () => editPost(post.id));
        deleteBtn.addEventListener('click', () => deletePost(post.id));
        stars.forEach(star => {
            star.addEventListener('click', () => ratePost(post.id, parseInt(star.dataset.value)));
        });
    });
}

// Generate star rating HTML
function generateStarRating(postId, rating) {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
        const starClass = i <= rating ? 'fas' : 'far';
        starsHtml += `<i class="${starClass} fa-star star" data-value="${i}"></i>`;
    }
    return starsHtml;
}

// Add these new functions for edit, delete, and rating functionality
function editPost(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;

    // Populate the modal with existing post data
    document.getElementById('dish-name').value = post.name;
    document.getElementById('post-meal-time').value = post.mealTime;
    document.getElementById('dish-description').value = post.description;
    
    // Add a data attribute to the form to indicate we're editing
    postForm.dataset.editId = postId;
    
    // Show the modal
    postModal.classList.remove('hidden');
}

function deletePost(postId) {
    if (confirm('Are you sure you want to delete this post?')) {
        communityPosts = communityPosts.filter(p => p.id !== postId);
        localStorage.setItem('communityPosts', JSON.stringify(communityPosts));
        displayPosts();
    }
}

function ratePost(postId, rating) {
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;

    // Initialize ratings array if it doesn't exist
    if (!post.ratings) {
        post.ratings = [];
    }

    // Add new rating
    post.ratings.push(rating);
    
    // Update localStorage and refresh display
    localStorage.setItem('communityPosts', JSON.stringify(communityPosts));
    displayPosts();
}

// Initial display of posts
displayPosts();

// Add event listeners for dietary filters
dietaryFilters.addEventListener('change', (e) => {
    if (e.target.classList.contains('dietary-checkbox')) {
        if (e.target.checked) {
            selectedDietaryRestrictions.add(e.target.id);
        } else {
            selectedDietaryRestrictions.delete(e.target.id);
        }
        
        // Refresh the current view
        if (searchTerm.value) {
            // If there's a search term, refresh search results
            searchMeals(searchTerm.value);
        } else {
            // Otherwise, get a new random meal
            getRandomMeal();
        }
    }
});

// Add this function to handle meal filtering
async function filterMeals(meals) {
    if (!meals) return [];
    
    // Get all checked dietary restrictions
    const checkedFilters = Array.from(document.querySelectorAll('.dietary-checkbox:checked'))
        .map(checkbox => checkbox.id);
    
    if (checkedFilters.length === 0) return meals;

    return meals.filter(meal => {
        const ingredients = getIngredientsList(meal).map(ing => ing.toLowerCase());
        
        // Check each selected filter
        return checkedFilters.every(filter => {
            switch (filter) {
                case 'halal':
                    return !ingredients.some(ing => 
                        ['pork', 'bacon', 'ham', 'wine', 'beer', 'alcohol'].some(forbidden => 
                            ing.includes(forbidden)
                        )
                    );
                case 'vegetarian':
                    return !ingredients.some(ing => 
                        ['chicken', 'beef', 'pork', 'fish', 'meat', 'bacon', 'ham'].some(forbidden => 
                            ing.includes(forbidden)
                        )
                    );
                case 'vegan':
                    return !ingredients.some(ing => 
                        ['chicken', 'beef', 'pork', 'fish', 'meat', 'bacon', 'ham', 'milk', 'cream', 
                         'cheese', 'egg', 'honey'].some(forbidden => 
                            ing.includes(forbidden)
                        )
                    );
                case 'gluten-free':
                    return !ingredients.some(ing => 
                        ['flour', 'bread', 'pasta', 'wheat', 'barley', 'rye'].some(forbidden => 
                            ing.includes(forbidden)
                        )
                    );
                case 'dairy-free':
                    return !ingredients.some(ing => 
                        ['milk', 'cream', 'cheese', 'butter', 'yogurt'].some(forbidden => 
                            ing.includes(forbidden)
                        )
                    );
                case 'nut-free':
                    return !ingredients.some(ing => 
                        ['peanut', 'almond', 'cashew', 'walnut', 'pecan', 'pistachio'].some(forbidden => 
                            ing.includes(forbidden)
                        )
                    );
                default:
                    return true;
            }
        });
    });
}

// Update the searchMeals function
async function searchMeals(term) {
    const meals = await getMealsBySearch(term);
    
    if (meals) {
        const filteredMeals = await filterMeals(meals);
        mealsEls.innerHTML = '';
        filteredMeals.forEach((meal) => {
            addMeal(meal);
        });
    }
}

// Add event listener for dietary filters
document.querySelectorAll('.dietary-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (searchTerm.value) {
            searchMeals(searchTerm.value);
        } else {
            getRandomMeal();
        }
    });
});

// Load saved game state
function loadGameState() {
    const defaultGameState = {
        currentCity: 0,
        fruitTokens: 0,
        recipeCards: 0,
        xp: 0,
        lastDaily: null,
        cities: [
            { 
                name: "Tokyo",
                x: 82,
                y: 35,
                requiredXP: 1000,
                collectibles: ["Sushi Master Card", "Ramen Expert Badge", "Japanese Tea Set"],
                unlockedCollectibles: [],
                description: "Master the art of Japanese cuisine"
            },
            { 
                name: "Rome",
                x: 48,
                y: 32,
                requiredXP: 2000,
                collectibles: ["Pizza Chef Card", "Pasta Master Badge", "Italian Herbs Set"],
                unlockedCollectibles: [],
                description: "Experience the flavors of Italy"
            },
            { 
                name: "Paris",
                x: 45,
                y: 30,
                requiredXP: 3000,
                collectibles: ["Pastry Chef Card", "Wine Connoisseur Badge", "French Cuisine Set"],
                unlockedCollectibles: [],
                description: "Discover French culinary excellence"
            },
            { 
                name: "Bangkok",
                x: 75,
                y: 45,
                requiredXP: 4000,
                collectibles: ["Spice Master Card", "Street Food Badge", "Thai Curry Set"],
                unlockedCollectibles: [],
                description: "Explore the vibrant tastes of Thailand"
            }
        ],
        quests: [
            {
                id: 1,
                title: "Water Champion",
                description: "Log water intake 3 times",
                target: 3,
                progress: 0,
                reward: { type: "xp", amount: 50 },
                daily: true
            },
            // ... other quests ...
        ]
    };

    const saved = localStorage.getItem('gameState');
    if (saved) {
        // Merge saved state with default state to ensure all properties exist
        Object.assign(defaultGameState, JSON.parse(saved));
    }
    
    // Update global gameState
    window.gameState = defaultGameState;
    
    return defaultGameState;
}

// Save game state
function saveGameState() {
    localStorage.setItem('gameState', JSON.stringify(gameState));
}

// Update UI elements
function updateUI() {
    // Update stats
    document.getElementById('fruit-tokens').textContent = gameState.fruitTokens;
    document.getElementById('recipe-cards').textContent = gameState.recipeCards;
    document.getElementById('xp-points').textContent = gameState.xp;

    // Update player position on map
    const marker = document.getElementById('player-marker');
    const currentCity = gameState.cities[gameState.currentCity];
    marker.style.left = `${currentCity.x}%`;
    marker.style.top = `${currentCity.y}%`;

    // Update destinations
    updateDestinations();

    // Update quests
    updateQuestsList();

    // Update daily reward button
    updateDailyReward();
}

// Update quests list
function updateQuestsList() {
    const questsList = document.getElementById('quests-list');
    questsList.innerHTML = '';

    gameState.quests.forEach(quest => {
        const progress = (quest.progress / quest.target) * 100;
        const questElement = document.createElement('div');
        questElement.className = 'quest-card';
        questElement.innerHTML = `
            <div class="quest-info">
                <h4>${quest.title}</h4>
                <p>${quest.description}</p>
                <div class="quest-progress">
                    <div class="quest-progress-bar" style="width: ${progress}%"></div>
                </div>
            </div>
            <div class="quest-reward">
                +${quest.reward.amount} ${quest.reward.type}
            </div>
        `;
        questsList.appendChild(questElement);
    });
}

// Handle daily reward
function updateDailyReward() {
    const claimBtn = document.getElementById('claim-daily');
    const lastDaily = gameState.lastDaily ? new Date(gameState.lastDaily) : null;
    const now = new Date();
    
    if (!lastDaily || now.getDate() !== lastDaily.getDate()) {
        claimBtn.disabled = false;
    } else {
        claimBtn.disabled = true;
    }
}

// Claim daily reward
function claimDailyReward() {
    if (document.getElementById('claim-daily').disabled) return;

    gameState.fruitTokens += 10;
    gameState.xp += 100;
    gameState.lastDaily = new Date().toISOString();
    
    saveGameState();
    updateUI();
}

// Progress quest
function progressQuest(questId, amount = 1) {
    const quest = gameState.quests.find(q => q.id === questId);
    if (!quest) return;

    quest.progress = Math.min(quest.progress + amount, quest.target);
    
    if (quest.progress === quest.target) {
        // Award reward
        switch (quest.reward.type) {
            case 'xp':
                gameState.xp += quest.reward.amount;
                checkCityProgress();
                break;
            case 'tokens':
                gameState.fruitTokens += quest.reward.amount;
                break;
            case 'recipe':
                gameState.recipeCards += quest.reward.amount;
                break;
        }
        
        // Reset progress if it's a daily quest
        if (quest.daily) {
            quest.progress = 0;
        }

        // Show reward notification
        showRewardNotification(quest.reward);
    }
    
    saveGameState();
    updateUI();
}

// Move to next city
function progressCity() {
    if (gameState.xp >= (gameState.currentCity + 1) * 1000) {
        gameState.currentCity = (gameState.currentCity + 1) % gameState.cities.length;
        saveGameState();
        updateUI();
    }
}

// Initialize gamification
document.addEventListener('DOMContentLoaded', () => {
    loadGameState();
    
    // Water intake tracking
    const waterButton = document.createElement('button');
    waterButton.className = 'track-water-btn';
    waterButton.innerHTML = '<i class="fas fa-glass-water"></i> Log Water';
    
    const challengesSection = document.querySelector('.challenges-section');
    if (challengesSection) {
        challengesSection.appendChild(waterButton);
        
        waterButton.addEventListener('click', () => {
            progressQuest(1); // Water Champion quest
        });
    }

    // Track vegetarian meal selection
    document.querySelectorAll('.dietary-checkbox').forEach(checkbox => {
        if (checkbox.id === 'vegetarian') {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    progressQuest(4); // Healthy Choice quest
                }
            });
        }
    });

    // Track meal preparation - check if element exists first
    const mealBody = document.querySelector('.meal-body');
    if (mealBody) {
        mealBody.addEventListener('click', () => {
            progressQuest(3); // Home Chef quest
        });
    }

    // Daily reward claim - check if element exists first
    const claimDailyBtn = document.getElementById('claim-daily');
    if (claimDailyBtn) {
        claimDailyBtn.addEventListener('click', claimDailyReward);
    }
});

// Add these functions to handle game mechanics
function updateDestinations() {
    if (!gameState || !gameState.cities) {
        console.error('Game state not properly initialized');
        return;
    }

    let destinations = document.querySelector('.destinations');
    
    if (!destinations) {
        const worldMapSection = document.querySelector('.world-map-section');
        if (!worldMapSection) {
            console.error('World map section not found');
            return;
        }
        destinations = document.createElement('div');
        destinations.className = 'destinations';
        worldMapSection.appendChild(destinations);
    }

    destinations.innerHTML = gameState.cities.map((city, index) => `
        <div class="destination ${index === gameState.currentCity ? 'active' : ''}">
            <h4>${city.name}</h4>
            <div class="city-progress">
                <div class="xp-bar">
                    <div class="xp-progress" style="width: ${Math.min((gameState.xp / city.requiredXP) * 100, 100)}%"></div>
                </div>
                <span>${gameState.xp}/${city.requiredXP} XP</span>
            </div>
            <div class="collectibles">
                ${city.collectibles.map((item, i) => `
                    <div class="collectible ${city.unlockedCollectibles.includes(item) ? 'unlocked' : 'locked'}">
                        <i class="fas ${getCollectibleIcon(item)}"></i>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function getCollectibleIcon(item) {
    if (item.includes('Card')) return 'fa-scroll';
    if (item.includes('Badge')) return 'fa-medal';
    return 'fa-box';
}

// Add notification system
function showRewardNotification(reward) {
    const notification = document.createElement('div');
    notification.className = 'reward-notification';
    
    if (reward.type === 'collectible') {
        notification.innerHTML = `
            <i class="fas ${getCollectibleIcon(reward.name)}"></i>
            New Collectible: ${reward.name}
        `;
    } else {
        notification.innerHTML = `
            <i class="fas ${reward.type === 'xp' ? 'fa-star' : 
                          reward.type === 'tokens' ? 'fa-apple-alt' : 'fa-book-open'}"></i>
            +${reward.amount} ${reward.type}
        `;
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Check city progress and unlock new cities
function checkCityProgress() {
    const currentCity = gameState.cities[gameState.currentCity];
    if (gameState.xp >= currentCity.requiredXP) {
        // Unlock collectibles based on XP milestones
        const collectibleIndex = Math.floor(gameState.xp / (currentCity.requiredXP / currentCity.collectibles.length)) - 1;
        
        for (let i = 0; i <= collectibleIndex; i++) {
            const collectible = currentCity.collectibles[i];
            if (!currentCity.unlockedCollectibles.includes(collectible)) {
                currentCity.unlockedCollectibles.push(collectible);
                showRewardNotification({ type: 'collectible', name: collectible });
            }
        }

        // Check if next city should be unlocked
        const nextCityIndex = gameState.currentCity + 1;
        if (nextCityIndex < gameState.cities.length && 
            gameState.xp >= gameState.cities[nextCityIndex].requiredXP) {
            showCityUnlockNotification(gameState.cities[nextCityIndex].name);
        }
    }
    
    // Update UI
    initializeWorldMap();
    saveGameState();
}

// Add city unlock notification
function showCityUnlockNotification(cityName) {
    const notification = document.createElement('div');
    notification.className = 'city-unlock-notification';
    notification.innerHTML = `
        <i class="fas fa-city"></i>
        New City Unlocked: ${cityName}!
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Add this function to ensure all required elements exist
function ensureGameElements() {
    // Check for world-map-section
    let worldMapSection = document.querySelector('.world-map-section');
    if (!worldMapSection) {
        const gamificationContainer = document.querySelector('.gamification-container');
        worldMapSection = document.createElement('div');
        worldMapSection.className = 'world-map-section';
        worldMapSection.innerHTML = '<h2>World Food Journey</h2>';
        gamificationContainer.appendChild(worldMapSection);
    }

    // Add additional CSS for the new elements
    const additionalStyles = `
        .world-map-section {
            padding: 20px;
            background: #fff;
            border-radius: 8px;
            margin: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .map-container {
            position: relative;
            width: 100%;
            height: 300px;
            margin: 20px 0;
            overflow: hidden;
        }

        .map-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .player-marker {
            position: absolute;
            width: 30px;
            height: 30px;
            background: #4CAF50;
            border-radius: 50%;
            transform: translate(-50%, -50%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        }
    `;

    // Add the additional styles
    const styleElement = document.createElement('style');
    styleElement.textContent = additionalStyles;
    document.head.appendChild(styleElement);
}

// First, define the gameStyles constant
const gameStyles = document.createElement('style');
gameStyles.textContent = `
    .game-controls-panel {
        background: #fff;
        border-radius: 8px;
        padding: 15px;
        margin: 15px 0;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .game-controls {
        text-align: center;
    }

    .control-buttons {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-top: 10px;
    }

    .game-btn {
        background: #4CAF50;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        transition: background 0.3s;
    }

    .destinations {
        margin-top: 20px;
    }

    .destination {
        background: #f5f5f5;
        padding: 15px;
        margin: 10px 0;
        border-radius: 8px;
    }
`;

// Update the initialization code
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Add the styles to the document first
        document.head.appendChild(gameStyles);
        
        // Ensure all required elements exist
        ensureGameElements();
        
        // Initialize the game
        loadGameState();
        initializeGameControls();
        initializeWorldMap();
        updateUI();
    } catch (error) {
        console.error('Error initializing game:', error);
    }
});

// Add this function to initialize game controls
function initializeGameControls() {
    // Create game controls panel
    const controlsPanel = document.createElement('div');
    controlsPanel.className = 'game-controls-panel';
    controlsPanel.innerHTML = `
        <div class="game-controls">
            <h3>Game Controls</h3>
            <div class="control-buttons">
                <button id="water-intake" class="game-btn">
                    <i class="fas fa-glass-water"></i> Log Water Intake
                </button>
                <button id="add-fruit" class="game-btn">
                    <i class="fas fa-apple-alt"></i> Add Fruit Serving
                </button>
                <button id="cook-meal" class="game-btn">
                    <i class="fas fa-utensils"></i> Log Home Cooking
                </button>
                <button id="claim-daily" class="game-btn">
                    <i class="fas fa-gift"></i> Claim Daily Reward
                </button>
            </div>
        </div>
    `;

    // Insert the controls panel before the world-map-section
    const worldMapSection = document.querySelector('.world-map-section');
    if (worldMapSection) {
        worldMapSection.parentNode.insertBefore(controlsPanel, worldMapSection);
    }

    // Add event listeners for the control buttons
    document.getElementById('water-intake')?.addEventListener('click', () => {
        progressQuest(1); // Water Champion quest
        showRewardNotification({ type: 'xp', amount: 10 });
        gameState.xp += 10;
        checkCityProgress();
        updateUI();
    });

    document.getElementById('add-fruit')?.addEventListener('click', () => {
        progressQuest(2); // Fruit Explorer quest
        showRewardNotification({ type: 'tokens', amount: 5 });
        gameState.fruitTokens += 5;
        updateUI();
    });

    document.getElementById('cook-meal')?.addEventListener('click', () => {
        progressQuest(3); // Home Chef quest
        showRewardNotification({ type: 'recipe', amount: 1 });
        gameState.recipeCards += 1;
        gameState.xp += 50;
        checkCityProgress();
        updateUI();
    });

    document.getElementById('claim-daily')?.addEventListener('click', () => {
        claimDailyReward();
    });
}

// Add this function to initialize the world map
function initializeWorldMap() {
    let mapContainer = document.querySelector('.map-container');
    const worldMapSection = document.querySelector('.world-map-section');
    
    if (!mapContainer && worldMapSection) {
        mapContainer = document.createElement('div');
        mapContainer.className = 'map-container';
        mapContainer.innerHTML = `
            <img src="./images/world-map.png" alt="World Map">
            <div class="player-marker" id="player-marker">
                <i class="fas fa-plane"></i>
            </div>
        `;
        worldMapSection.appendChild(mapContainer);
    }

    const playerMarker = document.getElementById('player-marker');
    if (playerMarker && gameState.cities[gameState.currentCity]) {
        const currentCity = gameState.cities[gameState.currentCity];
        playerMarker.style.left = `${currentCity.x}%`;
        playerMarker.style.top = `${currentCity.y}%`;
    }

    updateDestinations();
}
