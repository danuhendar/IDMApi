var mysqlLib = require('../../connection/mysql_connection');
var gs = require('../../controller/global_service');
var redisLib = require('../../connection/redis_connection');

const MasterFTPServer = (req, res) => {
  console.log("Mengakses API master_ftp_server pada "+gs.get_datetime())

  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.kode_cabang;

  var key_redis = "MASTER_FTP_"+IN_KODE_CABANG;
  var expired_key = 3600;
  var isExists = true;
  redisLib.isExists_Key(key_redis).then(async (d) =>{
      isExists = d;
      //console.log('isDownload : '+isDownload);
      if(isExists == true){
          redisLib.getKey_REDIS(key_redis).then((d) =>{
              var code = 200;
              var res_msg = gs.create_msg("Sukses Cache",code,d);
              res.status(code).json(res_msg);
              res.end();
          });
      }else{
          var query_ftp = "SELECT * FROM m_ftp_cabang WHERE KDCAB = '"+IN_KODE_CABANG+"';"
          mysqlLib.executeQuery(query_ftp).then((d) => {

            redisLib.setKey_REDIS(key_redis,JSON.stringify(d),parseFloat(expired_key));
            var code = 200;
            var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d));
            res.status(code).json(res_msg);
            res.end();
          }).catch(e => {
            var code = 500;
            console.log(e);
            var res_msg = gs.create_msg(e.Stack,code,e.toString());
            res.status(code).json(res_msg);
            res.end();
          });
      }
  });
  

  

  
}

const GetMasterSetting = (req, res) => {
  console.log("Mengakses API GetMasterSetting pada "+gs.get_datetime())

  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_ID = obj.IN_ID;

  const redisKey = 'SETTING_'+IN_ID;
  var isExists = false;
  redislib.isExists_Key(redisKey).then((d)=>{
      isExists = d;
      console.log('isExists : '+isExists);
      if(isExists == true){
          var data = '';
          redislib.getKey_REDIS(redisKey).then((e) =>{
              data = e;
              console.log("data exists");
              var code = 200;
              var res_msg = gs.create_msg("Sukses Cache",code,data);
              res.status(code).json(res_msg);
              res.end();
          });
         
      }else{
        console.log("data didn't exists");
        mysqlLib.executeQuery("SELECT ID,ITEM,CONTENT FROM setting WHERE ID = '"+IN_ID+"';").then((d) => {
          redislib.setKey_REDIS(redisKey,JSON.stringify(d),7200);
          //client.set(redisKey,JSON.stringify(d),'EX',7200); // simpan hasil query ke dalam redis dalam bentuk JSON yang sudah di jadikan string, kita setting expired selaman 60 (detik)
          var code = 200;
          var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d));
          res.status(code).json(res_msg);
          res.end();
        }).catch(e => {
          var code = 500;
          console.log(e);
          var res_msg = gs.create_msg(e.Stack,code,e.toString());
          res.status(code).json(res_msg);
          res.end();
        });
      }

  });

}

 
module.exports = {
  MasterFTPServer,
  GetMasterSetting
}
