// ==================== CONFIGURATION ====================
const API_BASE = 'https://www.vidking.net/embed';
const PLAYER_COLOR = 'e50914';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '7901627e4352f597cecc198c6f0b33e1'; // Replace with your TMDB API key

// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_FIREBASE_API_KEY",
    authDomain: "YOUR_FIREBASE_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_FIREBASE_PROJECT_ID",
    storageBucket: "YOUR_FIREBASE_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// Genre Mapping
const GENRES = {
    28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
    99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
    27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
    10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
};

// ==================== THEME MANAGEMENT ====================
// Initialize theme system
function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const defaultTheme = 'dark';
    
    const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButton(currentTheme);
}

// Update theme toggle button
function updateThemeButton(theme) {
    const button = document.getElementById('themeToggle');
    button.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    button.setAttribute('aria-label', theme === 'dark' ? 'Change to light theme' : 'Change to dark theme');
}

// Theme toggle event listener
document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
});

// ==================== AUTHENTICATION ====================
// Monitor auth state
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('authBtn').style.display = 'none';
        document.getElementById('userProfile').style.display = 'block';
        document.getElementById('userName').textContent = user.displayName || user.email;
        document.getElementById('continueLink').style.display = 'block';
        loadContinueWatching();
    } else {
        document.getElementById('authBtn').style.display = 'block';
        document.getElementById('userProfile').style.display = 'none';
        document.getElementById('continueLink').style.display = 'none';
    }
});

// Open auth modal
function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

// Close auth modal
function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

// Switch between login/register tabs
function switchTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    if (tab === 'login') {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    } else {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    }
}

// Register user
function registerUser() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .then(() => {
            closeAuthModal();
            alert('Registration successful!');
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// Login user
function loginUser() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            closeAuthModal();
            alert('Login successful!');
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

// Logout user
function logoutUser() {
    auth.signOut()
        .then(() => {
            alert('Logged out successfully!');
        });
}

// ==================== DATA MANAGEMENT ====================
// Sample data with genre IDs
const popularMovies = [
    { 
        id: 533535, title: 'Deadpool & Wolverine', year: 2024, 
        poster: '/8cdWjvZQUExUUTzyp4pr6VeVsmZ.jpg', 
        genre_ids: [28, 35, 878], rating: 8.5 
    },
    { 
        id: 912649, title: 'Venom: The Last Dance', year: 2024, 
        poster: '/aosm8NMQ3UwkBVqPpwfZ7PWOaA8.jpg', 
        genre_ids: [28, 878, 27], rating: 7.2 
    },
    { 
        id: 1022789, title: 'Terrifier 3', year: 2024, 
        poster: '/l1175ygxl3G6MOtRXXznQ3vxu3A.jpg', 
        genre_ids: [27], rating: 7.8 
    },
    { 
        id: 1184918, title: 'The Legacy of Strangler', year: 2024, 
        poster: '/ekZ1isBgusoGTbG4pY6eyj7e9q2.jpg', 
        genre_ids: [28, 53], rating: 6.5 
    },
    { 
        id: 1087822, title: 'In a Violent Nature', year: 2024, 
        poster: '/qtXNcjUeTdbaQoulbGfv2bBETX8.jpg', 
        genre_ids: [27, 53], rating: 6.8 
    },
    { 
        id: 1010605, title: 'The Killer', year: 2024, 
        poster: '/bxAFILl1kJegrwZ9n2UYoviUJfJ.jpg', 
        genre_ids: [28, 53, 80], rating: 7.5 
    }
];

const popularTVShows = [
    { 
        id: 119051, title: 'Fallout', year: 2024, 
        poster: '/oX6I3YyJMxZltZB8PSk3ml1gLh.jpg', 
        genre_ids: [10765, 10759], rating: 8.7, seasons: 1 
    },
    { 
        id: 60735, title: 'The Flash', year: 2014, 
        poster: '/lUFK7ElGCk9kVEryDJHICeNdmd1.jpg', 
        genre_ids: [28, 12, 878], rating: 7.8, seasons: 9 
    },
    { 
        id: 82856, title: 'The Mandalorian', year: 2019, 
        poster: '/eU1i6eHXlzMOlCf0m7rcASv5kt9.jpg', 
        genre_ids: [10765, 10759, 37], rating: 8.5, seasons: 3 
    },
    { 
        id: 1399, title: 'Game of Thrones', year: 2011, 
        poster: '/u3bZgnGQ9j01xWP2MYowaBSKsw8.jpg', 
        genre_ids: [10765, 18, 10759], rating: 9.2, seasons: 8 
    },
    { 
        id: 66732, title: 'Stranger Things', year: 2016, 
        poster: '/laCJxobHoPVaLQTKxcBW2M8DcPA.jpg', 
        genre_ids: [18, 9648, 10765], rating: 8.7, seasons: 5 
    }
];

// Active filters
let activeFilters = {
    year: '',
    rating: '',
    genres: [],
    search: ''
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    loadMovies();
    loadTVShows();
    loadGenreFilters();
    setupProgressTracking();
    setupStarRating();
});

// Load movies
function loadMovies(filteredData = null) {
    const movieGrid = document.getElementById('movieGrid');
    const data = filteredData || popularMovies;
    movieGrid.innerHTML = '';
    
    data.forEach(movie => {
        movieGrid.appendChild(createMediaCard(movie, 'movie'));
    });
}

// Load TV shows
function loadTVShows(filteredData = null) {
    const tvGrid = document.getElementById('tvGrid');
    const data = filteredData || popularTVShows;
    tvGrid.innerHTML = '';
    
    data.forEach(show => {
        tvGrid.appendChild(createMediaCard(show, 'tv'));
    });
}

// Load genre filters
function loadGenreFilters() {
    const container = document.getElementById('genreChips');
    container.innerHTML = '';
    
    Object.entries(GENRES).forEach(([id, name]) => {
        const chip = document.createElement('span');
        chip.className = 'genre-chip';
        chip.textContent = name;
        chip.dataset.genreId = id;
        chip.onclick = () => toggleGenre(id);
        container.appendChild(chip);
    });
}

// Toggle genre selection
function toggleGenre(genreId) {
    const chip = document.querySelector(`[data-genre-id="${genreId}"]`);
    const index = activeFilters.genres.indexOf(genreId);
    
    if (index > -1) {
        activeFilters.genres.splice(index, 1);
        chip.classList.remove('active');
    } else {
        activeFilters.genres.push(genreId);
        chip.classList.add('active');
    }
}

// Create media card
function createMediaCard(item, type) {
    const card = document.createElement('div');
    card.className = type === 'movie' ? 'movie-card' : 'tv-card';
    
    card.innerHTML = `
        <img src="${TMDB_IMAGE_BASE}${item.poster}" alt="${item.title}" 
             onerror="this.src='https://via.placeholder.com/300x450?text=No+Poster'">
        <div class="${type}-info">
            <h3>${item.title}</h3>
            <p>${item.year} • ${type === 'tv' ? item.seasons + ' Seasons' : 'Movie'}</p>
            <p>⭐ ${item.rating}</p>
            <p class="genres">${item.genre_ids.map(id => GENRES[id]).filter(g => g).join(', ')}</p>
        </div>
    `;
    
    card.onclick = () => type === 'movie' ? playMovie(item.id, item) : playTVShow(item.id, 1, 1, item);
    
    return card;
}

// ==================== PLAYER FUNCTIONS ====================
// Play movie
function playMovie(tmdbId, movieData = null) {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    const episodeSelector = document.getElementById('episodeSelector');
    
    // Hide episode selector for movies
    episodeSelector.style.display = 'none';
    
    // Check for saved progress
    const user = auth.currentUser;
    let startTime = 0;
    if (user) {
        const progressKey = `progress_${user.uid}_${tmdbId}_movie`;
        const saved = localStorage.getItem(progressKey);
        if (saved) {
            const progress = JSON.parse(saved);
            startTime = progress.currentTime || 0;
        }
    }
    
    // Build player URL
    const params = new URLSearchParams({
        color: PLAYER_COLOR,
        autoPlay: 'true',
        progress: Math.floor(startTime)
    });
    
    const playerUrl = `${API_BASE}/movie/${tmdbId}?${params.toString()}`;
    
    container.innerHTML = `
        <iframe
            src="${playerUrl}"
            width="100%"
            height="600"
            frameborder="0"
            allowfullscreen
            allow="autoplay">
        </iframe>
    `;
    
    modal.style.display = 'block';
    
    // Load ratings and reviews
    if (movieData) {
        loadRatingsAndReviews(tmdbId, 'movie', movieData.title);
    }
}

// Play TV show
function playTVShow(tmdbId, season = 1, episode = 1, showData = null) {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    const episodeSelector = document.getElementById('episodeSelector');
    
    // Show episode selector for TV shows
    episodeSelector.style.display = 'block';
    loadEpisodes(tmdbId, season, showData);
    
    // Build player URL
    const params = new URLSearchParams({
        color: PLAYER_COLOR,
        autoPlay: 'true',
        nextEpisode: 'true',
        episodeSelector: 'true'
    });
    
    const playerUrl = `${API_BASE}/tv/${tmdbId}/${season}/${episode}?${params.toString()}`;
    
    container.innerHTML = `
        <iframe
            src="${playerUrl}"
            width="100%"
            height="600"
            frameborder="0"
            allowfullscreen
            allow="autoplay">
        </iframe>
    `;
    
    modal.style.display = 'block';
    
    // Load ratings and reviews
    if (showData) {
        loadRatingsAndReviews(tmdbId, 'tv', showData.title, season, episode);
    }
}

// Load episodes for TV show
function loadEpisodes(tmdbId, season, showData = null) {
    const episodeList = document.getElementById('episodeList');
    const show = showData || popularTVShows.find(s => s.id === tmdbId);
    
    if (!show) return;
    
    episodeList.innerHTML = '';
    
    const episodesPerSeason = {
        1: 8, 2: 10, 3: 10, 4: 10, 5: 12, 6: 10, 7: 7, 8: 6, 9: 9
    };
    
    const episodeCount = episodesPerSeason[season] || 10;
    
    for (let ep = 1; ep <= episodeCount; ep++) {
        const btn = document.createElement('button');
        btn.className = 'episode-btn';
        btn.textContent = `S${season}E${ep}`;
        btn.onclick = () => playTVShow(tmdbId, season, ep, showData);
        episodeList.appendChild(btn);
    }
}

// Close player modal
function closePlayer() {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    
    modal.style.display = 'none';
    container.innerHTML = '';
}

// ==================== SEARCH & FILTERS ====================
// Search content
function searchContent() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    activeFilters.search = searchTerm;
    applyFilters();
}

// Apply filters
function applyFilters() {
    const yearFilter = document.getElementById('yearFilter').value;
    const ratingFilter = document.getElementById('ratingFilter').value;
    
    activeFilters.year = yearFilter;
    activeFilters.rating = ratingFilter;
    
    let filteredMovies = filterData(popularMovies);
    let filteredTV = filterData(popularTVShows);
    
    loadMovies(filteredMovies);
    loadTVShows(filteredTV);
}

// Filter data based on active filters
function filterData(data) {
    return data.filter(item => {
        // Search filter
        if (activeFilters.search && !item.title.toLowerCase().includes(activeFilters.search)) {
            return false;
        }
        
        // Year filter
        if (activeFilters.year) {
            if (activeFilters.year === '2020s' && (item.year < 2020 || item.year > 2029)) {
                return false;
            } else if (activeFilters.year === '2010s' && (item.year < 2010 || item.year > 2019)) {
                return false;
            } else if (item.year != activeFilters.year) {
                return false;
            }
        }
        
        // Rating filter
        if (activeFilters.rating && item.rating < parseInt(activeFilters.rating)) {
            return false;
        }
        
        // Genre filter
        if (activeFilters.genres.length > 0) {
            const hasMatchingGenre = activeFilters.genres.some(genreId => 
                item.genre_ids.includes(parseInt(genreId))
            );
            if (!hasMatchingGenre) return false;
        }
        
        return true;
    });
}

// Reset filters
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('yearFilter').value = '';
    document.getElementById('ratingFilter').value = '';
    
    activeFilters = {
        year: '',
        rating: '',
        genres: [],
        search: ''
    };
    
    document.querySelectorAll('.genre-chip').forEach(chip => {
        chip.classList.remove('active');
    });
    
    loadMovies();
    loadTVShows();
}

// ==================== CONTINUE WATCHING ====================
// Load continue watching items
function loadContinueWatching() {
    const user = auth.currentUser;
    if (!user) return;
    
    const continueGrid = document.getElementById('continueGrid');
    const continueSection = document.getElementById('continue-watching');
    
    // Get progress from localStorage
    const progressKeys = Object.keys(localStorage).filter(key => 
        key.startsWith(`progress_${user.uid}_`)
    );
    
    if (progressKeys.length === 0) {
        continueSection.style.display = 'none';
        return;
    }
    
    continueSection.style.display = 'block';
    continueGrid.innerHTML = '';
    
    progressKeys.slice(0, 6).forEach(key => {
        const progress = JSON.parse(localStorage.getItem(key));
        const [, , tmdbId, type] = key.split('_');
        
        // Find the movie/show data
        const item = type === 'movie' 
            ? popularMovies.find(m => m.id == tmdbId)
            : popularTVShows.find(s => s.id == tmdbId);
        
        if (item) {
            const card = createMediaCard(item, type);
            card.onclick = () => {
                if (type === 'movie') {
                    playMovie(item.id, item);
                } else {
                    playTVShow(item.id, 1, 1, item);
                }
            };
            continueGrid.appendChild(card);
        }
    });
}

// ==================== RATINGS & REVIEWS ====================
// Load ratings and reviews
function loadRatingsAndReviews(tmdbId, type, title, season = null, episode = null) {
    const user = auth.currentUser;
    const contentKey = `${type}_${tmdbId}_${season || ''}_${episode || ''}`;
    
    // Load average rating
    db.collection('ratings').doc(contentKey).get().then(doc => {
        if (doc.exists) {
            const data = doc.data();
            const avgRating = (data.totalRating / data.totalUsers).toFixed(1);
            document.getElementById('avgRating').innerHTML = `
                <p>Average Rating: ⭐ ${avgRating} (${data.totalUsers} users)</p>
            `;
        } else {
            document.getElementById('avgRating').innerHTML = '<p>No ratings yet</p>';
        }
    });
    
    // Load user rating
    if (user) {
        db.collection('userRatings').doc(user.uid).collection('ratings')
            .doc(contentKey).get().then(doc => {
                if (doc.exists) {
                    const rating = doc.data().rating;
                    highlightStars(rating);
                }
            });
    }
    
    // Load reviews
    loadReviews(contentKey);
}

// Setup star rating system
function setupStarRating() {
    const stars = document.querySelectorAll('#userRating span');
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.dataset.rating);
            submitUserRating(rating);
        });
        
        star.addEventListener('mouseenter', () => {
            const rating = parseInt(star.dataset.rating);
            highlightStars(rating);
        });
    });
    
    document.getElementById('userRating').addEventListener('mouseleave', () => {
        // Reset to saved rating
        const user = auth.currentUser;
        if (user) {
            // Load saved rating again
        }
    });
}

// Highlight stars
function highlightStars(rating) {
    const stars = document.querySelectorAll('#userRating span');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.style.filter = 'brightness(1.5)';
        } else {
            star.style.filter = 'none';
        }
    });
}

// Submit user rating
function submitUserRating(rating) {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login to rate content');
        return;
    }
    
    const modal = document.getElementById('playerModal');
    const contentKey = modal.dataset.contentKey;
    
    if (!contentKey) return;
    
    // Update user rating
    db.collection('userRatings').doc(user.uid).collection('ratings')
        .doc(contentKey).set({
            rating: rating,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    
    // Update global rating
    const ratingsRef = db.collection('ratings').doc(contentKey);
    
    db.runTransaction(transaction => {
        return transaction.get(ratingsRef).then(doc => {
            if (doc.exists) {
                const data = doc.data();
                transaction.update(ratingsRef, {
                    totalRating: data.totalRating + rating,
                    totalUsers: data.totalUsers + 1
                });
            } else {
                transaction.set(ratingsRef, {
                    totalRating: rating,
                    totalUsers: 1
                });
            }
        });
    }).then(() => {
        alert('Rating submitted!');
        highlightStars(rating);
        loadRatingsAndReviews(...contentKey.split('_'));
    });
}

// Submit review
function submitRating() {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login to write a review');
        return;
    }
    
    const reviewText = document.getElementById('reviewText').value;
    const modal = document.getElementById('playerModal');
    const contentKey = modal.dataset.contentKey;
    
    if (!reviewText.trim()) {
        alert('Please write a review');
        return;
    }
    
    db.collection('reviews').add({
        contentKey: contentKey,
        userId: user.uid,
        userName: user.displayName || user.email,
        review: reviewText,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert('Review submitted!');
        document.getElementById('reviewText').value = '';
        loadReviews(contentKey);
    });
}

// Load reviews
function loadReviews(contentKey) {
    const reviewsList = document.getElementById('reviewsList');
    reviewsList.innerHTML = '<h4>Reviews</h4>';
    
    db.collection('reviews')
        .where('contentKey', '==', contentKey)
        .orderBy('timestamp', 'desc')
        .get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                const review = doc.data();
                const reviewItem = document.createElement('div');
                reviewItem.className = 'review-item';
                reviewItem.innerHTML = `
                    <strong>${review.userName}</strong>
                    <p>${review.review}</p>
                    <small>${review.timestamp.toDate().toLocaleDateString()}</small>
                `;
                reviewsList.appendChild(reviewItem);
            });
        });
}

// ==================== PROGRESS TRACKING ====================
// Setup progress tracking from player
function setupProgressTracking() {
    window.addEventListener('message', function(event) {
        try {
            if (event.origin !== 'https://www.vidking.net') return;
            
            const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            
            if (data.type === 'PLAYER_EVENT') {
                handlePlayerEvent(data.data);
            }
        } catch (e) {
            console.error('Error parsing player message:', e);
        }
    });
}

// Handle player events
function handlePlayerEvent(eventData) {
    const user = auth.currentUser;
    if (!user) return;
    
    const { event, currentTime, duration, progress, id, mediaType, season, episode } = eventData;
    
    const contentKey = `${mediaType}_${id}_${season || ''}_${episode || ''}`;
    const modal = document.getElementById('playerModal');
    modal.dataset.contentKey = contentKey;
    
    // Save progress to localStorage
    const progressKey = `progress_${user.uid}_${id}_${mediaType}_${season || ''}_${episode || ''}`;
    
    if (['timeupdate', 'pause', 'ended'].includes(event)) {
        const progressData = {
            currentTime,
            duration,
            progress,
            timestamp: Date.now(),
            title: mediaType === 'movie' ? 
                (popularMovies.find(m => m.id == id)?.title || '') :
                (popularTVShows.find(s => s.id == id)?.title || '')
        };
        
        localStorage.setItem(progressKey, JSON.stringify(progressData));
        
        // Update continue watching
        loadContinueWatching();
    }
    
    // Display progress
    const progressDisplay = document.getElementById('progressDisplay');
    if (event === 'timeupdate' && progress > 0 && progress < 90) {
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        
        progressDisplay.innerHTML = `
            <strong>Continue Watching:</strong><br>
            ${mediaType === 'movie' ? 'Movie' : `S${season}E${episode}`}<br>
            ${minutes}:${seconds.toString().padStart(2, '0')} / ${Math.floor(duration / 60)} min<br>
            ${Math.round(progress)}%
        `;
        progressDisplay.style.display = 'block';
    } else if (event === 'ended') {
        setTimeout(() => {
            progressDisplay.style.display = 'none';
        }, 3000);
    }
}

// ==================== UTILITY FUNCTIONS ====================
// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('playerModal');
    if (event.target === modal) {
        closePlayer();
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePlayer();
        closeAuthModal();
    }
});

// Scroll to sections
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});
