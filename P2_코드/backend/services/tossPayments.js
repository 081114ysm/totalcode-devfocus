const API_URL = "https://api.tosspayments.com/v1/payments";

function authorization() {
  if (!process.env.TOSS_SECRET_KEY) return null;
  return `Basic ${Buffer.from(`${process.env.TOSS_SECRET_KEY}:`).toString("base64")}`;
}

async function tossRequest(path, body) {
  const auth = authorization();
  if (!auth) {
    if (process.env.ALLOW_MOCK_PAYMENT === "true" && process.env.NODE_ENV !== "production") {
      return { paymentKey: body.paymentKey, orderId: body.orderId, totalAmount: body.amount, method: "개발 결제", approvedAt: new Date().toISOString(), receipt: null };
    }
    const error = new Error("결제 서비스 키가 설정되지 않았습니다");
    error.status = 503;
    throw error;
  }
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { Authorization: auth, "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.message || "결제사 요청에 실패했습니다");
    error.status = response.status;
    error.code = result.code;
    throw error;
  }
  return result;
}

export const confirmTossPayment = ({ paymentKey, orderId, amount }) =>
  tossRequest("/confirm", { paymentKey, orderId, amount });

export const cancelTossPayment = (paymentKey, cancelReason) =>
  tossRequest(`/${encodeURIComponent(paymentKey)}/cancel`, { cancelReason });
