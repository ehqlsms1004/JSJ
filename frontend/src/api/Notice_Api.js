// src/api/Notice_Api.js 완성본 (복사-붙여넣기)
import axios from 'axios';

export const create_notice = async (noticeData) => {
  try {
    const token = localStorage.getItem('authToken');
    console.log('🔍 Notice_Api 토큰:', token);

    if (!token) {
      return { success: false, error: '로그인 토큰이 없습니다.' };
    }

    // 🔥 한글 토큰 URL 인코딩!
    const encodedToken = encodeURIComponent(token);  // "기린이다" → "%EA%B8%B0%EB%A6%B0%EC%9D%B4%EB%8B%A4"

    const response = await axios.post(
      `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/notices`,
      noticeData,
      {
        headers: {
          'Authorization': `Bearer ${encodedToken}`,
        }
      }
    );

    console.log('✅ 게시글 등록 성공:', response.data);
    return response.data;

  } catch (error) {
    console.error("❌ notice 등록 실패:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.error || '등록 실패'
    };
  }
};
