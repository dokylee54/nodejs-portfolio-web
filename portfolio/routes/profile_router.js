const express = require('express');
const path = require('path');
const str_query = require('./database/all_query');
const router = express.Router(); // 라우터 분리
const apps = require('../app');

router.get('/', (req, res) => {
    sess = req.session;

    if(!sess.logined) {
       
        res.send(`
        <div style="text-align: center;">
        <h1>Who are you?</h1>
        please login first
        <a href="/">Back </a>
        </div>
      `);
    
    } else {

        var user_id = sess.user_id;
        let sql = "select * from users where user_id=?"
        apps.conn.query(sql, [user_id], (err, post) => {
            res.render('../views/profile', {user_id: sess.user_id, post:post[0]});
       
        }); 

    }

})
// delete account
router.post('/:user_id/deleteAcount', (req, res) => {
    sess = req.session;
    console.log(sess);
    user_id = sess.user_id;

    var sql = 'delete from users where user_id=?';
    apps.conn.query(sql, [user_id], (err, result) => {
        res.redirect('/logout');
    });
});

router.get('/:user_id/deleteAcount', (req, res) => {
    sess = req.session;
    console.log(sess);
    res.render('../views/login/deleteAcount', {user_id:sess.user_id}); //세션에 
});


// edit users 
router.post('/:user_id/edit', (req, res) => {
    sess = req.session;
    console.log(sess);

    if(req.body.password!=sess.password){
        return res.send(`
        <div style="text-align: center;">
        <h1>Invalid password...!</h1>
        <a href="/">Back</a>
        </div>
        `);
    }
    console.log(req.body);
    let userinfo = [
        sess.user_id,
        sess.password,
        req.body.birth,
        req.body.email,
        req.body.phone,
        req.body.address,
        sess.user_id
    ];

    let sql = 'UPDATE users SET user_id=?, password=?, birth=?, email=?, phone=?, address=? WHERE user_id=?';
    apps.conn.query(sql, userinfo, (err, result) => {
        return res.send(`
        <div style="text-align: center;">
        <h1>Edit Successfully</h1>
        <a href="/">Back</a>
        </div>
        `);
    });
});

router.get('/:user_id/edit', (req, res) => {
    sess = req.session;
    console.log(sess);
    let sql = "select * from users where user_id=?"
    apps.conn.query(sql, [sess.user_id], (err, post) => {
        res.render('../views/login/mypage_edit', {user_id:sess.user_id, post:post[0]});
    });
});

module.exports = router; // 모듈로 만드는 부분