const redis = require('redis');
const fs = require('fs');
const config = require('../config.json');
var rconfig = JSON.stringify(config);
//console.log('config : '+rconfig);
let student = JSON.parse(rconfig);
var gs = require('../controller/global_service');

const client = redis.createClient(config.redis.PORT_REDIS, config.redis.HOST_REDIS);

client.on('connect', function() {
  console.log('✅ 💃 connect redis success !')
});

client.on("error", function (err) {
  console.log("" + err);
});

client.on("ready", () => {
  console.log('✅ 💃 redis have ready !')
});


function Remove_Key(in_redisKey){
    var res = false;
    return new Promise((resolve, reject) => {
        try{
            client.del(in_redisKey,(err,data) => {
                res = true;
                resolve(res)
            });
        }catch(ex){
            reject(ex)
        }
       
    });
}

function isExists_Key(in_redisKey){
    var res = false;
    return new Promise((resolve, reject) => {
        try{
            client.get(in_redisKey,(err,data) => {
                if(data != null){
                    //-- cek apakah ada di redis atau tidak
                    res = true;
                }else{
                    res = false;
                }
                resolve(res)
            });
        }catch(ex){
            reject(ex)
        }
       
    });
}

function setKey_REDIS(in_redisKey,in_content,in_expired_key){
    //console.log(`query: `, query)
    return new Promise((resolve, reject) => {
        try{
            var is_exists = isExists_Key(in_redisKey);
            if(is_exists === true){
              
            }else{
                var data = in_content;
                client.set(in_redisKey,data,'EX',in_expired_key); // simpan hasil query ke dalam redis dalam bentuk JSON yang sudah di jadikan string, kita setting expired selaman 60 (detik)
                var code = 200;
                var res_msg = gs.create_msg("Sukses SetCache",code,data);
                resolve(res_msg)    
            }
            
        }
        catch(ex){
            reject(ex)
        }
    })  

}

function getKey_REDIS(in_redisKey){
    return new Promise((resolve, reject) => {
        try{
            client.get(in_redisKey,(err,data) => {
                var code = 200;
                var res_msg = gs.create_msg("Sukses getCache",code,data);
                resolve(data)
            });
           
        }
        catch(ex){
            reject(ex)
        }
    })  
}

module.exports.isExists_Key = isExists_Key;
module.exports.setKey_REDIS = setKey_REDIS;
module.exports.getKey_REDIS = getKey_REDIS;
module.exports.Remove_Key = Remove_Key;