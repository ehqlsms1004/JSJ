import '../../css/ChatList.css'
import { Row, Col, Container, Image } from 'react-bootstrap'
const ChatList = () => {
  return (
    <div className="membership_all">
                <Container className="membership_container">
                    <Row className="membership_Row_ChatList">
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
            
  )
}

export default ChatList;