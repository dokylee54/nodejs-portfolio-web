var exportsList = module.exports = {};

const express = require('express');
const http = require('http');
const str_query = require('./routes/database/all_query');
const run_query = require('./routes/database/run_query');
const ejs = require('ejs')
const bodyParser = require('body-parser')

const main_router = require('./routes/main_router'); 
const profile_router = require('./routes/profile_router'); 
const loginCheck_router = require('./routes/loginCheck_router');
const board_router = require('./routes/board_router');

// get DB connection
const conn = run_query.getconn();
exportsList.conn = conn;

//앱 세팅
app = express();
app.set('port', 3000);

//세션
var session = require('express-session');

app.set('view engine', 'ejs');
app.set('views', './views');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
 secret: '@#@$MYSIGN#@$#$',
 resave: false,
 saveUninitialized: true
}));

//라우터들 모음
app.use('/main', main_router);
app.use('/profile', profile_router);
app.use('/', board_router);
app.use('/', loginCheck_router);

//서버 열기
app.listen(3000, (req, res) => {
    console.log("server start at port 3000");
});