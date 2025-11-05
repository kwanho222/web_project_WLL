/*
  firebase.js
  - 동적 CDN 로드(compat 빌드) + 초기화 유틸리티
  - 사용법:
    1) HTML에서 <script src="../jss/firebase.js"></script> 로 포함
    2) 페이지에서 아래처럼 초기화
       const config = { apiKey: "...", authDomain: "...", projectId: "...", ... };
       Firebase.init(config).then(({ auth, db }) => { /* 사용  });

 /* 참고: 이 파일은 compat 빌드(레거시 네임스페이스 firebase)를 사용합니다.
  필요하면 모듈(modular) 방식으로 변경해 드립니다.
*/

(function (global) {
  const FIREBASE_VERSION = '9.22.1';
  const BASE = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION + '/';
  const SCRIPTS = [
    BASE + 'firebase-app-compat.js',
    BASE + 'firebase-auth-compat.js',
    BASE + 'firebase-firestore-compat.js'
  ];

  // 내부 저장소
  let _loaded = false;
  let _loadingPromise = null;
  let _app = null;
  let _auth = null;
  let _db = null;

  function loadScripts() {
    if (_loaded) return Promise.resolve();
    if (_loadingPromise) return _loadingPromise;

    _loadingPromise = new Promise((resolve, reject) => {
      let i = 0;
      function next() {
        if (i >= SCRIPTS.length) {
          _loaded = true;
          return resolve();
        }
        const src = SCRIPTS[i++];
        const s = document.createElement('script');
        s.src = src;
        s.async = false; // 순서 보장
        s.onload = () => next();
        s.onerror = (e) => reject(new Error('Failed to load ' + src));
        document.head.appendChild(s);
      }
      next();
    });

    return _loadingPromise;
  }

  const Firebase = {
    // scripts 로드 + firebase 초기화 (config 객체 필요)
    init: async function (config) {
      if (!config) throw new Error('Firebase config object is required');
      await loadScripts();

      if (!global.firebase) {
        throw new Error('Firebase SDK not available after loading scripts');
      }

      // 이미 초기화된 경우 기존 반환
      if (_app) {
        return { app: _app, auth: _auth, db: _db };
      }

      _app = global.firebase.initializeApp(config);
      _auth = global.firebase.auth();
      _db = global.firebase.firestore();

      return { app: _app, auth: _auth, db: _db };
    },

    // Auth helpers
    signUp: async function (email, password, extraData) {
      await loadScripts();
      if (!_auth) throw new Error('Firebase not initialized. Call Firebase.init(config) first.');
      const userCredential = await _auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      // 사용자 문서 저장 (선택)
      if (user && extraData) {
        await _db.collection('users').doc(user.uid).set(Object.assign({ email: email }, extraData));
      }
      return userCredential;
    },

    signIn: async function (email, password) {
      await loadScripts();
      if (!_auth) throw new Error('Firebase not initialized. Call Firebase.init(config) first.');
      const credential = await _auth.signInWithEmailAndPassword(email, password);
      return credential;
    },

    signOut: async function () {
      await loadScripts();
      if (!_auth) throw new Error('Firebase not initialized. Call Firebase.init(config) first.');
      return _auth.signOut();
    },

    onAuthStateChanged: function (cb) {
      if (typeof cb !== 'function') throw new Error('callback must be a function');
      loadScripts().then(() => {
        if (!_auth) throw new Error('Firebase not initialized. Call Firebase.init(config) first.');
        _auth.onAuthStateChanged(cb);
      }).catch(err => console.error(err));
    },

    // Firestore helpers
    getUserDoc: async function (uid) {
      await loadScripts();
      if (!_db) throw new Error('Firebase not initialized. Call Firebase.init(config) first.');
      const doc = await _db.collection('users').doc(uid).get();
      return doc.exists ? doc.data() : null;
    },

    setUserDoc: async function (uid, data) {
      await loadScripts();
      if (!_db) throw new Error('Firebase not initialized. Call Firebase.init(config) first.');
      return _db.collection('users').doc(uid).set(data, { merge: true });
    },

    addUserIfNotExists: async function (userObj) {
      // userObj must contain uid
      if (!userObj || !userObj.uid) throw new Error('userObj with uid is required');
      const existing = await this.getUserDoc(userObj.uid);
      if (!existing) {
        return this.setUserDoc(userObj.uid, userObj);
      }
      return null;
    },

    // 노출 (테스트/디버그 목적)
    _internal: function () { return { app: _app, auth: _auth, db: _db, firebaseGlobal: global.firebase }; }
  };

  // 전역에 노출
  global.Firebase = Firebase;

})(window);
