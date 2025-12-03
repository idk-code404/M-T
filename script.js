// ==================== CONFIGURATION ====================
// ⚠️ CRITICAL: Replace these with your actual API keys
const API_BASE = 'https://www.vidking.net/embed';
const PLAYER_COLOR = 'e50914';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '7901627e4352f597cecc198c6f0b33e1'; // ⚠️ REQUIRED: Get from https://www.themoviedb.org/settings/api

// ⚠️ CRITICAL: Get from Firebase Console > Project Settings > General
const firebaseConfig = {
    apiKey: "AIzaSyADR6f5fyv2hAAhDoF7wrie2wF6q0UNBOY",
    authDomain: "movie-ac414.firebaseapp.com",
    projectId: "movie-ac414",
    storageBucket: "movie-ac414.firebasestorage.app",
    messagingSenderId: "415859175148",
    appId: "1:415859175148:web:9233c5319a43886b8bffc9"
};

// Validation function
function validateConfig() {
    const errors = [];
    
    if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
        errors.push('TMDB_API_KEY is not set');
    }
    
    if (firebaseConfig.apiKey === 'YOUR_FIREBASE_API_KEY') {
        errors.push('Firebase config is not set');
    }
    
    if (errors.length > 0) {
        showError(`CONFIGURATION ERROR: ${errors.join(', ')}`);
        throw new Error('Configuration not complete');
    }
}

// Error handling function
function showError(message) {
    const errorDiv = document.getElementById('errorDisplay');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 5000);
    console.error('❌ ERROR:', message);
}

// Initialize Firebase with error handling
try {
    validateConfig();
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} catch (error) {
    showError('Failed to initialize Firebase: ' + error.message);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Navigation state
let currentSection = 'movies';
let previousSection = 'movies';

// Touch gesture tracking
let touchStartX = 0;
let touchEndX = 0;

// ==================== THEME MANAGEMENT ====================
function initTheme() {
    try {
        const savedTheme = localStorage.getItem('theme');
        const currentTheme = savedTheme || 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeButton(currentTheme);
        console.log('🎨 Theme initialized:', currentTheme);
    } catch (error) {
        console.error('❌ Theme initialization error:', error);
    }
}

function updateThemeButton(theme) {
    try {
        const button = document.getElementById('themeToggle');
        button.innerHTML = theme === 'dark' ? '☀️' : '🌙';
        button.setAttribute('aria-label', theme === 'dark' ? 'Change to light theme' : 'Change to dark theme');
    } catch (error) {
        console.error('❌ Theme button update error:', error);
    }
}

// Add theme toggle with error handling
try {
    document.getElementById('themeToggle').addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeButton(newTheme);
        console.log('🎨 Theme changed to:', newTheme);
    });
} catch (error) {
    console.error('❌ Theme toggle error:', error);
}

// ==================== AUTHENTICATION ====================
try {
    auth.onAuthStateChanged(user => {
        try {
            if (user) {
                console.log('✅ User logged in:', user.email);
                document.getElementById('authBtn').style.display = 'none';
                document.getElementById('userProfile').style.display = 'flex';
                document.getElementById('userName').textContent = user.displayName || user.email;
                document.getElementById('continueLink').style.display = 'block';
                loadContinueWatching();
            } else {
                console.log('ℹ️ No user logged in');
                document.getElementById('authBtn').style.display = 'block';
                document.getElementById('userProfile').style.display = 'none';
                document.getElementById('continueLink').style.display = 'none';
            }
        } catch (error) {
            console.error('❌ Auth state change error:', error);
        }
    });
} catch (error) {
    console.error('❌ Auth initialization error:', error);
}

function openAuthModal() {
    try {
        document.getElementById('authModal').style.display = 'block';
    } catch (error) {
        console.error('❌ Failed to open auth modal:', error);
    }
}

function closeAuthModal() {
    try {
        document.getElementById('authModal').style.display = 'none';
    } catch (error) {
        console.error('❌ Failed to close auth modal:', error);
    }
}

function switchTab(tab) {
    try {
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
    } catch (error) {
        console.error('❌ Tab switch error:', error);
    }
}

function registerUser() {
    try {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        
        if (!name || !email || !password) {
            alert('Please fill all fields');
            return;
        }
        
        if (password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }
        
        console.log('📝 Registering user:', email);
        auth.createUserWithEmailAndPassword(email, password)
            .then(userCredential => {
                return userCredential.user.updateProfile({ displayName: name });
            })
            .then(() => {
                closeAuthModal();
                alert('Registration successful!');
                console.log('✅ User registered');
            })
            .catch(error => {
                alert('Error: ' + error.message);
                console.error('❌ Registration error:', error);
                showError('Registration failed: ' + error.message);
            });
    } catch (error) {
        console.error('❌ Register function error:', error);
    }
}

function loginUser() {
    try {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            alert('Please enter email and password');
            return;
        }
        
        console.log('🔑 Logging in user:', email);
        auth.signInWithEmailAndPassword(email, password)
            .then(() => {
                closeAuthModal();
                alert('Login successful!');
                console.log('✅ User logged in');
            })
            .catch(error => {
                alert('Error: ' + error.message);
                console.error('❌ Login error:', error);
                showError('Login failed: ' + error.message);
            });
    } catch (error) {
        console.error('❌ Login function error:', error);
    }
}

function logoutUser() {
    try {
        console.log('🚪 Logging out user');
        auth.signOut()
            .then(() => {
                alert('Logged out successfully!');
                console.log('✅ User logged out');
            })
            .catch(error => {
                console.error('❌ Logout error:', error);
                showError('Logout failed: ' + error.message);
            });
    } catch (error) {
        console.error('❌ Logout function error:', error);
    }
}

// ==================== MOBILE MENU & NAVIGATION ====================
function toggleMobileMenu() {
    try {
        const nav = document.querySelector('.nav');
        nav.classList.toggle('active');
        console.log('📱 Mobile menu toggled:', nav.classList.contains('active'));
    } catch (error) {
        console.error('❌ Mobile menu toggle error:', error);
    }
}

function showSection(sectionName, clickedLink) {
    try {
        console.log('🧭 Navigating to:', sectionName);
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        if (clickedLink) {
            clickedLink.classList.add('active');
        }
        
        // Hide all sections
        const sections = ['movies', 'tv', 'search', 'continue-watching', 'searchResults'];
        sections.forEach(section => {
            document.getElementById(section).style.display = 'none';
        });
        
        // Show selected section
        document.getElementById(sectionName).style.display = 'block';
        
        // Close mobile menu if open
        document.querySelector('.nav').classList.remove('active');
        
        // Update navigation state
        previousSection = currentSection;
        currentSection = sectionName;
        
        // Load section-specific data
        if (sectionName === 'continue-watching') {
            loadContinueWatching();
        }
        
        console.log('✅ Section loaded:', sectionName);
    } catch (error) {
        console.error('❌ Navigation error:', error);
        showError('Navigation failed: ' + error.message);
    }
}

// ==================== TMDB API FUNCTIONS ====================
async function fetchWithErrorHandling(url, action) {
    try {
        console.log(`📡 ${action}:`, url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`❌ ${action} failed:`, error);
        showError(`${action} failed. Check your API key and internet connection.`);
        throw error;
    }
}

async function fetchPopularMovies() {
    if (!TMDB_API_KEY) {
        showError('TMDB API key is missing!');
        return [];
    }
    
    try {
        const url = `${TMDB_API_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
        const data = await fetchWithErrorHandling(url, 'Fetch popular movies');
        
        if (!data.results) {
            throw new Error('Invalid response from TMDB');
        }
        
        const movies = data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
            poster: movie.poster_path || '',
            rating: movie.vote_average?.toFixed(1) || '0.0',
            genre_ids: movie.genre_ids || []
        }));
        console.log('✅ Movies fetched:', movies.length);
        return movies;
    } catch (error) {
        console.error('❌ Failed to fetch movies:', error);
        showError('Failed to load movies');
        return [];
    }
}

async function fetchPopularTVShows() {
    if (!TMDB_API_KEY) {
        showError('TMDB API key is missing!');
        return [];
    }
    
    try {
        const url = `${TMDB_API_BASE}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`;
        const data = await fetchWithErrorHandling(url, 'Fetch popular TV shows');
        
        if (!data.results) {
            throw new Error('Invalid response from TMDB');
        }
        
        const shows = data.results.map(show => ({
            id: show.id,
            title: show.name,
            year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'Unknown',
            poster: show.poster_path || '',
            rating: show.vote_average?.toFixed(1) || '0.0',
            genre_ids: show.genre_ids || [],
            seasons: show.number_of_seasons || 1
        }));
        console.log('✅ TV shows fetched:', shows.length);
        return shows;
    } catch (error) {
        console.error('❌ Failed to fetch TV shows:', error);
        showError('Failed to load TV shows');
        return [];
    }
}

async function searchMovies(query) {
    if (!TMDB_API_KEY) {
        showError('TMDB API key is missing!');
        return [];
    }
    
    if (!query.trim()) {
        return [];
    }
    
    try {
        const url = `${TMDB_API_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`;
        const data = await fetchWithErrorHandling(url, 'Search movies');
        
        if (!data.results) {
            throw new Error('Invalid search response');
        }
        
        return data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: movie.release_date ? new Date(movie.release_date).getFullYear() : 'Unknown',
            poster: movie.poster_path || '',
            rating: movie.vote_average?.toFixed(1) || '0.0',
            genre_ids: movie.genre_ids || []
        }));
    } catch (error) {
        console.error('❌ Movie search failed:', error);
        showError('Movie search failed');
        return [];
    }
}

async function searchTVShows(query) {
    if (!TMDB_API_KEY) {
        showError('TMDB API key is missing!');
        return [];
    }
    
    if (!query.trim()) {
        return [];
    }
    
    try {
        const url = `${TMDB_API_BASE}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`;
        const data = await fetchWithErrorHandling(url, 'Search TV shows');
        
        if (!data.results) {
            throw new Error('Invalid search response');
        }
        
        return data.results.map(show => ({
            id: show.id,
            title: show.name,
            year: show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'Unknown',
            poster: show.poster_path || '',
            rating: show.vote_average?.toFixed(1) || '0.0',
            genre_ids: show.genre_ids || [],
            seasons: show.number_of_seasons || 1
        }));
    } catch (error) {
        console.error('❌ TV search failed:', error);
        showError('TV show search failed');
        return [];
    }
}

// ==================== FIRESTORE FUNCTIONS ====================
async function saveMovieToFirebase(movie) {
    try {
        if (!movie || !movie.id) {
            throw new Error('Invalid movie data');
        }
        await db.collection('movies').doc(movie.id.toString()).set({
            ...movie,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('💾 Movie saved:', movie.title);
    } catch (error) {
        console.error('❌ Failed to save movie:', error);
    }
}

async function saveTVShowToFirebase(show) {
    try {
        if (!show || !show.id) {
            throw new Error('Invalid TV show data');
        }
        await db.collection('tvShows').doc(show.id.toString()).set({
            ...show,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('💾 TV Show saved:', show.title);
    } catch (error) {
        console.error('❌ Failed to save TV show:', error);
    }
}

async function getMoviesFromFirebase() {
    try {
        const snapshot = await db.collection('movies').get();
        const movies = snapshot.docs.map(doc => doc.data());
        console.log('📂 Movies loaded from Firebase:', movies.length);
        return movies;
    } catch (error) {
        console.error('❌ Failed to load movies from Firebase:', error);
        showError('Failed to load movies from database');
        return [];
    }
}

async function getTVShowsFromFirebase() {
    try {
        const snapshot = await db.collection('tvShows').get();
        const shows = snapshot.docs.map(doc => doc.data());
        console.log('📂 TV shows loaded from Firebase:', shows.length);
        return shows;
    } catch (error) {
        console.error('❌ Failed to load TV shows from Firebase:', error);
        showError('Failed to load TV shows from database');
        return [];
    }
}

async function loadMoviesFromFirebaseOrAPI() {
    try {
        let movies = await getMoviesFromFirebase();
        
        if (movies.length === 0) {
            console.log('📂 No movies in Firebase, fetching from TMDB...');
            movies = await fetchPopularMovies();
            
            if (movies.length > 0) {
                // Save to Firebase in batches to avoid rate limits
                for (const movie of movies) {
                    await saveMovieToFirebase(movie);
                }
            }
        }
        
        loadMovies(movies);
    } catch (error) {
        console.error('❌ Failed to load movies:', error);
        showError('Failed to load movies');
    }
}

async function loadTVShowsFromFirebaseOrAPI() {
    try {
        let tvShows = await getTVShowsFromFirebase();
        
        if (tvShows.length === 0) {
            console.log('📂 No TV shows in Firebase, fetching from TMDB...');
            tvShows = await fetchPopularTVShows();
            
            if (tvShows.length > 0) {
                // Save to Firebase in batches
                for (const show of tvShows) {
                    await saveTVShowToFirebase(show);
                }
            }
        }
        
        loadTVShows(tvShows);
    } catch (error) {
        console.error('❌ Failed to load TV shows:', error);
        showError('Failed to load TV shows');
    }
}

// ==================== UI FUNCTIONS ====================
function createMediaCard(item, type) {
    try {
        if (!item || !item.id) {
            console.warn('⚠️ Invalid item data:', item);
            return document.createElement('div'); // Return empty div as fallback
        }
        
        const card = document.createElement('div');
        card.className = type === 'movie' ? 'movie-card' : 'tv-card';
        
        // Touch feedback
        card.addEventListener('touchstart', () => {
            card.style.transform = 'scale(0.98)';
        });
        card.addEventListener('touchend', () => {
            card.style.transform = '';
        });
        
        // Safe poster URL
        const posterUrl = item.poster ? `${TMDB_IMAGE_BASE}${item.poster}` : '';
        const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFBvc3RlcjwvdGV4dD48L3N2Zz4=';
        
        // Safe year and rating
        const year = item.year || 'Unknown';
        const rating = item.rating?.toString() || '0.0';
        
        // Safe genres
        let genres = '';
        if (item.genre_ids && Array.isArray(item.genre_ids)) {
            const GENRES = {
                28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
                99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
                27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
                10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western"
            };
            genres = item.genre_ids.map(id => GENRES[id]).filter(g => g).join(', ');
        }
        
        card.innerHTML = `
            <img src="${posterUrl}" alt="${item.title}" 
                 onerror="this.src='${placeholder}'" loading="lazy">
            <div class="${type}-info">
                <h3>${item.title}</h3>
                <p>${year} • ${type === 'tv' ? (item.seasons || 1) + ' Seasons' : 'Movie'}</p>
                <p>⭐ ${rating}</p>
                ${genres ? `<p class="genres">${genres}</p>` : ''}
            </div>
        `;
        
        card.onclick = () => {
            console.log('🖱️ Card clicked:', item.title);
            type === 'movie' ? playMovie(item.id, item) : playTVShow(item.id, 1, 1, item);
        };
        
        return card;
    } catch (error) {
        console.error('❌ Failed to create media card:', error);
        return document.createElement('div');
    }
}

function loadMovies(filteredData = null) {
    try {
        const movieGrid = document.getElementById('movieGrid');
        if (!movieGrid) {
            console.error('❌ movieGrid element not found');
            return;
        }
        
        const data = filteredData || [];
        movieGrid.innerHTML = '';
        
        data.forEach(movie => {
            movieGrid.appendChild(createMediaCard(movie, 'movie'));
        });
    } catch (error) {
        console.error('❌ Failed to load movies:', error);
        showError('Failed to display movies');
    }
}

function loadTVShows(filteredData = null) {
    try {
        const tvGrid = document.getElementById('tvGrid');
        if (!tvGrid) {
            console.error('❌ tvGrid element not found');
            return;
        }
        
        const data = filteredData || [];
        tvGrid.innerHTML = '';
        
        data.forEach(show => {
            tvGrid.appendChild(createMediaCard(show, 'tv'));
        });
    } catch (error) {
        console.error('❌ Failed to load TV shows:', error);
        showError('Failed to display TV shows');
    }
}

// ==================== SEARCH FUNCTIONS ====================
function clearSearch() {
    try {
        console.log('🔄 Clearing search');
        document.getElementById('searchInput').value = '';
        
        // Hide search results
        document.getElementById('searchResults').style.display = 'none';
        
        // Show the original section
        document.getElementById(previousSection).style.display = 'block';
        
        // Update nav active state
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[onclick="showSection('${previousSection}', this)"]`)?.classList.add('active');
        
        currentSection = previousSection;
    } catch (error) {
        console.error('❌ Clear search error:', error);
    }
}

async function searchContent() {
    try {
        const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
        
        if (!searchTerm) {
            clearSearch();
            return;
        }
        
        console.log('🔍 Quick searching for:', searchTerm);
        
        // Store current section before searching
        previousSection = currentSection;
        
        // Show search results
        document.getElementById('searchResults').style.display = 'block';
        
        // Hide all other sections
        const sections = ['movies', 'tv', 'search', 'continue-watching'];
        sections.forEach(section => {
            document.getElementById(section).style.display = 'none';
        });
        
        // Deactivate nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const searchGrid = document.getElementById('searchGrid');
        searchGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Searching...</p>';
        
        // Validate TMDB API key
        if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
            throw new Error('TMDB API key is not configured');
        }
        
        const [movieResults, tvResults] = await Promise.all([
            searchMovies(searchTerm),
            searchTVShows(searchTerm)
        ]);
        
        searchGrid.innerHTML = '';
        
        const resultsCount = movieResults.length + tvResults.length;
        document.getElementById('searchTitle').textContent = `Search Results (${resultsCount} found)`;
        
        if (movieResults.length > 0) {
            const moviesHeader = document.createElement('h3');
            moviesHeader.textContent = `Movies (${movieResults.length})`;
            moviesHeader.style.gridColumn = '1/-1';
            moviesHeader.style.color = 'var(--color-primary)';
            moviesHeader.style.marginTop = '20px';
            searchGrid.appendChild(moviesHeader);
            
            movieResults.forEach(movie => {
                searchGrid.appendChild(createMediaCard(movie, 'movie'));
            });
        }
        
        if (tvResults.length > 0) {
            const tvHeader = document.createElement('h3');
            tvHeader.textContent = `TV Shows (${tvResults.length})`;
            tvHeader.style.gridColumn = '1/-1';
            tvHeader.style.color = 'var(--color-primary)';
            tvHeader.style.marginTop = '20px';
            searchGrid.appendChild(tvHeader);
            
            tvResults.forEach(show => {
                searchGrid.appendChild(createMediaCard(show, 'tv'));
            });
        }
        
        if (resultsCount === 0) {
            searchGrid.innerHTML = `
                <p style="text-align: center; grid-column: 1/-1; padding: 40px;">
                    No results found for "${searchTerm}"
                </p>
            `;
        }
        
    } catch (error) {
        console.error('❌ Search error:', error);
        showError('Search failed: ' + error.message);
        const searchGrid = document.getElementById('searchGrid');
        searchGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: red;">Search failed. Check API key and try again.</p>';
    }
}

// Advanced Search for Search Tab
async function advancedSearch() {
    try {
        const query = document.getElementById('advancedSearchInput').value.trim();
        const contentType = document.getElementById('contentTypeFilter').value;
        const yearFilter = document.getElementById('advancedYearFilter').value;
        const ratingFilter = document.getElementById('advancedRatingFilter').value;
        const genreFilter = document.getElementById('advancedGenreFilter').value;
        
        if (!query && !genreFilter && !yearFilter && !ratingFilter) {
            alert('Please enter at least one search criteria');
            return;
        }
        
        console.log('🔍 Advanced searching:', { query, contentType, yearFilter, ratingFilter, genreFilter });
        
        const searchGrid = document.getElementById('advancedSearchGrid');
        searchGrid.classList.add('loading');
        searchGrid.innerHTML = '<p>Searching with filters...</p>';
        
        // Validate TMDB API key
        if (TMDB_API_KEY === 'YOUR_TMDB_API_KEY_HERE') {
            throw new Error('TMDB API key is not configured');
        }
        
        let allResults = [];
        
        if (contentType === '' || contentType === 'movie') {
            const movieResults = await searchMovies(query);
            allResults = allResults.concat(movieResults.map(m => ({...m, media_type: 'movie'})));
        }
        
        if (contentType === '' || contentType === 'tv') {
            const tvResults = await searchTVShows(query);
            allResults = allResults.concat(tvResults.map(t => ({...t, media_type: 'tv'})));
        }
        
        let filteredResults = allResults.filter(item => {
            if (yearFilter) {
                if (yearFilter === '2020s' && (item.year < 2020 || item.year > 2029)) return false;
                else if (yearFilter === '2010s' && (item.year < 2010 || item.year > 2019)) return false;
                else if (yearFilter === '2000s' && (item.year < 2000 || item.year > 2009)) return false;
                else if (item.year != yearFilter) return false;
            }
            
            if (ratingFilter && parseFloat(item.rating) < parseInt(ratingFilter)) return false;
            
            if (genreFilter && (!item.genre_ids || !item.genre_ids.includes(parseInt(genreFilter)))) return false;
            
            return true;
        });
        
        filteredResults.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
        
        searchGrid.classList.remove('loading');
        searchGrid.innerHTML = '';
        
        if (filteredResults.length === 0) {
            searchGrid.innerHTML = `
                <p style="text-align: center; grid-column: 1/-1; padding: 40px;">
                    No results found for your search criteria
                </p>
            `;
        } else {
            filteredResults.forEach(item => {
                searchGrid.appendChild(createMediaCard(item, item.media_type));
            });
        }
        
    } catch (error) {
        console.error('❌ Advanced search error:', error);
        showError('Advanced search failed: ' + error.message);
        const searchGrid = document.getElementById('advancedSearchGrid');
        searchGrid.classList.remove('loading');
        searchGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: red;">Search failed. Check API key and try again.</p>';
    }
}

function clearAdvancedSearch() {
    try {
        console.log('🔄 Clearing advanced search');
        document.getElementById('advancedSearchInput').value = '';
        document.getElementById('contentTypeFilter').value = '';
        document.getElementById('advancedYearFilter').value = '';
        document.getElementById('advancedRatingFilter').value = '';
        document.getElementById('advancedGenreFilter').value = '';
        document.getElementById('advancedSearchGrid').innerHTML = '';
    } catch (error) {
        console.error('❌ Clear advanced search error:', error);
    }
}

// ==================== PLAYER FUNCTIONS ====================
function playMovie(tmdbId, movieData = null) {
    try {
        console.log('▶️ Playing movie:', tmdbId);
        const modal = document.getElementById('playerModal');
        const container = document.getElementById('playerContainer');
        const episodeSelector = document.getElementById('episodeSelector');
        
        if (!modal || !container) {
            throw new Error('Player elements not found');
        }
        
        episodeSelector.style.display = 'none';
        
        const user = auth.currentUser;
        let startTime = 0;
        if (user) {
            const progressKey = `progress_${user.uid}_${tmdbId}_movie`;
            const saved = localStorage.getItem(progressKey);
            if (saved) {
                const progress = JSON.parse(saved);
                startTime = progress.currentTime || 0;
                console.log('📊 Resuming from:', startTime);
            }
        }
        
        const params = new URLSearchParams({
            color: PLAYER_COLOR,
            autoPlay: 'true',
            progress: Math.floor(startTime)
        });
        
        const playerUrl = `${API_BASE}/movie/${tmdbId}?${params.toString()}`;
        
        container.innerHTML = `
            <iframe src="${playerUrl}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay"></iframe>
        `;
        
        modal.style.display = 'block';
        
        if (movieData) {
            modal.dataset.contentKey = `movie_${tmdbId}__`;
            loadRatingsAndReviews(tmdbId, 'movie', movieData.title);
        }
    } catch (error) {
        console.error('❌ Failed to play movie:', error);
        showError('Failed to load player: ' + error.message);
    }
}

function playTVShow(tmdbId, season = 1, episode = 1, showData = null) {
    try {
        console.log('▶️ Playing TV show:', tmdbId, 'S' + season + 'E' + episode);
        const modal = document.getElementById('playerModal');
        const container = document.getElementById('playerContainer');
        const episodeSelector = document.getElementById('episodeSelector');
        
        if (!modal || !container) {
            throw new Error('Player elements not found');
        }
        
        episodeSelector.style.display = 'block';
        loadEpisodes(tmdbId, season, showData);
        
        const params = new URLSearchParams({
            color: PLAYER_COLOR,
            autoPlay: 'true',
            nextEpisode: 'true',
            episodeSelector: 'true'
        });
        
        const playerUrl = `${API_BASE}/tv/${tmdbId}/${season}/${episode}?${params.toString()}`;
        
        container.innerHTML = `
            <iframe src="${playerUrl}" width="100%" height="100%" frameborder="0" allowfullscreen allow="autoplay"></iframe>
        `;
        
        modal.style.display = 'block';
        
        if (showData) {
            modal.dataset.contentKey = `tv_${tmdbId}_${season}_${episode}`;
            loadRatingsAndReviews(tmdbId, 'tv', showData.title, season, episode);
        }
    } catch (error) {
        console.error('❌ Failed to play TV show:', error);
        showError('Failed to load player: ' + error.message);
    }
}

function loadEpisodes(tmdbId, season, showData = null) {
    try {
        const episodeList = document.getElementById('episodeList');
        if (!episodeList) {
            console.error('❌ Episode list element not found');
            return;
        }
        
        episodeList.innerHTML = '';
        
        // Safe episode count
        const episodesPerSeason = {
            1: 8, 2: 10, 3: 10, 4: 10, 5: 12, 6: 10, 7: 7, 8: 6, 9: 9
        };
        
        const episodeCount = (showData && showData.seasons) ? episodesPerSeason[season] || 10 : 10;
        
        for (let ep = 1; ep <= episodeCount; ep++) {
            const btn = document.createElement('button');
            btn.className = 'episode-btn';
            btn.textContent = `S${season}E${ep}`;
            btn.onclick = () => playTVShow(tmdbId, season, ep, showData);
            episodeList.appendChild(btn);
        }
    } catch (error) {
        console.error('❌ Failed to load episodes:', error);
    }
}

function closePlayer() {
    try {
        console.log('❌ Closing player');
        const modal = document.getElementById('playerModal');
        const container = document.getElementById('playerContainer');
        
        if (modal) {
            modal.style.display = 'none';
        }
        if (container) {
            container.innerHTML = '';
        }
    } catch (error) {
        console.error('❌ Failed to close player:', error);
    }
}

// ==================== CONTINUE WATCHING ====================
function loadContinueWatching() {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        console.log('📺 Loading continue watching...');
        const continueGrid = document.getElementById('continueGrid');
        const continueSection = document.getElementById('continue-watching');
        
        if (!continueGrid || !continueSection) {
            console.error('❌ Continue watching elements not found');
            return;
        }
        
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
            try {
                const progress = JSON.parse(localStorage.getItem(key));
                const [, , tmdbId, type] = key.split('_');
                
                const item = type === 'movie' 
                    ? { id: tmdbId, title: progress.title || 'Movie', poster: '', rating: 0, genre_ids: [] }
                    : { id: tmdbId, title: progress.title || 'TV Show', poster: '', rating: 0, genre_ids: [], seasons: 1 };
                
                const card = createMediaCard(item, type);
                card.onclick = () => {
                    if (type === 'movie') {
                        playMovie(item.id, item);
                    } else {
                        playTVShow(item.id, 1, 1, item);
                    }
                };
                continueGrid.appendChild(card);
            } catch (error) {
                console.error('❌ Error processing continue watching item:', error);
            }
        });
        
        console.log('✅ Continue watching loaded');
    } catch (error) {
        console.error('❌ Failed to load continue watching:', error);
    }
}

// ==================== RATINGS & REVIEWS ====================
function loadRatingsAndReviews(tmdbId, type, title, season = null, episode = null) {
    try {
        const user = auth.currentUser;
        const contentKey = `${type}_${tmdbId}_${season || ''}_${episode || ''}`;
        
        if (!contentKey) {
            console.error('❌ Invalid content key for ratings');
            return;
        }
        
        console.log('⭐ Loading ratings for:', contentKey);
        
        // Load average rating
        db.collection('ratings').doc(contentKey).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    const avgRating = (data.totalRating / data.totalUsers).toFixed(1);
                    const avgRatingEl = document.getElementById('avgRating');
                    if (avgRatingEl) {
                        avgRatingEl.innerHTML = `<p>Average Rating: ⭐ ${avgRating} (${data.totalUsers} users)</p>`;
                    }
                } else {
                    const avgRatingEl = document.getElementById('avgRating');
                    if (avgRatingEl) {
                        avgRatingEl.innerHTML = '<p>No ratings yet</p>';
                    }
                }
            })
            .catch(error => {
                console.error('❌ Failed to load average rating:', error);
            });
        
        // Load user rating
        if (user) {
            db.collection('userRatings').doc(user.uid).collection('ratings')
                .doc(contentKey).get()
                .then(doc => {
                    if (doc.exists) {
                        const rating = doc.data().rating;
                        highlightStars(rating);
                    }
                })
                .catch(error => {
                    console.warn('⚠️ Failed to load user rating:', error);
                });
        }
        
        loadReviews(contentKey);
    } catch (error) {
        console.error('❌ Failed to load ratings:', error);
    }
}

function setupStarRating() {
    try {
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
    } catch (error) {
        console.error('❌ Star rating setup error:', error);
    }
}

function highlightStars(rating) {
    try {
        const stars = document.querySelectorAll('#userRating span');
        stars.forEach((star, index) => {
            star.style.filter = index < rating ? 'brightness(1.5)' : 'none';
        });
    } catch (error) {
        console.error('❌ Highlight stars error:', error);
    }
}

function submitUserRating(rating) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Please login to rate content');
            return;
        }
        
        const modal = document.getElementById('playerModal');
        const contentKey = modal?.dataset.contentKey;
        
        if (!contentKey) {
            showError('No content selected for rating');
            return;
        }
        
        console.log('⭐ Submitting rating:', rating, 'for', contentKey);
        
        // Update user rating
        db.collection('userRatings').doc(user.uid).collection('ratings')
            .doc(contentKey).set({
                rating: rating,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            })
            .catch(error => {
                console.error('❌ Failed to save user rating:', error);
                showError('Failed to save rating');
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
        }).catch(error => {
            console.error('❌ Failed to update global rating:', error);
            showError('Failed to update rating');
        });
    } catch (error) {
        console.error('❌ Submit rating error:', error);
    }
}

function submitRating() {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert('Please login to write a review');
            return;
        }
        
        const reviewText = document.getElementById('reviewText').value.trim();
        const modal = document.getElementById('playerModal');
        const contentKey = modal?.dataset.contentKey;
        
        if (!reviewText) {
            alert('Please write a review');
            return;
        }
        
        if (!contentKey) {
            showError('No content selected for review');
            return;
        }
        
        console.log('📝 Submitting review for:', contentKey);
        
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
        }).catch(error => {
            console.error('❌ Failed to submit review:', error);
            showError('Failed to submit review');
        });
    } catch (error) {
        console.error('❌ Submit review error:', error);
    }
}

function loadReviews(contentKey) {
    try {
        const reviewsList = document.getElementById('reviewsList');
        if (!reviewsList) {
            console.error('❌ Reviews list element not found');
            return;
        }
        
        reviewsList.innerHTML = '<h4>Reviews</h4>';
        
        db.collection('reviews')
            .where('contentKey', '==', contentKey)
            .orderBy('timestamp', 'desc')
            .get()
            .then(snapshot => {
                snapshot.forEach(doc => {
                    try {
                        const review = doc.data();
                        const reviewItem = document.createElement('div');
                        reviewItem.className = 'review-item';
                        reviewItem.innerHTML = `
                            <strong>${review.userName}</strong>
                            <p>${review.review}</p>
                            <small>${review.timestamp?.toDate()?.toLocaleDateString() || 'Unknown date'}</small>
                        `;
                        reviewsList.appendChild(reviewItem);
                    } catch (error) {
                        console.warn('⚠️ Error processing review:', error);
                    }
                });
            })
            .catch(error => {
                console.error('❌ Failed to load reviews:', error);
            });
    } catch (error) {
        console.error('❌ Load reviews error:', error);
    }
}

// ==================== PROGRESS TRACKING ====================
function setupProgressTracking() {
    try {
        console.log('📊 Setting up progress tracking');
        window.addEventListener('message', function(event) {
            try {
                if (event.origin !== 'https://www.vidking.net') return;
                
                const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
                
                if (data.type === 'PLAYER_EVENT') {
                    handlePlayerEvent(data.data);
                }
            } catch (e) {
                console.error('❌ Error parsing player message:', e);
            }
        });
    } catch (error) {
        console.error('❌ Progress tracking setup error:', error);
    }
}

function handlePlayerEvent(eventData) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const { event, currentTime, duration, progress, id, mediaType, season, episode } = eventData;
        
        const contentKey = `${mediaType}_${id}_${season || ''}_${episode || ''}`;
        const modal = document.getElementById('playerModal');
        if (modal) {
            modal.dataset.contentKey = contentKey;
        }
        
        const progressKey = `progress_${user.uid}_${id}_${mediaType}_${season || ''}_${episode || ''}`;
        
        if (['timeupdate', 'pause', 'ended'].includes(event)) {
            const progressData = {
                currentTime: currentTime || 0,
                duration: duration || 0,
                progress: progress || 0,
                timestamp: Date.now(),
                title: mediaType === 'movie' ? 
                    (document.querySelector('#movieGrid .movie-card h3')?.textContent || 'Movie') :
                    (document.querySelector('#tvGrid .tv-card h3')?.textContent || 'TV Show')
            };
            
            localStorage.setItem(progressKey, JSON.stringify(progressData));
            loadContinueWatching();
        }
        
        const progressDisplay = document.getElementById('progressDisplay');
        if (progressDisplay && event === 'timeupdate' && progress > 0 && progress < 90) {
            const minutes = Math.floor(currentTime / 60);
            const seconds = Math.floor(currentTime % 60);
            
            progressDisplay.innerHTML = `
                <strong>Continue Watching:</strong><br>
                ${mediaType === 'movie' ? 'Movie' : `S${season}E${episode}`}<br>
                ${minutes}:${seconds.toString().padStart(2, '0')} / ${Math.floor(duration / 60)} min<br>
                ${Math.round(progress)}%
            `;
            progressDisplay.style.display = 'block';
        } else if (progressDisplay && event === 'ended') {
            setTimeout(() => {
                progressDisplay.style.display = 'none';
            }, 3000);
        }
    } catch (error) {
        console.error('❌ Player event error:', error);
    }
}

// ==================== TOUCH GESTURES & EVENTS ====================
// Add swipe gesture support
try {
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });

    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
} catch (error) {
    console.error('❌ Touch gesture setup error:', error);
}

function handleSwipe() {
    try {
        const swipeThreshold = 50;
        const diff = touchEndX - touchStartX;
        
        if (Math.abs(diff) < swipeThreshold) return;
        
        const sections = ['movies', 'tv', 'search'];
        const currentIndex = sections.indexOf(currentSection);
        
        if (diff < 0 && currentIndex < sections.length - 1) {
            // Swipe left - next section
            const nextSection = sections[currentIndex + 1];
            showSection(nextSection);
            const nextLink = document.querySelector(`[onclick="showSection('${nextSection}', this)"]`);
            if (nextLink) nextLink.classList.add('active');
        } else if (diff > 0 && currentIndex > 0) {
            // Swipe right - previous section
            const prevSection = sections[currentIndex - 1];
            showSection(prevSection);
            const prevLink = document.querySelector(`[onclick="showSection('${prevSection}', this)"]`);
            if (prevLink) prevLink.classList.add('active');
        }
    } catch (error) {
        console.error('❌ Swipe handle error:', error);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing app...');
    
    try {
        initTheme();
        validateConfig();
        
        // Check for required elements
        const requiredElements = [
            'movieGrid', 'tvGrid', 'searchGrid', 'playerModal',
            'playerContainer', 'episodeSelector', 'episodeList',
            'userRating', 'reviewText', 'avgRating', 'reviewsList'
        ];
        
        for (const id of requiredElements) {
            if (!document.getElementById(id)) {
                console.error(`❌ Required element not found: #${id}`);
            }
        }
        
        // Load content
        await Promise.all([
            loadMoviesFromFirebaseOrAPI(),
            loadTVShowsFromFirebaseOrAPI()
        ]);
        
        setupProgressTracking();
        setupStarRating();
        
        // Add Enter key support
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchContent();
                }
            });
        }
        
        const advancedSearchInput = document.getElementById('advancedSearchInput');
        if (advancedSearchInput) {
            advancedSearchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    advancedSearch();
                }
            });
        }
        
        // Show default section
        showSection('movies');
        
        console.log('✅ App initialized successfully');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Failed to initialize app: ' + error.message);
    }
});

// ==================== GLOBAL EVENT LISTENERS ====================
window.onclick = function(event) {
    try {
        const playerModal = document.getElementById('playerModal');
        const authModal = document.getElementById('authModal');
        
        if (event.target === playerModal) {
            closePlayer();
        }
        if (event.target === authModal) {
            closeAuthModal();
        }
    } catch (error) {
        console.error('❌ Window click error:', error);
    }
}

document.addEventListener('keydown', function(event) {
    try {
        if (event.key === 'Escape') {
            closePlayer();
            closeAuthModal();
        }
    } catch (error) {
        console.error('❌ Keydown error:', error);
    }
});

// Close menu when resizing to desktop
window.addEventListener('resize', () => {
    try {
        if (window.innerWidth >= 769) {
            document.querySelector('.nav').classList.remove('active');
        }
    } catch (error) {
        console.error('❌ Resize error:', error);
    }
});

console.log('📄 script.js loaded successfully');
