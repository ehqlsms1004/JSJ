import certifi
import httpx
import os
import json
from flask import Blueprint, render_template, request, jsonify, session, current_app
from openai import OpenAI
from dotenv import load_dotenv
from backend.models import db, ChatLog, UseBox  # UseBox 모델 임포트 추가
from datetime import datetime, timezone

# 환경 변수 로드
load_dotenv()

# 블루프린트 설정
bp = Blueprint('tech_chat', __name__, url_prefix='/tech')

# --- 챗봇 환경 설정 ---
CHAT_TITLE = "AI 및 기술 활용 가이드 멘토"
USER_NAME = "사용자"

# [기존 유지] 시스템 프롬프트
SYSTEM_PROMPT = """
당신은 AI, 프로그래밍, IT 활용법 등 기술 관련 지식을 체계적으로 제공하는 **AI 및 기술 활용 가이드 멘토**입니다. 당신의 주된 임무는 사용자의 기술 관련 질문에 대해 **심층적 분석, 구체적인 활용법, 단계별 학습 로드맵**을 제공하는 것입니다.

다음 지침을 **엄격히 따르십시오**:
1. **전문가 역할 및 출력 형식 (최우선):**
    * 답변은 대화 형식이 아닌 **체계적인 보고서 형식**으로 제공하며, **명확하고 논리적인 전문적인 어조**를 사용합니다.
    * 불필요한 인사나 대화 유도 질문은 절대 사용하지 마십시오.
2. **내용 구조 (마크다운 강제):** 답변은 아래의 세 섹션으로 구성되어야 하며, 가독성을 위해 **마크다운 헤딩(`##`)과 목록(`*`)을 사용하여 명확하게 분리**해야 합니다.
    * **[중요!]** 답변은 오직 **마크다운 문법**만을 사용해야 합니다. 줄바꿈은 반드시 두 번 (`\\n\\n`) 사용하여 **단락을 구분**해야 합니다.
    * **## [사용자 질문 주제]에 대한 기술 분석 및 전망**
    * **## 구체적인 활용 로드맵 및 실천 방안**
    * **## 결론 및 추가 조언**
3. **역할 및 범위:** 오직 AI, 프로그래밍, 소프트웨어 사용법, 학습 로드맵 등 **기술 활용**에 국한된 조언만을 제공합니다.
4. **범위 이탈 시 대응:** 거절 템플릿을 사용하여 단호하게 거절하고 기술 활용 주제로 대화를 유도하십시오.
"""

# OpenAI 클라이언트 초기화
client = None
try:
    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key:
        client = OpenAI(
            api_key=api_key,
            http_client=httpx.Client(verify=certifi.where())
        )
except Exception as e:
    print(f"[Tech] OpenAI Init Error: {e}")


# --- 1. 초기 안내 데이터 제공 (/api/tech) ---
@bp.route('/', strict_slashes=False)
def chat_usage():
    user_name = session.get('user_name', USER_NAME)
    user_id = session.get('user_id')

    # 사용자가 요청한 상세 안내 문구 (불렛 포인트 포함) 완벽 복구
    intro_html = f"""
    <div class="initial-text" style="margin-top: 5px;">
        <b>환영합니다!</b> 급변하는 기술의 물결 속에서 당신을 위한 길잡이, 'AI 및 기술 활용 가이드' 챗봇입니다!
    </div>
    <div class="initial-text" style="margin-top: 10px; margin-bottom: 10px;">
        ChatGPT 활용법부터 새로운 AI 도구 배우기, 프로그래밍 기초 학습, 스마트 기기 활용법까지! 기술에 대한 궁금증과 고민을 쉽고 빠르게 해결해 드릴 준비가 되어 있습니다.
    </div>
    <div class="initial-text" style="margin-top: 10px; margin-bottom: 10px;">
        <b>어떤 질문을 해야 할까요?</b>
        <ul>
            <li>"ChatGPT를 업무에 활용하고 싶은데, 어떤 질문부터 시작해야 할까요?"</li>
            <li>"파이썬(Python)으로 데이터 분석을 시작하려면 뭘 공부해야 하나요?"</li>
        </ul>
    </div>
    <div class="initial-text" style="margin-top: 10px; margin-bottom: 10px;">
        <span style="color: red; font-weight: bold;">⭐꼭 기억해주세요!</span>
        <p>이 챗봇은 최신 기술 정보와 활용법을 안내해 드리지만, 실제 코딩 오류를 수정하거나 특정 하드웨어를 <br>직접 제어할 수는 없습니다. 언제든 궁금한 점을 편하게 물어보세요!</p>
    </div><p>자, 이제 {user_name}님의 기술 관련 질문을 들려주세요. 전문적인 분석 보고서로 답해 드릴게요!</p>
    """

    return jsonify({
        "status": "success",
        "user_name": user_name,
        "is_logged_in": bool(user_id),
        "chat_title": CHAT_TITLE,
        "intro_html": intro_html
    })


# --- 2. API 호출 및 하이브리드 저장 (/api/tech/ask) ---
@bp.route('/ask', methods=['POST'], strict_slashes=False)
def ask():
    if client is None:
        return jsonify({'response': 'Error: OpenAI API Key missing.'}), 500

    current_user_id = session.get('user_id', 1)

    try:
        data = request.get_json()
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({'response': '메시지를 입력해주세요.'}), 400

        messages = [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ]

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=messages,
            max_tokens=2048,
            temperature=0.7
        )

        gpt_response = response.choices[0].message.content.strip()

        # --- 하이브리드 저장 로직 (최신 UseBox 방식 적용) ---
        try:
            # 1. UseBox(권한) 확인 및 자동생성 - 테크 가이드는 ai_id=8
            TECH_AI_ID = 8
            usebox = UseBox.query.filter_by(user_id=current_user_id, ai_id=TECH_AI_ID).first()

            if not usebox:
                usebox = UseBox(user_id=current_user_id, ai_id=TECH_AI_ID)
                db.session.add(usebox)
                db.session.commit()

            # 2. SQL 저장 (수정된 DB 구조 반영: usebox_id 사용)
            new_log = ChatLog(
                usebox_id=usebox.use_id,
                question=user_message,
                answer=gpt_response,
                created_at=datetime.now(timezone.utc)
            )
            db.session.add(new_log)
            db.session.commit()
            sql_id = new_log.id

            # 3. MongoDB 저장 (Atlas)
            mongodb = getattr(current_app, 'mongodb', None)
            if mongodb is not None:
                try:
                    mongodb.chat_history.insert_one({
                        "sql_id": sql_id,
                        "usebox_id": usebox.use_id,
                        "user_id": current_user_id,
                        "category": "tech",
                        "question": user_message,
                        "answer": gpt_response,
                        "timestamp": datetime.now(timezone.utc)
                    })
                    print(">>> [SUCCESS] Tech data saved to MongoDB Atlas!")
                except Exception as mongo_err:
                    print(f"[Tech Mongo Error] {mongo_err}")

            # 4. Vector DB 저장
            vector_db = getattr(current_app, 'vector_db', None)
            if vector_db is not None:
                try:
                    vector_db.add(
                        documents=[user_message],
                        ids=[f"tech_{sql_id}"],
                        metadatas=[{"user_id": current_user_id, "category": "tech"}]
                    )
                except Exception as vec_err:
                    print(f"[Tech Vector Error] {vec_err}")

        except Exception as db_err:
            db.session.rollback()
            print(f"[Tech Storage Error] {db_err}")

        return jsonify({'status': 'success', 'response': gpt_response})

    except Exception as e:
        print(f"[Tech API Error] {e}")
        return jsonify({'response': '서버 통신 오류가 발생했습니다.'}), 500


# --- 3. 리포트 생성 함수 (/api/tech/report) ---
@bp.route('/report', methods=['GET'], strict_slashes=False)
def generate_report():
    user_id = session.get('user_id', 1)

    try:
        # UseBox 조인을 통해 테크(ai_id=8) 기록만 필터링
        history = ChatLog.query.join(UseBox).filter(
            UseBox.user_id == user_id,
            UseBox.ai_id == 8
        ).order_by(ChatLog.created_at.desc()).limit(5).all()

        if not history:
            return jsonify({'error': '기술 상담 내역이 부족합니다.'}), 404

        chat_data = "\\n".join([f"Q: {h.question}\\nA: {h.answer}" for h in reversed(history)])

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "IT 기술 전략가입니다. 전문 분석 리포트를 작성하세요."},
                {"role": "user", "content": f"기술 활용 상담 분석 리포트 작성:\\n\\n{chat_data}"}
            ]
        )

        return jsonify({'status': 'success', 'report': response.choices[0].message.content})

    except Exception as e:
        print(f"[Tech Report Error] {e}")
        return jsonify({'error': '리포트 생성 중 오류가 발생했습니다.'}), 500