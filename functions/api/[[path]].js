// Cloudflare Pages Functions - Proxy /api/* to Workers API

export async function onRequest(context) {
  const { request, env } = context;
  
  // 원본 URL에서 경로 추출
  const url = new URL(request.url);
  const path = url.pathname.replace('/api/', '');
  const search = url.search;
  
  // Workers API URL 구성
  const workerUrl = `https://beautycat-api.jansmakr.workers.dev/api/${path}${search}`;
  
  // Workers API로 프록시
  const response = await fetch(workerUrl, {
    method: request.method,
    headers: request.headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? await request.text() : undefined
  });
  
  // CORS 헤더 추가
  const headers = new Headers(response.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: headers
  });
}
