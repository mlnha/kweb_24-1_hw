import './MainPage.css';
import React from "react";
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function MainPage(props) {
    return (
        <>
            <h1>Main Page</h1>
            <h2>2024 KWEB 준회원 과정 면제 과제: 교수자와 학생이 상호 작용할 수 있는 웹 애플리케이션</h2>
            <h3>해당 웹 서비스는 로그인 후 사용 가능합니다. 로그인 성공 시, 학생/교수자 페이지로 이동 가능합니다.</h3>
            <ul className="button-list">
				<li><Link to="/login"><button>Login</button></Link></li>
				

			</ul>
        </>
    );
}

export default MainPage;
