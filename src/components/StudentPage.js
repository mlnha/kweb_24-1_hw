import './StudentPage.css';
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentPage() {
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [posts, setPosts] = useState([]);
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

  useEffect(() => {
    if (username) { // username이 존재할 때에만 요청을 보냄
        // 강의 목록 조회
        axios.get(`http://localhost:3000/student/${username}/courses`)
          .then(response => {
            setCourses(response.data);
          })
          .catch(error => {
            console.error('Error fetching courses:', error);
          });

        // 수강신청한 강의 목록 조회
        axios.get(`http://localhost:3000/student/${username}/my-courses`)
          .then(response => {
            setMyCourses(response.data);
          })
          .catch(error => {
            console.error('Error fetching my courses:', error);
          });
    }
  }, [username]);


  // 수강신청
  const handleEnroll = (courseId, courseName) => {
    axios.post(`http://localhost:3000/student/${username}/enroll-course`, { courseId, courseName })
      .then(response => {
        axios.get(`http://localhost:3000/student/${username}/my-courses`)
          .then(response => {
            setMyCourses(response.data);
            alert('수강신청이 완료되었습니다.');
          })
          .catch(error => {
            console.error('Error fetching my courses:', error);
          });
      })
      .catch(error => {
        console.error('Error enrolling course:', error);
      });
  };

  const handleCourseChange = (event) => {
    setSelectedCourseId(event.target.value);
    console.log("Selected Course ID:", event.target.value);
    // 강의별 게시물 조회
    axios.get(`http://localhost:3000/student/${username}/posts/${event.target.value}`)
      .then(response => {
        setPosts(response.data);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
      });
  };

  return (
    <div>
      <h1>과목 조회</h1>
      <ul className="course-table">
        <li className="course-table-header">
          <span className="course-table-cell">학수번호</span>
          <span className="course-table-cell">교수자</span>
          <span className="course-table-cell">강의명</span>
          <span className="course-table-cell">수강신청</span>
        </li>
        {courses.map(course => (
          <li key={course.id} className="course-table-row">
            <span className="course-table-cell">{course.id}</span>
            <span className="course-table-cell">{course.professor_name}</span>
            <span className="course-table-cell">{course.course_name}</span>
            <span className="course-table-cell">
              <button className="enroll-button" onClick={() => handleEnroll(course.id, course.course_name)}>
                수강신청
              </button>
            </span>
          </li>
        ))}
      </ul>

      <h1>수강신청 내역</h1>
      <ul>
        {myCourses.map(course => (
          <li key={course.id}>{course.course_name}</li>
        ))}
      </ul>

      <h1>강의별 게시물 조회하기</h1>
      <select onChange={(event) => handleCourseChange(event)}>
        <option value="">강의를 선택하세요</option>
        {myCourses.map(course => (
          <option key={course.id} value={course.course_id}>{course.course_name}</option>
        ))}
      </select>
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <h3>{`<${post.title}>`}</h3>
            <p>{post.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentPage;
