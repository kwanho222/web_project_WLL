/*
  jss/mypage.js
  - 마이페이지에서 로그인된 사용자의 검색 기록을 불러와 표시
  사용법:
    - mypage.html에 이 스크립트를 포함하세요.
    - Firebase가 초기화되어 있으면 Firebase 인증 사용, 아니면 localStorage의 currentUser.id 사용.
    - 로그인되어 있지 않으면 ../htmls/login.html 로 리다이렉트합니다.
*/

(function(global){
  async function ensureUser() {
    // 우선 Firebase auth 확인
    if (global.Firebase && typeof global.Firebase._internal === 'function') {
      const internal = global.Firebase._internal();
      if (internal && internal.auth && internal.auth.currentUser) {
        return { uid: internal.auth.currentUser.uid, source: 'firebase' };
      }
    }

    // 다음으로 로컬스토리지의 currentUser
    try {
      const cu = JSON.parse(localStorage.getItem('currentUser'));
      if (cu && cu.id) return { uid: cu.id, source: 'local' };
    } catch (e) {
      // ignore
    }

    return null;
  }

  function renderList(container, items) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      container.textContent = '검색 기록이 없습니다.';
      return;
    }
    const ul = document.createElement('ul');
    ul.style.paddingLeft = '20px';
    items.forEach(it => {
      const li = document.createElement('li');
      const timeText = it.timestamp && it.timestamp.toDate ? it.timestamp.toDate().toLocaleString() : (it.timestamp ? new Date(it.timestamp).toLocaleString() : '');
      li.textContent = `${it.keyword} — ${timeText}`;
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  async function loadHistory(limit) {
    const user = await ensureUser();
    if (!user) {
      // 로그인 필요
      window.location.href = '../htmls/login.html';
      return;
    }

    const uid = user.uid;
    const container = document.getElementById('searchHistory');
    if (!container) return;

    try {
      if (!window.DB || typeof window.DB.getSearchHistory !== 'function') {
        container.textContent = '검색 기록을 불러올 수 없습니다. DB 유틸이 준비되지 않았습니다.';
        return;
      }
      const items = await window.DB.getSearchHistory(uid, limit || 50);
      renderList(container, items);
    } catch (err) {
      console.error('Failed to load search history', err);
      container.textContent = '검색 기록을 불러오는 중 오류가 발생했습니다.';
    }
  }

  // 자동 실행: DOMContentLoaded 시 로드
  document.addEventListener('DOMContentLoaded', function(){
    loadHistory(50);
  });

  // 노출(테스트/디버그)
  global.Mypage = Object.assign(global.Mypage || {}, { loadHistory });

})(window);
