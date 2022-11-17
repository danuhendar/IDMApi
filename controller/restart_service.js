var mysqlLib          = require('../connection/mysql_connection');
var gs                = require('../controller/global_service');
var mqtt              = require('mqtt');
const {gzip, ungzip}  = require('node-gzip');
const requestIp       = require('request-ip');


var client  = mqtt.connect("mqtt://172.24.16.131",{clientId:"IDMApi_ListenerBackend",clean:true,port:1883,keepalive:60,reconnectPeriod:1000,retain:false,qos:0});
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

async function pub_1(topic,IN_TASK,IN_ID,IN_SOURCE,IN_OTP,IN_TANGGAL_JAM,IN_VERSI,IN_COMMAND,IN_HASIL,IN_FROM,IN_TO,IN_SN_HDD,IN_IP_ADDRESS,IN_STATION,IN_CABANG,IN_FILE,IN_NAMA_FILE,IN_CHAT_MESSAGE,IN_REMOTE_PATH,IN_LOCAL_PATH,IN_SUB_ID){
    try{

       var res_message = {
            "TASK": IN_TASK,
            "ID": IN_ID,
            "SOURCE": IN_SOURCE,
            "COMMAND": IN_COMMAND,
            "OTP": IN_OTP,
            "TANGGAL_JAM": IN_TANGGAL_JAM,
            "VERSI": IN_VERSI,
            "HASIL": IN_HASIL,
            "FROM": IN_FROM,
            "TO": IN_TO,
            "SN_HDD": IN_SN_HDD,
            "IP_ADDRESS": IN_IP_ADDRESS,
            "STATION": IN_STATION,
            "CABANG": IN_CABANG,
            "FILE": IN_FILE,
            "NAMA_FILE": IN_NAMA_FILE,
            "CHAT_MESSAGE": IN_CHAT_MESSAGE,
            "REMOTE_PATH": IN_REMOTE_PATH,
            "LOCAL_PATH": IN_LOCAL_PATH,
            "SUB_ID": IN_SUB_ID
        };

        console.log(res_message);
        const compressed = await gzip(JSON.stringify(res_message));  
        client.publish(topic,compressed);
        console.log(gs.get_tanggal_jam("1")+" - Publish : "+topic);
        await sleep(1000)
    }catch(exc){
        console.log("ERROR PENGIRIMAN PESAN : "+exc)
    }
}

const GET_Restart = (req, res) => {
  try{
    
    var obj = JSON.parse(JSON.stringify(req.body));
    const PARAM_IN_COMMAND = obj.IN_COMMAND;

    const topic_pub = "LISTENER_BACKEND_523/";
    const IN_TASK = "RESTART_SERVICE";
    const IN_ID = gs.get_id();
    const IN_SOURCE = "IDMCommandApi";
    const IN_OTP = "-";
    const IN_TANGGAL_JAM = gs.get_datetime();
    const IN_VERSI = "1.0.1";
    const IN_COMMAND = PARAM_IN_COMMAND;
    const IN_CABANG = "HO";
    const IN_HASIL = "-";
    const IN_FROM = "HO_2013058359_172.24.52.3_Z6EBV68R_IDMCommandApi";
    const IN_TO = "IDMReporter";
    const IN_SN_HDD = "Z6EBV68R";  
    const IN_IP_ADDRESS = "172.24.52.3";
    const IN_STATION = "-";
    const IN_FILE = "";
    const IN_NAMA_FILE = "-";
    const IN_CHAT_MESSAGE = "-";
    const IN_REMOTE_PATH = "-";
    const IN_LOCAL_PATH = "-";
    const IN_SUB_ID = gs.get_subid();
    pub_1(topic_pub,IN_TASK,IN_ID,IN_SOURCE,IN_OTP,IN_TANGGAL_JAM,IN_VERSI,IN_COMMAND,IN_HASIL,IN_FROM,IN_TO,IN_SN_HDD,IN_IP_ADDRESS,IN_STATION,IN_CABANG,IN_FILE,IN_NAMA_FILE,IN_CHAT_MESSAGE,IN_REMOTE_PATH,IN_LOCAL_PATH,IN_SUB_ID);

    var code = 200;
    var res_msg = gs.create_msg("Sukses",code,"");
    res.status(code).json(res_msg);

  }catch(exc){
    var code = 500;
    var res_msg = gs.create_msg("Gagal : "+exc,code,"");
    res.status(code).json(res_msg);  
  }
   
}

module.exports = {
  GET_Restart
}
