var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');


var mysql = require('mysql');
// Connection 객체 생성 
var connection = mysql.createConnection({
  host: '127.0.0.1',
  port: 3307,
  user: 'root',   
  password: 'wjdeorbs92',
  database: 'MOA_DB'  
});
// Connect
connection.connect(function (err) {   
    console.log("MOA_DB 접속");
    if (err) {     
      console.error('mysql connection error');     
      console.error(err);     
      throw err;   
    } 
  });

  //목록 올 조회
  router.get('/selectList', function (req, res) {
    console.log("메인");
    connection.query('SELECT * FROM TBL_MOA_BAS', function (err, rows) {
      if (err) throw err;
      console.log(rows);
      res.send(rows);
    });
  });

  //목록 등록

  //목록 수정

  //목록 검색

  
module.exports = router;