/**
 * Created by zhouxiong on 16/11/15.
 */

var mysql = require('mysql');
var q = require('q');
var dbUtil = {};

var options = {
    host: 'localhost',
    port: '3306',
    user: 'xxxxxxxx',
    password: 'xxxxxx',
    database: 'xxxxxx'
};


dbUtil.save = function (obj) {
    var connection = mysql.createConnection(options);
    connection.connect(function (error) {
        if (error) {
            console.log('数据库连接失败');
            console.log(error.stack);
        } else {
            console.log('数据库连接成功');
            connection.query('insert into images set ?', obj, function (error, result) {
                if(error){
                    console.log('数据插入失败');
                } else {
                    console.log('数据插入成功');
                    connection.end();
                }
            });
        }
    });
};

dbUtil.load = function (resp) {
    var connection = mysql.createConnection(options);
    connection.connect(function (error) {
        if(error){
            console.log('数据库连接失败');
            console.log(error.stack);
        } else {
            console.log('数据库连接成功');
            var pm =  function (sql) {
                var deferred = q.defer();
                connection.query(sql, function (error, data) {
                    if(error) {
                        deferred.reject(error);
                    } else {
                        deferred.resolve(data);
                    }
                });
                return deferred.promise;
            };
            var sql = 'select * from images';
            pm(sql).then(function (result) {
                console.log('db load success');
                connection.end();
                //result是一个数组对象,不能直接通过resp.write()方法调用,需要将result转为json字符串
                var str = JSON.stringify(result);
                resp.write(str);
                resp.end();
            }, function (error) {
                console.log(error);
            });
        }
    });
};

module.exports = dbUtil;