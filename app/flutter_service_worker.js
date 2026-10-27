'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"favicon.png": "c6e6ee2600bac21417c3431b5ffe3a16",
"canvaskit/canvaskit.js": "66177750aff65a66cb07bb44b8c6422b",
"canvaskit/chromium/canvaskit.js": "671c6b4f8fcc199dcc551c7bb125f239",
"canvaskit/chromium/canvaskit.js.symbols": "a012ed99ccba193cf96bb2643003f6fc",
"canvaskit/chromium/canvaskit.wasm": "b1ac05b29c127d86df4bcfbf50dd902a",
"canvaskit/skwasm.js": "694fda5704053957c2594de355805228",
"canvaskit/canvaskit.js.symbols": "48c83a2ce573d9692e8d970e288d75f7",
"canvaskit/skwasm.wasm": "9f0c0c02b82a910d12ce0543ec130e60",
"canvaskit/skwasm.js.symbols": "262f4827a1317abb59d71d6c587a93e2",
"canvaskit/skwasm.worker.js": "89990e8c92bcb123999aa81f7e203b1c",
"canvaskit/canvaskit.wasm": "1f237a213d7370cf95f443d896176460",
"flutter_bootstrap.js": "7e2296ba57b401dd3abd25fef41f841d",
"assets/NOTICES": "044ff80d6a661090e5692103cd3a5596",
"assets/packages/wakelock_plus/assets/no_sleep.js": "7748a45cd593f33280669b29c2c8919a",
"assets/AssetManifest.bin": "5d9d959096afbadcf437fef055f9dff7",
"assets/assets/brand/icon_1024.png": "8620b3cb617406847004b5d4e67d72a7",
"assets/assets/fonts/Tajawal-Bold.ttf": "ef7c3dc2a2b8035c243d12e76ec94590",
"assets/assets/fonts/Tajawal-Medium.ttf": "3876865bd2f341d2d9d48e8b5f998434",
"assets/assets/fonts/Tajawal-ExtraBold.ttf": "6ae16db8693a0f90c80cb31136304bb0",
"assets/assets/sfx/form.wav": "4f05383c78e7b1ae4b3604fe40e5b758",
"assets/assets/sfx/narrow.wav": "7577d4f2d05f15cdf63806ecab21ddf4",
"assets/assets/sfx/good.wav": "138568261fee3edd031db24a2a4b41ce",
"assets/assets/sfx/wide.wav": "2bdcdef024d3f10afb69c82bd76f28f5",
"assets/assets/sfx/shallow.wav": "050cdf4d1884ce6200bdc9a71c4510c8",
"assets/assets/sfx/tick.wav": "f634744f706d9e697d99806c6da5bf0f",
"assets/FontManifest.json": "337b2403576282573f22741fca81ba9b",
"assets/AssetManifest.json": "75b42d0dc44b814e1e4d3be00e507b8f",
"assets/fonts/MaterialIcons-Regular.otf": "4cf5d3769cd2a884e7e52b589513c18e",
"assets/AssetManifest.bin.json": "7690141a8ec88aa339355ba3fef9d1eb",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"index.html": "7094442ef389dadf7ae68de5724711b2",
"/": "7094442ef389dadf7ae68de5724711b2",
"flutter.js": "f393d3c16b631f36852323de8e583132",
"main.dart.js": "4bd4d844c449caf1ec6fd81e760a005d",
"manifest.json": "94346bca67ca86a397b108c0b0ab6d60",
"icons/Icon-512.png": "0d71ef99832bd9a47c9451b9e8c3b65c",
"icons/Icon-maskable-512.png": "f2d30c5da29dcbfc716e3ff635e6b12b",
"icons/Icon-maskable-192.png": "7916e172838f58870fd2d7cc9dba1fa2",
"icons/Icon-192.png": "1c0b330c8f1b0e56781376dae64c69af",
"version.json": "68da088e6cd15336abc5d16e84e98adc",
"pa_pose.js": "a6cde07efb2316d97f912412123e35fc",
"mediapipe/vision_bundle.mjs": "013a380dfa9df1a679300e85ced6f6ac",
"mediapipe/pose_landmarker_lite.task": "04a75ddf7c811ac7a1a4523266dd7d88",
"mediapipe/wasm/vision_wasm_internal.wasm": "314412736014f2b026020ca51310075a",
"mediapipe/wasm/vision_wasm_internal.js": "818dc4628ec93bfc86c4ce324f0da4dd",
"mediapipe/LICENSE.txt": "8ddaa64fc8ea632dab57f91540065a2e"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
