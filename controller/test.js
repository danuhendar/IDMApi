const redis = require('redis')
var mysqlLib = require('../connection/mysql_connection');
var mqttLib = require('../connection/mqtt_connection');
var gs = require('../controller/global_service');
const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()

const client = redis.createClient(6379, "172.24.52.3");
/*
client.on('connect', function() {
  console.log('✅ 💃 connect redis success !')
});


client.on("error", function (err) {
  console.log("" + err);
});

client.on("ready", () => {
  console.log('✅ 💃 redis have ready !')
});
*/

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
    var IN_ID = obj.IN_ID

    const redisKey = 'getip_'+IN_KODE_CABANG+'_'+IN_ID
    client.get(redisKey,(err,data) => {
        //console.log(data)
        if(data != null){// cek apakah ada di redis atau tidak
            
            console.log("data exists");
            var code = 200;

            var res_msg = gs.create_msg("Sukses Cache",code,data);
            res.status(code).json(res_msg);

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

const ServiceBackend = (req,res) => {
  console.log("Mengakses API restart pada "+gs.get_datetime())
  var controll     = req.params.controll
  var nama_service = req.params.nama_service

  console.log("nama_service : "+nama_service);
  // or with inline privateKey
  try{
    ssh.connect({
      host: '172.24.52.3',
      username: 'root',
      password: 'edpho@idm',
      port:22,
      readyTimeout: 200000
    })
    .then(function() {
      // Local, Remote
      // Putting entire directories
      const failed = []
      const successful = []
      // Command
      ssh.execCommand('systemctl '+controll+' '+nama_service, { cwd:'/home/idmcmd/' }).then(function(result) {
        //console.log('STDOUT: ' + result.stdout)
        //console.log('STDERR: ' + result.stderr)
        //console.log('CODE: '+result.code)
        ssh.dispose();
        var code = 200;
        if(controll == 'status'){
           res.status(code).send(result.stdout);
        }else{
           res.status(code).send("Sukses "+controll+" service : "+nama_service);
        }
       
      })
    });
  }catch(e){
      var code = 500;
      res.status(code).send("Error : "+e.Stack);
  }
}

const TriggerListener = (req,res) => {
   var kode_cabang_user = req.params.kode_cabang_user;
   var ip_listener = req.params.ip_listener;

   console.log("Trigger Listeners : "+ip_listener);
   try{

      var res_message = {
            "TASK": "PUB_INITIAL",
            "ID": gs.get_id(),
            "SOURCE": "IDMApi",
            "COMMAND": "C:\\IDMCommandListeners\\IDMCommandSpyService.exe",
            "OTP": "-",
            "TANGGAL_JAM": gs.get_tanggal_jam("1"),
            "VERSI": "1.0.1",
            "HASIL": "",
            "FROM": "IDMApi",
            "TO": ip_listener,
            "SN_HDD": "-",
            "IP_ADDRESS": "172.24.52.3",
            "STATION": "-",
            "CABANG": kode_cabang_user,
            "FILE": "-",
            "NAMA_FILE": "-",
            "CHAT_MESSAGE": "-",
            "REMOTE_PATH": "-",
            "LOCAL_PATH": "-",
            "SUB_ID": gs.get_subid()
      };
      var topic_return = ""+ip_listener+"/";
      console.log("res_message : "+JSON.stringify(res_message))
      console.log("topic_return : "+topic_return)
      
      mqttLib.PublishMessage(topic_return,JSON.stringify(res_message)).then((d) => {
        var code = 200;
        var res_msg = gs.create_msg("Sukses Trigger Listener : "+ip_listener,code,d);
        res.status(code).json(res_msg);
      }).catch(e => {
        var code = 500;
        console.log(e);
        var res_msg = gs.create_msg(e.Stack,code,"");
        res.status(code).json(res_msg);
      });
  }catch(e){
      var code = 500;
      console.log(e.toString());
      res.status(code).send("Error : "+e.toString());
  }
}

module.exports = {
    //getIpMysql,
    //getIPRedis,
    ServiceBackend,
    TriggerListener
}
  
