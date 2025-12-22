# backend/views/notice.py
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
from datetime import datetime
from urllib.parse import unquote
from backend.models import User, Notice, db

notice_bp = Blueprint('notice', __name__)


def get_user_id_from_nickname(nickname):
    try:
        decoded_nickname = unquote(nickname)
    except:
        decoded_nickname = nickname
    user = User.query.filter_by(user_nickname=decoded_nickname).first()

    if user:
        return user.user_id
    else:
        return None


@notice_bp.route("/notices", methods=["POST"])
def add_notice():
    try:
        auth_header = request.headers.get('Authorization')
        print(f"[HEADER] Authorization: '{auth_header}'")

        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"success": False, "error": "로그인 토큰 필요"}), 401

        nickname = auth_header.split(' ')[1]

        user_id = get_user_id_from_nickname(nickname)
        if not user_id:
            return jsonify({"success": False, "error": "사용자 인증 실패"}), 403

        notice_title = request.form.get('title', '').strip()
        notice_write = request.form.get('content', '').strip()

        if not notice_title or not notice_write:
            return jsonify({"success": False, "error": "제목과 내용 필수"}), 400

        # 이미지 처리
        images = request.files.getlist('images')
        image_paths = []

        if images:
            upload_folder = 'uploads'
            os.makedirs(upload_folder, exist_ok=True)
            for i, image in enumerate(images):
                if image and image.filename:
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    filename = secure_filename(f"{notice_title[:30]}_{timestamp}_{i}_{image.filename}")
                    filepath = os.path.join(upload_folder, filename)
                    image.save(filepath)
                    image_paths.append(f"/uploads/{filename}")

        notice_image = ','.join(image_paths) if image_paths else None

        # DB 저장
        notice = Notice(
            user_id=user_id,
            notice_title=notice_title,
            notice_write=notice_write,
            notice_image=notice_image,
        )
        db.session.add(notice)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "등록 성공",
            "notice": notice.to_dict()
        }), 201

    except Exception as e:
        print(f"[CRASH] 에러: {str(e)}")
        if 'db' in locals() and db.session:
            db.session.rollback()
        return jsonify({"success": False, "error": str(e)}), 500
