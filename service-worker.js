var cacheName = 'v181217C';
var filesToCache = [
	'./',
	'index.html',
	'manifest.json',
	'lib/singgit.css',
	'lib/singgit.js',
	'lib/bootstrap/bootstrap.min.js',
	'lib/bootstrap/popper.min.js',
	'lib/bootstrap/bootstrap.min.css',
	'lib/clusterize/clusterize.min.css',
	'lib/clusterize/clusterize.min.js',
	'lib/firebase/firebase-firestore.js',
	'lib/firebase/firebase.js',
	'lib/jquery/jquery-3.3.1.min.js',
	'lib/jquery.autocomplete/jquery.autocomplete.min.js',
	'lib/moment/moment.min.js',
	'lib/vue/vue.js',
	'img/hexagon.svg',
	'img/singgit.png',
	'img/singgit-48.png',
	'img/singgit-72.png',
	'img/singgit-96.png',
	'img/singgit-144.png',
	'img/singgit-192.png',
	'img/singgit-512.png',
	'font/OpenSans-Regular.ttf',
	'font/icomoon/style.css',
	'font/icomoon/fonts/icomoon.svg',
	'font/icomoon/fonts/icomoon.ttf',
	'font/icomoon/fonts/icomoon.woff'
];

self.addEventListener('install', function(e) {
	//console.log('[ServiceWorker] Install');
	e.waitUntil(
		caches.open(cacheName).then(function(cache) {
			//console.log('[ServiceWorker] Caching app shell');
			return cache.addAll(filesToCache);
		})
	);
});

self.addEventListener('activate', function(e) {
	//console.log('[ServiceWorker] Activate', cacheName);
	e.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (key !== cacheName) {
					//console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
			}));
		})
	);
	return self.clients.claim();
});

self.addEventListener('fetch', function(e) {
	//console.log('[ServiceWorker] Fetch', e.request.url);
	e.respondWith(
		caches.match(e.request).then(function(response) {
			return response || fetch(e.request);
		})
	);
});