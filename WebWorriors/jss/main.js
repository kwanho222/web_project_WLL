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
  alert("로그인 후 사용 가능합니다.")
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
  alert("아이디 혹은 비밀번호가 일치하지 않습니다.")
}

function register(id, pwd, name, birth, phonenum, email) {
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
  if (phonenum == "") {
    alert("휴대폰번호를 입력해 주십시오")
    return
  }
  if (email == "") {
    alert("이메일을 입력해 주십시오")
    return
  }

  alert("휴대폰 번호 인증을 완료해 주십시오");
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
