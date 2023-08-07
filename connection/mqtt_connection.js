var mqtt              = require('mqtt');
const {gzip, ungzip}  = require('node-gzip');
 

var client  = mqtt.connect("mqtt://172.24.16.131",{clientId:"GlobalIDMAPI_Lokal",clean:true,port:1883,keepalive:60,reconnectPeriod:1000,retain:false,qos:0});
// module.exports.connect = function (cb) {
//   return new Promise((resolve, reject) => {
//     // pool.on('connection', function (connection) {
//     //   connection.on('error', function (err) {
//     //     console.log('MySQL error event', err)
//     //   });
//     //   connection.on('close', function (err) {
//     //     console.log('MySQL close event', err)
//     //   });
//     // });
   

//     resolve()
//   })
// }

client.on("connect", function(){  
  console.log("connected MQTT");  
});

client.on("error",function(error){
  console.log("Can't connect MQTT Broker : " + error);
  process.exit(1)
});





const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

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

            client.on('message',function(topic, compressed){
              const decompressed = compressed;

              //const parseJson = JSON.parse(decompressed);
              console.log("TOPIC FROM : "+topic)
              console.log("PESAN : "+decompressed)
              sleep(10000)
              client.unsubscribe(topic);
              console.log("UNSUB : "+topic);
          });

            
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





module.exports.PublishMessage = PublishMessage
module.exports.SubsTopic = SubsTopic
