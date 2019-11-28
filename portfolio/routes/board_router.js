const express = require('express');
const path = require('path');
const str_query = require('./database/all_query'); // DB와의 연결 부분
const router = express.Router(); // 라우터 분리
const apps = require('../app');

//----------------- 1. competition 게시판 ----------------------------------------------

// 1-1. competiton 게시판 글 생성 (C)
router.get('/competition/add', (req, res) => {
    var sql = 'select * from competitions';
    apps.conn.query(sql, (err, posts, fields) => {
        if(err){
            console.log(err);
        } 
        res.render('../views/comp/comp_add', {posts:posts});
    });
});

router.post('/competition/add', (req, res) => {
    var comp_name = req.body.comp_name || req.query.comp_name;
    var comp_org = req.body.comp_org || req.query.comp_org;
    var awards_check = req.body.awards_check;
    var awards_name =  req.body.awards_name;
    var proj_check = req.body.proj_check || req.query.proj_check;
    var proj_name = req.body.proj_name || req.query.proj_name;
    var user_id = req.body.user_id || req.query.user_id;
    // 게시글 생성을 위한 dynamic query (insert)
    var sql = 'insert into competitions(comp_name, comp_org, awards_check, awards_name, proj_check, proj_name, user_id) values(?, ?, ?, ?, ?, ?, ?)';
    apps.conn.query(sql, [comp_name, comp_org, awards_check, awards_name, proj_check, proj_name, user_id], (err, result, fields)=> {
        if(err){
            console.log(err);
            console.log("데이터 추가 에러");
            res.status(500).send("internal server error");
        } else {
            res.redirect('/competition');
        }
    });
});

// 1-2. competition 게시판 글목록 보기, 글 상세보기
router.get(['/competition', '/competition/:seq'],(req, res) => {
    sess = req.session;

    if(!sess.logined) // 로그인 안 된 상태라면 접근안됨
    {
        res.send(`
        <h1>Who are you?</h1>
        please login first
        <a href="/">Back </a>
      `);
    
    }
else{  // 로그인 한 상태만 접근가능
    var user_id = sess.user_id; 
    // SELECT dynamic query
    var sql = 'SELECT * FROM competitions where user_id=?';  
        apps.conn.query(sql, [user_id], (err, posts, fields) => {
            var seq = req.params.seq || req.query.seq;
            // 만약 competition/:id 로 들어왔다면 (글 상세보기)
            if(seq) {
                var sql = 'SELECT * FROM competitions WHERE seq=?'; 
                apps.conn.query(sql, [seq], (err, posts, fields) => {
                    if(err){ // 에러가 있으면
                        console.log(err);
                    } else { // 에러가 없으면
                        res.render('../views/comp/comp_detail', {posts:posts, post:posts[0]})
                    }

                })
            } else{
                //res.send(posts);
                res.render('../views/comp/competition', {posts:posts});
            }
        });
    }

});


// 1-3. competition 게시글 수정 (U : update)
router.get(['/competition/:seq/edit'], (req, res) => {
    var sql = 'select * from competitions';
    apps.conn.query(sql, (err, posts, fields) => {
        var seq = req.params.seq;
        if(seq) {
            var sql = 'select * from competitions where seq=?';
            apps.conn.query(sql, [seq], (err, posts, fileds) => {
                if(err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('../views/comp/comp_edit', {posts:posts, post:posts[0]});
                }
            });
        } else {
            console.log('there is no id');
            res.status(500).send('Internal Server Error');
        }
    });
});

router.post(['/competition/:seq/edit'], (req, res) => {
    
    var comp_name = req.body.comp_name;
    var comp_org = req.body.comp_org;
    var awards_check = req.body.awards_check;
    var awards_name =  req.body.awards_name;
    var proj_check = req.body.proj_check;
    var proj_name = req.body.proj_name;
    var user_id = req.body.user_id; 
    var seq = req.params.seq;

    var sql = 'update competitions set comp_name=?, comp_org=?, awards_check=?, awards_name=?, proj_check=?, proj_name=?, user_id=? where seq=?';
    apps.conn.query(sql, [comp_name, comp_org, awards_check, awards_name, proj_check, proj_name, user_id, seq], (err, posts, fields) => {
        if(err){
            console.log(err);
            res.status(500).send("internal server error");
        } else {
            res.redirect('/competition/'+seq);
        }
    });
});


// 1-4. competition 게시글 삭제
router.get('/competition/:seq/delete', (req, res) => {
    var sql = 'select seq, comp_name from competitions';
    var seq = req.params.seq;

    apps.conn.query(sql, (err, posts, fields) => {
        var sql = 'select * from competitions where seq=?';
        apps.conn.query(sql, [seq], (err, posts) => {
            if(err) {
                console.log(err);
                res.status(500).send('internal server error1');
            } else {
                if(posts.length === 0) {
                    console.log('레코드가 없어용');
                    res.status(500).send('internal server error2');
                } else {
                    res.render('../views/comp/comp_delete', {posts:posts, post:posts[0]});
                }
            }
        });
    });
});

// 글 삭제 - yes 버튼을 눌렀을 때 정말 삭제
router.post('/competition/:seq/delete', (req, res) => {
    var seq = req.params.seq;
    var sql = 'delete from competitions where seq=?';
    apps.conn.query(sql, [seq], (err, result) => {
        res.redirect('/competition');
    });
});

//--------------- 1. comptition 끝 ----------------------------------------------


//--------------- 2. project 시작 ------------------------

// 2-1. project 게시판에 글 추가하기
router.get('/project/add', (req, res) => {
    var sql = 'select * from projects';
    apps.conn.query(sql, (err, posts, fields) => {
        if(err){
            console.log(err);
        } 
        res.render('../views/proj/proj_add', {posts:posts});
    });
});

router.post('/project/add', (req, res) => {
    var proj_name = req.body.proj_name;
    var proj_description = req.body.proj_description;
    var url = req.body.url;
    var user_id = req.body.user_id || req.query.user_id;
    var sql = 'insert into projects(proj_name, proj_description, url, user_id) values(?, ?, ?, ?)';
    apps.conn.query(sql, [proj_name, proj_description, url, user_id], (err, result, fields)=> {
        if(err){
            console.log(err);
            console.log("데이터 추가 에러");
            res.status(500).send("internal server error");
        } else {
            res.redirect('/project');
        }
    });
});

// 2-2. project 게시판 글목록 보기, 글 상세보기
router.get(['/project', '/project/:seq'],(req, res) => {
    sess = req.session;

    if(!sess.logined) // 로그인 안 된 상태라면 접근안됨
    {
        res.send(`
        <h1>Who are you?</h1>
        please login first
        <a href="/">Back </a>
      `);
    
    }
else{  // 로그인 한 상태만 접근가능
    var user_id = sess.user_id;  // 이걸로 내 아이디로 작성한 글만 판별해서 보여줄것임
    var sql = 'SELECT * FROM projects where user_id=?';  
        apps.conn.query(sql, [user_id], (err, posts, fields) => {
            var seq = req.params.seq || req.query.seq;
            // 만약 project/:id 로 들어왔다면 (글 상세보기)
            if(seq) {
                var sql = 'SELECT * FROM projects WHERE seq=?'; 
                apps.conn.query(sql, [seq], (err, posts, fields) => {
                    if(err){ // 에러가 있으면
                        console.log(err);
                    } else { // 에러가 없으면
                        res.render('../views/proj/proj_detail', {posts:posts, post:posts[0]})
                    }

                })
            } else{
                //res.send(posts);
                res.render('../views/proj/project', {posts:posts});
            }
        });
    }

});


// 2-3. project 게시글 수정
router.get(['/project/:seq/edit'], (req, res) => {
    var sql = 'select * from projects';
    apps.conn.query(sql, (err, posts, fields) => {
        var seq = req.params.seq;
        if(seq) {
            var sql = 'select * from projects where seq=?';
            apps.conn.query(sql, [seq], (err, posts, fileds) => {
                if(err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('../views/proj/proj_edit', {posts:posts, post:posts[0]});
                }
            });
        } else {
            console.log('there is no id');
            res.status(500).send('Internal Server Error');
        }
    });
});

router.post(['/project/:seq/edit'], (req, res) => {
    
    var proj_name = req.body.proj_name;
    var proj_description = req.body.proj_description;
    var url = req.body.url;
    var user_id = req.body.user_id || req.query.user_id;
    var seq = req.params.seq;

    var sql = 'update projects set proj_name=?, proj_description=?, url=?, user_id=? where seq=?';
    apps.conn.query(sql, [proj_name, proj_description, url, user_id, seq], (err, posts, fields) => {
        if(err){
            console.log(err);
            res.status(500).send("internal server error");
        } else {
            res.redirect('/project/'+seq);
        }
    });
});


// 2-4. project 게시글 삭제
router.get('/project/:seq/delete', (req, res) => {
    var sql = 'select seq, comp_name from projects';
    var seq = req.params.seq;

    apps.conn.query(sql, (err, posts, fields) => {
        var sql = 'select * from projects where seq=?';
        apps.conn.query(sql, [seq], (err, posts) => {
            if(err) {
                console.log(err);
                res.status(500).send('internal server error1');
            } else {
                if(posts.length === 0) {
                    console.log('레코드가 없어용');
                    res.status(500).send('internal server error2');
                } else {
                    res.render('../views/proj/proj_delete', {posts:posts, post:posts[0]});
                }
            }
        });
    });
});

// 글 삭제 - yes 버튼을 눌렀을 때 정말 삭제
router.post('/project/:seq/delete', (req, res) => {
    var seq = req.params.seq;
    var sql = 'delete from projects where seq=?';
    apps.conn.query(sql, [seq], (err, result) => {
        res.redirect('/project');
    });
});



//--------------- 2. project 끝 -----------------------------------------

//--------------- 3. resume 시작 ------------------------------------------

// 3-1. resume 게시판에 글 추가하기
router.get('/resume/add', (req, res) => {
    var sql = 'select * from resume';
    apps.conn.query(sql, (err, posts, fields) => {
        if(err){
            console.log(err);
        } 
        res.render('../views/resu/res_add', {posts:posts});
    });
});

router.post('/resume/add', (req, res) => {
    var company = req.body.company;
    var text = req.body.text;
    var user_id = req.body.user_id || req.query.user_id;
    var sql = 'insert into resume(company, text, user_id) values(?, ?, ?)';
    apps.conn.query(sql, [company, text, user_id], (err, result, fields)=> {
        if(err){
            console.log(err);
            console.log("데이터 추가 에러");
            res.status(500).send("internal server error");
        } else {
            res.redirect('/resume');
        }
    });
});

// 3-2. resume 게시판 글목록 보기, 글 상세보기
router.get(['/resume', '/resume/:seq'],(req, res) => {
    sess = req.session;

    if(!sess.logined) // 로그인 안 된 상태라면 접근안됨
    {
        res.send(`
        <h1>Who are you?</h1>
        please login first
        <a href="/">Back </a>
      `);
    
    }
else{  // 로그인 한 상태만 접근가능
    var user_id = sess.user_id;  // 이걸로 내 아이디로 작성한 글만 판별해서 보여줄것임
    var sql = 'SELECT * FROM resume where user_id=?';  
        apps.conn.query(sql, [user_id], (err, posts, fields) => {
            var seq = req.params.seq || req.query.seq;
            // 만약 project/:id 로 들어왔다면 (글 상세보기)
            if(seq) {
                var sql = 'SELECT * FROM resume WHERE seq=?'; 
                apps.conn.query(sql, [seq], (err, posts, fields) => {
                    if(err){ // 에러가 있으면
                        console.log(err);
                    } else { // 에러가 없으면
                        res.render('../views/resu/res_detail', {posts:posts, post:posts[0]})
                    }

                })
            } else{
                //res.send(posts);
                res.render('../views/resu/resume', {posts:posts});
            }
        });
    }

});


// 3-3. resume 게시글 수정
router.get(['/resume/:seq/edit'], (req, res) => {
    var sql = 'select * from resume';
    apps.conn.query(sql, (err, posts, fields) => {
        var seq = req.params.seq;
        if(seq) {
            var sql = 'select * from resume where seq=?';
            apps.conn.query(sql, [seq], (err, posts, fileds) => {
                if(err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('../views/resu/res_edit', {posts:posts, post:posts[0]});
                }
            });
        } else {
            console.log('there is no id');
            res.status(500).send('Internal Server Error');
        }
    });
});

router.post(['/resume/:seq/edit'], (req, res) => {
    
    var company = req.body.company;
    var text = req.body.text;
    var user_id = req.body.user_id || req.query.user_id;
    var seq = req.params.seq;

    var sql = 'update resume set company=?, text=?, user_id=? where seq=?';
    apps.conn.query(sql, [company, text, user_id, seq], (err, posts, fields) => {
        if(err){
            console.log(err);
            res.status(500).send("internal server error");
        } else {
            res.redirect('/resume/'+seq);
        }
    });
});


// 3-4. resume 게시글 삭제
router.get('/resume/:seq/delete', (req, res) => {
    var sql = 'select seq, comp_name from resume';
    var seq = req.params.seq;

    apps.conn.query(sql, (err, posts, fields) => {
        var sql = 'select * from resume where seq=?';
        apps.conn.query(sql, [seq], (err, posts) => {
            if(err) {
                console.log(err);
                res.status(500).send('internal server error1');
            } else {
                if(posts.length === 0) {
                    console.log('레코드가 없어용');
                    res.status(500).send('internal server error2');
                } else {
                    res.render('../views/resu/res_delete', {posts:posts, post:posts[0]});
                }
            }
        });
    });
});

// 글 삭제 - yes 버튼을 눌렀을 때 정말 삭제
router.post('/resume/:seq/delete', (req, res) => {
    var seq = req.params.seq;
    var sql = 'delete from resume where seq=?';
    apps.conn.query(sql, [seq], (err, result) => {
        res.redirect('/resume');
    });
});

//-----------------3. resume 끝 ----------------------------


//----------------- 4. certification 게시판 ----------------------------------------------

// 4-1. certification 게시판 글 생성
router.get('/certification/add', (req, res) => {
    var sql = 'select * from certifications';
    apps.conn.query(sql, (err, posts, fields) => {
        if(err){
            console.log(err);
        } 
        res.render('../views/cert/cert_add', {posts:posts});
    });
});

router.post('/certification/add', (req, res) => {
    var cert_name = req.body.cert_name;
    var cert_num = req.body.cert_num;
    var issuing_org = req.body.issuing_org;
    var issuing_date =  req.body.issuing_date;
    var expiration_date = req.body.expiration_date;
    var user_id = req.body.user_id || req.query.user_id;
    var sql = 'insert into certifications(cert_name, cert_num, issuing_org, issuing_date, expiration_date, user_id) values(?, ?, ?, ?, ?, ?)';
    apps.conn.query(sql, [cert_name, cert_num, issuing_org, issuing_date, expiration_date, user_id], (err, result, fields)=> {
        if(err){
            console.log(err);
            console.log("데이터 추가 에러");
            res.status(500).send("internal server error");
        } else {
            res.redirect('/certification');
        }
    });
});

// 4-2. certification 게시판 글목록 보기, 글 상세보기
router.get(['/certification', '/certification/:seq'],(req, res) => {
    sess = req.session;

    if(!sess.logined) // 로그인 안 된 상태라면 접근안됨
    {
        res.send(`
        <h1>Who are you?</h1>
        please login first
        <a href="/">Back </a>
      `);
    
    }
else{  // 로그인 한 상태만 접근가능
    var user_id = sess.user_id;  // 이걸로 내 아이디로 작성한 글만 판별해서 보여줄것임
    var sql = 'SELECT * FROM certifications where user_id=?';  
    apps.conn.query(sql, [user_id], (err, posts, fields) => {
            var seq = req.params.seq || req.query.seq;
            // 만약 certification/:id 로 들어왔다면 (글 상세보기)
            if(seq) {
                var sql = 'SELECT * FROM certifications WHERE seq=?'; 
                apps.conn.query(sql, [seq], (err, posts, fields) => {
                    if(err){ // 에러가 있으면
                        console.log(err);
                    } else { // 에러가 없으면
                        res.render('../views/cert/cert_detail', {posts:posts, post:posts[0]})
                    }

                })
            } else{
                //res.send(posts);
                res.render('../views/cert/certification', {posts:posts});
            }
        });
    }

});


// 4-3. certification 게시글 수정
router.get(['/certification/:seq/edit'], (req, res) => {
    var sql = 'select * from certifications';
    apps.conn.query(sql, (err, posts, fields) => {
        var seq = req.params.seq;
        if(seq) {
            var sql = 'select * from certifications where seq=?';
            apps.conn.query(sql, [seq], (err, posts, fileds) => {
                if(err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('../views/cert/cert_edit', {posts:posts, post:posts[0]});
                }
            });
        } else {
            console.log('there is no id');
            res.status(500).send('Internal Server Error');
        }
    });
});

router.post(['/certification/:seq/edit'], (req, res) => {
    
    var cert_name = req.body.cert_name; 
    var cert_num = req.body.cert_num;
    var issuing_org = req.body.issuing_org;
    var issuing_date =  req.body.issuing_date;
    var expiration_date = req.body.expiration_date;
    var user_id = req.body.user_id || req.query.user_id;
    var seq = req.params.seq;

    var sql = 'update certifications set cert_name=?, cert_num=?, issuing_org=?, issuing_date=?, expiration_date=?, user_id=? where seq=?';
    apps.conn.query(sql, [cert_name, cert_num, issuing_org, issuing_date, expiration_date, user_id, seq], (err, posts, fields) => {
        if(err){
            console.log(err);
            res.status(500).send("internal server error");
        } else {
            res.redirect('/certification/' + seq);
        }
    });
});


// 4-4. certification 게시글 삭제
router.get('/certification/:seq/delete', (req, res) => {
    var sql = 'select seq, cert_name from certifications';
    var seq = req.params.seq;

    apps.conn.query(sql, (err, posts, fields) => {
        var sql = 'select * from certifications where seq=?';
        apps.conn.query(sql, [seq], (err, posts) => {
            if(err) {
                console.log(err);
                res.status(500).send('internal server error1');
            } else {
                if(posts.length === 0) {
                    console.log('레코드가 없어용');
                    res.status(500).send('internal server error2');
                } else {
                    res.render('../views/cert/cert_delete', {posts:posts, post:posts[0]});
                }
            }
        });
    });
});

// 글 삭제 - yes 버튼을 눌렀을 때 정말 삭제
router.post('/certification/:seq/delete', (req, res) => {
    var seq = req.params.seq;
    var sql = 'delete from certifications where seq=?';
    apps.conn.query(sql, [seq], (err, result) => {
        res.redirect('/certification');
    });
});

//--------------- 4. certification 끝 ----------------------------------------------

//----------------- 5. test게시판 ----------------------------------------------

// 5-1. test 게시판 글 생성
router.get('/test/add', (req, res) => {
    var sql = 'select * from tests';
    apps.conn.query(sql, (err, posts, fields) => {
        if(err){
            console.log(err);
        } 
        res.render('../views/test/test_add', {posts:posts});
    });
});

router.post('/test/add', (req, res) => {
    var test_name = req.body.test_name;
    var score = req.body.score; 
    var issuing_org = req.body.issuing_org;
    var issuing_date =  req.body.issuing_date;
    var expiration_date = req.body.expiration_date;
    var user_id = req.body.user_id || req.query.user_id;
    var sql = 'insert into tests(test_name, score, issuing_org, issuing_date, expiration_date, user_id) values(?, ?, ?, ?, ?, ?)';
    apps.conn.query(sql, [test_name, score, issuing_org, issuing_date, expiration_date, user_id], (err, result, fields)=> {
        if(err){
            console.log(err);
            console.log("데이터 추가 에러");
            res.status(500).send("internal server error");
        } else {
            res.redirect('/test');
        }
    });
});

// 5-2. test 게시판 글목록 보기, 글 상세보기
router.get(['/test', '/test/:seq'],(req, res) => {
    sess = req.session;

    if(!sess.logined) // 로그인 안 된 상태라면 접근안됨
    {
        res.send(`
        <h1>Who are you?</h1>
        please login first
        <a href="/">Back </a>
      `);
    
    }
else{  // 로그인 한 상태만 접근가능
    var user_id = sess.user_id;  // 이걸로 내 아이디로 작성한 글만 판별해서 보여줄것임
    var sql = 'SELECT * FROM tests where user_id=?';  
    apps.conn.query(sql, [user_id], (err, posts, fields) => {
            var seq = req.params.seq || req.query.seq;
            // 만약 test/:id 로 들어왔다면 (글 상세보기)
            if(seq) {
                var sql = 'SELECT * FROM tests WHERE seq=?'; 
                apps.conn.query(sql, [seq], (err, posts, fields) => {
                    if(err){ // 에러가 있으면
                        console.log(err);
                    } else { // 에러가 없으면
                        res.render('../views/test/test_detail', {posts:posts, post:posts[0]})
                    }

                })
            } else{
                //res.send(posts);
                res.render('../views/test/test_main', {posts:posts});
            }
        });
    }

});


// 5-3. test 게시글 수정
router.get(['/test/:seq/edit'], (req, res) => {
    var sql = 'select * from tests';
    apps.conn.query(sql, (err, posts, fields) => {
        var seq = req.params.seq;
        if(seq) {
            var sql = 'select * from tests where seq=?';
            apps.conn.query(sql, [seq], (err, posts, fileds) => {
                if(err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('../views/test/test_edit', {posts:posts, post:posts[0]});
                }
            });
        } else {
            console.log('there is no id');
            res.status(500).send('Internal Server Error');
        }
    });
});

router.post(['/test/:seq/edit'], (req, res) => {
    
    var test_name = req.body.test_name; 
    var score = req.body.score;
    var issuing_org = req.body.issuing_org;
    var issuing_date =  req.body.issuing_date;
    var expiration_date = req.body.expiration_date;
    var user_id = req.body.user_id || req.query.user_id;
    var seq = req.params.seq;

    var sql = 'update tests set test_name=?, score=?, issuing_org=?, issuing_date=?, expiration_date=?, user_id=? where seq=?';
    apps.conn.query(sql, [test_name, score, issuing_org, issuing_date, expiration_date, user_id, seq], (err, posts, fields) => {
        if(err){
            console.log(err);
            res.status(500).send("internal server error");
        } else {
            res.redirect('/test/' + seq);
        }
    });
});


// 5-4. test 게시글 삭제
router.get('/test/:seq/delete', (req, res) => {
    var sql = 'select seq, test_name from tests';
    var seq = req.params.seq;

    apps.conn.query(sql, (err, posts, fields) => {
        var sql = 'select * from tests where seq=?';
        apps.conn.query(sql, [seq], (err, posts) => {
            if(err) {
                console.log(err);
                res.status(500).send('internal server error1');
            } else {
                if(posts.length === 0) {
                    console.log('레코드가 없어용');
                    res.status(500).send('internal server error2');
                } else {
                    res.render('../views/test/test_delete', {posts:posts, post:posts[0]});
                }
            }
        });
    });
});

// 글 삭제 - yes 버튼을 눌렀을 때 정말 삭제
router.post('/test/:seq/delete', (req, res) => {
    var seq = req.params.seq;
    var sql = 'delete from tests where seq=?';
    apps.conn.query(sql, [seq], (err, result) => {
        res.redirect('/test');
    });
});

//--------------- 5. test 끝 ----------------------------------------------

//----------------- 6. career 게시판 ----------------------------------------------

// 6-1. career 게시판 글 생성 (INSERT)
router.get('/career/add', (req, res) => {
    var sql = 'select * from career';
    apps.conn.query(sql, (err, posts, fields) => {
        if(err){
            console.log(err);
        } 
        res.render('../views/car/car_add', {posts:posts});
    });
});

router.post('/career/add', (req, res) => {
    var org_name = req.body.org_name;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var career_description = req.body.career_description;
    var user_id = req.body.user_id || req.query.user_id;
    // INSERT를 위한 dinamic query
    var sql = 'insert into career(org_name, start_date, end_date, career_description, user_id) values(?, ?, ?, ?, ?)';
    apps.conn.query(sql, [org_name, start_date, end_date, career_description, user_id], (err, result, fields)=> {
        if(err){
            console.log(err);
            console.log("데이터 추가 에러");
            res.status(500).send("internal server error");
        } else {
            res.redirect('/career');
        }
    });
});

// 6-2. career 게시판 글목록 보기, 글 상세보기 
router.get(['/career', '/career/:seq'],(req, res) => {
    sess = req.session;

    if(!sess.logined) // 로그인 안 된 상태라면 접근 안됨
    {
        res.send(`
        <h1>Who are you?</h1>
        please login first
        <a href="/">Back </a>
      `);
    
    }
else{  // 로그인 한 상태만 접근가능
    var user_id = sess.user_id;  
    var sql = 'SELECT * FROM career where user_id=?';  
    apps.conn.query(sql, [user_id], (err, posts, fields) => {
            var seq = req.params.seq || req.query.seq;
            // 만약 career/:id 로 들어왔다면 (글 상세보기)
            if(seq) {
                // SELECT 를 위한 dinamic query
                var sql = 'SELECT * FROM career WHERE seq=?'; 
                apps.conn.query(sql, [seq], (err, posts, fields) => {
                    if(err){ // 에러가 있으면
                        console.log(err);
                    } else { // 에러가 없으면 결과를 보여준다.
                        res.render('../views/car/car_detail', {posts:posts, post:posts[0]})
                    }

                })
            } else{
                res.render('../views/car/career', {posts:posts});
            }
        });
    }

});


// 6-3. career 게시글 수정 (UPDATE)
// GET /career/게시글seq/deit
router.get(['/career/:seq/edit'], (req, res) => {
    var sql = 'select * from career';
    apps.conn.query(sql, (err, posts, fields) => {
        var seq = req.params.seq;
        if(seq) {
            // UPDATE할 게시물 SELECT하는 query
            var sql = 'select * from career where seq=?';
            apps.conn.query(sql, [seq], (err, posts, fileds) => {
                if(err) {
                    console.log(err);
                    res.status(500).send('Internal Server Error');
                } else {
                    res.render('../views/car/car_edit', {posts:posts, post:posts[0]});
                }
            });
        } else {
            console.log('there is no id');
            res.status(500).send('Internal Server Error');
        }
    });
});

// POST /career/게시글seq/deit
router.post(['/career/:seq/edit'], (req, res) => {
    
    var org_name = req.body.org_name;
    var start_date = req.body.start_date;
    var end_date = req.body.end_date;
    var career_description = req.body.career_description;
    var user_id = req.body.user_id || req.query.user_id;
    var seq = req.params.seq;
    // UPDATE를 수행하는 dynamic query
    var sql = 'update career set org_name=?, start_date=?, end_date=?, career_description=?, user_id=? where seq=?';
    apps.conn.query(sql, [org_name, start_date, end_date, career_description, user_id, seq], (err, posts, fields) => {
        if(err){
            console.log(err);
            res.status(500).send("internal server error");
        } else {
            res.redirect('/career/' + seq);
        }
    });
});


// 6-4. career 게시글 삭제 (DELETE)
// GET /caeer/게시글seq/delete
router.get('/career/:seq/delete', (req, res) => {
    var sql = 'select seq, org_name from career';
    var seq = req.params.seq;

    apps.conn.query(sql, (err, posts, fields) => {
        var sql = 'select * from career where seq=?';
        apps.conn.query(sql, [seq], (err, posts) => {
            if(err) {
                console.log(err);
                res.status(500).send('internal server error1');
            } else {
                if(posts.length === 0) {
                    console.log('레코드가 없어용');
                    res.status(500).send('internal server error2');
                } else {
                    res.render('../views/car/car_delete', {posts:posts, post:posts[0]});
                }
            }
        });
    });
});

// 글 삭제 - yes 버튼을 눌렀을 때 정말 삭제
// POST /caeer/게시글seq/delete
router.post('/career/:seq/delete', (req, res) => {
    var seq = req.params.seq;
    var sql = 'delete from career where seq=?';
    apps.conn.query(sql, [seq], (err, result) => {
        res.redirect('/career');
    });
});

//--------------- 6. career 끝 ----------------------------------------------

module.exports = router; // 모듈로 만드는 부분

