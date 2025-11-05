(function(){
  // Auth helper that uses the global Firebase helper (defined in jss/firebase.js)
  async function ensureInitialized() {
    if (!window.Firebase) throw new Error('Firebase helper not loaded. Include jss/firebase.js before jss/auth.js');
    const intern = typeof Firebase._internal === 'function' ? Firebase._internal() : null;
    if (intern && intern.auth) return;

    // try auto-init from common global config names
    const cfg = window.firebaseConfig || window.FIREBASE_CONFIG || window.__FIREBASE_CONFIG || null;
    if (cfg) {
      await Firebase.init(cfg);
      return;
    }

    // attempt init without config will throw in Firebase.init
    throw new Error('Firebase is not initialized. Call Firebase.init(config) before using Auth or set window.firebaseConfig.');
  }

  const Auth = {
    // Optional manual init
    init: async function(config){
      return Firebase.init(config);
    },

    // email/password login
    login: async function(email, password) {
      try {
        await ensureInitialized();
      } catch (e) {
        console.error(e);
        alert('Firebase가 초기화되지 않았습니다. 콘솔을 확인하세요.');
        return;
      }

      try {
        const cred = await Firebase.signIn(email, password);
        const uid = cred && cred.user ? (cred.user.uid || cred.user?.uid) : null;
        if (uid) {
          localStorage.setItem('currentUserUid', uid);
        }
        // Optionally also store some user info
        try {
          const userDoc = await Firebase.getUserDoc(uid);
          if (userDoc) localStorage.setItem('currentUser', JSON.stringify(userDoc));
        } catch (e) {
          // ignore if no user doc
        }

        alert('로그인 성공');
        // redirect to mypage
        window.location.href = '../htmls/mypage.html';
        return cred;
      } catch (err) {
        console.error('login error', err);
        alert('로그인 실패: ' + (err.message || err));
        throw err;
      }
    },

    // register: create auth user with email/password and store extra fields to Firestore
    register: async function(id, password, name, birth, email) {
      try {
        await ensureInitialized();
      } catch (e) {
        console.error(e);
        alert('Firebase가 초기화되지 않았습니다. 콘솔을 확인하세요.');
        return;
      }

      try {
        // extraData stored in users collection
        const extra = { id: id, name: name, birth: birth, email: email };
        const cred = await Firebase.signUp(email, password, extra);
        const uid = cred && cred.user ? (cred.user.uid || cred.user?.uid) : null;
        if (uid) localStorage.setItem('currentUserUid', uid);
        // store user doc (signUp already tries to store extraData in firebase helper)
        alert('회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.');
        window.location.href = '../htmls/login.html';
        return cred;
      } catch (err) {
        console.error('register error', err);
        alert('회원가입 실패: ' + (err.message || err));
        throw err;
      }
    }
  };

  window.Auth = Auth;
})();
