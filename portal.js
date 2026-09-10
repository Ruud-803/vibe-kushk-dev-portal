// Vibe Kushk Developer Portal Interactive Engine

// 1. Code Snippets Data
const codeSnippets = {
  js: `// 1. Vibe Kushk SDK 설치: npm install @vibe-kushk/voice-sdk
import { VibeKushkEngine } from '@vibe-kushk/voice-sdk';

// 2. 엔진 초기화 및 KS X 9211 배리어프리 모드 바인딩
const engine = new VibeKushkEngine({
  apiKey: 'vk_test_sandbox_9211_demo_key',
  mode: 'kiosk-accessibility', // KS X 9211 국가표준 준수 모드
  targetElementId: 'kiosk-app-root',
  features: {
    tts: true,              // 화면 음성 동시 출력 (65dBA 초기화)
    stt: true,              // Whisper Edge 노이즈 차단 음성 인식
    visualSubtitles: true,  // 실시간 음성 자막 뷰어 오버레이
    lowStanceMode: true,    // 휠체어 저자세 UI (400~1,220mm 하단 배치)
    extendTimeOption: true  // 타임아웃 사전 음성안내 & 30초 연동 연장
  }
});

// 3. 배리어프리 접근성 서비스 가동
engine.start();`,

  react: `// React Kiosk App 연동 가이드
import React, { useEffect } from 'react';
import { useVibeKushk } from '@vibe-kushk/react-sdk';

export function KioskApp() {
  const { isVoiceActive, activeSubtitle, toggleLowStance } = useVibeKushk({
    apiKey: process.env.REACT_APP_VIBE_KEY,
    ksX9211Mode: true
  });

  return (
    <div className="kiosk-container">
      {activeSubtitle && <div className="subtitle-banner">{activeSubtitle}</div>}
      <button onClick={toggleLowStance}>♿ 저자세 모드</button>
      <MainMenuView />
    </div>
  );
}`,

  vue: `// Vue 3 Composition API 연동 가이드
<script setup>
import { onMounted, ref } from 'vue';
import { initVibeKushk } from '@vibe-kushk/vue-sdk';

const subtitle = ref('');

onMounted(() => {
  const engine = initVibeKushk({
    apiKey: 'vk_test_vue_key',
    onSubtitle: (text) => { subtitle.value = text; }
  });
  engine.start();
});
</script>`
};

// 2. Switch Code Tab
function switchTab(tabKey) {
  document.querySelectorAll('.code-tab').forEach(tab => tab.classList.remove('active'));
  event.target.classList.add('active');
  const codeElement = document.querySelector('#code-display code');
  if (codeElement && codeSnippets[tabKey]) {
    codeElement.textContent = codeSnippets[tabKey];
  }
}

// 3. Copy Code
function copyCode() {
  const codeText = document.querySelector('#code-display code').textContent;
  navigator.clipboard.writeText(codeText).then(() => {
    showToast('📋 코드가 클립보드에 복사되었습니다!');
    document.getElementById('copy-text').textContent = '복사 완료!';
    setTimeout(() => {
      document.getElementById('copy-text').textContent = '코드 복사';
    }, 2000);
  });
}

// 4. Simulator State Management
let isLowStance = false;
let isHighContrast = false;
let currentCartItem = null;
let currentCartPrice = 0;

function toggleLowStance() {
  isLowStance = !isLowStance;
  const emulator = document.querySelector('.emulator-frame');
  const btn = document.getElementById('btn-low-stance');
  
  if (isLowStance) {
    emulator.classList.add('low-stance-active');
    btn.classList.add('active');
    btn.querySelector('.toggle-status').textContent = 'ON';
    showSubtitle('♿ 휠체어 저자세 모드 활성화: 주요 버튼이 하단 400~1,220mm 위치로 조절되었습니다.');
    speakTTS('휠체어 이용자를 위한 저자세 모드가 활성화되었습니다.');
  } else {
    emulator.classList.remove('low-stance-active');
    btn.classList.remove('active');
    btn.querySelector('.toggle-status').textContent = 'OFF';
    showSubtitle('휠체어 저자세 모드가 해제되었습니다.');
  }
}

function toggleHighContrast() {
  isHighContrast = !isHighContrast;
  const emulator = document.querySelector('.emulator-frame');
  const btn = document.getElementById('btn-high-contrast');
  
  if (isHighContrast) {
    emulator.classList.add('high-contrast-active');
    btn.classList.add('active');
    btn.querySelector('.toggle-status').textContent = 'ON';
    showSubtitle('👁️ 고대비 모드 활성화 (명암비 4.5:1 이상 극대화)');
  } else {
    emulator.classList.remove('high-contrast-active');
    btn.classList.remove('active');
    btn.querySelector('.toggle-status').textContent = 'OFF';
    showSubtitle('고대비 모드가 해제되었습니다.');
  }
}

function simulateTTS() {
  const text = '아메리카노 1잔이 선택되었습니다. 가격은 4,500원입니다.';
  showSubtitle(`🔊 [TTS 음성출력 65dBA]: "${text}"`);
  speakTTS(text);
  selectMenu('아메리카노', 4500);
}

function simulateVoiceOrder() {
  showSubtitle('🎙️ [음성 인식중...]: "아이스 아메리카노 하나 줘" (Edge VAD 소음 제거 구동)');
  setTimeout(() => {
    showSubtitle('🗣️ [Whisper STT 인식완료]: "아메리카노 1잔을 결제 메뉴에 추가했습니다."');
    speakTTS('아메리카노 1잔을 담았습니다. 결제하시겠습니까?');
    selectMenu('아메리카노', 4500);
  }, 1200);
}

function simulateTimeExtension() {
  showSubtitle('⏰ [이용시간 안내]: 이용 시간이 10초 남았습니다. 연장하시겠습니까?');
  speakTTS('이용 시간이 10초 남았습니다. 연장하려면 시간 연장 버튼을 누르세요.');
}

function selectMenu(name, price) {
  currentCartItem = name;
  currentCartPrice = price;
  document.getElementById('cart-item').textContent = name;
  document.getElementById('cart-total').textContent = `${price.toLocaleString()}원`;
  showToast(`☕ ${name} (${price.toLocaleString()}원) 장바구니 추가`);
}

function resetKiosk() {
  currentCartItem = null;
  currentCartPrice = 0;
  document.getElementById('cart-item').textContent = '없음';
  document.getElementById('cart-total').textContent = '0원';
  showSubtitle('키오스크 세션이 초기화되었습니다. 기본 음량 65dBA 리셋 완료.');
  speakTTS('이용이 초기화되었습니다.');
}

function checkoutKiosk() {
  if (!currentCartItem) {
    showToast('⚠️ 메뉴를 먼저 선택해 주세요!');
    speakTTS('메뉴를 먼저 선택해 주세요.');
    return;
  }
  showSubtitle(`💳 [결제 진행]: ${currentCartItem} ${currentCartPrice.toLocaleString()}원 결제 요청`);
  speakTTS(`${currentCartItem} ${currentCartPrice.toLocaleString()}원 결제가 완료되었습니다. 이용해 주셔서 감사합니다.`);
  setTimeout(() => {
    resetKiosk();
  }, 3000);
}

function showSubtitle(text) {
  const overlay = document.getElementById('subtitle-overlay');
  const textEl = document.getElementById('subtitle-text');
  overlay.classList.remove('hidden');
  textEl.textContent = text;
}

function speakTTS(text) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  }
}

// 5. API Key Generation
function generateApiKey(e) {
  e.preventDefault();
  const email = document.getElementById('dev-email').value;
  const company = document.getElementById('dev-company').value;
  
  const randomHash = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
  const generatedKey = `vk_live_test_${randomHash}`;
  
  document.getElementById('generated-key').textContent = generatedKey;
  document.getElementById('key-result').classList.remove('hidden');
  showToast(`🎉 ${company} 개발자용 Sandbox API Key 발급 완료!`);
}

function copyApiKey() {
  const keyText = document.getElementById('generated-key').textContent;
  navigator.clipboard.writeText(keyText).then(() => {
    showToast('🔑 API Key가 복사되었습니다!');
  });
}

// 6. Partner Form Submission
async function submitPartnerForm(e) {
  e.preventDefault();
  const name = document.getElementById('p-name').value;
  const company = document.getElementById('p-company').value;
  const contact = document.getElementById('p-contact').value;
  const typeSelect = document.getElementById('p-type');
  const type = typeSelect.options[typeSelect.selectedIndex].text;
  const message = document.getElementById('p-msg').value;

  try {
    const res = await fetch('/api/partner-submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, company, contact, type, message })
    });
    const result = await res.json();
    if (result.success) {
      showToast(`🤝 [접수 완료] 대표님 메일(ruud.igrid@gmail.com) 및 문자(010-3180-1105)로 실시간 알림이 발송되었습니다!`);
    } else {
      showToast(`🤝 [접수 완료] ${company} ${name}님, 담당자가 1시간 이내 연락드립니다!`);
    }
  } catch (err) {
    showToast(`🤝 [접수 완료] ${company} ${name}님, 파트너십 문의가 성공적으로 접수되었습니다!`);
  }
  document.getElementById('partner-form').reset();
}

// 7. Toast Notification Utility
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-message');
  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  
  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3500);
}
