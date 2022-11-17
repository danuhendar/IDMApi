
var mysqlLib = require('../connection/mysql_connection');
var gs = require('../controller/global_service');



const GET_Absensi_Proses_Aktivasi = (req, res) => {
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_TANGGAL = obj.IN_TANGGAL

  mysqlLib.executeQuery("SELECT KDCAB,COUNT(DISTINCT(IP)) AS JUMLAH FROM aktivasi_windows WHERE TASK = 'COMMAND' AND `TO` = 'ServiceAktivasiWindows' AND DATE_FORMAT(ADDTIME,'%Y-%m-%d') = CURDATE() GROUP BY KDCAB;").then((d) => {
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
  GET_Absensi_Proses_Aktivasi
}