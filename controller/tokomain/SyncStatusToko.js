var mysqlLib = require('../../connection/mysql_connection');
var gs = require('../../controller/global_service');

const InsStatusToko = (req, res) => {
  console.log("Mengakses API InsStatusToko pada "+gs.get_datetime())

  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.IN_KODE_CABANG;
  var IN_STATUS = obj.IN_STATUS;
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

const UpdRECIDTokomain = (req, res) => {
  console.log("Mengakses API UpdRECIDTokomain pada "+gs.get_datetime())

  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.IN_KODE_CABANG;
  var IN_KODE_TOKO = obj.IN_KODE_TOKO;
  var IN_STATION = obj.IN_STATION;
  var sql_query = "UPDATE tokomain SET recid = '1' WHERE TOKO = '"+IN_KODE_TOKO+"' AND STATION IN("+IN_STATION+") AND KDCAB = '"+IN_KODE_CABANG+"' ";
  //console.log('sql_query : '+sql_query);
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
  InsStatusToko,
  UpdRECIDTokomain
}
