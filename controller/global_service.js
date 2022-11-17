const requestIp = require('request-ip');
var mysqlLib = require('../connection/mysql_connection');
var clickhouseLib = require('../connection/clickhouse_connect');

function create_msg(msg,code,data){
	var msg = {"msg":msg,"code":code,"data":data};
	var res_msg = msg;
	return res_msg;
}


function CreateMessage_MQTT(TASK,ID,SOURCE,OTP,TANGGAL_JAM,VERSI,COMMAND,HASIL,FROM,TO,SN_HDD,IP_ADDRESS,STATION,CABANG,FILE,NAMA_FILE,CHAT_MESSAGE,REMOTE_PATH,LOCAL_PATH,SUB_ID){
  const IN_TASK = TASK;
  const IN_ID = ID;
  const IN_SOURCE = SOURCE;
  const IN_OTP = OTP;
  const IN_TANGGAL_JAM = TANGGAL_JAM;
  const IN_VERSI = VERSI;
  const IN_COMMAND = COMMAND;
  const IN_HASIL = HASIL;
  const IN_FROM = FROM;
  const IN_TO = TO;
  const IN_SN_HDD = SN_HDD;
  const IN_IP_ADDRESS = IP_ADDRESS;
  const IN_STATION = STATION;
  const IN_CABANG = CABANG;
  const IN_FILE = FILE;
  const IN_NAMA_FILE = NAMA_FILE;
  const IN_CHAT_MESSAGE = CHAT_MESSAGE;
  const IN_REMOTE_PATH = REMOTE_PATH;
  const IN_LOCAL_PATH = LOCAL_PATH;
  const IN_SUB_ID = SUB_ID;
  const myObj = {"TASK":IN_TASK, "ID":IN_ID, "SOURCE":IN_SOURCE,"OTP":IN_OTP,"TANGGAL_JAM":IN_TANGGAL_JAM,"VERSI":IN_VERSI,"COMMAND":IN_COMMAND,"HASIL":IN_HASIL,"FROM":IN_FROM,"TO":IN_TO,"SN_HDD":IN_SN_HDD,"IP_ADDRESS":IN_IP_ADDRESS,"STATION":IN_STATION,"CABANG":IN_CABANG,"FILE":IN_FILE,"NAMA_FILE":IN_NAMA_FILE,"CHAT_MESSAGE":IN_CHAT_MESSAGE,"REMOTE_PATH":IN_REMOTE_PATH,"LOCAL_PATH":IN_LOCAL_PATH,"SUB_ID":IN_SUB_ID};
  const res = JSON.stringify(myObj);
  return res;
}


function get_datetime(){
	var datetime = require('node-datetime');
	var dt = datetime.create();
	var formatted = dt.format('Y-m-d H:M:S');
	return formatted;
}

function get_id(){
  var date = new Date();

  var tahun = date.getFullYear();
  var bulan = date.getMonth()+1;
  var res_bulan = "";
  if(bulan < 10){
      res_bulan = "0"+bulan;
  }else{  
      res_bulan = ""+bulan;
  }
  var tanggal = date.getDate();
  var res_tanggal = "";
  if(tanggal < 10){
      res_tanggal = "0"+tanggal;
  }else{  
      res_tanggal = ""+tanggal;
  }

  var jam = date.getHours();
  var menit = date.getMinutes();
  var res_menit = "";
  if(menit < 10){
      res_menit = "0"+menit;
  }else{  
      res_menit = ""+menit;
  }
  var detik = date.getSeconds();
  var res_detik = "";
  if(detik < 10){
      res_detik = "0"+detik;
  }else{  
      res_detik = ""+detik;
  }

  var concat = tahun+""+res_bulan+""+res_tanggal+""+jam+""+res_menit;

  return concat;
}

function get_subid(){
  var date = new Date();

  var tahun = date.getFullYear();
  var bulan = date.getMonth()+1;
  var res_bulan = "";
  if(bulan < 10){
      res_bulan = "0"+bulan;
  }else{  
      res_bulan = ""+bulan;
  }
  var tanggal = date.getDate();
  var res_tanggal = "";
  if(tanggal < 10){
      res_tanggal = "0"+tanggal;
  }else{  
      res_tanggal = ""+tanggal;
  }

  var jam = date.getHours();
  var menit = date.getMinutes();
  var res_menit = "";
  if(menit < 10){
      res_menit = "0"+menit;
  }else{  
      res_menit = ""+menit;
  }
  var detik = date.getSeconds();
  var res_detik = "";
  if(detik < 10){
      res_detik = "0"+detik;
  }else{  
      res_detik = ""+detik;
  }

  var concat = tahun+""+res_bulan+""+res_tanggal+""+jam+""+res_menit+""+res_detik;

  return concat;
}


function get_ip(){ 
	// inside middleware handler
	const ipMiddleware = function(req, res, next) {
	    const clientIp = requestIp.getClientIp(req); 
	    next();
	};
}

function get_tanggal_jam(is_tanggal_jam){
  var date = new Date();

  var tahun = date.getFullYear();
  var bulan = date.getMonth()+1;
  var res_bulan = "";
  if(bulan < 10){
      res_bulan = "0"+bulan;
  }else{  
      res_bulan = ""+bulan;
  }
  var tanggal = date.getDate();
  var res_tanggal = "";
  if(tanggal < 10){
      res_tanggal = "0"+tanggal;
  }else{  
      res_tanggal = ""+tanggal;
  }

  var jam = date.getHours();
  var res_jam = "";
  if(jam < 10){
      res_jam = "0"+jam;
  }else{  
      res_jam = ""+jam;
  }
  var menit = date.getMinutes();
  var res_menit = "";
  if(menit < 10){
      res_menit = "0"+menit;
  }else{  
      res_menit = ""+menit;
  }
  var detik = date.getSeconds();
  var res_detik = "";
  if(detik < 10){
      res_detik = "0"+detik;
  }else{  
      res_detik = ""+detik;
  }

  var concat = "";
  if(is_tanggal_jam === "1"){
      concat = tahun+"-"+res_bulan+"-"+res_tanggal+" "+res_jam+":"+res_menit+":"+res_detik;
  }else{
      concat = tahun+""+res_bulan+""+res_tanggal;
  }

  return concat;
}

async function ins_transreport(topic,obj,nama_table) {

  return new Promise((resolve, reject) => {
    try{
     
      const parseJson = JSON.parse(obj);
      const IN_TASK = parseJson.TASK;
      const IN_ID = parseJson.ID;
      const IN_SOURCE = parseJson.SOURCE;
      const IN_OTP = parseJson.OTP;
      const IN_TANGGAL_JAM = parseJson.TANGGAL_JAM;
      const IN_VERSI = parseJson.VERSI;
      const IN_COMMAND = parseJson.COMMAND;
      const IN_HASIL = parseJson.HASIL;
      const IN_FROM = parseJson.FROM;
      const IN_TO = parseJson.TO;
      const IN_SN_HDD = parseJson.SN_HDD;
      const IN_IP_ADDRESS = parseJson.IP_ADDRESS;
      //console.log("IP_ADDRESS : "+IN_IP_ADDRESS)
      const IN_STATION = parseJson.STATION;
      const IN_CABANG = parseJson.CABANG;
      const IN_FILE = parseJson.FILE;
      const IN_NAMA_FILE = parseJson.NAMA_FILE;
      const IN_CHAT_MESSAGE = parseJson.CHAT_MESSAGE;
      const IN_REMOTE_PATH = parseJson.REMOTE_PATH;
      const IN_LOCAL_PATH = parseJson.LOCAL_PATH;
      const IN_SUB_ID = parseJson.SUB_ID;

      var kdtk = ""
      var nm_pc = ""
      var res_in_from = ""
      var res_in_to = ""
      var res_in_kdcab = IN_CABANG
      var nama_table = "transreport"
      var st = ""

      if(IN_SOURCE === "IDMCommandListeners"){
          try{
            res_in_from = IN_TO;
            res_in_to = IN_FROM;
            var qry = "SELECT TOKO,NAMA,STATION,KDCAB FROM tokomain where IP = '"+IN_IP_ADDRESS+"'";
                  mysqlLib.executeQuery(qry).then((d) => {
                    var code = 200;
                    //console.log(d)
                    kdtk = d[0].TOKO.toString();
                    nm_pc = d[0].NAMA.toString();
                    st = d[0].STATION.toString();
                    //console.log(kdtk+" - "+nm_pc)
                      const sql_query = "INSERT INTO idmcmd."+nama_table+" VALUES('"+res_in_kdcab+"',"
                                                    + "'"+IN_TASK.toUpperCase()+"',"
                                                    + "'"+IN_ID+"',"
                                                    + "'"+IN_SUB_ID+"',"
                                                    + "'"+IN_SOURCE+"',"
                                                    + "'"+res_in_from+"',"
                                                    + "'"+res_in_to+"',"
                                                    + "'"+IN_OTP+"',"
                                                    + "'"+kdtk+"',"
                                                    + "'"+nm_pc+"',"
                                                    + "'"+st+"',"
                                                    + "'"+IN_IP_ADDRESS+"',"
                                                    + "'"+IN_SN_HDD+"',"
                                                    + "'"+IN_COMMAND.replace("\\", "/").split("'").join('"')+"',"
                                                    + "'"+IN_HASIL.replace("'", "").replace("\\", "/")+"',"
                                                    + "'"+IN_CHAT_MESSAGE.replace("","-")+"',"
                                                    + "'"+IN_NAMA_FILE.replace("","-")+"',"
                                                    + "'"+IN_REMOTE_PATH.replace("","-")+"',"
                                                    + "'"+IN_LOCAL_PATH.replace("","-")+"',"
                                                    + "NOW(),"
                                                    + "'"+IN_VERSI+"',"
                                                    + "NULL,"
                                                    + "NOW());";
                      console.log(sql_query);
                      clickhouseLib.ExecuteQueryClickHouse(sql_query);    
                  }).catch(e => {
                    console.log(e);
                  });   


          }catch(exc){
            kdtk = "";
            nm_pc = "";
          }
      }else if(IN_SOURCE === "IDMCommander"){
          res_in_from = IN_TO;
          res_in_to = IN_FROM;
         
          
            if(res_in_from === 'IDMReporter'){
              const sql_query = "INSERT INTO idmcmd."+nama_table+" VALUES('"+res_in_kdcab+"',"
                                                    + "'"+IN_TASK.toUpperCase()+"',"
                                                    + "'"+IN_ID+"',"
                                                    + "'"+IN_SUB_ID+"',"
                                                    + "'"+IN_SOURCE+"',"
                                                    + "'"+res_in_from+"',"
                                                    + "'"+res_in_to+"',"
                                                    + "'"+IN_OTP+"',"
                                                    + "'"+kdtk+"',"
                                                    + "'"+nm_pc+"',"
                                                    + "'"+IN_STATION+"',"
                                                    + "'"+IN_IP_ADDRESS+"',"
                                                    + "'"+IN_SN_HDD+"',"
                                                    + "'"+IN_COMMAND.replace("\\", "/").split("'").join('"')+"',"
                                                    + "'"+IN_HASIL.replace("'", "").replace("\\", "/")+"',"
                                                    + "'"+IN_CHAT_MESSAGE.replace("","-")+"',"
                                                    + "'"+IN_NAMA_FILE.replace("","-")+"',"
                                                    + "'"+IN_REMOTE_PATH.replace("","-")+"',"
                                                    + "'"+IN_LOCAL_PATH.replace("","-")+"',"
                                                    + "NOW(),"
                                                    + "'"+IN_VERSI+"',"
                                                    + "NULL,"
                                                    + "NOW());";
              console.log(sql_query);
              clickhouseLib.ExecuteQueryClickHouse(sql_query);
              //console.log("KONDISI 1")      
            }else{
                var qry = "SELECT TOKO,NAMA,STATION,KDCAB FROM tokomain where IP = '"+res_in_from+"';";
                console.log("QUERY INS : "+qry)
                 
                  mysqlLib.executeQuery(qry).then((d) => {
                    var code = 200;
                    //console.log(d)
                    kdtk = d[0].TOKO.toString();
                    nm_pc = d[0].NAMA.toString();
                    res_ip_address = res_in_from;
                    st = d[0].STATION.toString();
                    //console.log(kdtk+" - "+nm_pc)

                      const sql_query = "INSERT INTO idmcmd."+nama_table+" VALUES('"+res_in_kdcab+"',"
                                                    + "'"+IN_TASK.toUpperCase()+"',"
                                                    + "'"+IN_ID+"',"
                                                    + "'"+IN_SUB_ID+"',"
                                                    + "'"+IN_SOURCE+"',"
                                                    + "'"+res_in_from+"',"
                                                    + "'"+res_in_to+"',"
                                                    + "'"+IN_OTP+"',"
                                                    + "'"+kdtk+"',"
                                                    + "'"+nm_pc+"',"
                                                    + "'"+st+"',"
                                                    + "'"+res_ip_address+"',"
                                                    + "'"+IN_SN_HDD+"',"
                                                    + "'"+IN_COMMAND.replace("\\", "/").split("'").join('"')+"',"
                                                    + "'"+IN_HASIL.replace("'", "").replace("\\", "/")+"',"
                                                    + "'"+IN_CHAT_MESSAGE.replace("","-")+"',"
                                                    + "'"+IN_NAMA_FILE.replace("","-")+"',"
                                                    + "'"+IN_REMOTE_PATH.replace("","-")+"',"
                                                    + "'"+IN_LOCAL_PATH.replace("","-")+"',"
                                                    + "NOW(),"
                                                    + "'"+IN_VERSI+"',"
                                                    + "NULL,"
                                                    + "NOW());";
                      console.log(sql_query);
                      clickhouseLib.ExecuteQueryClickHouse(sql_query); 
                      //console.log("KONDISI 2")   
                  }).catch(e => {
                    //console.log("ERROR GET ATTRIBUT TOKO : "+e);
                    const sql_query = "INSERT INTO idmcmd.transreport VALUES('"+res_in_kdcab+"',"
                                                    + "'"+IN_TASK.toUpperCase()+"',"
                                                    + "'"+IN_ID+"',"
                                                    + "'"+IN_SUB_ID+"',"
                                                    + "'"+IN_SOURCE+"',"
                                                    + "'"+IN_FROM+"',"
                                                    + "'"+IN_TO+"',"
                                                    + "'"+IN_OTP+"',"
                                                    + "'"+kdtk+"',"
                                                    + "'"+nm_pc+"',"
                                                    + "'"+IN_STATION+"',"
                                                    + "'"+IN_IP_ADDRESS+"',"
                                                    + "'"+IN_SN_HDD+"',"
                                                    + "'"+IN_COMMAND.replace("\\", "/").split("'").join('"')+"',"
                                                    + "'"+IN_HASIL.replace("'", "").replace("\\", "/")+"',"
                                                    + "'"+IN_CHAT_MESSAGE.replace("","-")+"',"
                                                    + "'"+IN_NAMA_FILE.replace("","-")+"',"
                                                    + "'"+IN_REMOTE_PATH.replace("","-")+"',"
                                                    + "'"+IN_LOCAL_PATH.replace("","-")+"',"
                                                    + "NOW(),"
                                                    + "'"+IN_VERSI+"',"
                                                    + "NULL,"
                                                    + "NOW());";
                      console.log(sql_query);
                      clickhouseLib.ExecuteQueryClickHouse(sql_query);                           
                  });
                    
            } 

           

      }else if(IN_SOURCE === "IDMReporter"){
          res_in_from = IN_FROM;
          res_in_to = IN_TO;
      }else{
          const sql_query = "INSERT INTO idmcmd."+nama_table+" VALUES('"+res_in_kdcab+"',"
                                                    + "'"+IN_TASK.toUpperCase()+"',"
                                                    + "'"+IN_ID+"',"
                                                    + "'"+IN_SUB_ID+"',"
                                                    + "'"+IN_SOURCE+"',"
                                                    + "'"+IN_FROM+"',"
                                                    + "'"+IN_TO+"',"
                                                    + "'"+IN_OTP+"',"
                                                    + "'"+kdtk+"',"
                                                    + "'"+nm_pc+"',"
                                                    + "'"+IN_STATION+"',"
                                                    + "'"+IN_IP_ADDRESS+"',"
                                                    + "'"+IN_SN_HDD+"',"
                                                    + "'"+IN_COMMAND.replace("\\", "/").split("'").join('"')+"',"
                                                    + "'"+IN_HASIL.replace("'", "").replace("\\", "/")+"',"
                                                    + "'"+IN_CHAT_MESSAGE.replace("","-")+"',"
                                                    + "'"+IN_NAMA_FILE.replace("","-")+"',"
                                                    + "'"+IN_REMOTE_PATH.replace("","-")+"',"
                                                    + "'"+IN_LOCAL_PATH.replace("","-")+"',"
                                                    + "NOW(),"
                                                    + "'"+IN_VERSI+"',"
                                                    + "NULL,"
                                                    + "NOW());";
              console.log(sql_query);
              clickhouseLib.ExecuteQueryClickHouse(sql_query); 
              console.log("SOURCE : "+IN_SOURCE);
      }

    }
    catch(ex){
      reject(ex)
      console.log(""+ topic+" > "+ex.Stack);
    }
  });  
}


module.exports = {
  create_msg,
  get_datetime,
  get_id,
  get_subid,
  get_ip,
  CreateMessage_MQTT,
  get_tanggal_jam,
  ins_transreport
}

