const mysql = require('mysql2');
const config = require('../config.json')
const jwt = require('jsonwebtoken')
const jwtKey = 'my_secret_key'

 const mysqlConfig = {
     host: config.database.HOSTNAME,
     user: config.database.USER,
     password: config.database.PASSWORD,
     database: config.database.DATABASE,
     port: config.database.PORT,
     multipleStatements: true
 }


var pool = mysql.createPool(mysqlConfig);

module.exports.connect = function (cb) {
  return new Promise((resolve, reject) => {
    pool.on('connection', function (connection) {
      connection.on('error', function (err) {
        console.log('MySQL error event', err)
      });
      connection.on('close', function (err) {
        console.log('MySQL close event', err)
      });
    });
    resolve()
  })
}

async function executeQuery (query) {
  //console.log(`query: `, query)
  return new Promise((resolve, reject) => {
    try{
      pool.query(query, (e, r, f) => {
        if(e){
          reject(e)
        }
        else{
          resolve(r)
        }
      });
    }
    catch(ex){
      reject(ex)
    }
  })  
}

async function execSP(spName, params){
  return new Promise((resolve, reject) => {
    try{
      var paramPlaceHolder = ''
      if(params && params.length){
        for(var i = 0; i < params.length; i++){
          paramPlaceHolder += '?,'
        }
      }
      if(paramPlaceHolder.length){
        paramPlaceHolder = paramPlaceHolder.slice(0, -1)
      }
      console.log('final SP call', `CALL ${spName}(${params})`)
      pool.query(`CALL ${spName}(${paramPlaceHolder})`, params, (e, r, f) => {
        if(e){
          reject(e)
        }
        else{
          resolve(r)
        }
      });
    }
    catch(ex){
      reject(ex)
    }
  })
}


async function Verifikasi_Token(token) {
  return new Promise((resolve, reject) => {
    try{
      // We can obtain the session token from the requests cookies, which come with every request
      var payload;
      //payload = jwt.verify(token, jwtKey)
      jwt.verify(token,jwtKey, (e, r, f) => {
        if(e){
          reject(e)
        }
        else{
          resolve(r)
        }
      });

    }catch(ex){
      reject(ex)
    }
  })    

   
}


module.exports.executeQuery = executeQuery
module.exports.execSP = execSP
module.exports.Verifikasi_Token = Verifikasi_Token