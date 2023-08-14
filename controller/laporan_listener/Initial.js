var mysqlLib = require('../../connection/mysql_connection');
var gs = require('../../controller/global_service');

const InitialIDMCommandListeners = (req, res) => {
  console.log("Mengakses API InsStatusToko pada "+gs.get_datetime())

  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.kode_cabang;
  var IN_IP = obj.ip_listener;
  var IN_KODE_TOKO = obj.IN_KODE_TOKO;
  var IN_TANGGAL = obj.IN_TANGGAL;
  var IN_OTORISATOR = obj.IN_OTORISATOR;
  var sql_query = "REPLACE INTO m_status_toko VALUES('"+IN_KODE_TOKO+"','"+IN_STATUS+"','"+IN_TANGGAL+"',NOW(),'"+IN_OTORISATOR+"');";
  mysqlLib.executeQuery(sql_query).then((d) => {
    var code = 200;
    var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d));
    res.status(code).json(res_msg);
  }).catch(e => {
    var code = 500;
    console.log(e);
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
  });
}


 
module.exports = {
  InsStatusToko
}
