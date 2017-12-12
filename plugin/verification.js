/**
 * Created by dell on 2017/12/7.
 */
var SHA1 = require('./sha1').SHA1;
module.exports.verification = function (token,timestamp,nonce) {
    let arrTemp = [token,timestamp,nonce].sort();
    let targetTemp = arrTemp[0]+''+arrTemp[1]+''+arrTemp[2];
    let target = SHA1(targetTemp);
    return target
}