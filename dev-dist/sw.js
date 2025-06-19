/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-8b9ee101'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "3ca0b8505b4bec776b69afdba2768812"
  }, {
    "url": "/index.html",
    "revision": "0.n00f94lpblo"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("/index.html"), {
    allowlist: [/^\/$/],
    denylist: [/^\/_/, /\/[^/?]+\.[^/]+$/, /^\/api\//]
  }));
  workbox.registerRoute(({
    url
  }) => url.pathname.startsWith("/api"), new workbox.NetworkFirst({
    "cacheName": "api-cache",
    "networkTimeoutSeconds": 5,
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [0, 200, 201, 204]
    }), new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 86400,
      purgeOnQuotaError: true
    }), {
      cacheKeyWillBeUsed: async ({
        request
      }) => {
        const url = new URL(request.url);
        url.searchParams.delete("_t");
        url.searchParams.delete("timestamp");
        return url.toString();
      }
    }]
  }), 'GET');
  workbox.registerRoute(({
    url
  }) => url.pathname.includes("/api/chat") || url.pathname.includes("/api/conversation"), new workbox.CacheFirst({
    "cacheName": "chat-cache",
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    }), new workbox.ExpirationPlugin({
      maxEntries: 200,
      maxAgeSeconds: 604800,
      purgeOnQuotaError: true
    })]
  }), 'GET');
  workbox.registerRoute(({
    url
  }) => url.pathname.includes("/api/records") || url.pathname.includes("/api/children"), new workbox.NetworkFirst({
    "cacheName": "records-cache",
    "networkTimeoutSeconds": 3,
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [0, 200, 201, 204]
    }), new workbox.ExpirationPlugin({
      maxEntries: 300,
      maxAgeSeconds: 2592000,
      purgeOnQuotaError: true
    })]
  }), 'GET');
  workbox.registerRoute(({
    url,
    request
  }) => request.destination === "image" || url.pathname.match(/\.(png|jpg|jpeg|svg|webp|gif)$/i), new workbox.CacheFirst({
    "cacheName": "images-cache",
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    }), new workbox.ExpirationPlugin({
      maxEntries: 500,
      maxAgeSeconds: 5184000,
      purgeOnQuotaError: true
    })]
  }), 'GET');
  workbox.registerRoute(({
    url
  }) => url.origin === "https://fonts.googleapis.com" || url.origin === "https://fonts.gstatic.com" || url.pathname.match(/\.(woff|woff2|ttf|eot)$/i), new workbox.CacheFirst({
    "cacheName": "fonts-cache",
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    }), new workbox.ExpirationPlugin({
      maxEntries: 50,
      maxAgeSeconds: 31536000,
      purgeOnQuotaError: true
    })]
  }), 'GET');
  workbox.registerRoute(({
    url
  }) => url.origin.includes("cdn") || url.origin.includes("static"), new workbox.CacheFirst({
    "cacheName": "cdn-cache",
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    }), new workbox.ExpirationPlugin({
      maxEntries: 100,
      maxAgeSeconds: 2592000,
      purgeOnQuotaError: true
    })]
  }), 'GET');
  workbox.registerRoute(({
    url
  }) => url.pathname.includes("/docs/") || url.pathname.includes("/knowledge/"), new workbox.StaleWhileRevalidate({
    "cacheName": "docs-cache",
    plugins: [new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    }), new workbox.ExpirationPlugin({
      maxEntries: 200,
      maxAgeSeconds: 604800,
      purgeOnQuotaError: true
    })]
  }), 'GET');

}));
