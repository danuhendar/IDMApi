var mysqlLib = require('../connection/mysql_connection');
var gs = require('../controller/global_service');



const GET_Supmast = (req, res) => {
  console.log("Mengakses API GET_Supmast pada "+gs.get_datetime())
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.IN_KODE_CABANG
  var IN_PERIODE =  obj.IN_PERIODE
  var IN_KODE_TOKO = obj.IN_KODE_TOKO
  mysqlLib.executeQuery("SELECT JSON_EXTRACT(JSON_EXTRACT_RESULT(RESULT),'$.data') AS RESULT FROM transreport"+IN_PERIODE+" WHERE TASK = 'BC_SQL' AND `TO` RLIKE '2013058359' AND CMD LIKE '%(SELECT COUNT(*) FROM SUPMAST) AS supmast;%' AND KDCAB LIKE '"+IN_KODE_CABANG+"%' AND KDTK LIKE '"+IN_KODE_TOKO+"%';").then((d) => {
    var code = 200;
    var res_msg = gs.create_msg("Sukses",code,d);
    res.status(code).json(res_msg);
  }).catch(e => {
    var code = 500;
    console.log(e);
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
  });
}

const GET_Monitoring_Posrealtime = (req, res) => {
  console.log("Mengakses API GET_Monitoring_Posrealtime pada "+gs.get_datetime())
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.IN_KODE_CABANG
  //var IN_NIK = obj.IN_NIK
  var sql_query = "SELECT LAST_UPDATE,JSON_EXTRACT_RESULT_DATA(HASIL) AS HASIL FROM transaksi_posrealtime_nok WHERE KDCAB IN('"+IN_KODE_CABANG.replace(",", "','")+"');"
  //console.log(sql_query);
  mysqlLib.executeQuery(sql_query).then((d) => {
    var code = 200;
    var res_msg = gs.create_msg("Sukses",code,d);
    res.status(code).json(res_msg);
  }).catch(e => {
    var code = 500;
    console.log(e);
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
  });
}


 
module.exports = {
  GET_Supmast,
  GET_Monitoring_Posrealtime
}
