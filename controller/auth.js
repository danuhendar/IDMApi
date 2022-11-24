const jwt = require('jsonwebtoken')
const jwtKey = 'my_secret_key'
const jwtKey_refresh_token = 'rahasia'
const jwt_token_ExpirySeconds = 1800 //-- expired 30 menit
const jwtRefresh_token_ExpirySeconds = 7200 //-- expired 2 jam
const bodyParser = require('body-parser')


var mysqlLib = require('../connection/mysql_connection');
var gs = require('../controller/global_service');



const signIn = (req, res) => {
  // Get credentials from JSON body
  var obj = JSON.parse(JSON.stringify(req.body));
  var username = obj.IN_USERNAME;
  var password = obj.IN_PASSWORD;
  console.log("Mengakses API signIn pada "+gs.get_datetime())
  mysqlLib.executeQuery("SELECT LOCATION,NIK,NAMA,BRANCH_CODE FROM idm_org_structure WHERE NIK = '"+username+"' and PASSWORD = '"+password+"';").then((d) => {
        //console.log(d.length);
        var res_location = d[0].LOCATION;
        var res_nik = d[0].NIK;
        var res_nama = d[0].NAMA;
        var res_branch_code = d[0].BRANCH_CODE;
        var sp_res_branch_code = res_branch_code.split(',');
        var sp_res_branch_name = "";
        for(var i = 0;i<sp_res_branch_code.length;i++){
            var kode_cabang = sp_res_branch_code[i];
            mysqlLib.executeQuery("SELECT BRANCH_CODE,BRANCH_NAME FROM idm_org_branch where BRANCH_CODE = '"+kode_cabang+"'").then((d) => {
                  var res_nama_cabang = d[0].BRANCH_NAME;
                  var res_kode_cabang = d[0].BRANCH_CODE;
                  //console.log("NAMA CABANG : "+res_nama_cabang);
                  if(i == (sp_res_branch_code.length - 1))
                  {
                      sp_res_branch_name += res_kode_cabang+"-"+res_nama_cabang+"";
                  }
                  else
                  {
                      sp_res_branch_name += res_kode_cabang+"-"+res_nama_cabang+",";
                  }
                  
            });
        }

        if(d.length>0){
          // Create a new token with the username in the payload
          // and which expires 300 seconds after issue
          const token = jwt.sign({ username }, jwtKey, {
            algorithm: 'HS256',
            expiresIn: jwt_token_ExpirySeconds
          })

          const refreshToken = jwt.sign({ username }, jwtKey_refresh_token, {
            algorithm: 'HS256',
            expiresIn: jwtRefresh_token_ExpirySeconds
          })

          //-- masukan session ke dalam database --//
          const query_cek_session = "SELECT EXISTS(SELECT USER FROM session_login_web WHERE USER = '"+username+"') AS HASIL;";
          mysqlLib.executeQuery(query_cek_session).then((d) => {
               if(parseFloat(d[0].HASIL) == 0){
                    console.log("User belum pernah login menggunakan session");

                    const query_session = "INSERT INTO session_login_web VALUES(NULL,'"+username+"','"+res_location+"','"+token+"','"+refreshToken+"',NOW());"; 
                    console.log("query_session : "+query_session);
                    mysqlLib.executeQuery(query_session).then((d) => {
                          if(parseFloat(d.affectedRows)>0){
                               console.log("berhasil insert session");
                               var data = {"TOKEN":token,"LOCATION":res_location,"NIK":res_nik,"NAMA":res_nama,"BRANCH_CODE":sp_res_branch_name,"REFRESH_TOKEN":refreshToken};
                               var code = 200;
                               var res_msg = gs.create_msg("Sukses",code,data);
                               res.status(code).json(res_msg);
                               res.end()
                          }
                    });

               }else{
                    const query_cek_time_login = "SELECT HOUR(TIMEDIFF(NOW(),LOGIN_AT)) AS HASIL FROM session_login_web WHERE `USER` = '"+username+"' ORDER BY ID DESC LIMIT 0,1 ";
                    mysqlLib.executeQuery(query_cek_time_login).then((d) => {
                         if(parseFloat(d[0].HASIL)>1){
                              console.log("session lebih dari 2 jam silahkan login ulang");
                              //var data = {"TOKEN":d[0].TOKEN,"LOCATION":res_location,"NIK":res_nik,"NAMA":res_nama,"BRANCH_CODE":res_branch_code};
                              
                              const query_session = "INSERT INTO session_login_web VALUES(NULL,'"+username+"','"+res_location+"','"+token+"','"+refreshToken+"',NOW());"; 
                              mysqlLib.executeQuery(query_session).then((d) => {
                                   if(parseFloat(d.affectedRows)>0){
                                         console.log("berhasil insert session");
                                         var data = {"TOKEN":token,"LOCATION":res_location,"NIK":res_nik,"NAMA":res_nama,"BRANCH_CODE":sp_res_branch_name,"REFRESH_TOKEN":refreshToken};
                                         var code = 200;
                                         var res_msg = gs.create_msg("Sukses",code,data);
                                         res.status(code).json(res_msg);
                                         res.end()
                                   }
                              });
                         }else{
                              var code = 200;
                              const query_token = "SELECT TOKEN,REFRESH_TOKEN FROM session_login_web WHERE USER = '"+username+"' ORDER BY ID DESC LIMIT 0,1";
                              mysqlLib.executeQuery(query_token).then((d) => {
                                    console.log("session masih ada tidak perlu login ulang");
                                    var data = {"TOKEN":d[0].TOKEN,"LOCATION":res_location,"NIK":res_nik,"NAMA":res_nama,"BRANCH_CODE":sp_res_branch_name,"REFRESH_TOKEN":d[0].REFRESH_TOKEN};
                                    var res_msg = gs.create_msg("Sukses",code,data);
                                    res.status(code).json(res_msg);
                                    res.end()
                              });
                         }
                    });
               }
          });

        }else{
          var code = 201;
          var res_msg = gs.create_msg("Gagal Login Cek Kembali username & password",code,"");
          res.status(code).json(res_msg);
          res.end()
        }
  }).catch(e => {
    console.log(e);
    var code = 500;
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
  });
    
  
    
  
}


const welcome = (req, res) => {
  console.log("Mengakses API welcome pada "+gs.get_datetime())
  // We can obtain the session token from the requests cookies, which come with every request
  const token = req.cookies.token

  // if the cookie is not set, return an unauthorized error
  if (!token) {
    return res.status(401).end()
  }

  var payload
  try {
    // Parse the JWT string and store the result in `payload`.
    // Note that we are passing the key in this method as well. This method will throw an error
    // if the token is invalid (if it has expired according to the expiry time we set on sign in),
    // or if the signature does not match
    payload = jwt.verify(token, jwtKey)
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      // if the error thrown is because the JWT is unauthorized, return a 401 error
      return res.status(401).end()
    }
    // otherwise, return a bad request error
    return res.status(400).end()
  }


  // Finally, return the welcome message to the user, along with their
  // username given in the token
  res.send("Welcome ${payload.username}!")
}



const refresh = (req, res) => {
  console.log("Mengakses API refresh pada "+gs.get_datetime())
  // (BEGIN) The code uptil this point is the same as the first part of the `welcome` route
  //const token = req.cookies.token
  var obj = JSON.parse(JSON.stringify(req.body));
  var token = obj.TOKEN;
  //console.log(token);
  
  // if (!token) {
  //   return res.status(401).end()
  // }

  var payload
  try {
    payload = jwt.verify(token, jwtKey_refresh_token)
  } catch (e) {
    //console.log(e.toString())
    if (e instanceof jwt.JsonWebTokenError) {
      var res_msg = gs.create_msg("Error","401",e.toString());
      return res.status(401).json(res_msg).end()
    }
    var res_msg = gs.create_msg("Error","400",e.toString());
    return res.status(400).json(res_msg).end()
  }
  // (END) The code uptil this point is the same as the first part of the `welcome` route

  // We ensure that a new token is not issued until enough time has elapsed
  // In this case, a new token will only be issued if the old token is within
  // 30 seconds of expiry. Otherwise, return a bad request status
  const nowUnixSeconds = Math.round(Number(new Date()) / 1000)
  //console.log("nowUnixSeconds : "+nowUnixSeconds);
  //console.log("payload exp : "+payload.exp);
  //console.log("payload : "+payload);
  //console.log("hasil : "+parseFloat(payload.exp) - parseFloat(nowUnixSeconds))
  //console.log("payload.username : "+payload.username);
  
  
  if (nowUnixSeconds > payload.exp) {
    //console.log("lebih dari 2 jam")
    var res_msg = gs.create_msg("Info","400","Token Expired");
    return res.status(400).end()
  }

  // Now, create a new token for the current user, with a renewed expiration time
  const newToken = jwt.sign({ username: payload.username }, jwtKey, {
    algorithm: 'HS256',
    expiresIn: jwt_token_ExpirySeconds
  })
 
  const newrefreshToken = jwt.sign({ username: payload.username }, jwtKey_refresh_token, {
    algorithm: 'HS256',
    expiresIn: jwtRefresh_token_ExpirySeconds
  })


  // Set the new token as the users `token` cookie
  // res.cookie('token', newToken, { 
  //     maxAge: jwt_token_ExpirySeconds * 1000 
  // })

  var data = {"TOKEN":newToken,"REFRESH_TOKEN":newrefreshToken};
  var res_msg = gs.create_msg("Sukses","200",data);
  res.status("200").json(res_msg);
  res.end()
}




module.exports = {
  signIn,
  welcome,
  refresh
}