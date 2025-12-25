import { useMemo, useState } from "react";
import '../../css/Pay.css'

export default function Pay() {
    // /예시 금액(props/라우팅 state로 받기)
    const [amount] = useState(39900);
    // card / naver / kakao / toss
    const [method, setMethod] = useState("card")
    const [agree, setAgree] = useState({
        terms: false,
        privacy: false,
    });

    const canPay = useMemo(() => {
        return agree.terms && agree.privacy && !!method && amount > 0;
    }, [agree, method, amount]);

    const formatKRW = (n) => {
        try {
            return n.toLocaleString("ko-KR");
        } catch {
            return String(n);
        }
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!canPay) return;

        // TODO: 백엔드로 결제 생성 요청
        // pay_money: amount
        // pay_choice: method (DB가 Boolean이면 서버에서 매핑 필요)
        console.log({
            pay_money: amount,
            pay_choice: method,
            agree,
        });

        alert("결제 요청");
    };

    return (
        <div className="pay-page">
            <form className="pay-card" onSubmit={onSubmit}>
                <h1 className="pay-title">결제하기</h1>

                <section className="pay-section">
                    <h2 className="pay-section-title">결제 금액</h2>
                    <div className="pay-amount">
                        <span className="pay-amount-currency">₩</span>
                        <span className="pay-amount-number">{formatKRW(amount)}</span>
                    </div>
                </section>

                <div className="pay-divider" />

                <section className="pay-section">
                    <h2 className="pay-section-title">결제 수단</h2>

                    <div className="pay-methods" role="radiogroup" aria-label="결제 수단">
                        <button type="button" className={`pay-method pay-method--card is-img ${method === "card" ? "is-active" : ""}`} onClick={() => setMethod("card")}>
                        카드 결제
                        </button>

                        <button type="button" className={`pay-method pay-method--naver is-img ${method === "naver" ? "is-active" : ""}`} onClick={() => setMethod("naver")}>
                            네이버페이 결제
                        </button>

                        <button type="button" className={`pay-method pay-method--kakao is-img ${method === "kakao" ? "is-active" : ""}`} onClick={() => setMethod("kakao")}>
                            카카오페이 결제
                        </button>

                        <button type="button" className={`pay-method pay-method--toss is-img ${method === "toss" ? "is-active" : ""}`} onClick={() => setMethod("toss")}>
                            토스페이 결제
                        </button>
                    </div>
                </section>

                <div className="pay-divider" />

                <section className="pay-agree">
                    <label className="pay-check">
                        <input type="checkbox" checked={agree.terms} onChange={(e) => setAgree((p) => ({ ...p, terms: e.target.checked}))} />
                        <span>서비스 이용약관 동의</span>
                    </label>

                    <label className="pay-check">
                        <input type="checkbox" checked={agree.privacy} onChange={(e) => setAgree((p) => ({ ...p, privacy: e.target.checked}))} />
                        <span>개인정보 수집 및 이용 동의</span>
                    </label>
                </section>

                <button className="pay-submit" type="submit" disabled={!canPay}>결제하기</button>
            </form>
        </div>
    )
}