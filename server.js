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
    const {signIn,welcome,refresh} = require('./controller/auth')
    //-- ROUTER AUTH LOGIN --//
    app.post("/signIn", signIn)
    app.post("/welcome", welcome)
    app.post("/refresh", refresh)
    //-- CONTROLLER ABSENSI PROSES --//
    const { GET_Absensi_Proses_Aktivasi } = require('./controller/absensi_proses')
    //-- ROUTER ABSENSI PROSES --//
    app.post("/admin/GET_Absensi_Proses_Aktivasi", GET_Absensi_Proses_Aktivasi)
    //-- CONTROLLER BROADCAST COMMAND --//
    const { Publish_Broadcast_Command_DC } = require('./controller/Publish_Broadcast_Command')
    //-- ROUTER BROADCAST COMMAND --//
    app.post("/admin/Publish_Broadcast_Command_DC", Publish_Broadcast_Command_DC)
    //-- ROUTER IRIS ADMIN SUPMAST --//
    const { GET_Supmast } = require('./controller/IRISAdmin')
    app.post("/admin/GET_Supmast", GET_Supmast)
    //-- ROUTER IRIS ADMIN SUPMAST --//
    const { GET_Restart } = require('./controller/restart_service')
    app.get("/user/restart_service", cors(corsOptions), GET_Restart)
     //-- ROUTER IRIS ADMIN MONITORING POSREALTIME --//
    const { GET_Monitoring_Posrealtime } = require('./controller/IRISAdmin')
    app.post("/user/monitoring_posrealtime", cors(corsOptions), GET_Monitoring_Posrealtime)

    console.log('todo list RESTful API server started on: ' + port);
    app.listen(port);
}).catch(e => {
  console.error(e.stack)
  process.exit()
})


