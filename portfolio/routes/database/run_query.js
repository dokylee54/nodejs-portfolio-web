var exportsList = module.exports = {};

//connection 얻기
exportsList.getconn = function(){
    var mysql = require('mysql');

    var conn = mysql.createConnection({
      host     : 'localhost',  //db ip
      user     : 'root',  //db user
      password : 'rootroot', //db password
      database : 'team02',  //db name
      dateStrings: 'date'
    });

    conn.connect();

    return conn;
}

//커넥션, 쿼리 주면 결과 리스트로 반환
exportsList.testrun = function(conn, query){

    var result = [];

    conn.query(query, function(err, res, fields)
    {
        if (err)  return console.log(err);

        if(res.length)
        {
            for(var i = 0; i<res.length; i++ ) result.push(res[i]); //파싱 가능
        }

        console.log(result)
    });

    return result;
}