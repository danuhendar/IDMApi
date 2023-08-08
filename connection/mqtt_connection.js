var mqtt              = require('mqtt');
const {gzip, ungzip}  = require('node-gzip');
 
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



function PublishMessage (res_topic,res_message) {
  //console.log(`query: `, query)
  return new Promise((resolve, reject) => {
    try{
        if (client.connected === true) {
            console.log('Still Connected'); 
            //console.log("PAYLOAD TO IDMCommandListeners : "+res_message);
            const compressed = res_message;
            //const compressed = await gzip(res_message);  
            client.publish(res_topic,compressed);
            console.log("Publish : "+res_topic);   

        }else{
            console.log('DisConnected'); 
        }
        resolve()
        
    }
    catch(ex){
      reject(ex)
    }
  })  
}

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
                  const source = parseJson.SOURCE;
                  const kode_cabang = parseJson.KDCAB;
                  const ip_address = parseJson.IP_ADDRESS;
                  const hasil = parseJson.HASIL;
                  const from = parseJson.FROM;
                  if(source == 'IDMCommandListeners'){
                      DokumentasiHasil(kode_cabang,ip_address,hasil,from);
                  }else{

                  }
                  
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
          }
          resolve()
      }
      catch(ex){
        ex.Stack
        reject(ex)
      }
  })  
}

function DokumentasiHasil(kode_cabang,ip_address,hasil,from){

    return new Promise((resolve, reject) => {
      try{
          
          
          resolve()
      }
      catch(ex){
        ex.Stack
        reject(ex)
      }
  })  

}





module.exports.PublishMessage = PublishMessage
module.exports.SubsTopic = SubsTopic
