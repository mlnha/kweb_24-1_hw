import './LoginPage.css';
import { useState } from 'react';
import { useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';


function Login(props) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");


  
  return <>
    <h2>로그인</h2>

    <div className="login-form">
      <p><input className="login" type="text" name="username" placeholder="아이디" onChange={event => {
        setId(event.target.value);
      }} /></p>
      <p><input className="login" type="password" name="pwd" placeholder="비밀번호" onChange={event => {
        setPassword(event.target.value);
      }} /></p>

      <p><input className="login-btn" type="submit" value="로그인" onClick={() => {
        const userData = {
          userId: id,
          userPassword: password,
        };
        fetch("http://localhost:3000/login", {
          method: "post", 
          headers: {  
            "content-type": "application/json",
          },
          body: JSON.stringify(userData),
        })
          .then((res) => res.json())
          .then((json) => {            
            if(json.isLogin==="True"){
              props.setMode("WELCOME");
              props.setRole(json.role);
              props.setUsername(json.username);
              
              
            }
            else {
              alert(json.isLogin)
            }
          });
      }} /></p>
    </div>

    <p>계정이 없으신가요?  <button onClick={() => {
      props.setMode("SIGNIN");
    }}>회원가입</button></p>
  </> 
}


function Signin(props) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState(null);

  return <>
    <h2>회원가입</h2>

    <div className="login-form">
      <p><input className="login" type="text" placeholder="아이디" onChange={event => {
        setId(event.target.value);
      }} /></p>
      <p><input className="login" type="password" placeholder="비밀번호" onChange={event => {
        setPassword(event.target.value);
      }} /></p>
      <p><input className="login" type="password" placeholder="비밀번호 확인" onChange={event => {
        setPassword2(event.target.value);
      }} /></p>
      <p><input className="login" type="text" placeholder="이름" onChange={event => {
        setName(event.target.value);
      }} /></p>
      <p><input className="login" type="text" placeholder="학번" onChange={event => {
        setStudentId(event.target.value);
      }} /></p>
      <p>
        <label><input type="radio" name="role" value="student" checked={role === "student"} onChange={() => setRole("student")} /> 학생</label>
        <label><input type="radio" name="role" value="professor" checked={role === "professor"} onChange={() => setRole("professor")} /> 교수</label>
      </p>



      <p><input className="login-btn" type="submit" value="회원가입" onClick={() => {
        const userData = {
          userId: id,
          userPassword: password,
          userPassword2: password2,
          name: name,
          studentId: studentId,
          role: role
        };
        fetch("http://localhost:3000/signin", { 
          method: "post", 
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(userData), 
        })
          .then((res) => res.json())
          .then((json) => {
            if(json.isSuccess==="True"){
              alert('회원가입이 완료되었습니다!')
              props.setMode("LOGIN");
            }
            else{
              alert(json.isSuccess)
            }
          });
      }} /></p>
    </div>

    <p>로그인 화면으로 돌아가기  <button onClick={() => {
      props.setMode("LOGIN");
    }}>로그인</button></p>
  </> 
}


function LoginPage() {
  const [mode, setMode] = useState("");
  const [role, setRole] = useState(null);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetch("http://localhost:3000/authcheck")
      .then((res) => res.json())
      .then((json) => {        
        if (json.isLogin === "True") {
          setMode("WELCOME");
          setRole(json.role);
          setUsername(json.username);
          console.log("Role:", json.role);
          console.log("Username:", json.username);
          
        }
        else {
          setMode("LOGIN");
        }
      });
  }, []); 

  let content = null;  

  if(mode==="LOGIN"){
    content = <Login setMode={setMode} setRole={setRole} setUsername={setUsername}></Login> 
  }
  else if (mode === 'SIGNIN') {
    content = <Signin setMode={setMode}></Signin> 
  }
  else if (mode === 'WELCOME') { //이동하는 로직 추가
    content = <>
    <h2>메인 페이지에 오신 것을 환영합니다</h2>
    <p>로그인에 성공하셨습니다.</p> 
    {role === 1 && (
      <Link to={`/student/${username}`}><button>Student</button></Link>
    )}
    {role === 2 && (
      <Link to={`/professor/${username}/courses`}><button>Professor</button></Link>
    )}

    <br />
    <a href="/logout">로그아웃</a>   
    </>
  }

  return (
    <>

      <div className="login-page-background">
        {content}
      </div>
    </>
  );
}

export default LoginPage;