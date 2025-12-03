// ==================== CONFIGURATION ====================
const API_BASE = 'https://www.vidking.net/embed';
const PLAYER_COLOR = 'e50914';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const TMDB_API_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = '7901627e4352f597cecc198c6f0b33e1'; // ⚠️ REQUIRED: Get from https://www.themoviedb.org/settings/api

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyADR6f5fyv2hAAhDoF7wrie2wF6q0UNBOY",
    authDomain: "movie-ac414.firebaseapp.com",
    projectId: "movie-ac414",
    storageBucket: "movie-ac414.firebasestorage.app",
    messagingSenderId: "415859175148",
    appId: "1:415859175148:web:9233c5319a43886b8bffc9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
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
    const savedTheme = localStorage.getItem('theme');
    const currentTheme = savedTheme || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeButton(currentTheme);
}

function updateThemeButton(theme) {
    const button = document.getElementById('themeToggle');
    button.innerHTML = theme === 'dark' ? '☀️' : '🌙';
    button.setAttribute('aria-label', theme === 'dark' ? 'Change to light theme' : 'Change to dark theme');
}

document.getElementById('themeToggle').addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
});

// ==================== AUTHENTICATION ====================
auth.onAuthStateChanged(user => {
    if (user) {
        document.getElementById('authBtn').style.display = 'none';
        document.getElementById('userProfile').style.display = 'flex';
        document.getElementById('userName').textContent = user.displayName || user.email;
        document.getElementById('continueLink').style.display = 'block';
        loadContinueWatching();
    } else {
        document.getElementById('authBtn').style.display = 'block';
        document.getElementById('userProfile').style.display = 'none';
        document.getElementById('continueLink').style.display = 'none';
    }
});

function openAuthModal() {
    document.getElementById('authModal').style.display = 'block';
}

function closeAuthModal() {
    document.getElementById('authModal').style.display = 'none';
}

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

function registerUser() {
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(userCredential => {
            return userCredential.user.updateProfile({ displayName: name });
        })
        .then(() => {
            closeAuthModal();
            alert('Registration successful!');
        })
        .catch(error => {
            alert('Error: ' + error.message);
        });
}

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

function logoutUser() {
    auth.signOut().then(() => {
        alert('Logged out successfully!');
    });
}

// ==================== MOBILE MENU & NAVIGATION ====================
function toggleMobileMenu() {
    const nav = document.querySelector('.nav');
    nav.classList.toggle('active');
}

function showSection(sectionName, clickedLink) {
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
}

// ==================== TMDB API FUNCTIONS ====================
async function fetchPopularMovies() {
    try {
        const response = await fetch(
            `${TMDB_API_BASE}/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        const data = await response.json();
        return data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: new Date(movie.release_date).getFullYear(),
            poster: movie.poster_path || '',
            rating: movie.vote_average.toFixed(1),
            genre_ids: movie.genre_ids || []
        }));
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}

async function fetchPopularTVShows() {
    try {
        const response = await fetch(
            `${TMDB_API_BASE}/tv/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
        );
        const data = await response.json();
        return data.results.map(show => ({
            id: show.id,
            title: show.name,
            year: new Date(show.first_air_date).getFullYear(),
            poster: show.poster_path || '',
            rating: show.vote_average.toFixed(1),
            genre_ids: show.genre_ids || [],
            seasons: show.number_of_seasons || 1
        }));
    } catch (error) {
        console.error('Error fetching TV shows:', error);
        return [];
    }
}

async function searchMovies(query) {
    try {
        const response = await fetch(
            `${TMDB_API_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
        );
        const data = await response.json();
        return data.results.map(movie => ({
            id: movie.id,
            title: movie.title,
            year: new Date(movie.release_date).getFullYear(),
            poster: movie.poster_path || '',
            rating: movie.vote_average.toFixed(1),
            genre_ids: movie.genre_ids || []
        }));
    } catch (error) {
        console.error('Search error:', error);
        return [];
    }
}

async function searchTVShows(query) {
    try {
        const response = await fetch(
            `${TMDB_API_BASE}/search/tv?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=1`
        );
        const data = await response.json();
        return data.results.map(show => ({
            id: show.id,
            title: show.name,
            year: new Date(show.first_air_date).getFullYear(),
            poster: show.poster_path || '',
            rating: show.vote_average.toFixed(1),
            genre_ids: show.genre_ids || [],
            seasons: show.number_of_seasons || 1
        }));
    } catch (error) {
        console.error('TV search error:', error);
        return [];
    }
}

// ==================== FIRESTORE FUNCTIONS ====================
async function saveMovieToFirebase(movie) {
    try {
        await db.collection('movies').doc(movie.id.toString()).set({
            ...movie,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ Movie saved:', movie.title);
    } catch (error) {
        console.error('Error saving movie:', error);
    }
}

async function saveTVShowToFirebase(show) {
    try {
        await db.collection('tvShows').doc(show.id.toString()).set({
            ...show,
            addedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('✅ TV Show saved:', show.title);
    } catch (error) {
        console.error('Error saving TV show:', error);
    }
}

async function getMoviesFromFirebase() {
    try {
        const snapshot = await db.collection('movies').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error fetching movies from Firebase:', error);
        return [];
    }
}

async function getTVShowsFromFirebase() {
    try {
        const snapshot = await db.collection('tvShows').get();
        return snapshot.docs.map(doc => doc.data());
    } catch (error) {
        console.error('Error fetching TV shows from Firebase:', error);
        return [];
    }
}

async function fetchAndSaveAllContent() {
    console.log('🎬 Fetching movies from TMDB...');
    const movies = await fetchPopularMovies();
    for (const movie of movies) {
        await saveMovieToFirebase(movie);
    }
    
    console.log('📺 Fetching TV shows from TMDB...');
    const tvShows = await fetchPopularTVShows();
    for (const show of tvShows) {
        await saveTVShowToFirebase(show);
    }
    
    console.log('✨ All content saved to Firebase!');
    return { movies, tvShows };
}

async function loadMoviesFromFirebaseOrAPI() {
    let movies = await getMoviesFromFirebase();
    
    if (movies.length === 0) {
        console.log('📂 No movies in Firebase, fetching from TMDB...');
        movies = await fetchPopularMovies();
        for (const movie of movies) {
            await saveMovieToFirebase(movie);
        }
    }
    
    loadMovies(movies);
}

async function loadTVShowsFromFirebaseOrAPI() {
    let tvShows = await getTVShowsFromFirebase();
    
    if (tvShows.length === 0) {
        console.log('📂 No TV shows in Firebase, fetching from TMDB...');
        tvShows = await fetchPopularTVShows();
        for (const show of tvShows) {
            await saveTVShowToFirebase(show);
        }
    }
    
    loadTVShows(tvShows);
}

// ==================== UI FUNCTIONS ====================
function createMediaCard(item, type) {
    const card = document.createElement('div');
    card.className = type === 'movie' ? 'movie-card' : 'tv-card';
    
    // Touch feedback
    card.addEventListener('touchstart', () => {
        card.style.transform = 'scale(0.98)';
    });
    card.addEventListener('touchend', () => {
        card.style.transform = '';
    });
    
    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iI2ZmZiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIFBvc3RlcjwvdGV4dD48L3N2Zz4=';
    
    const genres = item.genre_ids ? 
        item.genre_ids.map(id => GENRES[id]).filter(g => g).join(', ') : 
        '';
    
    card.innerHTML = `
        <img src="${TMDB_IMAGE_BASE}${item.poster}" alt="${item.title}" 
             onerror="this.src='${placeholder}'" loading="lazy">
        <div class="${type}-info">
            <h3>${item.title}</h3>
            <p>${item.year} • ${type === 'tv' ? (item.seasons || 1) + ' Seasons' : 'Movie'}</p>
            <p>⭐ ${item.rating}</p>
            ${genres ? `<p class="genres">${genres}</p>` : ''}
        </div>
    `;
    
    card.onclick = () => type === 'movie' ? playMovie(item.id, item) : playTVShow(item.id, 1, 1, item);
    
    return card;
}

function loadMovies(filteredData = null) {
    const movieGrid = document.getElementById('movieGrid');
    const data = filteredData || [];
    movieGrid.innerHTML = '';
    
    data.forEach(movie => {
        movieGrid.appendChild(createMediaCard(movie, 'movie'));
    });
}

function loadTVShows(filteredData = null) {
    const tvGrid = document.getElementById('tvGrid');
    const data = filteredData || [];
    tvGrid.innerHTML = '';
    
    data.forEach(show => {
        tvGrid.appendChild(createMediaCard(show, 'tv'));
    });
}

// ==================== SEARCH FUNCTIONS ====================
function clearSearch() {
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
}

async function searchContent() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    
    if (!searchTerm) {
        clearSearch();
        return;
    }
    
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
    
    try {
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
        console.error('Search error:', error);
        searchGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: red;">Search failed. Try again.</p>';
    }
}

// Advanced Search for Search Tab
async function advancedSearch() {
    const query = document.getElementById('advancedSearchInput').value.trim();
    const contentType = document.getElementById('contentTypeFilter').value;
    const yearFilter = document.getElementById('advancedYearFilter').value;
    const ratingFilter = document.getElementById('advancedRatingFilter').value;
    const genreFilter = document.getElementById('advancedGenreFilter').value;
    
    if (!query && !genreFilter && !yearFilter && !ratingFilter) {
        alert('Please enter at least one search criteria');
        return;
    }
    
    const searchGrid = document.getElementById('advancedSearchGrid');
    searchGrid.classList.add('loading');
    searchGrid.innerHTML = '<p>Searching with filters...</p>';
    
    try {
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
        console.error('Advanced search error:', error);
        searchGrid.classList.remove('loading');
        searchGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: red;">Advanced search failed. Try again.</p>';
    }
}

function clearAdvancedSearch() {
    document.getElementById('advancedSearchInput').value = '';
    document.getElementById('contentTypeFilter').value = '';
    document.getElementById('advancedYearFilter').value = '';
    document.getElementById('advancedRatingFilter').value = '';
    document.getElementById('advancedGenreFilter').value = '';
    document.getElementById('advancedSearchGrid').innerHTML = '';
}

// ==================== PLAYER FUNCTIONS ====================
function playMovie(tmdbId, movieData = null) {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    const episodeSelector = document.getElementById('episodeSelector');
    
    episodeSelector.style.display = 'none';
    
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
}

function playTVShow(tmdbId, season = 1, episode = 1, showData = null) {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    const episodeSelector = document.getElementById('episodeSelector');
    
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
}

function loadEpisodes(tmdbId, season, showData = null) {
    const episodeList = document.getElementById('episodeList');
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

function closePlayer() {
    const modal = document.getElementById('playerModal');
    const container = document.getElementById('playerContainer');
    
    modal.style.display = 'none';
    container.innerHTML = '';
}

// ==================== CONTINUE WATCHING ====================
function loadContinueWatching() {
    const user = auth.currentUser;
    if (!user) return;
    
    const continueGrid = document.getElementById('continueGrid');
    const continueSection = document.getElementById('continue-watching');
    
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
    });
}

// ==================== RATINGS & REVIEWS ====================
function loadRatingsAndReviews(tmdbId, type, title, season = null, episode = null) {
    const user = auth.currentUser;
    const contentKey = `${type}_${tmdbId}_${season || ''}_${episode || ''}`;
    
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
    
    if (user) {
        db.collection('userRatings').doc(user.uid).collection('ratings')
            .doc(contentKey).get().then(doc => {
                if (doc.exists) {
                    const rating = doc.data().rating;
                    highlightStars(rating);
                }
            });
    }
    
    loadReviews(contentKey);
}

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
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('#userRating span');
    stars.forEach((star, index) => {
        star.style.filter = index < rating ? 'brightness(1.5)' : 'none';
    });
}

function submitUserRating(rating) {
    const user = auth.currentUser;
    if (!user) {
        alert('Please login to rate content');
        return;
    }
    
    const modal = document.getElementById('playerModal');
    const contentKey = modal.dataset.contentKey;
    
    if (!contentKey) return;
    
    db.collection('userRatings').doc(user.uid).collection('ratings')
        .doc(contentKey).set({
            rating: rating,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
    
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
    });
}

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

function handlePlayerEvent(eventData) {
    const user = auth.currentUser;
    if (!user) return;
    
    const { event, currentTime, duration, progress, id, mediaType, season, episode } = eventData;
    
    const contentKey = `${mediaType}_${id}_${season || ''}_${episode || ''}`;
    const modal = document.getElementById('playerModal');
    modal.dataset.contentKey = contentKey;
    
    const progressKey = `progress_${user.uid}_${id}_${mediaType}_${season || ''}_${episode || ''}`;
    
    if (['timeupdate', 'pause', 'ended'].includes(event)) {
        const progressData = {
            currentTime,
            duration,
            progress,
            timestamp: Date.now(),
            title: mediaType === 'movie' ? 
                (document.querySelector('#movieGrid .movie-card h3')?.textContent || 'Movie') :
                (document.querySelector('#tvGrid .tv-card h3')?.textContent || 'TV Show')
        };
        
        localStorage.setItem(progressKey, JSON.stringify(progressData));
        loadContinueWatching();
    }
    
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

// ==================== TOUCH GESTURES & EVENTS ====================
// Add swipe gesture support
document.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchEndX - touchStartX;
    
    if (Math.abs(diff) < swipeThreshold) return;
    
    const sections = ['movies', 'tv', 'search'];
    const currentIndex = sections.indexOf(currentSection);
    
    if (diff < 0 && currentIndex < sections.length - 1) {
        // Swipe left - next section
        const nextSection = sections[currentIndex + 1];
        showSection(nextSection);
        document.querySelector(`[onclick="showSection('${nextSection}', this)"]`)?.classList.add('active');
    } else if (diff > 0 && currentIndex > 0) {
        // Swipe right - previous section
        const prevSection = sections[currentIndex - 1];
        showSection(prevSection);
        document.querySelector(`[onclick="showSection('${prevSection}', this)"]`)?.classList.add('active');
    }
}

// Add Enter key support for search
document.addEventListener('DOMContentLoaded', async function() {
    await loadMoviesFromFirebaseOrAPI();
    await loadTVShowsFromFirebaseOrAPI();
    
    setupProgressTracking();
    setupStarRating();
    
    // Add Enter key support
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchContent();
        }
    });
    
    document.getElementById('advancedSearchInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            advancedSearch();
        }
    });
    
    // Show default section
    showSection('movies');
});

// ==================== GLOBAL EVENT LISTENERS ====================
window.onclick = function(event) {
    const playerModal = document.getElementById('playerModal');
    const authModal = document.getElementById('authModal');
    
    if (event.target === playerModal) {
        closePlayer();
    }
    if (event.target === authModal) {
        closeAuthModal();
    }
}

document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closePlayer();
        closeAuthModal();
    }
});

// Close menu when resizing to desktop
window.addEventListener('resize', () => {
    if (window.innerWidth >= 769) {
        document.querySelector('.nav').classList.remove('active');
    }
});
