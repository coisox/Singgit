//This is the service worker with the Cache-first network
var CACHE = 'precache-20171229b';
var precacheFiles = [
	'index.html',
	'./', // Alias for index.html
	'font/OpenSans-Regular.ttf',
	'lib/firebase/firebase.js',
	'lib/firebase/firebase-firestore.js',
	'lib/framework7/css/app.css',
	'lib/framework7/css/framework7.ios.min.css',
	'lib/framework7/css/framework7.ios.colors.min.css',
	'lib/framework7/js/app.js',
	'lib/framework7/js/framework7.min.js',
	'lib/framework7/js/vue.min.js',
	'lib/icomoon/style.css',
	'lib/icomoon/fonts/icomoon.ttf',
	'lib/icomoon/fonts/icomoon.woff',
	'lib/icomoon/fonts/icomoon.svg',
	'lib/jquery/jquery-3.2.1.slim.min.js',
	'lib/moment/moment.min.js'
];

//Install stage sets up the cache-array to configure pre-cache content
self.addEventListener('install', function(evt) {
	console.log('The service worker is being installed.');
	evt.waitUntil(precache().then(function() {
			console.log('[ServiceWorker] Skip waiting on install');
			return self.skipWaiting();
		})
	);
});


//allow sw to control of current page
self.addEventListener('activate', function(event) {
	var cacheWhitelist = ['precache-20171229b'];

	event.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (cacheWhitelist.indexOf(key) === -1) {
					return caches.delete(key);
				}
			}));
		})
	);
});

self.addEventListener('fetch', function(evt) {
	console.log('The service worker is serving the asset.'+ evt.request.url);
	evt.respondWith(fromCache(evt.request).catch(fromServer(evt.request)));
	evt.waitUntil(update(evt.request));
});


function precache() {
	return caches.open(CACHE).then(function (cache) {
		return cache.addAll(precacheFiles);
	});
}


function fromCache(request) {
	//we pull files from the cache first thing so we can show them fast
	return caches.open(CACHE).then(function (cache) {
		return cache.match(request).then(function (matching) {
			return matching || Promise.reject('no-match');
		});
	});
}


function update(request) {
	//this is where we call the server to get the newest version of the 
	//file to use the next time we show view
	return caches.open(CACHE).then(function (cache) {
		return fetch(request).then(function (response) {
			return cache.put(request, response);
		});
	});
}

function fromServer(request){
	//this is the fallback if it is not in the cahche to go to the server and get it
	return fetch(request).then(function(response){ return response})
}