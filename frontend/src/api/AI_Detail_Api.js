// AI_Detail_Api.js (한글 닉네임 안전 처리)
import { AuthUtils } from './User_Api';

const API_BASE = '/api';

const getAuthHeaders = () => {
    const token = AuthUtils.getNickname();  // "카피바라"
    if (!token) {
        return { 'Content-Type': 'application/json' };
    }

    // 🔧 한글 닉네임 → URL 인코딩 (ISO-8859-1 오류 해결)
    const encodedToken = encodeURIComponent(token);
    return {
        'Authorization': `Bearer ${encodedToken}`,
        'Content-Type': 'application/json'
    };
};

// AI 상세 정보 + 리뷰 가져오기
export const fetchAiDetail = async (aiId) => {
    console.log('🌐 API 호출:', `${API_BASE}/ai/${aiId}`);
    console.log('🔑 토큰:', AuthUtils.getNickname());

    const response = await fetch(`${API_BASE}/ai/${aiId}`, {
        headers: getAuthHeaders()
    });

    console.log('📡 응답 상태:', response.status);

    if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API 에러:', errorText);
        throw new Error('AI 정보를 가져오지 못했습니다.');
    }

    return response.json();
};

// 리뷰 작성
export const createReview = async (aiId, reviewText) => {
    if (!AuthUtils.isLoggedIn()) {
        throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE}/ai/${aiId}/review`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ review_write: reviewText })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || '리뷰 작성에 실패했습니다.');
    }

    return response.json();
};
