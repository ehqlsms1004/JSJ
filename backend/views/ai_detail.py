from flask import Blueprint, jsonify, request
from backend.models import db, BasicAI, Review, UseBox, User
from sqlalchemy import and_, desc
from urllib.parse import unquote
from datetime import datetime
from zoneinfo import ZoneInfo  # timezone.utc 대체

ai_detail_bp = Blueprint('ai_detail', __name__)


def get_current_user_info():
    """로그인 사용자 정보 반환"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None

    try:
        decoded_nickname = unquote(auth_header.split(' ')[1])
        user = User.query.filter_by(user_nickname=decoded_nickname, user_delete=False).first()
        if user:
            return {'user': user, 'user_id': user.user_id}
    except:
        pass
    return None


@ai_detail_bp.route('/ai/<int:ai_id>', methods=['GET'])
def get_ai_detail(ai_id):
    """AI 상세 정보 + 리뷰 목록 반환"""
    ai = BasicAI.query.get_or_404(ai_id)

    current_user_info = get_current_user_info()
    current_user_id = current_user_info['user_id'] if current_user_info else None

    # ✅ 리뷰 쿼리 완벽 수정 (review_new 사용!)
    reviews = db.session.query(Review).filter(
        Review.ai_id == ai_id,
        Review.review_delete == False
    ).order_by(desc(Review.review_new)).limit(10).all()

    # ✅ 사용자별 리뷰 존재 여부
    has_review = False
    if current_user_id:
        has_review = db.session.query(Review).filter(
            Review.user_id == current_user_id,
            Review.ai_id == ai_id,
            Review.review_delete == False
        ).first() is not None

    # ✅ AI 사용 여부
    is_user_used_ai = False
    if current_user_id:
        is_user_used_ai = db.session.query(UseBox).filter(
            UseBox.user_id == current_user_id,
            UseBox.ai_id == ai_id
        ).first() is not None

    # ✅ 완전한 응답
    response = {
        'ai': ai.to_dict(),
        'reviews': [r.to_dict() for r in reviews],
        'can_write_review': bool(current_user_id and is_user_used_ai and not has_review),
        'is_logged_in': bool(current_user_id)
    }

    if current_user_info and current_user_info.get('user'):
        response['nickname'] = current_user_info['user'].user_nickname

    return jsonify(response)


@ai_detail_bp.route('/ai/<int:ai_id>/review', methods=['POST'])
def create_review(ai_id):
    """리뷰 작성"""
    current_user_info = get_current_user_info()
    if not current_user_info:
        return jsonify({'error': '로그인이 필요합니다.'}), 401

    user_id = current_user_info['user_id']
    data = request.get_json()

    if not data or not data.get('review_write'):
        return jsonify({'error': '리뷰 내용이 필요합니다.'}), 400

    # 1. AI 사용 여부 확인
    use_record = db.session.query(UseBox).filter(
        UseBox.user_id == user_id,
        UseBox.ai_id == ai_id
    ).first()

    if not use_record:
        return jsonify({'error': '이 AI를 사용한 기록이 없습니다.'}), 403

    # 2. 이미 리뷰 작성 여부 확인 (UniqueConstraint 덕분에 중복 불가)
    existing_review = db.session.query(Review).filter(
        Review.user_id == user_id,
        Review.ai_id == ai_id,
        Review.review_delete == False
    ).first()

    if existing_review:
        return jsonify({'error': '이미 리뷰를 작성하셨습니다.'}), 400

    # 3. 리뷰 생성 (review_new 자동 설정됨)
    review = Review(
        user_id=user_id,
        ai_id=ai_id,
        review_write=data['review_write'],
        review_good=0
    )

    db.session.add(review)
    db.session.commit()

    return jsonify(review.to_dict()), 201
