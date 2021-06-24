var express = require('express');
var router = express.Router();
const bcrypt = require('bcryptjs');

const conn = require('./dbConnection.js');

//추가한 부분
// const mariadb = require('mariadb');

var connection = conn.connection;

// Connect
connection.connect(function (err) {   
  console.log("MOA_DB 접속_musers");
  if (err) {     
    console.error('mysql connection error');     
    console.error(err);     
    throw err;   
  } 
});

router.get('/', function (req, res) {
  console.log("메인");
  connection.query('SELECT * FROM TBL_MOA_USER_BAS', function (err, rows) {
    if (err) throw err;
    res.send(rows);
  });
});

router.post('/signUp', function (req, res) {
  console.log("회원가입");
  const user = {
    'user_tel_no':req.body.user.user_tel_no,
    'user_nm': req.body.user.user_nm,
    'user_id': req.body.user.user_id,
    'user_pwd': req.body.user.user_pwd,
    'team_div_cd' : req.body.user.default_team.idx,
    'emp_pos_div_cd' : req.body.user.default_team.idx2
  }
  console.log(user);
  // const team_div_cd ={
  //   'team_div_cd' : req.body.team_div_cd.idx,
  //   'emp_pos_div_cd' : req.boby.team_div_cd.idx2
  // }
  // console.log(team_div_cd);
  connection.query('SELECT user_id FROM TBL_MOA_USER_BAS WHERE user_id = "' + user.user_id + '"', function (err, row) {
    console.log(res);
    if (row[0] == undefined){ //  동일한 아이디가 없을경우,
      const salt = bcrypt.genSaltSync();
      const encryptedPassword = bcrypt.hashSync(user.user_pwd, salt);
      connection.query('INSERT INTO TBL_MOA_USER_BAS (user_id, user_pwd, user_tel_no, user_nm, upld_cascnt, team_div_cd, emp_pos_div_cd ) VALUES ("' + user.user_id + '","' + encryptedPassword + '", "' + user.user_tel_no + '", "' + user.user_nm + '","' + 0 + '","' + user.team_div_cd + '","' + user.emp_pos_div_cd + '")', user, function (err, row2) {
        if (err) throw err;
      });
      res.json({
        success: true,
        message: '회원가입이 완료되었습니다.'
      })
    }
    else {
      res.json({
        success: false,
        message: '이미 있는 아이디입니다. 다른 아이디를 입력해주세요.'
      })
    }
  });
});

router.post('/login', function (req, res) {
  console.log("로그인");
  const user = {
    'user_id': req.body.user.user_id,
    'user_pwd': req.body.user.user_pwd
  };

  connection.query('SELECT user_id, user_pwd FROM TBL_MOA_USER_BAS WHERE user_id = "' + user.user_id + '"', function (err, row) {
    if (err) {
      console.log(err);
    }else{
      if(row[0]===undefined){
        res.json({
          success:false,
          message : '아이디가 틀립니다.'
        })
      }
      if (row[0] !== undefined && row[0].user_id === user.user_id) {
        bcrypt.compare(user.user_pwd, row[0].user_pwd, function (err, res2) {
          if (res2) {
            console.log(res2);
            // req.session.is_logined = true;
            req.session.user=row[0];
            req.session.save();
            res.json({ // 로그인 성공 
              token: req.session,
              success: true,
              message: '로그인 성공'
            })
          }
          else {
            res.json({ // 매칭되는 아이디는 있으나, 비밀번호가 틀린 경우            success: false,
              message: '비밀번호가 틀립니다.'
            })
          }
        })
      }
    }
  })
});

//아이디로 정보 조회
router.post('/userinfo', function (req, res) {
  console.log("정보조회");
  
  const users = {
    'user_id': req.body.user_id,
  };
  console.log(users.user_id);
  connection.query('SELECT * FROM TBL_MOA_USER_BAS WHERE user_id = "' + users.user_id + '"', function (err, rows) {
    if (err) throw err;
    console.log(rows);
    res.send(rows);
    });
});




router.post('/pwReset', function (req, res) {
  console.log("비밀번호 초기화");
  const user = {
    'user_id': req.body.user.user_id,
    'user_pwd': req.body.user.user_pwd,
    'confirm_user_pwd' : req.body.user.confirm_user_pwd
  };

  connection.query('SELECT user_id FROM TBL_MOA_USER_BAS WHERE user_id = "' + user.user_id + '"', function (err, row) {
    if (row[0] == undefined){ //  동일한 아이디가 없을경우,
      res.json({
        success: false,
        message: '아이디를 다시 입력해주세요.'
      })
    }
    else {
      if(user.user_pwd == user.confirm_user_pwd){
        const salt = bcrypt.genSaltSync();
        const encryptedPassword = bcrypt.hashSync(user.user_pwd, salt);
        connection.query('UPDATE TBL_MOA_USER_BAS SET user_pwd = "' + encryptedPassword + '" where user_id = "' + user.user_id + '"', user, function (err, row2) {
          if (err) throw err;
        });
        res.json({
          success: true,
          message: '비밀번호 초기화가 완료되었습니다.'
        })
      }else{
        res.json({
          success: false,
          message: '비밀번호가 일치하지 않습니다.'
        })
      }
    }
  });
  
});

module.exports = router;
