var mqtt              = require('mqtt');
const {gzip, ungzip}  = require('node-gzip');
var mysqlLib = require('../connection/mysql_connection');
var redislib = require('../connection/redis_connection');

const config = require('../config.json');
var rconfig = JSON.stringify(config);
let student = JSON.parse(rconfig);

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

var client  = mqtt.connect("mqtt://172.24.16.131",{clientId:"GlobalIDMAPI_Lokal",clean:true,port:1883,keepalive:60,reconnectPeriod:1000,retain:false,qos:0});

client.on("connect", function(){  
  console.log("connected MQTT");  
});

client.on("error",function(error){
  console.log("Can't connect MQTT Broker : " + error);
  process.exit(1)
});

var expired_key = config.redis.EXPIRED_KEY;
console.log('expired_key : '+expired_key);

function Unsub(res_topic,res_second_unsub){
  return new Promise((resolve, reject) => {
    try{
       //var res_second_unsub = 120000;
       console.log('res_second_unsub :'+res_second_unsub);
       sleep(res_second_unsub)
       client.unsubscribe(res_topic);
       console.log("UNSUB : "+res_topic);
       resolve();
    }
    catch(ex){
      reject(ex)
    }
  })
}

function PublishMessage (res_topic,res_message,is_return,task,kode_cabang,ip_listener,is_dokumentasi,in_waktu_unsub) {
  //console.log(`query: `, query)
  return new Promise((resolve, reject) => {
    try{
        if (client.connected === true) {
            console.log('Still Connected'); 
           
            //-- SUBS TOPIC --//
            var topic_sub = '';
            if(task == 'PUB_INITIAL'){
                topic_sub = 'INITIAL/'+kode_cabang+'/'+ip_listener+'/';
            }else{
                topic_sub = res_topic+"#";
            }
            //const topic_sub = res_topic+"#";
            if(is_dokumentasi == true){
                client.subscribe(topic_sub,{qos:0});
                console.log("SUBSCRIBE TOPIC : "+topic_sub);

                  client.on('message',async function(topic, compressed){
                    if(topic.toString().includes("BYLINE/")){

                    }else{
                      var  decompressed = '';
                      try{
                         decompressed = await ungzip(compressed);
                         //console.log('Message decompressed');
                      }catch(ex){
                         decompressed = compressed;
                         //console.log('Message it doesnt decompressed');
                      }
                      
                      const parseJson = JSON.parse(decompressed);
                      //console.log("PESAN : "+decompressed);
                      // console.log("TOPIC : "+topic)
                      // console.log("HASIL : "+parseJson.HASIL)
                      // console.log("SOURCE : "+parseJson.SOURCE)
                      
                      
                      const source = parseJson.SOURCE;


                      if(source == 'IDMCommandListeners'){
                        const id = parseJson.ID;
                        const subid = parseJson.SUB_ID;
                        const task = parseJson.TASK;
                        const kode_cabang = parseJson.CABANG;
                        const ip_address = parseJson.IP_ADDRESS;
                        const hasil = parseJson.HASIL;
                        const to = parseJson.TO;
                        const versi = parseJson.VERSI;
                        const station = parseJson.STATION;
                        const tanggal_jam = parseJson.TANGGAL_JAM;
                        const command = parseJson.COMMAND;
                        const summary_hasil = {
                                                "ID":id,
                                                "SUBID":subid,
                                                "TASK":task,
                                                "SOURCE":source,
                                                "KODE_CABANG":kode_cabang,
                                                "IP_ADDRESS":ip_address,
                                                "HASIL":hasil,
                                                "TO":to,
                                                "VERSI":versi,
                                                "STATION":station,
                                                "TANGGAL_JAM":tanggal_jam,
                                                "CMD":command
                                              };
                          DokumentasiHasil(kode_cabang,ip_address,hasil,to,versi,command);
                          const arr_return = [summary_hasil];
                          
                          if(is_return === true){
                              resolve(arr_return)
                          }else{
                              resolve()
                          }
                          //-- menunggu 10 detik sebelum melaukan unsubscribe --//
                          //-- diberi batas 10 detik untuk mendapatkan respon listener --//
                          //-- 10 detik lewat unsub dan anggap listener tidak merespon atas request yang diberikan --//
                          
                          //var res_second_unsub = parseFloat(in_waktu_unsub);
                          //console.log('res_second_unsub :'+res_second_unsub);
                          sleep(4000)
                          client.unsubscribe(topic_sub);
                          console.log("UNSUB : "+topic_sub);
                          
                      }else{
                         
                      }
                    }
                    
                });
            }else{
              console.log("NO SUB : "+res_topic);
            }  
            

            //console.log("PAYLOAD TO IDMCommandListeners : "+res_message);
            const compressed = res_message;
            //const compressed = await gzip(res_message);  
            //-- PUBLISH KE TOPIC --//
            client.publish(res_topic,compressed);
            console.log("Publish : "+res_topic);
        }else{
            console.log('DisConnected'); 
        }
    }
    catch(ex){
      reject(ex)
    }
  })
}

async function DokumentasiHasil(kode_cabang,ip_address,hasil,to,versi,command){

    return new Promise((resolve, reject) => {
      try{

          if(to == 'ServiceMemoryInfo'){
              if(hasil == ''){
                resolve()
              }else{
                //console.log('hasil : '+hasil);
                var res_hasil = hasil.toString().split(', ~')[1];
                var memory_installed = res_hasil.toString().split('~')[0];
                var memory_physical = res_hasil.toString().split('~')[1];
                var memory_usage = res_hasil.toString().split('~')[2];
                var memory_free = res_hasil.toString().split('~')[3];
                var arsitektur = res_hasil.toString().split('~')[4];
                var os = res_hasil.toString().split('~')[5];

                var sql = "REPLACE INTO transaksi_summary_memory_toko_baru VALUES('"+ip_address.trim()+"','"+memory_installed.trim()+"','"+memory_physical.trim()+"','"+memory_usage.trim()+"','"+memory_free.trim()+"','"+arsitektur.trim()+"','"+os.trim()+"',NOW(),'"+versi+"')";
                //console.log('sql_dokumentasi :'+sql)
                mysqlLib.executeQuery(sql);
                console.log('DOKUMENTASI DARI : '+ip_address+" untuk : "+to);
                resolve()
              }
          }else if(to == 'ServicePhysicalDisk'){
              var res_hasil = hasil.replace('"DeviceId","Model","MediaType","BusType"','').trim();
              var device_id = res_hasil.split(',')[0].split('"').join('');
              var model = res_hasil.split(',')[1].split('"').join('');
              var mediaType = res_hasil.split(',')[2].split('"').join('');
              var busType = res_hasil.split(',')[3].split('"').join('');
              
              var sql = "REPLACE INTO transaksi_storage_info VALUES('"+ip_address.trim()+"','"+device_id+"','"+model+"','"+mediaType+"','"+busType+"','[]',NOW(),'"+versi+"')";
              //console.log('sql_dokumentasi :'+sql)
              mysqlLib.executeQuery(sql);
              console.log('DOKUMENTASI DARI : '+ip_address+" untuk : "+to);
              resolve()
          }else if(to == 'ServiceBootTime'){
              var res_hasil = hasil.split('{').join('').split('}').join('');
              var rep1 = res_hasil.split('                                           ').join('').split('                    ').join('').split('           ').join('');
              
              var rep3 = rep1.split('\r\n').join('%');
              //console.log("DATA BOOT TIME : "+rep3);
              
              const arr_concat = [];
              var summary_boot_time = 0;
              var sp_record = rep3.split('%');
              for(var i = 1;i<sp_record.length;i++){
                var sp_field = sp_record[i].split(',');
                var data_boot_time = parseFloat(sp_field[0]);
                //console.log('data_boot_time : '+data_boot_time);
                var data_boot_finished = sp_field[1].trim();
                //console.log('data_boot_finished : '+data_boot_finished);
                const arr_detail = [data_boot_time,data_boot_finished];
                arr_concat.push(arr_detail);
                summary_boot_time = parseFloat(summary_boot_time)+parseFloat(data_boot_time);
                //console.log('summary_boot_time : '+summary_boot_time);
              }

              var detail_boot_time = JSON.stringify(arr_concat);
              //console.log(summary_boot_time+" / "+parseFloat(sp_record.length));

              var average_boot_time = summary_boot_time / parseFloat(sp_record.length);
              var sql = "REPLACE INTO transaksi_summary_boot_time_baru VALUES('"+ip_address.trim()+"','"+parseFloat(average_boot_time).toFixed(2)+"','"+detail_boot_time+"','"+versi+"',NOW())";
              //console.log('sql_dokumentasi :'+sql)
              mysqlLib.executeQuery(sql);
              console.log('DOKUMENTASI DARI : '+ip_address+" untuk : "+to);
              resolve()
          }
          /*
          else if(to == 'ServiceInitial'){
              var sql = "REPLACE INTO transaksi_initial_listener VALUES('"+ip_address.trim()+"','"+to+"','"+hasil+"','"+versi+"',NOW())";
              //console.log('sql_dokumentasi :'+sql)
              mysqlLib.executeQuery(sql);
              console.log('DOKUMENTASI DARI : '+ip_address+" untuk : "+to);
              resolve()
          
          }
          */
          else if(to == 'ServiceDownloadListener'){
              //var sql = "REPLACE INTO transaksi_update_listeners VALUES(NULL,'"+ip_address.trim()+"','"+to+"','"+hasil+"','"+versi+"',NOW())";
              //console.log('sql_dokumentasi :'+sql)
              //mysqlLib.executeQuery(sql);
              var key_redis = '';
              if(command.includes('wget')){
                  key_redis = "DOWNLOAD_"+ip_address;
              }else if(command.includes('dir')){
                  key_redis = "CEKSIZE_"+ip_address;
              }else if(command.includes('cd\\Windows\\System32\\')){
                  key_redis = "UPDATE_"+ip_address;
              }else if(command.includes('type C:\\IDMCommandListeners\\version.txt')){
                  key_redis = "CEKVERSI_"+ip_address;
              }else if(command.includes('sc query IDMCommandSpy')){
                  key_redis = "CEKSPY_"+ip_address;
              }else{
                  console.log('COMMAND TIDAK DIKETAHUI : '+command);
              }
              
              redislib.setKey_REDIS(key_redis,hasil,parseFloat(expired_key));
              console.log('DOKUMENTASI DARI : '+ip_address+" untuk : "+to);
              resolve()
          }
          /*
          else if(to == 'ServiceProgramInstalled'){
            var res_hasil = hasil.replace('"DisplayName","DisplayVersion"','').trim();
            //console.log('res_hasil : '+res_hasil);
            var sp_res_hasil = res_hasil.split('\r\n');
            var arr_program = [];
            for(var a = 0;a<sp_res_hasil.length;a++){
                //console.log('Row Program : '+sp_res_hasil.length);
                var DisplayName = "";
                var DisplayVersion = "";
                try{
                 
                  DisplayName = sp_res_hasil[a].split(',')[0].split('"').join('');
                  DisplayVersion = sp_res_hasil[a].split(',')[1].split('"').join('');

                }catch(Ex){

                }
               
                if(DisplayName == '' || DisplayVersion == ''){

                }else if(DisplayName == 'null' || DisplayVersion == 'null'){

                }else{
                  arr_program[a] = [DisplayName,DisplayVersion];
                }
              
            }

            //var arr_concat = [arr_program];

            var sql = "REPLACE INTO transaksi_program_installed_copy VALUES('"+ip_address.trim()+"','"+JSON.stringify(arr_program).split('null,null,').join('')+"',NOW(),'IDMApiV101')";
            //console.log(sql);
            mysqlLib.executeQuery(sql);
            console.log('DOKUMENTASI DARI : '+ip_address+" untuk : "+to);
          }
          */
          else{
              console.log('res_hasil :'+hasil)
              console.log('TIDAK MELAKUKAN DOKUMENTASI PADA : '+to)
          }
      }
      catch(ex){
        ex.Stack
        reject(ex)
      }
  })  

}

/*
function SubsTopic (res_topic) {
  //console.log(`query: `, query)
    return new Promise((resolve, reject) => {
      try{
          if (client.connected === true) {
              console.log('Still Connected'); 
              //console.log("PAYLOAD TO IDMCommandListeners : "+res_message);
              client.subscribe(res_topic,{qos:0});
              console.log("SUBSCRIBE TOPIC : "+res_topic);

              client.on('message',async function(topic, compressed){
                if(topic.toString().includes("BYLINE/")){

                }else{
                  var  decompressed = '';
                  try{
                     decompressed = await ungzip(compressed);
                     console.log('kondisi 1');
                  }catch(ex){
                     decompressed = compressed;
                     console.log('kondisi 2');
                  }
                  
                  const parseJson = JSON.parse(decompressed);
                  console.log("PESAN : "+decompressed);
                  console.log("TOPIC : "+topic)
                  console.log("HASIL : "+parseJson.HASIL)
                  console.log("SOURCE : "+parseJson.SOURCE)
                  const source = parseJson.SOURCE;
                  const kode_cabang = parseJson.KDCAB;
                  const ip_address = parseJson.IP_ADDRESS;
                  const hasil = parseJson.HASIL;
                  const to = parseJson.TO;
                  const versi = parseJson.VERSI;
                  
                  if(source == 'IDMCommandListeners'){
                      DokumentasiHasil(kode_cabang,ip_address,hasil,to,versi);
                  }else{

                  }
                  resolve(parseJson)
                  
                  //-- menunggu 10 detik sebelum melaukan unsubscribe --//
                  //-- diberi batas 10 detik untuk mendapatkan respon listener --//
                  //-- 10 detik lewat unsub dan anggap listener tidak merespon atas request yang diberikan --//
                  sleep(10000)
                  client.unsubscribe(topic);
                  console.log("UNSUB : "+topic);
                }
                
              });
          }else{
              console.log('DisConnected'); 
              resolve('DisConnected')
          }
         
      }
      catch(ex){
        ex.Stack
        reject(ex)
      }
  })  
}
*/






module.exports.PublishMessage = PublishMessage
module.exports.Unsub = Unsub
//module.exports.SubsTopic = SubsTopic
