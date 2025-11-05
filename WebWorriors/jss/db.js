/*
  jss/db.js
  - Firestore에 사용자의 검색 기록을 저장하는 유틸리티
  사용법:
    1) HTML에서 firebase.js를 먼저 로드하고 Firebase.init(config)을 호출하여 초기화합니다.
    2) 페이지에서 아래 함수를 호출합니다.
       // 특정 uid로 저장
       await DB.saveSearch(uid, keyword);

       // 현재 로그인된 사용자로 저장 (Auth가 사용 중일 때)
       await DB.saveSearchForCurrentUser(keyword);

  구현 세부사항:
    - compat Firestore를 사용합니다 (window.firebase, window.Firebase 존재 전제)
    - 타임스탬프는 서버 타임스탬프를 사용합니다.
*/

(function (global) {
  async function _ensureDb() {
    if (!global.Firebase) throw new Error('Firebase helper not found. Include jss/firebase.js and call Firebase.init(config) first.');
    const internal = typeof global.Firebase._internal === 'function' ? global.Firebase._internal() : null;
    if (!internal || !internal.db) {
      throw new Error('Firestore not initialized. Call Firebase.init(config) first.');
    }
    return { db: internal.db, firebaseGlobal: internal.firebaseGlobal };
  }

  async function saveSearch(uid, keyword) {
    if (!uid) throw new Error('uid is required');
    if (!keyword || typeof keyword !== 'string') throw new Error('keyword must be a non-empty string');

    const { db, firebaseGlobal } = await _ensureDb();

    // compat 방식의 serverTimestamp
    const serverTs = (firebaseGlobal && firebaseGlobal.firestore && firebaseGlobal.firestore.FieldValue && firebaseGlobal.firestore.FieldValue.serverTimestamp)
      ? firebaseGlobal.firestore.FieldValue.serverTimestamp()
      : new Date();

    // users/{uid}/searches 컬렉션에 추가
    const colRef = db.collection('users').doc(uid).collection('searches');
    const docRef = await colRef.add({
      keyword: keyword,
      timestamp: serverTs
    });
    return docRef; // 반환: DocumentReference
  }

  async function saveSearchForCurrentUser(keyword) {
    if (!global.Firebase) throw new Error('Firebase helper not found. Include jss/firebase.js and call Firebase.init(config) first.');
    const internal = typeof global.Firebase._internal === 'function' ? global.Firebase._internal() : null;
    if (!internal || !internal.auth) throw new Error('Auth not initialized. Call Firebase.init(config) first.');
    const current = internal.auth.currentUser;
    if (!current) throw new Error('No authenticated user found.');
    return saveSearch(current.uid, keyword);
  }

  // 검색 히스토리 조회: users/{uid}/searches 컬렉션에서 timestamp 내림차순으로 문서 리스트 반환
  async function getSearchHistory(uid, limit) {
    if (!uid) throw new Error('uid is required');
    const { db } = await _ensureDb();
    let q = db.collection('users').doc(uid).collection('searches').orderBy('timestamp', 'desc');
    if (typeof limit === 'number' && limit > 0) q = q.limit(limit);
    const snap = await q.get();
    const results = [];
    snap.forEach(doc => {
      const d = doc.data();
      results.push(Object.assign({ id: doc.id }, d));
    });
    return results; // [{id, keyword, timestamp}, ...]
  }

  // 전역 노출
  global.DB = Object.assign(global.DB || {}, {
    saveSearch,
    saveSearchForCurrentUser
    , getSearchHistory
  });

})(window);
