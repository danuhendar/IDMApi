var mysqlLib = require('../../connection/mysql_connection');
var gs = require('../../controller/global_service');

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

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
    res.end();
  }).catch(e => {
    var code = 500;
    console.log(e);
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
    res.end();
  });
}

const UpdRECIDTokomain = (req, res) => {
  console.log("Mengakses API UpdRECIDTokomain pada "+gs.get_datetime())

  var obj = JSON.parse(JSON.stringify(req.body));
  
  //var IN_KODE_CABANG = obj.IN_KODE_CABANG;
  //var IN_KODE_TOKO = obj.IN_KODE_TOKO;
  
  var data = obj.IN_PARAM;
  console.log(data.length);
  for(var a = 0;a<data.length;a++){
    //console.log("========================");
    var arr_station = data[a].station.split(',');
    for(var i = 0;i<arr_station.length;i++){
        var res_station = arr_station[i]; 
        var res_ip = arr_station[i]; 
        var sql_query = "REPLACE INTO tokomain_temp VALUES('"+data[a].toko+"','"+res_station+"',NOW(),'V101');";//"UPDATE tokomain SET recid = '1' WHERE TOKO = '"+data[a].toko+"' AND STATION IN('"+data[a].station.split(",").join("','")+"'"+");"; 
        console.log('sql_query : '+sql_query);
        mysqlLib.executeQuery(sql_query).then((d) => {
          
          //req.end();
        }).catch(e => {
          var code = 500;
          console.log(e);
          var res_msg = gs.create_msg(e.Stack,code,"");
          res.status(code).json(res_msg);
          res.end();
          //req.end();
        });

    }

    //-- execute query UPDATE tokomain --//
  }
  sleep(6000);
  var sql_update_recid = "UPDATE `tokomain` a INNER JOIN `tokomain_temp` b ON a.TOKO=b.TOKO AND a.STATION=b.STATION SET a.RECID='1' WHERE DATE(b.LAST_UPDATE) = CURDATE();";
  mysqlLib.executeQuery(sql_update_recid);

  var code = 200;
  var res_msg = gs.create_msg("Sukses",code,'Proses Recid Station Selesai');
  res.status(code).json(res_msg);
  res.end();
  /*
  var sql_query = "UPDATE tokomain SET recid = '1' WHERE TOKO = '"+IN_KODE_TOKO+"' AND STATION IN("+IN_STATION+");";
  //console.log('sql_query : '+sql_query);
  mysqlLib.executeQuery(sql_query).then((d) => {
    var code = 200;
    var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d));
    res.status(code).json(res_msg);
    res.end();
    //req.end();
  }).catch(e => {
    var code = 500;
    console.log(e);
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
    res.end();
    //req.end();
  });

  */
}

const ResetRECIDAll = (req, res) => {
  console.log("Mengakses API ResetRECIDAll pada "+gs.get_datetime())
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.IN_KODE_CABANG;
  //-- truncate terlebih dahulu tokomain_temp --//
  var sql_query_truncate = "TRUNCATE tokomain_temp;";
  mysqlLib.executeQuery(sql_query_truncate);
  
  //-- reset recid selain is_induk --//
  var sql_query = "UPDATE tokomain SET RECID = '0' WHERE IS_INDUK != '1' AND KDCAB LIKE '"+IN_KODE_CABANG+"%';"; 
  //console.log('sql_query : '+sql_query);
  mysqlLib.executeQuery(sql_query).then((d) => {
      //-- set recid STB = '1'
      var sql_query_stb = "UPDATE tokomain SET RECID = '1' WHERE STATION = 'STB' AND KDCAB LIKE '"+IN_KODE_CABANG+"%';"; 
      mysqlLib.executeQuery(sql_query_stb);
      var code = 200;
      var res_msg = gs.create_msg("Sukses",code,'Proses Reset Recid All');
      res.status(code).json(res_msg);
      res.end();
  }).catch(e => {
    var code = 500;
    console.log(e);
    var res_msg = gs.create_msg(e.Stack,code,"");
    res.status(code).json(res_msg);
    res.end();
    //req.end();
  });

   

}



 
module.exports = {
  InsStatusToko,
  UpdRECIDTokomain,
  ResetRECIDAll
}
