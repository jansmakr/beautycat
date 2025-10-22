// 🚀 beautycat RESTful Table API
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 허용된 테이블 목록
const ALLOWED_TABLES = [
    'users', 'skincare_shops', 'consultations', 'quotes', 
    'messages', 'reviews', 'representative_shops', 'call_statistics',
    'announcements', 'contact_inquiries', 'external_orders', 
    'payments', 'user_sessions', 'subscriptions'
];

export default async function handler(req, res) {
    // CORS 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const { params } = req.query;
        const [tableName, recordId] = params || [];

        // 테이블명 검증
        if (!tableName || !ALLOWED_TABLES.includes(tableName)) {
            return res.status(400).json({ 
                error: '유효하지 않은 테이블명입니다.',
                allowed_tables: ALLOWED_TABLES
            });
        }

        // HTTP 메서드별 처리
        switch (req.method) {
            case 'GET':
                return await handleGet(req, res, tableName, recordId);
            case 'POST':
                return await handlePost(req, res, tableName);
            case 'PUT':
                return await handlePut(req, res, tableName, recordId);
            case 'PATCH':
                return await handlePatch(req, res, tableName, recordId);
            case 'DELETE':
                return await handleDelete(req, res, tableName, recordId);
            default:
                return res.status(405).json({ error: '지원하지 않는 HTTP 메서드입니다.' });
        }
    } catch (error) {
        console.error('API 오류:', error);
        return res.status(500).json({ 
            error: '서버 내부 오류가 발생했습니다.',
            message: error.message
        });
    }
}

// GET 요청 처리
async function handleGet(req, res, tableName, recordId) {
    try {
        if (recordId) {
            const { data, error } = await supabase
                .from(tableName)
                .select('*')
                .eq('id', recordId)
                .eq('deleted', false)
                .single();

            if (error) throw error;
            
            if (!data) {
                return res.status(404).json({ error: '레코드를 찾을 수 없습니다.' });
            }

            return res.status(200).json(data);
        } else {
            const { 
                page = 1, 
                limit = 100, 
                sort = 'created_at',
                order = 'desc',
                search,
                ...filters 
            } = req.query;

            let query = supabase
                .from(tableName)
                .select('*', { count: 'exact' })
                .eq('deleted', false);

            // 검색 기능
            if (search) {
                if (tableName === 'users') {
                    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
                } else if (tableName === 'skincare_shops') {
                    query = query.or(`shop_name.ilike.%${search}%,owner_name.ilike.%${search}%`);
                }
            }

            // 정렬
            query = query.order(sort, { ascending: order === 'asc' });

            // 페이징
            const offset = (parseInt(page) - 1) * parseInt(limit);
            query = query.range(offset, offset + parseInt(limit) - 1);

            const { data, error, count } = await query;

            if (error) throw error;

            return res.status(200).json({
                data: data || [],
                total: count || 0,
                page: parseInt(page),
                limit: parseInt(limit),
                table: tableName
            });
        }
    } catch (error) {
        console.error('GET 요청 오류:', error);
        return res.status(500).json({ error: '데이터 조회 중 오류가 발생했습니다.' });
    }
}

// POST 요청 처리
async function handlePost(req, res, tableName) {
    try {
        const data = req.body;
        const currentTime = new Date().toISOString();
        data.created_at = currentTime;
        data.updated_at = currentTime;
        data.deleted = false;

        const { data: newRecord, error } = await supabase
            .from(tableName)
            .insert([data])
            .select()
            .single();

        if (error) throw error;
        return res.status(201).json(newRecord);
    } catch (error) {
        console.error('POST 요청 오류:', error);
        return res.status(500).json({ error: '데이터 생성 중 오류가 발생했습니다.' });
    }
}

// PUT 요청 처리
async function handlePut(req, res, tableName, recordId) {
    try {
        if (!recordId) {
            return res.status(400).json({ error: '레코드 ID가 필요합니다.' });
        }

        const data = req.body;
        data.updated_at = new Date().toISOString();

        const { data: updatedRecord, error } = await supabase
            .from(tableName)
            .update(data)
            .eq('id', recordId)
            .eq('deleted', false)
            .select()
            .single();

        if (error) throw error;

        if (!updatedRecord) {
            return res.status(404).json({ error: '레코드를 찾을 수 없습니다.' });
        }

        return res.status(200).json(updatedRecord);
    } catch (error) {
        console.error('PUT 요청 오류:', error);
        return res.status(500).json({ error: '데이터 업데이트 중 오류가 발생했습니다.' });
    }
}

// PATCH 요청 처리
async function handlePatch(req, res, tableName, recordId) {
    try {
        if (!recordId) {
            return res.status(400).json({ error: '레코드 ID가 필요합니다.' });
        }

        const data = req.body;
        data.updated_at = new Date().toISOString();

        const { data: updatedRecord, error } = await supabase
            .from(tableName)
            .update(data)
            .eq('id', recordId)
            .eq('deleted', false)
            .select()
            .single();

        if (error) throw error;

        if (!updatedRecord) {
            return res.status(404).json({ error: '레코드를 찾을 수 없습니다.' });
        }

        return res.status(200).json(updatedRecord);
    } catch (error) {
        console.error('PATCH 요청 오류:', error);
        return res.status(500).json({ error: '데이터 업데이트 중 오류가 발생했습니다.' });
    }
}

// DELETE 요청 처리
async function handleDelete(req, res, tableName, recordId) {
    try {
        if (!recordId) {
            return res.status(400).json({ error: '레코드 ID가 필요합니다.' });
        }

        const { data: deletedRecord, error } = await supabase
            .from(tableName)
            .update({ 
                deleted: true, 
                updated_at: new Date().toISOString() 
            })
            .eq('id', recordId)
            .eq('deleted', false)
            .select('id')
            .single();

        if (error) throw error;

        if (!deletedRecord) {
            return res.status(404).json({ error: '레코드를 찾을 수 없습니다.' });
        }

        return res.status(204).send();
    } catch (error) {
        console.error('DELETE 요청 오류:', error);
        return res.status(500).json({ error: '데이터 삭제 중 오류가 발생했습니다.' });
    }
}

