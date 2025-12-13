// 임시 마이그레이션 엔드포인트
// 사용법: https://api.beautycat.kr/api/migrate-shop-announcements

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // 마이그레이션 엔드포인트
    if (url.pathname === '/api/migrate-shop-announcements') {
      try {
        const db = env.DB;
        
        // 1. category 컬럼 추가
        await db.prepare(
          "ALTER TABLE shop_announcements ADD COLUMN category TEXT DEFAULT '일반공지'"
        ).run();
        
        // 2. event_type 컬럼 추가
        await db.prepare(
          "ALTER TABLE shop_announcements ADD COLUMN event_type TEXT DEFAULT 'normal'"
        ).run();
        
        // 3. slots_info 컬럼 추가
        await db.prepare(
          "ALTER TABLE shop_announcements ADD COLUMN slots_info TEXT DEFAULT ''"
        ).run();
        
        // 4. discount_rate 컬럼 추가
        await db.prepare(
          "ALTER TABLE shop_announcements ADD COLUMN discount_rate INTEGER DEFAULT 0"
        ).run();
        
        // 검증
        const result = await db.prepare(
          "PRAGMA table_info(shop_announcements)"
        ).all();
        
        return new Response(JSON.stringify({
          success: true,
          message: "Migration completed successfully",
          columns: result.results
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
        
      } catch (error) {
        return new Response(JSON.stringify({
          success: false,
          error: error.message
        }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    
    return new Response('Migration endpoint: /api/migrate-shop-announcements', {
      status: 404
    });
  }
};
