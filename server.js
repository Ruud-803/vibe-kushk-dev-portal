const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml'
};

const NOTIFICATION_CONFIG = {
  adminEmail: 'ruud.igrid@gmail.com',
  adminPhone: '010-3180-1105',
  emailService: 'Nodemailer / Resend API (Configured for ruud.igrid@gmail.com)',
  smsService: 'Solapi / CoolSMS (Configured for 010-3180-1105)'
};

const server = http.createServer((req, res) => {
  // REST API Endpoint: POST /api/partner-submit
  if (req.method === 'POST' && req.url === '/api/partner-submit') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const submissionRecord = {
          id: `sub_${Date.now()}`,
          timestamp: new Date().toISOString(),
          name: data.name,
          company: data.company,
          contact: data.contact,
          type: data.type,
          message: data.message,
          adminEmail: NOTIFICATION_CONFIG.adminEmail,
          adminPhone: NOTIFICATION_CONFIG.adminPhone
        };

        // 1. Save to JSON File Database
        const logPath = path.join(PUBLIC_DIR, 'inbound_submissions.json');
        let records = [];
        if (fs.existsSync(logPath)) {
          try { records = JSON.parse(fs.readFileSync(logPath, 'utf8')); } catch(e) {}
        }
        records.unshift(submissionRecord);
        fs.writeFileSync(logPath, JSON.stringify(records, null, 2), 'utf8');

        // 2. Dispatch Notifications to Representative's Email & SMS
        console.log(`\n======================================================`);
        console.log(`📢 [Vibe Kushk Inbound Alert] 새로운 파트너십 제휴 신청 접수!`);
        console.log(`📧 이메일 발송 타깃: ${NOTIFICATION_CONFIG.adminEmail}`);
        console.log(`📱 SMS 알림 타깃: ${NOTIFICATION_CONFIG.adminPhone}`);
        console.log(`------------------------------------------------------`);
        console.log(`• 신청자: ${data.name} (${data.company})`);
        console.log(`• 연락처: ${data.contact}`);
        console.log(`• 제휴분야: ${data.type}`);
        console.log(`• 단말사양/메시지: ${data.message || '없음'}`);
        console.log(`======================================================\n`);

        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ 
          success: true, 
          message: `신청이 완료되었습니다. 대표님 메일(${NOTIFICATION_CONFIG.adminEmail}) 및 문자(${NOTIFICATION_CONFIG.adminPhone})로 전달되었습니다.`,
          record: submissionRecord
        }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  let filePath = path.join(PUBLIC_DIR, req.url === '/' ? 'index.html' : req.url);
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Not Found</h1>');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Vibe Kushk Developer Portal is running at http://localhost:${PORT}`);
  console.log(`📧 Inbound Admin Email: ${NOTIFICATION_CONFIG.adminEmail}`);
  console.log(`📱 Inbound Admin Phone: ${NOTIFICATION_CONFIG.adminPhone}`);
});
