# M-T

Markdown
Copy
Code Preview

# 🎬 M-T: Movies & TV Shows Streaming Platform

A sleek, modern streaming website that provides access to thousands of movies and TV shows through an intuitive web interface.

**Live Demo**: [https://idk-code404.github.io/M-T/](https://idk-code404.github.io/M-T/)  
**Direct Movies Section**: [https://idk-code404.github.io/M-T/#movies](https://idk-code404.github.io/M-T/#movies)

---

## ✨ Features

- 🎥 **Extensive Library**: Access to 50,000+ movies and 25,000+ TV shows
- 📺 **TV Shows Support**: Complete series with all episodes
- 🎯 **4K Content**: Over 1,500 4K movies available
- 🔍 **Smart Search**: Find content quickly by title, genre, or TMDB ID
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🎨 **Customizable Player**: Brandable colors and UI elements
- ⏯️ **Auto-Play**: Optional automatic playback
- 📡 **Progress Tracking**: Save watch progress locally
- 🔄 **Episode Navigation**: Next episode button and episode selector for TV shows
- 🎭 **Genre Filtering**: Browse content by categories
- ⚡ **Fast Loading**: Optimized streaming with 99.9% uptime

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Player**: Vidking Player API
- **Hosting**: GitHub Pages
- **Data Source**: TMDB (The Movie Database) API
- **Streaming**: HLS.js for adaptive streaming
- **Storage**: localStorage for user preferences

---

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- For local development: Python 3.x or Node.js for simple HTTP server

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/idk-code404/M-T.git
cd M-T

    Run locally

bash
Copy

# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then open http://localhost:8000

    Open in browser
    Navigate to http://localhost:8000 or open index.html directly.

📖 Usage Guide
Embedding a Movie
HTML
Preview
Copy

<iframe 
  src="https://www.vidking.net/embed/movie/{tmdbId}"
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>

Embedding a TV Show Episode
HTML
Preview
Copy

<iframe 
  src="https://www.vidking.net/embed/tv/{tmdbId}/{season}/{episode}"
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>

Custom Player Options
Add URL parameters to customize the player:
Table
Copy
Parameter	Type	Description	Example
color	hex	Primary UI color	?color=e50914
autoPlay	boolean	Auto-start playback	?autoPlay=true
nextEpisode	boolean	Show next button	?nextEpisode=true
episodeSelector	boolean	Enable episode menu	?episodeSelector=true
progress	number	Start time (seconds)	?progress=120
Example with all features:
https://www.vidking.net/embed/tv/119051/1/8?color=e50914&autoPlay=true&nextEpisode=true&episodeSelector=true
⚙️ Configuration
Player Customization
Edit the iframe URL parameters to match your preferences:
JavaScript
Copy

// Configuration object
const playerConfig = {
  color: '9146ff',        // Brand color (hex without #)
  autoPlay: false,        // Auto-play on load
  nextEpisode: true,      // Show next episode button
  episodeSelector: true,  // Enable episode selection
  progress: 0             // Resume from (seconds)
};

Tracking Watch Progress
JavaScript
Copy

// Add this script to track viewing progress
window.addEventListener("message", function (event) {
  if (typeof event.data === "string") {
    const data = JSON.parse(event.data);
    console.log("Player event:", data);
    
    // Save to localStorage
    localStorage.setItem(`progress-${data.id}`, data.currentTime);
  }
});

🎨 Theming
Customize the player's appearance to match your brand:
HTML
Preview
Copy

<!-- Custom branded player -->
<iframe 
  src="https://www.vidking.net/embed/movie/1078605?color=9146ff&autoPlay=true"
  width="100%" 
  height="600" 
  frameborder="0" 
  allowfullscreen>
</iframe>

🔧 Development
Project Structure
Copy

M-T/
├── index.html          # Main landing page
├── movies.html         # Movies section
├── tv.html            # TV Shows section
├── css/
│   ├── style.css      # Main stylesheet
│   └── responsive.css # Mobile adaptations
├── js/
│   ├── app.js         # Main application logic
│   ├── player.js      # Player controls
│   └── api.js         # API calls to Vidking/TMDB
├── assets/
│   ├── images/        # Banners, logos, icons
│   └── fonts/         # Custom fonts
└── README.md          # This file

Adding New Content

    Get TMDB ID: Find the movie/show ID on TMDB
    Update database: Add the ID to your content JSON
    Regenerate pages: Run your build script (if applicable)

🚨 Important Legal Notice
Disclaimer: This project is for educational purposes only. The content served through Vidking Player API is subject to copyright laws. Users are responsible for ensuring they have the right to access and stream any content.

    DMCA Notice: If you are a copyright holder and wish to report content, please contact the hosting provider directly
    No Warranty: This service is provided "as is" without any guarantees
    User Responsibility: End users must comply with their local copyright regulations

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

    Fork the repository
    Create your feature branch (git checkout -b feature/AmazingFeature)
    Commit your changes (git commit -m 'Add some AmazingFeature')
    Push to the branch (git push origin feature/AmazingFeature)
    Open a Pull Request

Development Guidelines

    Follow existing code style
    Test on multiple browsers
    Optimize for mobile
    Keep player embeds secure (use HTTPS)

🐛 Troubleshooting
Player not loading?

    Check if the TMDB ID is correct
    Ensure Vidking API is accessible
    Verify iframe embed code

Video not playing?

    Try a different browser
    Disable ad-blockers temporarily
    Check console for specific errors

404 Errors?

    Confirm content ID exists on TMDB
    Check URL parameters formatting

📊 Performance

    Load Time: < 2 seconds on 4G
    Uptime: 99.9% (dependent on Vidking API)
    Concurrent Users: Unlimited (static site)
    Data Usage: Adaptive streaming based on connection

🎯 Roadmap

    [ ] User watchlist feature
    [ ] Advanced search filters
    [ ] Comment/review system
    [ ] Dark mode toggle
    [ ] Chromecast support
    [ ] Picture-in-Picture mode
    [ ] Multi-language subtitles
    [ ] User authentication
    [ ] Watch history sync

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
🙏 Acknowledgments

    Vidking Player API for streaming infrastructure
    TMDB for movie/TV metadata
    GitHub Pages for free hosting
    Open-source community for inspiration

📧 Contact
Project Maintainer: idk-code404
GitHub Issues: Report Bug/Request Feature
<div align="center">
  <sub>Built with ❤️ for movie enthusiasts</sub>
</div>
```
