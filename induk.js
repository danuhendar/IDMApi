import { Server } from "socket.io";
var PORT = 3000;
const io = new Server(PORT);
console.log("LISTENING ON PORT : "+PORT);

var socket = io.connect('http://localhost:'+PORT);
socket.emit('my other event', { my: 'data' });
//server side
io.sockets.on('connection', function (socket) {
  socket.on('my other event', function (data) {
    console.log(data);
  });
});
//sending data from the user via a socket.io
socket.on("test", function (data) {
    data.forEach(obj => {
        console.log("Yer : " + obj.yer + ", Lat : " + obj.lat + ", Long : " + obj.lng);
    })
});