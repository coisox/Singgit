importScripts('lib/workbox.4.0.0/workbox-sw.js');
workbox.precaching.precacheAndRoute([
  {
    "url": "font/icomoon/fonts/icomoon.svg",
    "revision": "3cba1da854aaaab022a26b9e5f12b9d9"
  },
  {
    "url": "font/icomoon/fonts/icomoon.ttf",
    "revision": "9620f168ce62884977fcd8045a88c8e8"
  },
  {
    "url": "font/icomoon/fonts/icomoon.woff",
    "revision": "1f7d7fca129e14f4f12738fac511ac23"
  },
  {
    "url": "font/icomoon/selection.json",
    "revision": "a8839eeda369e690ec22d0f0c35cf142"
  },
  {
    "url": "font/icomoon/style.css",
    "revision": "e4422fd2907cfe392114010684e0073b"
  },
  {
    "url": "font/OpenSans-Regular.ttf",
    "revision": "629a55a7e793da068dc580d184cc0e31"
  },
  {
    "url": "img/hexagon.svg",
    "revision": "7974f7258525073e327579d412231305"
  },
  {
    "url": "img/singgit-144.png",
    "revision": "240e21c41265e4a028a35f3e0d06a189"
  },
  {
    "url": "img/singgit-192.png",
    "revision": "7b72568f45504a162181cffba32b4352"
  },
  {
    "url": "img/singgit-48.png",
    "revision": "6945bab084e4ea7de328499556881cbe"
  },
  {
    "url": "img/singgit-512.png",
    "revision": "5872409474f23056a05de2181c953ceb"
  },
  {
    "url": "img/singgit-72.png",
    "revision": "eee7b97e34f7f94d16eff104e317f970"
  },
  {
    "url": "img/singgit-96.png",
    "revision": "7aea6bee6b765c2dab4a7484975187e2"
  },
  {
    "url": "img/singgit.png",
    "revision": "82716b1dab4979f79e879a366da2f38a"
  },
  {
    "url": "index.html",
    "revision": "da0e6b1ad2cfeba6c2903d5a5dc32b6e"
  },
  {
    "url": "lib/bootstrap/bootstrap.min.css",
    "revision": "a15c2ac3234aa8f6064ef9c1f7383c37"
  },
  {
    "url": "lib/bootstrap/bootstrap.min.js",
    "revision": "e1d98d47689e00f8ecbc5d9f61bdb42e"
  },
  {
    "url": "lib/bootstrap/popper.min.js",
    "revision": "56456db9d72a4b380ed3cb63095e6022"
  },
  {
    "url": "lib/firebase/firebase-firestore.js",
    "revision": "891f0df03133590fda6de8a8e60a99be"
  },
  {
    "url": "lib/firebase/firebase.js",
    "revision": "1e7fcd644740ffc7f3ef0bc30e78920f"
  },
  {
    "url": "lib/jquery.autocomplete/jquery.autocomplete.min.js",
    "revision": "2c52ceecb553772569e2fad4e7df77ed"
  },
  {
    "url": "lib/jquery/jquery-3.3.1.min.js",
    "revision": "a09e13ee94d51c524b7e2a728c7d4039"
  },
  {
    "url": "lib/moment/moment.min.js",
    "revision": "aeb7908241d9f6d5a45e504cc4f2ec15"
  },
  {
    "url": "lib/singgit.css",
    "revision": "b31973edaadf17a19c4719e3aac4a37e"
  },
  {
    "url": "lib/singgit.js",
    "revision": "6f99cca7503e63318e730bda5010eec0"
  },
  {
    "url": "lib/vue/vue.js",
    "revision": "440e570c372631aa20b9c778ad9e7273"
  },
  {
    "url": "lib/vue/vue.min.js",
    "revision": "9cfa1585246355bf21ba3980f5843cdb"
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
    "revision": "035dd53f91c0c6b95fe0816fbe3910f7"
  }
]);