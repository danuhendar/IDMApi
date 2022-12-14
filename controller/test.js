const redis = require('redis')
var mysqlLib = require('../connection/mysql_connection');
var gs = require('../controller/global_service');

const client = redis.createClient(6379, "172.24.52.3");

client.on('connect', function() {
  console.log('✅ 💃 connect redis success !')
});


client.on("error", function (err) {
  console.log("" + err);
});

client.on("ready", () => {
  console.log('✅ 💃 redis have ready !')
});

const getIpMysql = (req, res) => {
    console.log("Mengakses API getIPMysql pada "+gs.get_datetime())
    var obj = JSON.parse(JSON.stringify(req.body));
    var IN_KODE_CABANG = obj.IN_KODE_CABANG;
    var query = "SELECT KDCAB,TOKO,NAMA,IP,STATION FROM tokomain WHERE KDCAB = '"+IN_KODE_CABANG+"' ";
    console.log(query);
    mysqlLib.executeQuery(query).then((d) => {
      var code = 200;
      var res_msg = gs.create_msg("Sukses",code,d);
      res.status(code).json(res_msg);
    }).catch(e => {c
      var code = 500;
      console.log(e);
      var res_msg = gs.create_msg(e.Stack,code,"");
      res.status(code).json(res_msg);
    });
  }

  const getIPRedis = (req,res) => {

    console.log("Mengakses API getIPRedis pada "+gs.get_datetime())
    var obj = JSON.parse(JSON.stringify(req.body));
    var IN_KODE_CABANG = obj.IN_KODE_CABANG

    const redisKey = 'getip'
    client.get(redisKey,(err,data) => {
        //console.log(data)
        if(data != null){// cek apakah ada di redis atau tidak
            
            console.log("data exists");
            var code = 200;

            //var res_msg = gs.create_msg("Sukses",code,JSON.parse(data));
            res.status(code).send({isCached:true,data:JSON.parse(data)});

            //res.status(200).send({isCached:true,data:JSON.parse(data)});
        }else{
            console.log("data didn't exists");
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
  
