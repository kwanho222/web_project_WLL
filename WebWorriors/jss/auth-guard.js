/*
  jss/auth-guard.js
  - Firebase Auth 상태를 감시해 로그인 상태가 아닐 경우 지정 페이지에서 로그인 페이지로 리다이렉트합니다.
  - 로그아웃 시 localStorage의 관련 키를 정리합니다.

  사용:
    - 이 스크립트를 보호할 페이지(index.html, mypage.html 등)에 포함하세요.
    - Firebase 초기화는 이미 되어 있어야 합니다 (Firebase.init(config)).
*/

(function(global){
  function clearLocalAuth() {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('currentUserUid');
    } catch (e) { console.warn('clearLocalAuth error', e); }
  }

  function redirectToLogin() {
    window.location.href = '../htmls/login.html';
  }

  // 실행: DOMContentLoaded에서 onAuthStateChanged 등록
  document.addEventListener('DOMContentLoaded', function(){
    if (!global.Firebase || typeof global.Firebase.onAuthStateChanged !== 'function') {
      // Firebase helper 없으면, 로컬스토리지 기준으로만 보호 시도
      try {
        const cu = JSON.parse(localStorage.getItem('currentUser'));
        if (!cu) redirectToLogin();
      } catch (_) { redirectToLogin(); }
      return;
    }

    // Firebase SDK 기반 상태 감시
    global.Firebase.onAuthStateChanged(function(user){
      if (user) {
        // 로그인 상태: 로컬에 uid 저장
        try { localStorage.setItem('currentUserUid', user.uid); } catch(e) { /* ignore */ }
      } else {
        // 로그아웃 상태: localStorage 정리 및 보호 페이지에서 로그인 페이지로 이동
        clearLocalAuth();
        // 현재 페이지가 로그인 페이지가 아니라면 이동
        const path = window.location.pathname || '';
        if (!path.endsWith('/htmls/login.html') && !path.endsWith('/login.html')) {
          redirectToLogin();
        }
      }
    });
  });

  // 전역 노출(테스트)
  global.AuthGuard = { clearLocalAuth, redirectToLogin };

})(window);
