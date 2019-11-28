const express = require('express');
const path = require('path');
const str_query = require('./database/all_query');
const router = express.Router(); // 라우터 분리
const apps = require('../app');

// func : get user info
var userInfoDict = {};
get_userInfo = function(){
    userInfoDict = {};
    apps.conn.query(str_query.getUsersID, function(err, res, fields)
    {
        if (err)  return console.log(err);
        if(res.length)
        {
            for(var i = 0; i<res.length; i++ )
            {
                userInfoDict[res[i]['user_id']] = res[i]['password'];
            }
        }
    }); 

}

router.get('/', function (req, res) {
    get_userInfo();
    var sess = req.session;
    console.log(sess);
    if(!sess.logined)
        res.redirect('/login')
    else
        res.redirect('/main')
});


router.get('/login', (req, res) => {
    res.render('../views/login'); 
});

router.post('/login', (req, res) => {
    sess = req.session;

    if(req.body.id in userInfoDict){  
        if(req.body.pwd == userInfoDict[req.body.id]){ 
            sess.logined = true;
            sess.user_id = req.body.id;
            sess.password = req.body.pwd;
            res.redirect('/')
        } 
        else {
            res.send(`
            <h1>Who are you?</h1>
            please login first
            <a href="/">Back </a>
            `);
        }
    }
    else {
    res.send(`
      <h1>Who are you?</h1>
      please login first
      <a href="/">Back </a>
    `);}
});

// logout
router.get('/logout', function(req, res){
    sess = req.session;
    if(sess.id){ 
        req.session.destroy(function(err){
            if(err){
                console.log(err);
            }else{
                res.redirect('/');
            }
        });
    }else{
        res.redirect('/');
    }
});

//signup
router.get('/signup', function(req, res){
    res.render('../views/login/signup');
});

router.post('/signup', (req, res) => {
    
    var u_id = req.body.id;
    var u_pwd = req.body.pwd;
    var u_birth = req.body.birth;
    var u_email =  req.body.email;
    var u_phone = req.body.phone;
    var u_address = req.body.address;

    if(!u_id || !u_pwd || !u_birth || !u_email || !u_phone || !u_address){
        return res.send(`
            <h1>Invalid input, try again</h1>
            <a href="/signup">Back </a>
        `);
    }
    
    get_userInfo(); //refresh user info
    if(req.body.id in userInfoDict){
        return res.send(`
            <h1>ID already exists!</h1>
            <a href="/main">Back</a>
        `);
    }

    let userinfo = {
        user_id: u_id,
        password: u_pwd,
        birth: u_birth,
        email: u_email,
        phone: u_phone,
        address: u_address
    };
    
    let sql = 'INSERT INTO users SET ?'; 

    apps.conn.query(sql, userinfo, (err, result, fields) => {
        if(err){ // 에러가 있으면
            console.log(err);
        }
        else {
            res.send(`
            <div style="text-align: center;">
            <h1 style="text-align: center;">SIGN UP success!</h1>
            <a href="/">go back to the SIGN IN page</a>
            </div>
            `);
        }
    });
    
});

module.exports = router; // 모듈로 만드는 부분

