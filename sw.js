importScripts('lib/workbox.4.0.0/workbox-sw.js');
workbox.precaching.precacheAndRoute([
  {
    "url": "app.css",
    "revision": "4b0059aa65ed41117b2c16a7d6fd9dda"
  },
  {
    "url": "app.js",
    "revision": "f70472c9ffd38faf0bf20f127b394927"
  },
  {
    "url": "font/fonts/icomoon.svg",
    "revision": "3ece51fc6b1967b8d86b32e98de3b474"
  },
  {
    "url": "font/fonts/icomoon.ttf",
    "revision": "1bcdfba85f192014d6b1eabbf54cedca"
  },
  {
    "url": "font/fonts/icomoon.woff",
    "revision": "51d73c78cde2f6bb933b18f37569ae9d"
  },
  {
    "url": "font/selection.json",
    "revision": "e7e99d19380b4f9e7080e30b133b064a"
  },
  {
    "url": "font/style.css",
    "revision": "0009ce3a063e2662e781d444d77831c6"
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
    "revision": "b8ef411362893550ec9e42cfd744bbc9"
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