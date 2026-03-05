// =========================================
// FILE: config/config_downloader.js
// =========================================

const DL_CONFIG = {
    // =========================================
    // SETTING UMUM
    // =========================================
    system: {
        appName: "Media Saver Pro",
        version: "4.0.0 (API Edition)",
        maintenance: false
    },

    // =========================================
    // DAFTAR TOOLS (SIDEBAR)
    // =========================================
    tools: [
        {
            id: "tiktok",
            name: "TikTok No WM",
            icon: "tiktok",
            color: "#ff0050"
        },
        {
            id: "instagram",
            name: "Instagram Reels",
            icon: "instagram",
            color: "#E1306C"
        },
        {
            id: "youtube",
            name: "YouTube Video",
            icon: "youtube",
            color: "#ff0000"
        },
        {
            id: "facebook",
            name: "Facebook HD",
            icon: "facebook",
            color: "#1877F2"
        },
        {
            id: "twitter",
            name: "X / Twitter",
            icon: "twitter",
            color: "#1DA1F2"
        }
    ],

    // =========================================
    // API ENDPOINTS
    // =========================================
    apis: {
        tiktok: {
            url: "https://tiktok-scrapper-videos-music-challenges-downloader.p.rapidapi.com/download?url={URL}",
            key: "27ab026372msh448b2d3361d45f7p15ba73jsnd82e2673ead7",
            method: "GET",
            host: "tiktok-scrapper-videos-music-challenges-downloader.p.rapidapi.com"
        },

        instagram: {
            url: "https://api.example.com/ig?url={URL}&apikey={KEY}",
            key: "27ab026372msh448b2d3361d45f7p15ba73jsnd82e2673ead7",
            method: "GET"
        },

        youtube: {
            url: "https://api.example.com/yt?url={URL}&apikey={KEY}",
            key: "27ab026372msh448b2d3361d45f7p15ba73jsnd82e2673ead7",
            method: "GET"
        },

        facebook: {
            url: "https://api.example.com/fb?url={URL}&apikey={KEY}",
            key: "27ab026372msh448b2d3361d45f7p15ba73jsnd82e2673ead7",
            method: "GET"
        },

        twitter: {
            url: "https://api.example.com/tw?url={URL}&apikey={KEY}",
            key: "27ab026372msh448b2d3361d45f7p15ba73jsnd82e2673ead7",
            method: "GET"
        }
    },

    // =========================================
    // PESAN TEXT UI
    // =========================================
    messages: {
        welcomeTitle: "SYSTEM ONLINE",
        welcomeDesc: "Hubungkan ke server API premium untuk download konten.",
        processing: "REQUESTING TO SERVER...",
        success: "DATA RECEIVED",
        error: "SERVER ERROR / INVALID LINK",
        maintenance: "Fitur sedang maintenance."
    }
};
