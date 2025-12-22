import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const AIIntroduce = () => {
    const noticeData = [
        { id: 1, title: '우', writer: '예노', views: 90 },
        { id: 2, title: '왕', writer: '수도승', views: 65 },
        { id: 3, title: '우', writer: '수도승', views: 50 },
        { id: 4, title: '왕', writer: '태연', views: 20 },
    ];
    const navigate = useNavigate();

    return (
        <section>
            <div className="Introduce">
                <Image src='/img/main_slider_img.png' alt="웹사이트_설명" className="AI_introduce_img" fluid />
            </div>

            <div className="service_section">
                <div className="membership_img">
                    <Container >
                        <Row>
                            <Col xs={6} md={4}>
                                <Image src='/img/Membership.gif' alt="멤버십_가입_소개_gif파일" className="membership_gif" roundedCircle />
                            </Col>
                        </Row>
                    </Container>
                </div>
            </div>

            <div className="AICategoty_all">
                <Container className="AiCategory_container">
                    <Row className="circle_Row">
                        <h1>Basic Category</h1>
                        <Col xs={6} md={4} className="AICategory_circle">
                            <div className="circle_div">
                                <Image src="/img/Business.png" roundedCircle />
                                <div className="circle_text d-none d-lg-block">
                                    <h2>비지니스</h2>
                                    <p>성장과 수익 구조를<br />설계합니다.</p>
                                </div>
                            </div>
                        </Col>

                        <Col xs={6} md={4} className="AICategory_circle">
                            <div className="circle_div">
                                <Image src="/img/Designer.png" roundedCircle />
                                <div className="circle_text d-none d-lg-block">
                                    <h2>디자이너</h2>
                                    <p>사용자의 경험을<br />설계합니다.</p>
                                </div>
                            </div>
                        </Col>

                        <Col xs={6} md={4} className="AICategory_circle">
                            <div className="circle_div">
                                <Image src="/img/Developer.png" roundedCircle />
                                <div className="circle_text d-none d-lg-block">
                                    <h2>개발/엔지니어</h2>
                                    <p>아이디어를 실제 서비스로<br />구현합니다.</p>
                                </div>
                            </div>
                        </Col>

                        <Col xs={6} md={4} className="AICategory_circle">
                            <div className="circle_div">
                                <Image src="/img/Legal.png" roundedCircle />
                                <div className="circle_text d-none d-lg-block">
                                    <h2>법률/재무</h2>
                                    <p>리스크를 관리하고<br />안정성을 확보합니다.</p>
                                </div>
                            </div>
                        </Col>

                        <Col xs={6} md={4} className="AICategory_circle">
                            <div className="circle_div">
                                <Image src="/img/Planner.png" roundedCircle />
                                <div className="circle_text d-none d-lg-block">
                                    <h2>기획/PM</h2>
                                    <p>제품의 방향과 완성도를<br />관리합니다.</p>
                                </div>
                            </div>
                        </Col>

                        <Col xs={6} md={4} className="AICategory_circle">
                            <div className="circle_div">
                                <Image src="/img/Medical.png" roundedCircle />
                                <div className="circle_text d-none d-lg-block">
                                    <h2>의료/서비스</h2>
                                    <p>전문적인 의료 경험을<br />제공합니다.</p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div className="membership_all">
                <Container className="membership_container">
                    <Row className="membership_Row">
                        <h1>Membership Category</h1>
                        <Col xs={6} md={3} className="membership_circle">
                            <div className="membership_circle_div">
                                <Image src="/img/membership_img.png" roundedCircle />
                            </div>
                        </Col>

                        <Col xs={6} md={3} className="membership_circle">
                            <div className="membership_circle_div">
                                <Image src="/img/membership_img.png" roundedCircle />
                            </div>
                        </Col>

                        <Col xs={6} md={3} className="membership_circle">
                            <div className="membership_circle_div">
                                <Image src="/img/membership_img.png" roundedCircle />
                            </div>
                        </Col>

                        <Col xs={6} md={3} className="membership_circle">
                            <div className="membership_circle_div">
                                <Image src="/img/membership_plus_img.png" roundedCircle />
                            </div>
                        </Col>

                    </Row>
                </Container>
            </div>

            <div className="notice">
                <div className="notice-header">
                    <h2>게시판</h2>
                    <div className="notice-actions">
                        <button className="my-board-btn" onClick={() => navigate("/NoticeMy")}>내 게시글</button>

                        <button className="write-btn" onClick={() => navigate('/NoticeWrite')}>작성</button>
                    </div>
                </div>

                <div className="notice-table">
                    <div className="notice-head">
                        <span>번호</span>
                        <span>제목</span>
                        <span>작성자</span>
                        <span>조회수</span>
                    </div>

                    {noticeData.map((item) => (
                        <div className="notice-row" key={item.id}>
                            <span>{item.id}</span>
                            <span className="title">{item.title}</span>
                            <span>{item.writer}</span>
                            <span>{item.views}</span>
                        </div>
                    ))}
                </div>

                <div className='pagination_all'>
                    <div className="pagination">
                        <p>1 2 3 4 ...</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AIIntroduce;