var mysqlLib = require('../../connection/mysql_connection');
var gs = require('../../controller/global_service');

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


 
module.exports = {
  MasterFTPServer
}
