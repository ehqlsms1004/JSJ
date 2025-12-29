import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
// 실제 프로젝트의 경로에 맞게 아래 주석을 해제하거나 확인해주세요.
// import { AuthUtils } from '../utils/AuthUtils';
// import { getMyProfile } from '../services/api';

const ChatComponent = () => {
    const { type } = useParams();
    const [msg, setMsg] = useState('');
    const [chat, setChat] = useState([]);
    const [intro, setIntro] = useState('');
    const [report, setReport] = useState('');
    const [loading, setLoading] = useState(true);
    const [isTyping, setIsTyping] = useState(false);

    // 1. 사용자 정보 및 닉네임 상태 관리
    const [userInfo, setUserInfo] = useState(null);
    const [nickname, setNickname] = useState('사용자');

    const chatEndRef = useRef(null);

    // 2. 봇 설정 (nickname 상태에 따라 제목이 실시간으로 변합니다)
    const botConfigs = {
        wellness: { title: `🌿 ${nickname}님의 웰니스 코치`, color: '#4CAF50', placeholder: '마음 상태를 들려주세요...' },
        career: { title: `🚀 ${nickname}님의 커리어 멘토`, color: '#FF8C00', placeholder: '진로 고민을 함께 나눠보시죠...' },
        finance: { title: `💰 ${nickname}님의 금융 가이드`, color: '#1E88E5', placeholder: '자산 관리에 대해 궁금함을 알려주세요...' },
        health: { title: `🏥 ${nickname}님의 건강 매니저`, color: '#E53935', placeholder: '건강 상태를 알려주세요...' },
        daily: { title: `📅 ${nickname}님의 데일리 도우미`, color: '#9C27B0', placeholder: '오늘 하루는 어땠나요?' },
        learning: { title: `✍️ ${nickname}님의 학습 서포터`, color: '#795548', placeholder: '공부 계획을 세워볼까요?' },
        legal: { title: `⚖️ ${nickname}님의 법률 자문`, color: '#607D8B', placeholder: '상담이 필요한 법률 문제를 알려주세요...' },
        tech: { title: `💻 ${nickname}님의 테크 가이드`, color: '#263238', placeholder: '기술적 궁금증을 해결해드릴게요.' }
    };

    const currentBot = botConfigs[type] || { title: `🤖 ${nickname}님의 AI 어시스턴트`, color: '#333', placeholder: '메시지를 입력하세요...' };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chat, isTyping]);

    useEffect(() => {
        // 페이지 이동 시 상태 초기화
        setChat([]);
        setReport('');
        setIntro('');
        setLoading(true);

        const initChatPage = async () => {
            // A. 로그인 체크 (AuthUtils가 있을 경우)
            if (typeof AuthUtils !== 'undefined' && !AuthUtils.isLoggedIn()) {
                setLoading(false);
                return;
            }

            try {
                // B. 최신 유저 프로필 및 닉네임 가져오기
                let currentName = '사용자';
                if (typeof getMyProfile === 'function') {
                    const data = await getMyProfile();
                    setUserInfo(data);
                    currentName = data.user_nickname || data.nickname || '사용자';
                } else {
                    // API 미구현 시 세션스토리지에서 가져오기
                    currentName = sessionStorage.getItem('user_name') || sessionStorage.getItem('nickname') || '사용자';
                }
                setNickname(currentName);

                // C. 서버로부터 챗봇 인트로 정보 가져오기
                const res = await fetch(`http://localhost:5000/${type}/`, { credentials: 'include' });
                const data = await res.json();

                if (data.status === "success") {
                    // [정석 로직] 서버가 주는 intro_html을 가공 없이 그대로 노출합니다.
                    // 이름 불일치 문제는 이제 백엔드 파이썬 코드에서 수정하게 됩니다.
                    setIntro(data.intro_html);
                }
            } catch (err) {
                console.error(`${type} 데이터 로드 실패:`, err);
            } finally {
                setLoading(false);
            }
        };

        initChatPage();
    }, [type]);

    const send = async () => {
        if (!msg.trim() || isTyping) return;
        const currentMsg = msg;
        setChat(prev => [...prev, { role: 'user', text: currentMsg }]);
        setMsg('');
        setIsTyping(true);

        try {
            const res = await fetch(`http://localhost:5000/${type}/ask`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: currentMsg }),
                credentials: 'include'
            });
            const data = await res.json();
            if (data.status === "success" || data.response) {
                setChat(prev => [...prev, { role: 'ai', text: data.response }]);
            }
        } catch (error) {
            console.error("전송 에러:", error);
        } finally {
            setIsTyping(false);
        }
    };

    const generateReport = async () => {
        if (chat.length < 2) return alert("대화가 부족합니다.");
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:5000/${type}/report`, { credentials: 'include' });
            const data = await res.json();
            if (data.report) setReport(data.report);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '850px', margin: '0 auto', fontFamily: 'Pretendard, sans-serif' }}>
            {/* 상단 제목: 리액트 닉네임 상태가 반영됨 */}
            <h2 style={{ textAlign: 'center', color: currentBot.color, marginBottom: '30px' }}>{currentBot.title}</h2>

            {/* 인트로 설명글: 백엔드에서 보내주는 HTML 그대로 표시 */}
            {intro && (
                <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '12px', border: '1px solid #eee', marginBottom: '20px', fontSize: '0.95rem', color: '#444' }}
                     dangerouslySetInnerHTML={{ __html: intro }} />
            )}

            <div style={{ border: '1px solid #ddd', borderRadius: '15px', height: '500px', overflowY: 'auto', padding: '20px', backgroundColor: '#fff', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {chat.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', color: '#bbb' }}>
                        <p style={{ fontSize: '1.2rem' }}>💬</p>
                        <p>{nickname}님, 무엇을 도와드릴까요?</p>
                    </div>
                ) : (
                    chat.map((c, i) => (
                        <div key={i} style={{ textAlign: c.role === 'user' ? 'right' : 'left' }}>
                            <div style={{
                                display: 'inline-block',
                                padding: '12px 18px',
                                borderRadius: '18px',
                                backgroundColor: c.role === 'user' ? currentBot.color : '#f1f3f5',
                                color: c.role === 'user' ? '#fff' : '#212529',
                                maxWidth: '85%',
                                fontSize: '14px'
                            }}>
                                {c.role === 'ai' ? <ReactMarkdown>{c.text}</ReactMarkdown> : c.text}
                            </div>
                        </div>
                    ))
                )}
                {isTyping && <div style={{ textAlign: 'left', color: '#888' }}>답변 중...</div>}
                <div ref={chatEndRef} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
                <input style={{ flex: 1, padding: '14px', borderRadius: '10px', border: '1px solid #ddd' }}
                       value={msg}
                       onChange={e => setMsg(e.target.value)}
                       onKeyPress={e => e.key === 'Enter' && send()}
                       placeholder={currentBot.placeholder} />
                <button onClick={send} style={{ padding: '0 30px', backgroundColor: currentBot.color, color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold' }}>전송</button>
            </div>

            <button onClick={generateReport} style={{ width: '100%', marginTop: '20px', padding: '16px', backgroundColor: '#212529', color: '#fff', border: 'none', borderRadius: '12px' }}>
                {loading ? "데이터 불러오는 중..." : "📊 AI 분석 리포트 생성"}
            </button>
            {report && <div style={{ marginTop: '20px', padding: '20px', border: '1px solid #ddd', borderRadius: '12px' }}><ReactMarkdown>{report}</ReactMarkdown></div>}
        </div>
    );
};

export default ChatComponent;