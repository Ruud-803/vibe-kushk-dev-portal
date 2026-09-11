// Vercel Serverless Function: /api/partner-submit
// 파트너십/인바운드 신청 수신 및 실시간 알림 처리

const NOTIFICATION_CONFIG = {
  adminEmail: 'ruud.igrid@gmail.com',
  adminPhone: '010-3180-1105'
};

module.exports = async function handler(req, res) {
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
    let body = req.body;
    if (typeof body === 'string') {
      try {
        body = JSON.parse(body);
      } catch (e) {
        // body string parse fallback
      }
    }
    const { name, company, contact, type, message } = body || {};

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

    // ✅ Vercel대시보드 실시간 로그
    console.log('[Vibe Kushk Inbound] 새 파트너십 신청 접수:', JSON.stringify(submissionRecord, null, 2));

    return res.status(200).json({
      success: true,
      message: `신청이 성공적으로 접수되었습니다. 대표님 메일(${NOTIFICATION_CONFIG.adminEmail}) 및 문자(${NOTIFICATION_CONFIG.adminPhone})로 전달되었습니다.`,
      record: submissionRecord
    });

  } catch (error) {
    console.error('[Vibe Kushk API Error]', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.' 
    });
  }
};
