var mysqlLib = require('../connection/mysql_connection');
var gs = require('../controller/global_service');
var redislib = require('../connection/redis_connection');

const GET_Tokomain = (req, res) => {
  console.log("Mengakses API GET_Tokomain pada "+gs.get_datetime())
  var obj = JSON.parse(JSON.stringify(req.body));
  var IN_KODE_CABANG = obj.IN_KODE_CABANG
  var IN_STATION = obj.IN_STATION
  var IN_KODE_TOKO = obj.IN_KODE_TOKO
  var IN_TOKEN = obj.IN_TOKEN

  var res_station = "";
  if(IN_STATION == ''){
    res_station = "ALL";
  }else{
    res_station = IN_STATION;
  }

  var res_cabang = "";
  if(IN_KODE_CABANG == ''){
    res_cabang = "ALL";
  }else{
    res_cabang = IN_KODE_CABANG;
  }

  var res_toko = "";
  if(IN_KODE_TOKO == ''){
    res_toko = "ALL";
  }else{
    res_toko = IN_KODE_TOKO;
  }



  const redisKey = 'get_tokomain_'+res_cabang+"_"+res_toko+"_"+res_station;
  var isExists = false;
  redislib.isExists_Key(redisKey).then((d)=>{
      isExists = d;
      console.log('isExists : '+isExists);
      if(isExists == true){
          var data = '';
          redislib.getKey_REDIS(redisKey).then((e) =>{
              data = e;
              console.log("data exists");
              var code = 200;
              var res_msg = gs.create_msg("Sukses Cache",code,data);
              res.status(code).json(res_msg);
              res.end();
          });
         
      }else{
        console.log("data didn't exists");
        mysqlLib.executeQuery("select c.KDCAB,c.TOKO,c.NAMA,c.STATION,c.IP,IS_INDUK,d.USER,d.PASSWORD from tokomain c INNER JOIN (SELECT a.USER,GROUP_CONCAT(a.PASS SEPARATOR '|') AS PASSWORD FROM m_pass_sql a WHERE DB LIKE 'pos%' AND IS_AKTIF = '1') d where c.KDCAB LIKE '"+IN_KODE_CABANG+"%' AND c.TOKO LIKE '"+IN_KODE_TOKO+"%' AND c.STATION LIKE '"+IN_STATION+"%' ").then((d) => {
          redislib.setKey_REDIS(redisKey,JSON.stringify(d),7200);
          //client.set(redisKey,JSON.stringify(d),'EX',7200); // simpan hasil query ke dalam redis dalam bentuk JSON yang sudah di jadikan string, kita setting expired selaman 60 (detik)
          var code = 200;
          var res_msg = gs.create_msg("Sukses",code,JSON.stringify(d));
          res.status(code).json(res_msg);
        }).catch(e => {
          var code = 500;
          console.log(e);
          var res_msg = gs.create_msg(e.Stack,code,"");
          res.status(code).json(res_msg);
          res.end();
        });
      }
  });
  
  /*
  client.get(redisKey,(err,data) => {
      if(data != null){// cek apakah ada di redis atau tidak 
          console.log("data exists");
          var code = 200;
          var res_msg = gs.create_msg("Sukses Cache",code,data);
          res.status(code).json(res_msg);
      }else{
          console.log("data didn't exists");
          mysqlLib.executeQuery("select c.KDCAB,c.TOKO,c.NAMA,c.STATION,c.IP,IS_INDUK,d.USER,d.PASSWORD from tokomain c INNER JOIN (SELECT a.USER,GROUP_CONCAT(a.PASS SEPARATOR '|') AS PASSWORD FROM m_pass_sql a WHERE DB LIKE 'pos%' AND IS_AKTIF = '1') d where c.KDCAB LIKE '"+IN_KODE_CABANG+"%' AND c.TOKO LIKE '"+IN_KODE_TOKO+"%' AND c.STATION LIKE '"+IN_STATION+"%' ").then((d) => {
            
            client.set(redisKey,JSON.stringify(d),'EX',7200); // simpan hasil query ke dalam redis dalam bentuk JSON yang sudah di jadikan string, kita setting expired selaman 60 (detik)
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
  });
  */
  
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
