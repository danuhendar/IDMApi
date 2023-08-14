var mysqlLib = require('../../connection/mysql_connection');
var gs = require('../../controller/global_service');

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
    }).catch(e => {
      var code = 500;
      console.log(e);
      var res_msg = gs.create_msg(e.Stack,code,"");
      res.status(code).json(res_msg);
    });  
}

const CekFileSize = (req, res) => {
    console.log("Mengakses API CekFileSize pada "+gs.get_datetime());

    var obj = JSON.parse(JSON.stringify(req.body));
    var IN_KODE_CABANG = obj.IN_KODE_CABANG
    var IN_STATION = obj.IN_STATION
 
    
    mysqlLib.executeQuery("").then((d) => {
      var code = 200;
      var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d[0]));
      res.status(code).json(res_msg);
    }).catch(e => {
      var code = 500;
      console.log(e);
      var res_msg = gs.create_msg(e.Stack,code,"");
      res.status(code).json(res_msg);
    });  
}

const ProsesUpdate = (req, res) => {
    console.log("Mengakses API CekFileSize pada "+gs.get_datetime());

    var obj = JSON.parse(JSON.stringify(req.body));
    var IN_KODE_CABANG = obj.IN_KODE_CABANG
    var IN_STATION = obj.IN_STATION
 
    
    mysqlLib.executeQuery("").then((d) => {
      var code = 200;
      var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d[0]));
      res.status(code).json(res_msg);
    }).catch(e => {
      var code = 500;
      console.log(e);
      var res_msg = gs.create_msg(e.Stack,code,"");
      res.status(code).json(res_msg);
    });  
}
 
module.exports = {
  TargetDownload,
  CekFileSize
}
