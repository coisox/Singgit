importScripts('lib/workbox.4.0.0/workbox-sw.js');
workbox.precaching.precacheAndRoute([
  {
    "url": "app.css",
    "revision": "e9ec42c107de1bd97a6954f86f6308cc"
  },
  {
    "url": "app.js",
    "revision": "67b025f363d149a2a3c5df6803dd97fb"
  },
  {
    "url": "font/fonts/icomoon.woff",
    "revision": "87cb9d184f1c400f1876d76f55e20452"
  },
  {
    "url": "font/selection.json",
    "revision": "ca6fb2579a7d427a41d1ecffc0746799"
  },
  {
    "url": "font/style.css",
    "revision": "358ee30312f0730b5bb59c9931c741cf"
  },
  {
    "url": "img/favicon.png",
    "revision": "0a63cc2c9589451b114cc942e5c92390"
  },
  {
    "url": "img/singgit-192.png",
    "revision": "2a1413f14e674f8f267e330a33157fa5"
  },
  {
    "url": "img/singgit-512.png",
    "revision": "f1a824ed89c33b232a972a7a25d19039"
  },
  {
    "url": "index.html",
    "revision": "f7f65fdf53c4bc0f550aeb0816c40e6f"
  },
  {
    "url": "lib/dropbox/Dropbox-sdk.min.js",
    "revision": "1b2d8cd04034423190f3d83c0607f08a"
  },
  {
    "url": "lib/moment/moment.min.js",
    "revision": "aeb7908241d9f6d5a45e504cc4f2ec15"
  },
  {
    "url": "lib/spectre/spectre-exp.min.css",
    "revision": "5909d80638a6ae6aa3a455b6f6a6d768"
  },
  {
    "url": "lib/spectre/spectre.css",
    "revision": "204edc89a96431bec9f5c364cd31b5e0"
  },
  {
    "url": "lib/spectre/spectre.min.css",
    "revision": "5cd401d486f79e82913923fe7d7f47ff"
  },
  {
    "url": "lib/taffydb/taffy-min.js",
    "revision": "27c11a100def26ee818ec43974349fbd"
  },
  {
    "url": "lib/vue/vue.js",
    "revision": "440e570c372631aa20b9c778ad9e7273"
  },
  {
    "url": "lib/workbox.4.0.0/workbox-sw.js",
    "revision": "b89e47af54e6339c1b5bea01c3eb575e"
  },
  {
    "url": "manifest.json",
    "revision": "b8b7e401372dcb13e3514d8e6e0cc933"
  },
  {
    "url": "sw-config.js",
    "revision": "6b0c6a1ad115276ea18687c2d3015544"
  },
  {
    "url": "workbox-config.js",
    "revision": "bead981998f55c3157e8a29304824862"
  }
]);