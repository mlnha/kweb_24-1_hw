const express = require('express') 
const session = require('express-session')
const path = require('path');
const app = express() 
const port = 3000 

const db = require('./lib/db'); 
const sessionOption = require('./lib/sessionOption'); 
const bodyParser = require("body-parser"); 
const bcrypt = require('bcrypt');

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var MySQLStore = require('express-mysql-session')(session);
var sessionStore = new MySQLStore(sessionOption);
app.use(session({  
	key: 'session_cookie_name',
    secret: '~',
	store: sessionStore,
	resave: false,
	saveUninitialized: false
}))

app.get('/', (req, res) => {    
    req.sendFile(path.join(__dirname, '/build/index.html'));
})

// ################## #1 로그인 ##################
app.get('/authcheck', (req, res) => {      
    const sendData = { isLogin: "", role: null, username: ""};
    if (req.session.is_logined) {
        sendData.isLogin = "True"
        sendData.role = req.session.role
        sendData.username = req.session.nickname;

    } else {
        sendData.isLogin = "False"
    }
    res.send(sendData);
})

app.get('/logout', function (req, res) {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

app.post("/login", (req, res) => { 
    const username = req.body.userId;
    const password = req.body.userPassword;
    const sendData = { isLogin: "", role: null, username: ""};

    if (username && password) {             // id와 pw가 입력되었는지 확인
        db.query('SELECT * FROM users WHERE username = ?', [username], function (error, results, fields) {
            if (error) throw error;
            if (results.length > 0) {       // db에서의 반환값이 있다 = 일치하는 아이디가 있다.      

                bcrypt.compare(password , results[0].password, (err, result) => {    // 입력된 비밀번호가 해시된 저장값과 같은 값인지 비교

                    if (result === true) { // 비밀번호가 일치하면
                        req.session.is_logined = true; // 세션 정보 갱신
                        req.session.nickname = username;
                        req.session.role = results[0].role;
                        req.session.save(function () {
                            sendData.isLogin = "True"
                            sendData.role = results[0].role;
                            sendData.username = req.session.nickname;
                            res.send(sendData);
                        });
                        db.query(`INSERT INTO logTable (created, username, action, command, actiondetail) VALUES (NOW(), ?, 'login' , ?, ?)`
                            , [req.session.nickname, '-', `React 로그인 테스트`], function (error, result) { });
                    }
                    else{ // 비밀번호가 다른 경우
                        sendData.isLogin = "로그인 정보가 일치하지 않습니다."
                        res.send(sendData);
                    }
                })                      
            } else { // db에 해당 아이디가 없는 경우
                sendData.isLogin = "아이디 정보가 일치하지 않습니다."
                res.send(sendData);
            }
        });
    } else { // 아이디, 비밀번호 중 입력되지 않은 값이 있는 경우
        sendData.isLogin = "모든 필드를 입력하세요!"
        res.send(sendData);
    }
});

// ################## #2 회원가입 ##################
app.post("/signin", (req, res) => {  
    const username = req.body.userId;
    const password = req.body.userPassword;
    const password2 = req.body.userPassword2;
    const name = req.body.name;
    const studentId = req.body.studentId;
    let role = req.body.role;
    
    const sendData = { isSuccess: "" };

    if (username && password && password2 && name && studentId && role) {
        if (role === 'student') {
            role = 1;
        } else if (role === 'professor') {
            role = 2;
        }

        db.query('SELECT * FROM users WHERE username = ?', [username], function(error, results, fields) { // DB에 같은 이름의 회원아이디가 있는지 확인
            if (error) throw error;
            if (results.length <= 0 && password == password2) {         // db에 같은 이름의 회원아이디가 없고, 비밀번호가 올바르게 입력된 경우
                const hasedPassword = bcrypt.hashSync(password, 10);   
                db.query('INSERT INTO users (username, password, name, studentId, role) VALUES(?,?,?,?,?)', [username, hasedPassword, name, studentId, role], function (error, data) {
                    if (error) throw error;
                    req.session.save(function () {                        
                        sendData.isSuccess = "True"
                        res.send(sendData);
                    });
                });
            } else if (password != password2) {                     // 비밀번호가 올바르게 입력되지 않은 경우                  
                sendData.isSuccess = "입력된 비밀번호가 서로 다릅니다."
                res.send(sendData);
            }
            else {                                                  // db에 같은 이름의 회원아이디가 있는 경우            
                sendData.isSuccess = "이미 존재하는 아이디입니다!"
                res.send(sendData);  
            }            
        });        
    } else {
        sendData.isSuccess = "아이디와 비밀번호를 입력하세요!"
        res.send(sendData);  
    }
    
});

// ################## #3 교수자 홈페이지 ##################
// 새로운 강의 등록하기
app.post('/professor/:username/courses', (req, res) => {
    const professorUsername = req.params.username;
    const { courseName } = req.body;
    const sql = 'INSERT INTO courses (professor_name, course_name) VALUES ((SELECT name FROM users WHERE username = ?), ?)';
    db.query(sql, [professorUsername, courseName], (error, results, fields) => {
        if (error) {
            console.error('Error adding course to database:', error);
            res.status(500).send('Failed to add course to database');
            return;
        }
        res.send('New course added to database successfully');
    });
});

// 강의 목록 조회하기
app.get('/professor/:username/courses', (req, res) => {
    const professorUsername = req.params.username;
    const sql = 'SELECT * FROM courses WHERE professor_name = (SELECT name FROM users WHERE username = ?)';
    db.query(sql, [professorUsername], (error, results, fields) => {
        if (error) {
            console.error('Error fetching courses from database:', error);
            res.status(500).send('Failed to fetch courses from database');
            return;
        }
        res.json(results);
    });
});

// 강의별 게시물 작성하기
app.post('/professor/:username/course/:id/posts', (req, res) => {
    const professorUsername = req.params.username;
    const courseId = req.params.id;
    const { title, content } = req.body;
    const sql = 'INSERT INTO posts (course_id, title, content) VALUES (?, ?, ?)';
    db.query(sql, [courseId, title, content], (error, results, fields) => {
        if (error) {
            console.error('Error adding post to database:', error);
            res.status(500).send('Failed to add post to database');
            return;
        }
        res.send('New post added to database successfully');
    });
});

// ################## #4 학생 홈페이지 ##################
// 학생 계정으로 강의 목록 조회
app.get('/student/:username/courses', (req, res) => {
    db.query('SELECT * FROM courses', (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });

// 수강신청
app.post('/student/:username/enroll-course', (req, res) => {
    const studentUsername = req.session.nickname;
    const { courseId, courseName } = req.body;
    db.query(
        'INSERT INTO my_courses (course_id, student_name, professor_name, course_name) ' +
        'VALUES (?,(SELECT name FROM users WHERE username = ?), ' +
        '(SELECT professor_name FROM courses WHERE id = ?), ?)',
        [courseId, studentUsername, courseId, courseName],
        (error, results) => {
            if (error) throw error;
            res.json({ success: true });
        }
      );
      
  });

// 학생 계정으로 수강신청한 강의 목록 조회
app.get('/student/:username/my-courses', (req, res) => {
    const studentUsername = req.session.nickname;
    db.query('SELECT * FROM my_courses WHERE student_name =  (SELECT name FROM users WHERE username = ?)' , [studentUsername], (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });
  
// 학생 계정으로 강의 게시물 목록 조회
app.get('/student/:username/posts/:courseId', (req, res) => {
    const courseId = req.params.courseId;
    db.query('SELECT * FROM posts WHERE course_id = ?', [courseId], (error, results) => {
      if (error) throw error;
      res.json(results);
    });
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
