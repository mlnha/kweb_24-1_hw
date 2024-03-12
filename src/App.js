import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainPage from './components/MainPage.js';
import LoginPage from './components/LoginPage.js';
import ProfessorPage from './components/ProfessorPage.js';
import StudentPage from './components/StudentPage.js';

import './App.css';

const App = () => {
    const renderPages = ({ match }) => {
        const { username } = match.params;
        return (
            <div>
                <ProfessorPage username={username} />
                <StudentPage username={username} />
            </div>
        );
    };

    return (
        <div className='App'>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/professor/:username/courses" element={<ProfessorPage />} />
                    <Route path="/student/:username" element={<StudentPage />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
};

export default App;

// 1. 계정별 조회 (교수자 이름으로 강의 등록, 학생 이름으로 강의 조회)
// 2. 메인 페이지에서 로그인 없이 학생/교수자 페이지로 이동 불가. 이동 시 로그인 하라고 알림.