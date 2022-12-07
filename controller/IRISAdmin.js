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

const GET_Monitoring_Header_Trigger_Toko = (req, res) => {
  console.log("Mengakses API GET_Monitoring_Header_Trigger_Toko pada "+gs.get_datetime())
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_LOCATION = obj.IN_LOCATION
  var IN_PERIODE_AWAL = obj.IN_PERIODE_AWAL
  var IN_PERIODE_AKHIR = obj.IN_PERIODE_AKHIR
  var IN_JENIS = obj.IN_JENIS
  var res_table = ''
  if(IN_JENIS == 'MonitoringProdmast'){
    res_table = 'transaksi_monitoring_prodmast'
  }else if(IN_JENIS == 'MonitoringPosRealtime'){
    res_table = 'transaksi_posrealtime_nok'
  }else if(IN_JENIS == 'MonitoringSPDmast'){
    res_table = 'transaksi_monitoring_spdmast'
  }else{
    res_table = ''
  }

  if(res_table != '')
  {
      var sql_query = "CALL GET_LAPORAN_HEADER_TRIGGER_TOKO('"+IN_PERIODE_AWAL+"','"+IN_PERIODE_AKHIR+"','"+IN_LOCATION+"','"+IN_JENIS+"','"+res_table+"');"
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
  else
  {
    var code = 501;
    var res_msg = gs.create_msg("Jenis report : "+IN_JENIS+" tidak diketahui",code,"");
    res.status(code).json(res_msg);
  }

  
}

const GET_Monitoring_Detail_Trigger_Toko = (req, res) => {
  console.log("Mengakses API GET_Monitoring_Detail_Posrealtime pada "+gs.get_datetime())
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_NIK = obj.IN_NIK
  var IN_SUB_ID = obj.IN_SUB_ID

  var IN_JENIS = obj.IN_JENIS
  var res_table = ''
  if(IN_JENIS == 'MonitoringProdmast'){
    res_table = 'transaksi_monitoring_prodmast'
  }else if(IN_JENIS == 'MonitoringPosRealtime'){
    res_table = 'transaksi_posrealtime_nok'
  }else if(IN_JENIS == 'MonitoringSPDmast'){
    res_table = 'transaksi_monitoring_spdmast'
  }else{
    res_table = ''
  }


  
  var sql_query = "CALL GET_LAPORAN_DETAIL_TRIGGER_TOKO('"+IN_NIK+"','"+IN_SUB_ID+"','"+res_table+"');"
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
  GET_Monitoring_Detail_Trigger_Toko,
  GET_Monitoring_Header_Trigger_Toko
}
