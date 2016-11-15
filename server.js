/**
 * Created by zhouxiong on 16/11/15.
 */

var http = require('http');
var fs = require('fs');
var dbUtil = require('./js/db-util');
var npath = require('path');

var server = http.createServer(function (req, resp) {
    if (req.url != '/favicon.ico') {
        if (req.url === '/upload') {
            var chunks = [];
            var size = 0;
            req.on('data', function (chunk) {
                chunks.push(chunk);
                size += chunk.length;
            });

            req.on('end', function () {
                var buffer = Buffer.concat(chunks, size);
                if (!size) {
                    resp.writeHead(404);
                    resp.end('');
                    return;
                }

                var rems = [];

                //根据\r\n分离数据和报头
                for (var i = 0; i < buffer.length; i++) {
                    var v = buffer[i];
                    var v2 = buffer[i + 1];
                    if (v == 13 && v2 == 10) {
                        rems.push(i);
                    }
                }
                //图片信息,
                var picmsg_1 = buffer.slice(rems[0] + 2, rems[1]).toString();
                var filename = picmsg_1.match(/filename=".*"/g)[0].split('"')[1];

                //图片数据,结尾去掉\r\n--WebKitFormblabla--\r\n等数据
                var nbuf = buffer.slice(rems[3] + 2, rems[rems.length - 2]);
                //文件重命名
                var fns = filename.split('\.');
                var realName = new Date().getTime() + '.' + fns[fns.length - 1];
                var fpath = './upload/' + realName;
                var dbPath = 'upload/' + realName;
                //存入数据库
                var imgObj = {
                    image_name: realName,
                    image_url: dbPath
                };
                dbUtil.save(imgObj);

                //写到本地
                fs.writeFileSync(fpath, nbuf);
                resp.write('上传成功');
                resp.end();
            });

        } else if (req.url == '/load') {
            dbUtil.load(resp);
        } else {
            if (req.url == '/') {
                responseByPath(npath.resolve(__dirname, './index.html'), 'html');
            } else {
                responseByPath(npath.resolve(__dirname, './' + req.url), getSuffix(req.url));
            }
        }

        function responseByPath(realPath, suffix) {
            fs.readFile(realPath, function (error, data) {
                if (error) {
                    console.log('读取文件错误');
                    console.log(error);
                } else {
                    var contentTypes = {
                        'html': 'text/html',
                        'css': 'text/css',
                        'js': 'application/x-javascript'
                    };
                    resp.writeHead(200, {'Content-Type': contentTypes[suffix]});
                    resp.write(data);
                    resp.end();
                }
            });
        }

        function getSuffix(name) {
            var nameArr = name.split('\.');
            return nameArr[nameArr.length - 1];
        }
    }
});

server.listen(8080, 'localhost');