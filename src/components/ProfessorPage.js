import './ProfessorPage.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ProfessorPage() {
    const [courseName, setCourseName] = useState('');
    const [courses, setCourses] = useState([]);
    const [postTitle, setPostTitle] = useState('');
    const [postContent, setPostContent] = useState('');
    const [username, setUsername] = useState("");

    useEffect(() => {
        // 사용자 이름 가져오기
        fetchUsername();
    }, []);

    const fetchUsername = () => {
        axios.get('http://localhost:3000/authcheck')
            .then(response => {
                setUsername(response.data.username);
            })
            .catch(error => {
                console.error('Error fetching username:', error);
            });
    };

    // 새로운 강의 등록
    const addCourse = () => {
        axios.post(`http://localhost:3000/professor/${username}/courses`, { courseName })
            .then(response => {
                console.log(response.data);
                fetchCourses(); // 강의 목록 갱신
            })
            .catch(error => {
                console.log(username);
                console.error('Error adding course:', error);
            });
    };

    // 자신의 강의 목록 조회
    const fetchCourses = () => {
        axios.get(`http://localhost:3000/professor/${username}/courses`)
            .then(response => {
                setCourses(response.data);
            })
            .catch(error => {
                console.error('Error fetching courses:', error);
            });
    };

    // 강의별 게시물 작성
    const addPost = (courseId, title, content) => {
      axios.post(`http://localhost:3000/professor/${username}/course/${courseId}/posts`, { title, content })
          .then(response => {
              console.log(response.data);
              fetchCourses();
              alert('강의 게시물이 등록되었습니다.');
          })
          .catch(error => {
              console.error('Error adding post:', error);
          });
  };

  useEffect(() => {
    if(username) {
        fetchCourses();
    }
  }, [username]);

  return (
      <div>
          <h1>Professor Page</h1>
          <div>
              <h2>강의 등록</h2>
              <input type="text" value={courseName} onChange={e => setCourseName(e.target.value)} />
              <button onClick={addCourse}>강의 추가</button>
          </div>
          <div>
              <h2>강의 목록</h2>
              <ul>
                  {courses.map(course => (
                      <li key={course.id}>
                          <h3>{course.course_name}</h3>
                            <div className="post-container">
                                <input type="text" className="post-title" placeholder="게시물 제목" value={postTitle} onChange={e => setPostTitle(e.target.value)} />
                                <textarea className="post-content" placeholder="게시물 내용" value={postContent} onChange={e => setPostContent(e.target.value)} />
                                <button onClick={() => addPost(course.id, postTitle, postContent)}>강의 게시물 등록하기</button>
                            </div>
                      </li>
                  ))}
              </ul>
          </div>
      </div>
  );
}

export default ProfessorPage;