// system-links-config.js
// Centralized configuration for the System Links Hub.
window.SSPSystemLinksManifest = [
  {
    category: "Local Apps",
    links: [
      { text: "Pomodoro Timer", url: "/ssp-apps/pomodoro-timer/index.html" },
      { text: "Sports Network", url: "/ssp-apps/personal-sports-hub/index.html" },
      { text: "Zen Snake", url: "/ssp-apps/zen-snake/index.html" }
    ]
  },
  {
    category: "Repositories",
    links: [
      { text: "andykozicki/ssp-apps", url: "https://github.com/andykozicki/ssp-apps" },
      { text: "Kzick Dashboard Repo", url: "https://github.com/kzick001/dashboard" }
    ]
  },
  {
    category: "Infrastructure",
    links: [
      { text: "Weather Worker Pipeline", url: "https://dash.cloudflare.com/b161c0d78599ee2ead9d5aa4a03d1c40/workers/services/view/kzick-weather/production" },
      { text: "Personal Dash Live", url: "https://kzick001.github.io/dashboard/" }
    ]
  }
];
