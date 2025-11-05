function popup_best(obj) {
  openPopup()
}

function openPopup() {
  var modal = document.getElementById('popup');
  modal.style.display = 'block';
}

// 팝업 닫기
function closePopup() {
  var modal = document.getElementById('popup');
  modal.style.display = 'none';
}

function search(title) {
  localStorage.setItem("title", title)

  // 비동기적으로 Firestore에 검색어 저장 시도
  try {
    if (window.DB && typeof window.DB.saveSearchForCurrentUser === 'function') {
      // 현재 Firebase 인증된 사용자로 저장
      window.DB.saveSearchForCurrentUser(title).catch(function(err){
        console.warn('DB.saveSearchForCurrentUser failed:', err);
      });
    } else if (window.DB && typeof window.DB.saveSearch === 'function') {
      // 파이어베이스 인증이 없을 경우 로컬 currentUser의 id를 uid로 사용해서 저장 시도
      var localUser = null;
      try { localUser = JSON.parse(localStorage.getItem('currentUser')); } catch(e) { localUser = null; }
      if (localUser && localUser.id) {
        window.DB.saveSearch(localUser.id, title).catch(function(err){
          console.warn('DB.saveSearch with local id failed:', err);
        });
      }
    }
  } catch (e) {
    console.warn('saveSearch attempt error:', e);
  }

  open("../htmls/noresult.html", self)
}

function load(){
  document.getElementById('title').textContent
    = localStorage.getItem("title")
}


function purchase(s1, s2, s3){
  if(s1.checked){
    open("../htmls/machinelearninganddeeplearning.html",self)
  }
  if(s2.checked){
    open("../htmls/modernjavascript.html",self)
  }
  if(s3.checked){
    open("../htmls/androidprogramming.html",self)
  }
}

function mypage(){
  // 로컬스토리지에서 현재 로그인 사용자 확인
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (currentUser) {
    // 로그인 상태면 마이페이지로 이동
    window.location.href = "../htmls/mypage.html";
  } else {
    alert("로그인하셔야합니다")
    window.location.href = "../htmls/login.html";
  }
}

function alert_noimplement() {
  alert("해당 서비스는 준비중입니다.")
}

function login(id, pwd) {
  if (id == "") {
    alert("아이디를 입력해 주십시오")
    return
  }
  if (pwd == "") {
    alert("비밀번호를 입력해 주십시오")
    return
  }
  
  // 로컬스토리지에서 사용자 목록 가져오기
  let users = JSON.parse(localStorage.getItem('users')) || [];
  
  // 아이디와 비밀번호 일치 확인
  const user = users.find(u => u.id === id && u.pwd === pwd);
  
  if (user) {
    // 로그인 성공 - 현재 로그인 사용자 정보 저장
    localStorage.setItem('currentUser', JSON.stringify(user));
    alert("로그인 성공!");
    window.location.href = "../htmls/index.html";
  } else {
    alert("아이디 혹은 비밀번호가 일치하지 않습니다.")
  }
}

function register(id, pwd, name, birth, email) {
  if (id == "") {
    alert("아이디를 입력해 주십시오")
    return
  }
  if (pwd == "") {
    alert("비밀번호를 입력해 주십시오")
    return
  }
  if (name == "") {
    alert("이름 입력해 주십시오")
    return
  }
  if (birth == "") {
    alert("생년월일을 입력해 주십시오")
    return
  }
  if (email == "") {
    alert("이메일을 입력해 주십시오")
    return
  }

  // 로컬스토리지에서 기존 사용자 목록 가져오기
  let users = JSON.parse(localStorage.getItem('users')) || [];
  
  // 중복 아이디 체크
  if (users.find(user => user.id === id)) {
    alert("이미 존재하는 아이디입니다.")
    return
  }
  
  // 새 사용자 정보 저장
  const newUser = {
    id: id,
    pwd: pwd,
    name: name,
    birth: birth,
    email: email
  };
  
  users.push(newUser);
  localStorage.setItem('users', JSON.stringify(users));
  
  alert("회원가입이 완료되었습니다!");
  window.location.href = "../htmls/login.html";
}

function phonecheck() {
  alert("서버 점검으로 인해 해당 서비스를 이용하실 수 없습니다.")
}

function agreeall(all, item1, item2, item3) {
  if (all.checked) {
    item1.checked = true
    item2.checked = true
    item3.checked = true
  } else {
    item1.checked = false
    item2.checked = false
    item3.checked = false
  }
}

function allagreed(all, item1, item2, item3) {
  if (item1.checked && item2.checked && item3.checked) {
    all.checked = true
  } else {
    all.checked = false
  }
}

function checkLogin() {
  // 로컬스토리지에서 현재 로그인 사용자 확인
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  
  if (!currentUser) {
    // 로그인하지 않은 상태면 로그인 페이지로 이동
    alert("로그인이 필요합니다.");
    window.location.href = "../htmls/login.html";
  }
}

function updateLoginUI() {
  // 로컬스토리지에서 현재 로그인 사용자 확인
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const loginNav = document.querySelector('.login');
  
  if (loginNav) {
    if (currentUser) {
      // 로그인 상태: 로그인/회원가입 버튼 숨기고 사용자 이름 표시
      loginNav.innerHTML = '<a href="#" onclick="logout()">로그아웃</a><span style="margin-left: 10px; margin-right: 10px;">' + currentUser.name + '님</span>';
    } else {
      // 비로그인 상태: 로그인/회원가입 버튼 표시
      loginNav.innerHTML = '<a href="./login.html">로그인</a><a href="./register.html">회원가입</a>';
    }
  }
}

function logout() {
  if (confirm("로그아웃 하시겠습니까?")) {
    // Firebase signOut이 가능하면 시도
    (async function(){
      try {
        if (window.Firebase && typeof window.Firebase.signOut === 'function') {
          await window.Firebase.signOut();
        }
      } catch (e) {
        console.warn('Firebase signOut failed', e);
      }
      // 로컬 스토리지 정리
      try { localStorage.removeItem('currentUser'); } catch(e){}
      try { localStorage.removeItem('currentUserUid'); } catch(e){}
      alert("로그아웃되었습니다.");
      updateLoginUI();
      window.location.href = "./index.html";
    })();
  }
}
