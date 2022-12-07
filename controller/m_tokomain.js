var mysqlLib = require('../connection/mysql_connection');
var gs = require('../controller/global_service');



const GET_Tokomain = (req, res) => {
  console.log("Mengakses API GET_Tokomain pada "+gs.get_datetime())

 
 
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.IN_KODE_CABANG
  var IN_STATION = obj.IN_STATION
  var IN_KODE_TOKO = obj.IN_KODE_TOKO
  var IN_TOKEN = obj.IN_TOKEN

  mysqlLib.Verifikasi_Token(IN_TOKEN).then((d)=>{
    console.log("HASIL VERIFIKASI : "+d);
  });

  mysqlLib.executeQuery("select c.KDCAB,c.TOKO,c.NAMA,c.STATION,c.IP,IS_INDUK,d.USER,d.PASSWORD from tokomain c INNER JOIN (SELECT a.USER,GROUP_CONCAT(a.PASS SEPARATOR '|') AS PASSWORD FROM m_pass_sql a WHERE DB LIKE 'pos%' AND IS_AKTIF = '1') d where c.KDCAB = '"+IN_KODE_CABANG+"' AND c.TOKO LIKE '"+IN_KODE_TOKO+"%' AND c.STATION LIKE '"+IN_STATION+"%' ").then((d) => {
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

const GET_Tokomain_Non_Station = (req, res) => {
  console.log("Mengakses API GET_Tokomain_Non_Station pada "+gs.get_datetime())
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.IN_KODE_CABANG
  var IN_STATION = obj.IN_STATION
  var IN_KODE_TOKO = obj.IN_KODE_TOKO
  mysqlLib.executeQuery("SELECT CABANG AS KDCAB,TOKO,NAMA_TOKO AS NAMA,DEVICE AS STATION,IP FROM `m_ip_non_station` WHERE CABANG LIKE '"+IN_KODE_CABANG+"%' AND TOKO LIKE '"+IN_KODE_TOKO+"%' AND DEVICE LIKE '"+IN_STATION+"%';").then((d) => {
    var code = 200;
    var res_msg = gs.create_msg("Sukses",code,d);
    res.status(code).json(res_msg);
  }).catch(e => {
    var code = 500;
    console.log(e);
    var res_msg = gs.create_msg(e.toString(),code,"");
    res.status(code).json(res_msg);
  });
}
 
module.exports = {
  GET_Tokomain,
  GET_Tokomain_Non_Station
}
