/**
 * Created by dell on 2017/12/7.
 */
var express = require('express');
var bodyParser = require('body-parser');
var xml2json = require('xml2json');
require('body-parser-xml')(bodyParser);
var Request = require('request');
var app = express();
app.use(express.static(__dirname))
var verification = require('./plugin/verification').verification;


const Token = 'Weixinshangqiang2017';
const EncodingAESKey = 'xAjxXrDP9ZUfelG61SUqRNqOovzrcWKmKzZ13bq3iIk';
const AppID = 'wx8fb5a70957137dfc';
const AppSecret = 'f01140778662052571938d62087f110c';



var access_token = '';
//http服务上门搭载socket服务器，程序收到用户发送的消息后，将消息转发给socket
require('./socket').LISTEN(app);

var server = require('http').Server(app);
var server_io = require('socket.io')(server);
server.listen(80);
var tempSocket;
server_io.on('connection',function (socket) {
    tempSocket = socket;
    //连接上来之后处理收到的消息，并发送给用户
});

app.use(bodyParser.xml({
    limit: "1MB",   // Reject payload bigger than 1 MB
    xmlParseOptions: {
        normalize: true,     // Trim whitespace inside text nodes
        normalizeTags: true, // Transform tags to lowercase
        explicitArray: false // Only put nodes in array if >1
    },
    verify: function(req, res, buf, encoding) {
        if(buf && buf.length) {
            // Store the raw XML
            req.rawBody = buf.toString(encoding || "utf8");
        }
    }
}));

app.use(bodyParser.json());
app.get('/',function (req,res) {
    let tempStr = verification(Token,req.query.timestamp,req.query.nonce);
        if(tempStr.toLowerCase() == req.query.signature){
            res.send(req.query.echostr);
    }
});
app.post('/',function (req,res) {
    console.log(xml2json.toJson(req.rawBody));
    let tempdata = JSON.parse(xml2json.toJson(req.rawBody));
    res.send('');
    if(tempdata.xml.MsgType == 'text'){
        Request('https://api.weixin.qq.com/cgi-bin/user/info?access_token='+access_token+'&openid='+tempdata.xml.FromUserName+'&lang=zh_CN',function (error,response,body) {
            if(error){
                console.log("获取用户信息，返回错误，请检查配置");
            }else{
                if(response && response.statusCode==200){
                    console.log(body);
                    let tempMessage = JSON.parse(body);
                    let newMessage = {
                        "nickname":tempMessage.nickname,
                        "headImgUrl":tempMessage.headimgurl,
                        "content":tempdata.xml.Content
                    };
                    server_io.sockets.emit('sendMsg',newMessage);
                }else{
                    console.log("获取用户信息，返回失败结果，请检查配置");
                }
            }
        });
    }
});
app.get('/shangqiang',function (req,res) {
    res.sendFile(__dirname+'/shangqiang.html');
});
//获取access_token，微信规定时间间隔为7200s
(function() {
    getAccessToken();
    setInterval(function () {
        getAccessToken();
    },7100000);
})();

function getAccessToken() {
    Request('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+AppID+'&secret='+AppSecret, function (error, response, body) {
        if(error){
            console.log("获取access_token，返回错误，请检查配置");
        }else{
            if(response && response.statusCode==200){
                access_token = JSON.parse(body).access_token;
            }else{
                console.log("获取access_token，返回失败结果，请检查配置");
            }
        }
    });
}