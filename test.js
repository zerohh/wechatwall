/**
 * Created by dell on 2017/12/7.
 */
var io = require('socket.io-client');
var socket = io.connect('http://47.94.5.37:80');
socket.on('news',function (data) {
    console.log(data)
});
socket.emit('newmsg',{msg:'你说啥'});
