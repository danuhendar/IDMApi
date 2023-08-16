var mysqlLib = require('../../connection/mysql_connection');
var gs = require('../../controller/global_service');
var redislib = require('../../connection/redis_connection');

const MasterFTPServer = (req, res) => {
  console.log("Mengakses API master_ftp_server pada "+gs.get_datetime())

  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.kode_cabang;
  var query_ftp = "SELECT * FROM m_ftp_cabang WHERE KDCAB = '"+IN_KODE_CABANG+"';"
  mysqlLib.executeQuery(query_ftp).then((d) => {
    var code = 200;
    var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d));
    res.status(code).json(res_msg);
  }).catch(e => {
    var code = 500;
    console.log(e);
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
  });;
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
          });
         
      }else{
        console.log("data didn't exists");
        mysqlLib.executeQuery("SELECT ID,ITEM,CONTENT FROM setting WHERE ID = '"+IN_ID+"';").then((d) => {
          redislib.setKey_REDIS(redisKey,JSON.stringify(d),7200);
          //client.set(redisKey,JSON.stringify(d),'EX',7200); // simpan hasil query ke dalam redis dalam bentuk JSON yang sudah di jadikan string, kita setting expired selaman 60 (detik)
          var code = 200;
          var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d));
          res.status(code).json(res_msg);
        }).catch(e => {
          var code = 500;
          console.log(e);
          var res_msg = gs.create_msg(e.Stack,code,e.toString());
          res.status(code).json(res_msg);
        });
      }

  });

}

 
module.exports = {
  MasterFTPServer,
  GetMasterSetting
}
