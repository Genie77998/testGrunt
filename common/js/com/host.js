/**
 * author:DZ
 * time:2014/12/3
 */
define([], function () {
    'use strict';
    var config = {
        mode: 0, //模式：0 测试 /1 预发 /2 生产
        hostUrls: [
            //"http://192.168.10.3:9880/",
            //"http://192.168.10.233:8080",
            //"http://183.136.220.27:38080",
            "http://192.168.10.53",
            "http://121.40.72.129:8080",
            "http://app.qichekb.com",
            "http://192.168.10.106:8080/car_client_oilCharge"
        ]
    };
    return {
        HOST_URL: config.hostUrls[config.mode]
    }
});
