var mysqlLib = require('../../connection/mysql_connection');
var gs = require('../../controller/global_service');
var redislib = require('../../connection/redis_connection');

const TargetDownload = (req, res) => {
    console.log("Mengakses API TargetDownload pada "+gs.get_datetime());

    var obj = JSON.parse(JSON.stringify(req.body));
    var IN_KODE_CABANG = obj.IN_KODE_CABANG
    var IN_STATION = obj.IN_STATION
    var IN_ACT = obj.IN_ACT
 
    
    mysqlLib.executeQuery("CALL GET_LIST_TARGET_UPDATE('"+IN_KODE_CABANG+"','"+IN_STATION+"');").then((d) => {
      var code = 200;
      var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d[0]));
      res.status(code).json(res_msg);
      res.end();
    }).catch(e => {
      var code = 500;
      console.log(e);
      var res_msg = gs.create_msg(e.Stack,code,"");
      res.status(code).json(res_msg);
      res.end();
    });  
}


const FlagUpdateListeners = (req, res) => {
    console.log("Mengakses API FlagUpdateListeners pada "+gs.get_datetime());

    var obj = JSON.parse(JSON.stringify(req.body));
    var IN_KODE_CABANG = obj.IN_KODE_CABANG
    var IN_IP = obj.IN_IP
    var IN_HASIL = obj.IN_HASIL

    try{
        var sql_update_master = "UPDATE m_update_listeners SET ACT = '6',FLAG_UPDATE=NOW() WHERE KDCAB = '"+IN_KODE_CABANG+"' AND IP = '"+IN_IP+"' ;";
        //console.log('sql_update_master : '+sql_update_master);
        mysqlLib.executeQuery(sql_update_master).then(async (d) => {
          
          
          var response = JSON.stringify(IN_HASIL);
          //console.log('RESPONSE : '+response)
          var parseJson = JSON.parse(response);
          //console.log('LENGTH : '+parseJson.length)
          for(var a = 0;a<parseJson.length;a++){
              var act = parseJson[a].ACT;
              var hasil = parseJson[a].HASIL;
              var sql_insert_log_history_update = "INSERT INTO transaksi_update_listeners VALUES(NULL,'"+IN_IP+"','"+act+"','"+hasil+"',NOW(),'IDMApiV101');";
              mysqlLib.executeQuery(sql_insert_log_history_update);
              //-- del key redis --//
              var key_redis_download = "DOWNLOAD_"+IN_IP;
              redislib.Remove_Key(key_redis_download);
              var key_redis_ceksize = "CEKSIZE_"+IN_IP;
              redislib.Remove_Key(key_redis_ceksize);
              var key_redis_update = "UPDATE_"+IN_IP;
              redislib.Remove_Key(key_redis_update);
              var key_redis_cek_versi = "CEKVERSI_"+IN_IP;
              redislib.Remove_Key(key_redis_cek_versi);
              var key_redis_cek_spy_service = "CEKSPY_"+IN_IP;
              redislib.Remove_Key(key_redis_cek_spy_service);
              console.log('HAPUS KEY REDIS SUKSES : '+IN_KODE_CABANG+'/IP : '+IN_IP);
          }
          var code = 200;
          var res_msg = gs.create_msg("Sukses",code,'');
          res.status(code).json(res_msg);
          res.end();
        }).catch(e => {
          var code = 400;
          //console.log(e);
          var res_msg = gs.create_msg(e.Stack,code,"");
          console.log(res_msg)
          res.status(code).json(res_msg);
          res.end();
        });  
    }catch(Ex){
        var code = 500;
        //console.log(e);
        var res_msg = gs.create_msg(e.Stack,code,"");
        console.log(res_msg)
        res.status(code).json(res_msg);
        res.end();
    }
}


 
module.exports = {
  TargetDownload,
  FlagUpdateListeners
}
