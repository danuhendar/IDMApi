const redis = require('redis')
var mysqlLib = require('../connection/mysql_connection');
var mqttLib = require('../connection/mqtt_connection');
var gs = require('../controller/global_service');
const {NodeSSH} = require('node-ssh')
const ssh = new NodeSSH()

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

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
      res.end();
    }).catch(e => {c
      var code = 500;
      console.log(e);
      var res_msg = gs.create_msg(e.Stack,code,"");
      res.status(code).json(res_msg);
      res.end();
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
            res.end();

            //res.status(200).send({isCached:true,data:JSON.parse(data)});
        }else{
            console.log("data didn't exists");
            mysqlLib.executeQuery("SELECT KDCAB,TOKO,NAMA,IP,STATION FROM tokomain WHERE KDCAB = '"+IN_KODE_CABANG+"' ").then((d) => {
                client.set(redisKey,JSON.stringify(d),'EX',60); // simpan hasil query ke dalam redis dalam bentuk JSON yang sudah di jadikan string, kita setting expired selaman 60 (detik)
                var code = 200;
                var res_msg = gs.create_msg("Sukses",code,d);
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
   var location = '';
   var command = '';
   var task = "PUB_INITIAL";
   var service = 'ServiceInitial';
   var is_return = false;
   var is_dokumentasi = true;

   console.log("Trigger Listeners : "+ip_listener);
   try{

      var res_message = {
            "TASK": task,
            "ID": gs.get_id(),
            "SOURCE": "IDMApi",
            "COMMAND": "C:\\IDMCommandListeners\\IDMCommandSpyService.exe",
            "OTP": "-",
            "TANGGAL_JAM": gs.get_tanggal_jam("1"),
            "VERSI": "1.0.1",
            "HASIL": "",
            "FROM": service,
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
      //console.log("res_message : "+JSON.stringify(res_message))
      //console.log("topic_return : "+topic_return)
      
      mqttLib.PublishMessage(topic_return,JSON.stringify(res_message),is_return,task,kode_cabang_user,ip_listener,is_dokumentasi,7000);
      var code = 200;
      var res_msg = gs.create_msg("Sukses Trigger Listener : "+ip_listener,code,'');
      res.status(code).json(res_msg);
      res.end();
  }catch(e){
      var code = 500;
      console.log(e.toString());
      res.status(code).send("Error : "+e.toString());
      res.end();
  }
}

const UpdateCabangIni = (req,res) => {
   var kode_cabang = req.params.kode_cabang;
   var list_kode_cabang = "G001,G004,G005,G009,G259,G020,G025,G026,G027,G028,G029,G030,G033,G034,G049,G050,G080,G089,G092,G244,G105,G107,G113,G116,G117,G137,G143,G146,G148,G149,G156,G157,G158,G165,G174,G177,G224,G232,G234,G301,G236,G237,G305,G801,G241,G242,G244,G245,G260,G097";
   var ip_listener = req.params.ip_listener;
   var location = '';
   var command = '';
   var task = "COMMAND";
   var service = 'ServiceCabangIni';
   var is_return = false;
   var is_dokumentasi = true;

   console.log("Perbaikan Cabang ini ke : "+ip_listener);
   try{
      var command = "taskkill /F /IM IDMCommandListenersApp.exe*\n"+
                    "taskkill /F /IM IDMCommandSpy.exe*\n"+
                      "tskill idmcom*\n"+
                      "C:\n"+
                      "cd\\IDMCommandListeners\n"+
                      "del cabang.ini /S\n"+
                      "echo "+kode_cabang+" > cabang.ini\n"+
                      "sc start IDMCommandSpy\n"+
                      "start IDMCommandListenersApp.exe\n"+
                      "exit;";
      //console.log("command : "+command);
      var res_message = {
            "TASK": "COMMAND",
            "ID": gs.get_id(),
            "SOURCE": "IDMApi",
            "COMMAND": command,
            "OTP": "-",
            "TANGGAL_JAM": gs.get_tanggal_jam("1"),
            "VERSI": "1.0.1",
            "HASIL": "",
            "FROM": service,
            "TO": ip_listener,
            "SN_HDD": "-",
            "IP_ADDRESS": "172.24.52.3",
            "STATION": "-",
            "CABANG": list_kode_cabang,
            "FILE": "-",
            "NAMA_FILE": "-",
            "CHAT_MESSAGE": "-",
            "REMOTE_PATH": "-",
            "LOCAL_PATH": "-",
            "SUB_ID": gs.get_subid()
      };
      var topic_return = "COMMAND/"+ip_listener+"/";
      //console.log("res_message : "+JSON.stringify(res_message))
      //console.log("topic_return : "+topic_return)
      
      mqttLib.PublishMessage(topic_return,JSON.stringify(res_message),is_return,task,kode_cabang,ip_listener,is_dokumentasi,7000).then((d) => {
        var code = 200;
        var res_msg = gs.create_msg("Sukses Eksekusi Cabang ini",code,d);
        res.status(code).json(res_msg);
        res.end();
      }).catch(e => {
        var code = 500;
        console.log(e);
        var res_msg = gs.create_msg(e.Stack,code,"");
        res.status(code).json(res_msg);
        res.end();
      });
  }catch(e){
      var code = 500;
      console.log(e.toString());
      res.status(code).send("Error : "+e.toString());
      res.end();
  }
}

const PublishBackend = (req,res) => {
    var obj = JSON.parse(JSON.stringify(req.body));
    var kode_cabang = obj.kode_cabang;
    //var list_kode_cabang = "G001,G004,G005,G009,G259,G020,G025,G026,G027,G028,G029,G030,G033,G034,G049,G050,G080,G089,G092,G244,G105,G107,G113,G116,G117,G137,G143,G146,G148,G149,G156,G157,G158,G165,G174,G177,G224,G232,G234,G301,G236,G237,G305,G801,G241,G242,G244,G245,G260,G097";
    var ip_listener = obj.ip_listener;
    var location = obj.location;
    var command = obj.command;
    var task = obj.task;
    var service = obj.service;
    var is_return = obj.is_return
    //console.log('service dari : '+service)
    var is_dokumentasi = false;
    if(service != 'ServiceProgramInstalled'){
        is_dokumentasi = true;
    }else{
        is_dokumentasi = false;
    }

    try{
        //console.log("command : "+command);
        var topic_return = "";
        if(task === 'COMMAND'){
          console.log('kondisi 1')
          if(ip_listener == kode_cabang){
               console.log('kondisi 1.1')                
               //var query_list_ip = "SELECT STATION FROM tokomain WHERE KDCAB = '"+kode_cabang+"' AND STATION NOT IN('','STB') AND RECID = 1 GROUP BY STATION ORDER BY STATION ASC LIMIT 0,1;"
               //console.log('query_list_ip : '+query_list_ip)
               var query_list_ip = "SELECT IP FROM tokomain WHERE KDCAB = '"+kode_cabang+"' AND STATION NOT IN('','STB') AND RECID = 1;"
               mysqlLib.executeQuery(query_list_ip).then(async(d) => {
                  console.log('JUMLAH STATION di Cabang :'+kode_cabang+' :'+d.length)
                  for(var p =0;p<d.length;p++){
                    await sleep(500)
                    var res_message = {
                        "TASK": task,
                        "ID": gs.get_id(),
                        "SOURCE": "IDMApi",
                        "COMMAND": command,
                        "OTP": "-",
                        "TANGGAL_JAM": gs.get_tanggal_jam("1"),
                        "VERSI": "1.0.1",
                        "HASIL": "",
                        "FROM": service,
                        "TO": d[p].IP,
                        //"TO": d[p].STATION,
                        "SN_HDD": "-",
                        "IP_ADDRESS": "172.24.52.3",
                        "STATION": "-",
                        "CABANG": kode_cabang,
                        "FILE": "-",
                        "NAMA_FILE": "-",
                        "CHAT_MESSAGE": "-",
                        "REMOTE_PATH": "-",
                        "LOCAL_PATH": "-",
                        "SUB_ID": gs.get_subid()
                    };
                    //topic_return = kode_cabang+"/"+d[p].STATION+"/";
                    topic_return = "COMMAND/"+d[p].IP+"/";
                    console.log('topic_return :'+topic_return)
                    mqttLib.PublishMessage(topic_return,JSON.stringify(res_message),is_return,task,kode_cabang,d[p].STATION,is_dokumentasi,120000);
                    //mqttLib.Unsub(topic_return+"#",120000);
                  }
                  //mqttLib.Unsub(topic_return+"#",120000);
              });
             
              //console.log("UNSUB : "+topic_sub);
          }else{
              console.log('kondisi 1.2')
              var res_message = {
                    "TASK": task,
                    "ID": gs.get_id(),
                    "SOURCE": "IDMApi",
                    "COMMAND": command,
                    "OTP": "-",
                    "TANGGAL_JAM": gs.get_tanggal_jam("1"),
                    "VERSI": "1.0.1",
                    "HASIL": "",
                    "FROM": service,
                    "TO": ip_listener,
                    "SN_HDD": "-",
                    "IP_ADDRESS": "172.24.52.3",
                    "STATION": "-",
                    "CABANG": kode_cabang,
                    "FILE": "-",
                    "NAMA_FILE": "-",
                    "CHAT_MESSAGE": "-",
                    "REMOTE_PATH": "-",
                    "LOCAL_PATH": "-",
                    "SUB_ID": gs.get_subid()
              };
              topic_return = "COMMAND/"+ip_listener+"/";    
              mqttLib.PublishMessage(topic_return,JSON.stringify(res_message),is_return,task,kode_cabang,ip_listener,is_dokumentasi,7000);
          }
          
        }else{
          console.log('kondisi 2')
          var res_message = {
                    "TASK": task,
                    "ID": gs.get_id(),
                    "SOURCE": "IDMApi",
                    "COMMAND": command,
                    "OTP": "-",
                    "TANGGAL_JAM": gs.get_tanggal_jam("1"),
                    "VERSI": "1.0.1",
                    "HASIL": "",
                    "FROM": service,
                    "TO": ip_listener,
                    "SN_HDD": "-",
                    "IP_ADDRESS": "172.24.52.3",
                    "STATION": "-",
                    "CABANG": kode_cabang,
                    "FILE": "-",
                    "NAMA_FILE": "-",
                    "CHAT_MESSAGE": "-",
                    "REMOTE_PATH": "-",
                    "LOCAL_PATH": "-",
                    "SUB_ID": gs.get_subid()
          };
          topic_return = ""+ip_listener+"/";
          mqttLib.PublishMessage(topic_return,JSON.stringify(res_message),is_return,task,kode_cabang,ip_listener,is_dokumentasi,7000);
        }
        
        //mqttLib.SubsTopic(topic_return+"#");
        //console.log("res_message : "+JSON.stringify(res_message))
        //console.log("topic_return : "+topic_return)
        
       
        var code = 200;
        var res_msg = gs.create_msg("Sukses Eksekusi PublishBackend",code,'');
        res.status(code).json(res_msg);
        res.end();
    }catch(e){
        var code = 500;
        console.log(e.toString());
        res.status(code).send("Error : "+e.toString());
        res.end();
    }
}

const DownloadListener = (req,res) => {
    var kode_cabang = obj.kode_cabang;
    //var list_kode_cabang = "G001,G004,G005,G009,G259,G020,G025,G026,G027,G028,G029,G030,G033,G034,G049,G050,G080,G089,G092,G244,G105,G107,G113,G116,G117,G137,G143,G146,G148,G149,G156,G157,G158,G165,G174,G177,G224,G232,G234,G301,G236,G237,G305,G801,G241,G242,G244,G245,G260,G097";
    var ip_listener = obj.ip_listener;
    var location = obj.location;
    var command = obj.command;
    var task = obj.task;
    var service = obj.service;
    var is_return = obj.is_return

   var username_ftp = '';
   var pass_ftp = '';
   var ip_ftp = '';
   var port_ftp = '';
   var path_ftp = '';
   var query_ftp = "SELECT * FROM m_ftp_cabang WHERE KDCAB = '"+location+"';"
   mysqlLib.executeQuery(query_ftp).then((d) => {
       
       username_ftp = d[0].USERNAME;
       ip_ftp = d[0].HOST;
       pass_ftp = d[0].PASSWORD;
       port_ftp = d[0].PORT;
       if(location == 'REG4'){
          path_ftp = 'DHR/IDMCMD/TESTING/'
       }else{
          path_ftp = 'IDMCMD/'
       }

      console.log("Download Listener ke : "+ip_listener);
      try{
          /*
          var command = "D:\\Backoff\\wget -P d:/ --user="+username_ftp+" --password="+pass_ftp+" --limit-rate=100K ftp://"+ip_ftp+":"+port_ftp+"/"+path_ftp+"IDMCommandListenersV421RC1-FILEUPDATE.zip -N \n"+
                        "exit";
          */
          console.log("command : "+command);
          var res_message = {
                "TASK": "COMMAND",
                "ID": gs.get_id(),
                "SOURCE": "IDMApi",
                "COMMAND": command,
                "OTP": "-",
                "TANGGAL_JAM": gs.get_tanggal_jam("1"),
                "VERSI": "1.0.1",
                "HASIL": "",
                "FROM": "IDMApi",
                "TO": ip_listener,
                "SN_HDD": "-",
                "IP_ADDRESS": "172.24.52.3",
                "STATION": "-",
                "CABANG": kode_cabang,
                "FILE": "-",
                "NAMA_FILE": "-",
                "CHAT_MESSAGE": "-",
                "REMOTE_PATH": "-",
                "LOCAL_PATH": "-",
                "SUB_ID": gs.get_subid()
          };
          var topic_return = "COMMAND/"+ip_listener+"/";
          mqttLib.SubsTopic(topic_return+"#");
          //console.log("res_message : "+JSON.stringify(res_message))
          //console.log("topic_return : "+topic_return)
          
          mqttLib.PublishMessage(topic_return,JSON.stringify(res_message)).then((d) => {
            var code = 200;
            var res_msg = gs.create_msg("Sukses Eksekusi DownloadListener",code,d);
            res.status(code).json(res_msg);
            res.end();
          }).catch(e => {
            var code = 500;
            console.log(e);
            var res_msg = gs.create_msg(e.Stack,code,"");
            res.status(code).json(res_msg);
            res.end();
          });


      }catch(e){
          var code = 500;
          console.log(e.toString());
          res.status(code).send("Error : "+e.toString());
          res.end();
      }
     
  }).catch(e => {c
      var code = 500;
      console.log(e);
      var res_msg = gs.create_msg(e.Stack,code,"");
      res.end();
     
  });
}





module.exports = {
    ServiceBackend,
    TriggerListener,
    UpdateCabangIni,
    DownloadListener,
    PublishBackend
}
  
