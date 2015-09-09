/**
 * Created by libin on 14/11/17.
 */

;
(function () {
    "use strict";

    var Daze = {};

    /**
     * @description 客户端UA
     */
    Daze.ua = navigator.userAgent;


    /**
     * @name isDazeClient
     * @description 是否在客户端内运行
     * @readonly
     * @type {string}
     */
    Daze.isDazeClient = (function () {
        return Daze.ua.indexOf("DazeClient") > -1;
    })();

    /**
     * @name dazeClientVersion
     * @description 客户端版本号
     * @readyonly
     * @type {string}
     */
    Daze.dazeClientVersion = (function () {
        if (Daze.isDazeClient) {
            return Daze.ua.match(/DazeClient_(.*)/)[1];
        }
    })();

    /**
     * @description 通用接口，调用方式等同DazeJSBridge.call;
     */
    Daze.call = function () {
        var a = arguments,
            fn = function () {
                window.DazeJSBridge.call.apply(null, a);
            };
        window.DazeJSBridge ? fn() : Daze.on("DazeJSBridgeReady", fn);
    };

    /**
     * 设置标题
     * @param {string | object} opt 调用参数，可为对象或字符串
     * @param {string}          opt.text 文案
     * @param {string}          opt.type title | subtitle
     * @param {function}        callback 回调函数
     */
    Daze.setTitle = function (opt, callback) {
        var def = {
            text: "",
            type: "title",
            moduleName: "navigator"
        };

        if (isStr(opt)) {
            opt = {
                text: opt
            };
        }

        simpleExtend(def, opt);

        if (Daze.isDazeClient) {
            if (def.type === "title") {
                def.title = def.text;
            }

            if (def.type == "subtitle") {
                def.subtitle = def.text;
            }
        }

        Daze.call("setTitle", def, callback);
    };

    /**
     * 显示/隐藏标题栏
     * @param {boolean} boolean loading显示或隐藏
     * @param {function} callback 回调函数
     * @todo 暂时不支持回调
     * @example
     * Daze.toggleTitle(true,function(){
     *     console.log("end toggleTitle");
     * });
     */
    Daze.toggleTitle = function (boolean, callback) {
        var eventName = Daze.isDazeClient ? "toggleTitleBar" : "toggleTitle";
        var def = {
            visible: boolean,
            moduleName: "navigator"
        };
        Daze.call(eventName, def, callback);
    };


    /**
     * 显示自定义菜单
     * @param {object}  opt           菜单配置
     * @param {array}   opt.items     菜单列表
     * @param {string}  item.title    菜单标题
     * @param {string}  item.id       菜单标记
     * @param callback
     * @example opt
     * {"items":[
     *  {
     *      "title":"测试菜单1",
     *      "id":"item1"
     *  },
     *  {
     *      "title":"测试菜单2",
     *      "id":"item2"
     *  }
     * ]}
     */
    Daze.showOptionMenu = function (opt, callback) {
        var def = {
            items: [],
            "moduleName": "navigator"
        };

        simpleExtend(def, opt);
        Daze.call("showOptionMenu", def, callback);
    };

    /**
     * 开新窗口
     * @param {string|object}   opt         调用参数，可为对象或字符串
     * @param {string}          opt.appId   要打开的app id
     * @param {string}          opt.url     要打开的url
     * @param {function}        callback    回调函数
     */
    Daze.pushWindow = function (opt, callback) {
        var def = {
            appId: '',
            url: '',
            moduleName: "navigator"
        };

        if (isStr(opt)) {
            opt = {
                url: opt
            };
        }

        simpleExtend(def, opt);

        Daze.call("pushWindow", def, callback);
    };

    /**
     * 关闭当前窗口
     * @param {string} callback 回调函数
     */
    Daze.popWindow = function (callback) {
        Daze.popTo({
            step: -1,
            moduleName: "navigator"
        }, callback);
    };

    /**
     * 退回指定界面
     * @param opt
     */
    Daze.popTo = function (opt, callback) {
        var def = {
            moduleName: "navigator"
        };

        if (isNumber(opt)) {
            opt = {
                step: opt
            };
        }

        simpleExtend(def, opt);

        Daze.call("popTo", def, callback);
    };


    /**
     * 获取地理位置
     * @type {{}}
     */
    Daze.geolocation = {};

    Daze.geolocation.getCurrentPosition = function (callback) {
        var eventName = Daze.isDazeClient ? "geolocation" : "geolocation.getCurrentPosition";

        var def = {
            "moduleName": 'geolocation'
        };

        Daze.call(eventName, def, function (result) {
            var data = {};

            data.coords = {};
            data.coords.latitude = result.latitude;
            data.coords.longitude = result.longitude;

            data.city = result.city ? result.city : result.province;
            data.province = result.province;
            data.id = result.id;

            callback(data);
        });
    };

    /**
     * 网络状态
     */
    Daze.network = {};

    /**
     * 获取网络状态
     * @param {function} fn 回调函数
     * @param {object}  result 包含各种网络状况的对象
     * @param {boolean} result.is3G 是否在使用3G网络
     * @param {boolean} result.is2G 是否在使用2G网络
     * @param {boolean} result.isWifi 是否在使用 Wifi
     * @param {boolean} result.isE 是否处于 E
     * @param {boolean} result.isG 是否处于 G
     * @param {boolean} result.isH 是否处于 H
     * @param {boolean} result.isOnline 是否联网
     * @param {boolean} networkAvaliable 网络是否连网可用
     */
    Daze.network.getType = function (callback) {
        var eventName = Daze.isDazeClient ? "getNetworkType" : "network.getType";
        var def = {
            "moduleName": "network"
        };

        Daze.call(eventName, def, function (result) {
            var data = {};

            data.networkAvaliable = result.networkType !== "fail";

            data.is3G = data.is2G = data.isEdge = data.isGprs = data.isHSDPA = data.networkAvaliable && result.networkType !== "wifi";

            data.isWifi = result.networkType === "wifi";
            data.isOnline = data.networkAvaliable;

            callback(data, data.networkAvaliable);
        });
    };

    /**
     * 拍照/选择照片
     * @param {object} opt 调用参数，为对象
     * @param {string} opt.dataType 结果数据格式：dataurl|fileurl|remoteurl
     * @param {boolean} opt.allowEdit 是否允许编辑(框选). 为true时，拍照时会有一个方形的选框
     * @param {number} opt.maxWidth 图片的最大宽度. 过大将被等比缩小
     * @param {number} opt.maxHeight 图片的最大高度. 过大将被等比缩小
     * @param {string} opt.format jpg|png
     * @param {number} opt.quality 图片质量, 取值1到100
     * @param {function} callback 回调函数
     */
    Daze.photo = function (opt, callback) {
        var def = {
            format: "jpg",
            dataType: "dataurl",
            quality: 75,
            allowEdit: false,
            moduleName: "photo"
        };

        simpleExtend(def, opt);

        if (Daze.isDazeClient) {
            def.imageFormat = def.format;
            def.dataType = def.dataType.slice(0, -3) + def.dataType.slice(-3).toUpperCase();
        }

        Daze.call("photo", def, callback);
    };

    /**
     * 登陆
     * @param callback
     */
    Daze.login = function (callback) {
        var def = {
            moduleName: 'login'
        };
        Daze.call("login", def, callback);
    };

    /**
     * 城市改变后统一
     * @param {城市id:cityId   城市名称:cityName  经度:lng  纬度:lat  省:provience}
     */
    Daze.cityChange = function(obj){
        var cityChangeEvent = document.createEvent("Events");
        cityChangeEvent.initEvent("cityChangeEvent", false, false);
        cityChangeEvent.data = obj;
        var docAddEventListener = document.addEventListener;

        // 处理ready事件发生以后才addEventListener的情况
        document.addEventListener = function (name, func) {
            if (name === cityChangeEvent.type) {
                // 保持func执行的异步性
                setTimeout(function () {
                    func(cityChangeEvent);
                }, 1);
            } else {
                docAddEventListener.apply(document, arguments);
            }
        };
        document.dispatchEvent(cityChangeEvent);
    }

    Daze.loginFromNative = function (userId, uid, pid) {
        var loginEvent = document.createEvent("Events");
        loginEvent.initEvent("loginEvent", false, false);
        loginEvent.data = [userId, uid, pid];
        // 处理ready事件发生以后才addEventListener的情况
        var docAddEventListener = document.addEventListener;
        document.addEventListener = function (name, func) {
            if (name === loginEvent.type) {
                // 保持func执行的异步性
                setTimeout(function () {
                    func(loginEvent);
                }, 1);
            } else {
                docAddEventListener.apply(document, arguments);
            }
        };
        document.dispatchEvent(loginEvent);
    };

    
    Daze.logout = function () {
        var logoutEvent = document.createEvent("Events");
        logoutEvent.initEvent("logoutEvent", false, false);
        // 处理ready事件发生以后才addEventListener的情况
        var docAddEventListener = document.addEventListener;
        document.addEventListener = function (name, func) {
            if (name === logoutEvent.type) {
                // 保持func执行的异步性
                setTimeout(function () {
                    func(logoutEvent);
                }, 1);
            } else {
                docAddEventListener.apply(document, arguments);
            }
        };
        document.dispatchEvent(logoutEvent);
    };

    /**
     * @method pay
     * @description 支付
     * @param {number} opt.orderId 订单id
     * @param {boolean} opt.useBalance 是否使用账户余额
     * @param {boolean} opt.payOnline 是否使用在线支付
     * @param {number} opt.type 支付类型：1.支付宝客户端；2.银联客户端
     * @param {number} opt.payType 支付类型：1.支付宝客户端；2.银联客户端
     * @param {function} callback 回调方法
     */
    Daze.pay = function (opt, callback) {
        var def = {
            orderId: null,
            useBalance: false,
            payOnline: false,
            type: null,
            payType: null,
            moduleName: 'pay'
        };

        simpleExtend(def, opt);

        Daze.call('pay', def, callback);
    };

    /**
     * @method showMsg
     * @description 提示信息
     * @param opt.type 1.msg;2.loading
     * @param opt.text 信息内容
     * @param opt.visible loading参数，控制loading显示/隐藏
     * @param opt.delay msg参数，控制msg显示时间，默认值为2
     * @param callback
     */
    Daze.showMsg = function (opt, callback) {
        var def = {
            type: 'msg',
            text: '',
            visible: true,
            delay: 2,
            moduleName: 'system'
        };

        if (isStr(opt)) {
            opt = {
                text: opt
            };
        }

        simpleExtend(def, opt);

        Daze.call('showMsg', def, callback);
    };

    /**
     * @method stats
     * @description 统计
     * @param {number} opt.event 事件编号
     * @param {object} opt.props 关键参数对象
     */
    Daze.stats = function (opt) {
        var def = {
            event: null,
            props: {},
            moduleName: 'system'
        };

        simpleExtend(def, opt);

        Daze.call('stats', def);
    };

    /**
     * @method showShareWin
     * @description 分享
     * @param opt.to 分享到：1.微信；2.朋友圈；3.微信好友；4.短信
     * @param opt.from 来自哪里的分享
     * @param {function} callback 回调方法
     */
    Daze.share = function (opt, callback) {
        var def = {
            to: '',
            from: '',
            moduleName: 'share'
        };

        if (isStr(opt)) {
            opt = {
                to: opt
            };
        }

        simpleExtend(def, opt);

        Daze.call('share', def, callback);
    };

    /**
     * @method rescue
     * @description 道路救援
     */
    Daze.rescue = function () {
        var def = {
            moduleName: 'system'
        };
        Daze.call('rescue', def);
    };

    /**
     * @method dealWithViolation
     * @description 违章代办服务
     */
    Daze.dealWithViolation = function () {
        var def = {
            moduleName: 'system'
        };
        Daze.call('dealWithViolation', def);
    };

    /**
     * @method showSelectWin
     * @description 选择列表
     * @param couponList
     * @param callback
     */
    Daze.showSelectWin = function (couponList, callback) {
        var def = {
            list: couponList,
            moduleName: 'coupon'
        };
        Daze.call('showSelectWin', def, callback);
    };

    /**
     * @method chat
     * @description 开启在线客服
     * @param {object} opt
     * @param {string} opt.workgroupName 1.daliycs; 2.techcs
     * @param {string} opt.productInfo 我正在看{城市}的{服务名称}，有些问题想要咨询
     * @param callback
     */
    Daze.chat = function (opt, callback) {
        var def = {
            moduleName: 'feedback'
        };

        simpleExtend(def, opt);

        Daze.call('chat', def, callback);
    };


    // -----------------------------------------------------------------------------------------------------------------
    // 仅供客户端中使用,系统方法
    ([
        "startApp",
        "showAlert",
        "remoteLogging",
        "exitApp"
    ]).forEach(function (methodName) {
            Daze[methodName] = function (opt, callback) {
                var def = {
                    "moduleName": "system"
                };
                if (opt && isObj(opt)) simpleExtend(def, opt);
                Daze.call(methodName, def, callback);
            };
        });

    /**
     * 初始化模块功能
     * @param methods
     * @param moduleName
     */
    Daze.bindModule = function (methods, moduleName) {

        var module = Daze[moduleName] = Daze[moduleName] || {};

        if (isStr(methods)) {
            methods = [methods];
        }

        if (isArray(methods)) {
            (methods).forEach(function (methodName) {
                module[methodName] = function (opt, callback) {
                    var def = {
                        "moduleName": moduleName
                    };

                    simpleExtend(def, opt);

                    Daze.call(methodName, def, callback);
                };
            });
        }
    };

    /**
     * 绑定全局事件
     * @param {string} event 事件名称，多个事件可用空格分隔开
     * @param {function} fn 回调函数
     */
    Daze.on = function (event, fn) {
        event.split(/\s+/g).forEach(function (eventName) {
            document.addEventListener(eventName, fn, false);
        });
    };

    function isStr(fn) {
        return 'string' === type(fn);
    }

    function isObj(o) {
        return 'object' === type(o);
    }

    function isNumber(num) {
        return "number" === type(num);
    }

    function isArray(o) {
        return 'array' === type(o);
    }

    function type(obj) {
        return Object.prototype.toString.call(obj).replace(/\[object (\w+)\]/, '$1').toLowerCase();
    }

    function simpleExtend(target, source) {
        for (var k in source) {
            target[k] = source[k];
        }
        return target;
    }


    Daze.init = function () {
        //禁用重复调用
        Daze.init = null;

        var readyEvent = document.createEvent("Events");
        readyEvent.initEvent("DazeJSObjReady", false, false);

        // 处理ready事件发生以后才addEventListener的情况
        var docAddEventListener = document.addEventListener;
        document.addEventListener = function (name, func) {
            if (name === readyEvent.type) {
                // 保持func执行的异步性
                setTimeout(function () {
                    func(readyEvent);
                }, 1);
            } else {
                docAddEventListener.apply(document, arguments);
            }
        };

        Daze.startApp();

        document.dispatchEvent(readyEvent);

    };

    window.Daze = Daze;

    Daze.on("DazeJSBridgeReady", function () {
        console.log("DazeJSBridgeReady");
        Daze.init();
    });

}());
