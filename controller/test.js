const redis = require('redis')
var mysqlLib = require('../connection/mysql_connection');
var gs = require('../controller/global_service');
const client = redis.createClient({
  socket: {
      host: '127.0.0.1',
      port: 6379
  },
  legacyMode: true
});

client.connect();

client.on("error", function (err) {
  console.log("Error " + err);
});

client.on("ready", () => {
  console.log('✅ 💃 redis have ready !')
 })
 
 client.on("connect", () => {
  console.log('✅ 💃 connect redis success !')
 })



const getIpMysql = (req, res) => {
    console.log("Mengakses API getIP pada "+gs.get_datetime())
    var obj = JSON.parse(JSON.stringify(req.body));
    var ÏN_KODE_CABANG = obj.IN_KODE_CABANG;
    var query = "SELECT KDCAB,TOKO,NAMA,IP,STATION FROM tokomain WHERE KDCAB = '"+ÏN_KODE_CABANG+"' ";
    console.log(query);
    mysqlLib.executeQuery(query).then((d) => {
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

  const getIPRedis = (req,res) => {

    console.log("Mengakses API getIP pada "+gs.get_datetime())
    var obj = JSON.parse(JSON.stringify(req.body));
    var IN_KODE_CABANG = obj.IN_KODE_CABANG

    const redisKey = 'getip'
    client.get(redisKey,(err,data) => {
        if(data){// cek apakah ada di redis atau tidak
            res.status(200).send({isCached:true,data:JSON.parse(data)});
        }else{
            mysqlLib.executeQuery("SELECT KDCAB,TOKO,NAMA,IP,STATION FROM tokomain WHERE KDCAB = '"+IN_KODE_CABANG+"' ").then((d) => {
                client.set(redisKey,JSON.stringify(d),'EX',60); // simpan hasil query ke dalam redis dalam bentuk JSON yang sudah di jadikan string, kita setting expired selaman 60 (detik)
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
    });
}

  module.exports = {
    getIpMysql,
    getIPRedis
  }
  
