var mysqlLib = require('../../connection/mysql_connection');
var gs = require('../../controller/global_service');

const LaporanListenerNOK = (req, res) => {
    console.log("Mengakses API LaporanListenerNOK pada "+gs.get_datetime());

    var obj = JSON.parse(JSON.stringify(req.body));
    var IN_STATUS = obj.IN_STATUS
    var IN_TOKEN = obj.IN_TOKEN
 
    
    mysqlLib.executeQuery("CALL GET_LAPORAN_INSTALLASI_LISTENER_PER_TOKO_NOK('18','0','0','"+IN_STATUS+"%');").then((d) => {
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
 
module.exports = {
  LaporanListenerNOK
}
