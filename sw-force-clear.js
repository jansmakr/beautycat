// 🧹 Service Worker 강제 정리 - 포워딩 환경 완전 최적화
// 이 파일은 모든 캐시와 기존 SW를 완전히 제거한 후 자동 삭제됩니다.

console.log('🧹 Service Worker 강제 정리 시작...');

self.addEventListener('install', event => {
  console.log('SW 강제정리: 설치 중...');
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('SW 강제정리: 활성화 중...');
  
  event.waitUntil(
    Promise.all([
      // 1. 모든 캐시 완전 삭제
      caches.keys().then(cacheNames => {
        console.log('🗑️ 삭제할 캐시들:', cacheNames);
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }),
      
      // 2. IndexedDB 정리 (있다면)
      new Promise((resolve) => {
        try {
          if ('indexedDB' in self) {
            // beautycat 관련 DB 삭제 시도
            const deleteReq = indexedDB.deleteDatabase('beautycat');
            deleteReq.onsuccess = () => {
              console.log('🗑️ IndexedDB 삭제 완료');
              resolve();
            };
            deleteReq.onerror = () => {
              console.log('IndexedDB 삭제 실패 (무시)');
              resolve();
            };
          } else {
            resolve();
          }
        } catch (e) {
          console.log('IndexedDB 정리 중 오류 (무시):', e);
          resolve();
        }
      }),
      
      // 3. 클라이언트들에게 정리 완료 알림
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'SW_CLEARED',
            message: 'Service Worker 캐시가 모두 정리되었습니다.'
          });
        });
        console.log('📢 클라이언트들에게 정리 완료 알림 전송');
      })
      
    ]).then(() => {
      console.log('✅ Service Worker 강제 정리 완료!');
      
      // 5초 후 자동으로 등록 해제
      setTimeout(() => {
        self.registration.unregister().then(() => {
          console.log('🚫 강제 정리 SW 자동 제거 완료');
        });
      }, 5000);
    })
  );
});

// fetch 이벤트는 완전히 무시
console.log('🚫 네트워크 요청 가로채기 비활성화 - 모든 요청이 브라우저로 직접 전달됩니다.');