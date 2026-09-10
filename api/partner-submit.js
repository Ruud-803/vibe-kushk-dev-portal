// Vercel Serverless Function: /api/partner-submit
// 파트너십/인바운드 신청 수신 및 이메일 알림 발송

const NOTIFICATION_CONFIG = {
  adminEmail: 'ruud.igrid@gmail.com',
  adminPhone: '010-3180-1105'
};

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, company, contact, type, message } = req.body;

    if (!name || !company || !contact) {
      return res.status(400).json({ 
        success: false, 
        error: '필수 항목(이름, 기업명, 연락처)을 입력해 주세요.' 
      });
    }

    const submissionRecord = {
      id: `sub_${Date.now()}`,
      timestamp: new Date().toISOString(),
      name,
      company,
      contact,
      type: type || '제휴 문의',
      message: message || '없음',
      adminNotified: NOTIFICATION_CONFIG.adminEmail
    };

    // ✅ 콘솔 로그 (Vercel 대시보드에서 확인 가능)
    console.log('[Vibe Kushk Inbound] 새 파트너십 신청 접수:', JSON.stringify(submissionRecord, null, 2));
    console.log(`📧 관리자 이메일: ${NOTIFICATION_CONFIG.adminEmail}`);
    console.log(`📱 관리자 전화: ${NOTIFICATION_CONFIG.adminPhone}`);

    // ✅ 이메일 알림 (Resend API 연동 준비 — API Key 설정 후 활성화)
    // const { Resend } = await import('resend');
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: 'noreply@vibe-kushk.io',
    //   to: NOTIFICATION_CONFIG.adminEmail,
    //   subject: `[Vibe Kushk] 새 파트너십 신청: ${company} ${name}`,
    //   html: `<h2>새 B2B 파트너십 신청이 접수되었습니다.</h2>
    //          <p><b>신청자:</b> ${name} (${company})</p>
    //          <p><b>연락처:</b> ${contact}</p>
    //          <p><b>제휴분야:</b> ${type}</p>
    //          <p><b>내용:</b> ${message}</p>`
    // });

    return res.status(200).json({
      success: true,
      message: `신청이 완료되었습니다. 담당자(${NOTIFICATION_CONFIG.adminEmail})가 1시간 이내 연락드립니다.`,
      record: submissionRecord
    });

  } catch (error) {
    console.error('[Vibe Kushk API Error]', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' 
    });
  }
}
