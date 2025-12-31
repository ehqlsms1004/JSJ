import '../../css/ChatList.css'
import {  useEffect, useRef, useState } from "react";

export default function ChatList() {
    const topProfiles = [
        { id:1, name: "웰니스 코치", img:"/img/chatlist2.png"},
        { id:2, name: "커리어 멘토", img:"/img/chatlist2.png"},
        { id:3, name: "금융 가이드", img:"/img/chatlist2.png"},
        { id:4, name: "건강 매니저", img:"/img/chatlist2.png"},
    ];

    const rooms = [
        {id:1, title:"웰니스 코치", preview:"사람들은 누구나 마음속에 마음의알을 가지고 태어난다."},
        {id:2, title:"커리어 멘토", preview:"내 꿈은 해적왕."},
        {id:3, title:"금융 가이드", preview:"인생 한방."},
        {id:4, title:"건강 매니저", preview:"건강한 생활을 관리한다."},
        {id:5, title:"데일리 도우미", preview:"오늘 집에가서 게임할거다."},
        {id:6, title:"학습 서포터", preview:"공동묘지에 올라갔더니 시체가 벌떡."},
        {id:7, title:"채팅방", preview:"..."},
        {id:8, title:"쌓이면서", preview:"..."},
        {id:9, title:"스크롤 생기는거", preview:"..."},
        {id:10, title:"확인용", preview:"..."},
    ];

    return (
        <div className='chatListPage'>
            <div className='chatListShell'>
                {/* 상단 프로필 고정 */}
                <div className='chatTop'>
                    <div className='topIcons'>
                        {topProfiles.map((p) => (
                            <button key={p.id} className='iconCircleBtn' type='button' title={p.name}>
                                <img className='iconCircleImg' src={p.img} alt={p.name} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* 목록 영역만 스크롤 */}
                <div className='chatListBody'>
                    {rooms.map((r) => (
                        <div key={r.id} className='chatRoomRow'>
                            <div className='chatAvatar' />
                            <div className='chatRoomText'>
                                <div className='chatRoomTitle'>{r.title}</div>
                                <div className='chatRoomPreview'>{r.preview}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
