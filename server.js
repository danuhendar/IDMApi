var express = require('express');
var cors = require('cors');
var mysqllib = require('./connection/mysql_connection');
bodyParser = require('body-parser');
const config = require('./config.json')

port = config.data.PORT;

var corsOptions = {
  origin: 'http://172.24.52.3:4646',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app = express();
app.use(cors());


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mysqllib.connect().then(() => {
    console.log('Connected to mysql : '+config.database.HOSTNAME)
    //-- CONTROLLER MASTER DATA TOKOMAIN  --//
    const { GET_Tokomain,GET_Tokomain_Non_Station } = require('./controller/m_tokomain')
    //-- ROUTER MASTER DATA TOKOMAIN --//
    app.post("/user/GET_Tokomain", GET_Tokomain)  
    //-- ROUTER MASTER DATA TOKOMAIN NON STATION --//
    app.post("/user/GET_Tokomain_Non_Station", GET_Tokomain_Non_Station)
    //-- CONTROLLER LOGIN --//
    const {signIn,welcome,refresh,get_branch_coverage_user} = require('./controller/auth')
    //-- ROUTER AUTH LOGIN --//
    app.post("/signIn", signIn)
    app.post("/welcome", welcome)
    app.post("/refresh", refresh)
    //-- ROUTER BRANCH COVERAGE USER --//
    app.post("/get_branch_coverage_user",get_branch_coverage_user)
    //-- CONTROLLER ABSENSI PROSES --//
    //const { GET_Absensi_Proses_Aktivasi } = require('./controller/absensi_proses')
    //-- ROUTER ABSENSI PROSES --//
    //app.post("/admin/GET_Absensi_Proses_Aktivasi", GET_Absensi_Proses_Aktivasi)
    //-- CONTROLLER BROADCAST COMMAND --//
    //const { Publish_Broadcast_Command_DC } = require('./controller/Publish_Broadcast_Command')
    //-- ROUTER BROADCAST COMMAND --//
    //app.post("/admin/Publish_Broadcast_Command_DC", Publish_Broadcast_Command_DC)
    //-- ROUTER IRIS ADMIN SUPMAST --//
    const { GET_Supmast } = require('./controller/IRISAdmin')
    app.post("/admin/GET_Supmast", GET_Supmast)
    //-- ROUTER IRIS ADMIN SUPMAST --//
    //const { GET_Restart } = require('./controller/restart_service')
    //app.get("/user/restart_service", cors(corsOptions), GET_Restart)
    //-- ROUTER & CONTROLLER IRIS ADMIN MONITORING POSREALTIME NOK,MONITORING PRODMAST --//
    const { GET_Monitoring_Header_Trigger_Toko,GET_Monitoring_Detail_Trigger_Toko } = require('./controller/IRISAdmin')
    app.post("/user/monitoring_header_trigger_toko", cors(corsOptions), GET_Monitoring_Header_Trigger_Toko)
    app.post("/user/monitoring_detail_trigger_toko", cors(corsOptions), GET_Monitoring_Detail_Trigger_Toko)
    //-- ROUTER & CONTROLLER REDIS --//
    const{ServiceBackend,TriggerListener,UpdateCabangIni,DownloadListener,PublishBackend} = require('./controller/test');
    //app.post("/user/get_ip_mysql",cors(corsOptions), getIpMysql);
    //app.post("/user/get_ip_redis",cors(corsOptions), getIPRedis);
    app.get("/user/ServiceBackend/:controll/:nama_service",cors(corsOptions), ServiceBackend);
    app.get("/user/TriggerListener/:kode_cabang_user/:ip_listener",cors(corsOptions), TriggerListener);
    app.get("/user/UpdateCabangIni/:kode_cabang/:ip_listener",cors(corsOptions), UpdateCabangIni);
    app.get("/user/DownloadListener/:location/:kode_cabang/:ip_listener",cors(corsOptions), DownloadListener);
    app.post("/user/PublishBackend",cors(corsOptions), PublishBackend)
    
    const{LaporanListenerNOK} = require('./controller/laporan_listener/LaporanListenerNOK');
    app.post("/user/LaporanListenerNOK",cors(corsOptions), LaporanListenerNOK)

    const{TargetDownload,FlagUpdateListeners} = require('./controller/update_listener/UpdateListener');
    app.post("/user/TargetDownload",cors(corsOptions), TargetDownload)
    app.post("/user/FlagUpdateListeners",cors(corsOptions), FlagUpdateListeners)

    const{InsStatusToko,UpdRECIDTokomain,ResetRECIDAll} = require('./controller/tokomain/SyncStatusToko');
    app.post("/user/InsStatusToko",cors(corsOptions), InsStatusToko)
    app.post("/user/UpdRECIDTokomain",cors(corsOptions), UpdRECIDTokomain)
    app.post("/user/ResetRECIDAll",cors(corsOptions), ResetRECIDAll)

    //-- MASTER DATA --//
    const{MasterFTPServer,GetMasterSetting} = require('./controller/master_data/GetMasterData');
    app.post("/user/MasterFTPServer",cors(corsOptions), MasterFTPServer)
    app.post("/user/GetMasterSetting",cors(corsOptions), GetMasterSetting)

    console.log('todo list RESTful API server started on: ' + port);
    app.listen(port);
    app.maxConnections = 50;

    var timeout = require('connect-timeout');
    app.use(timeout('60s')); //set 5s timeout for all requests

}).catch(e => {
  console.error(e.stack)
  process.exit()
})


