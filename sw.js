// Service Worker 완전 제거됨 - 이 파일은 비어있습니다
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
