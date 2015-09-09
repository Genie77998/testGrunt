/**
 * author:DZ
 * time:2014/10/12
 */
define([
    'lib/zepto.min',
    'lib/md5.min',
    'com/storage',
    'com/host'
], function (a, md5, storage, host) {
    return {
        convertParams: function (params) {
            var appkey = 'ba0a57838f';
            var secret = '763f6ef3b392637b';
            var time = +new Date();
            var sign = appkey + secret + time;
            var o = {
                appkey: appkey,
                time: time
            };
            if (params) {
                sign += JSON.stringify(params);
                o.params = JSON.stringify(params);
            }
            o.sign = md5(sign);
            return o;
        },
        convertStatus: function (status) {
            var s = '',
                color = '',
                bc = '';
            switch (status) {
                case -1:
                    s = '已删除';
                    color = '#7c7c7c';
                    break;
                case 1:
                    s = '无法支付';
                    color = '#7c7c7c';
                    break;
                case 2:
                    s = '待支付';
                    color = '#ff7e2e';
                    break;
                case 3:
                    s = '已支付';
                    color = '#ff7e2e';
                    break;
                case 4:
                    s = '审核信息';
                    color = '#ff7e2e';
                    break;
                case 5:
                    s = '待审核';
                    color = '#ff7e2e';
                    break;
                case 6:
                    s = '审核失败';
                    color = '#ff7e2e';
                    break;
                case 7:
                    s = '审核通过';
                    color = '#ffb718';
                    break;
                case 10:
                    s = '处理中';
                    color = '#ff7e2e';
                    break;
                case 11:
                    s = '处理失败';
                    color = '#7c7c7c';
                    break;
                case 12:
                    s = '处理成功';
                    color = '#7c7c7c';
                    break;
                case 13:
                    s = '待退款';
                    color = '#71bbf7';
                    break;
                case 14:
                    s = '已退款';
                    color = '#7c7c7c';
                    break;
                case 15:
                    s = '确认完成';
                    color = '#7c7c7c';
                    break;
                case 16:
                    s = '已评价';
                    color = '#7c7c7c';
                    break;
                case 20:
                    s = '已关闭';
                    color = '#7c7c7c';
                    break;
            }
            return {
                status: s,
                color: color,
                backgroundColor: bc
            };
        },
        addMask: function (target) {
            if (!target) {
                target = $('body');
            }
            var mask = $('<div class="mask" id="mask">');
            target.append(mask);
        },
        removeMask: function (target) {
            if (!target) {
                target = $('body');
            }
            target.find('#mask').remove();
        },
        confirm: function (options) {
            /*
             {
             title ： 标题
             content : 内容
             yesFn : 确认回调
             noFn : 取消回调
             }
             */
            var me = this,
                $body = $('body'),
                $confirmBox = $('<div class="win-confirm" id="winConfirm">');
            $confirmBox.append(
                $('<div class="title">').html(options.title || '提示'),
                $('<div class="content body2">').html(options.content),
                $('<div class="btns">').append(
                    $('<input type="button" class="btn btn-no" id="btnNo" value="取消">'),
                    $('<input type="button" class="btn btn-yes" id="btnYes" value="确认">')
                )
            );

            me.addMask();
            $body.append($confirmBox);

            $('#btnNo').click(function () {
                me.removeMask();
                $confirmBox.remove();
                if (options.noFn) {
                    options.noFn();
                }
            });

            $('#btnYes').click(function () {
                if (options.yesFn) {
                    options.yesFn();
                }
                me.removeMask();
                $confirmBox.remove();
            });
        },
        login: function (callback) {
            var me = this;
            var pid = storage.getPid(),
                uid = storage.getUid(),
                userId = storage.getUserId();
            if (pid && userId) {
                // 已登录
                if (uid) {
                    if (callback) {
                        callback();
                    }
                }
                else {
                    me.getUidByPid(pid, function () {
                        if (callback) {
                            callback();
                        }
                    });
                }

            } else {
                // 未登录
                Daze.login(function (resp) {
                    if (Number(resp.isSuccess)) {
                        var pid = Number(resp.pid),
                            uid = Number(resp.uid),
                            userId = Number(resp.userId);
                        if (pid) {
                            storage.storeInfo('pid', pid);
                        }
                        if (uid) {
                            storage.storeInfo('uid', uid);
                        }
                        if (userId) {
                            storage.storeInfo('userId', userId);
                        }
                        if (callback) {
                            callback(resp);
                        }
                    }
                });
            }
        },
        getUidByPid: function (pid, callback) {
            var me = this;
            $.ajax({
                url: host.HOST_URL + '/user/getUId.htm',
                data: me.convertParams({
                    pId: pid
                })
            }).done(function (r) {
                if (r.code == 0) {
                    var uid = Number(r.data.result);
                    storage.storeInfo('uid', uid);
                    if (callback) {
                        callback(uid);
                    }
                }
                else {
                    return false;
                }
            });
        },
        validateParams: function (params, callback) {
            var me = this;
            var eligible = true,
                msg = '';

            if (!params.pId || !params.userId) {
                eligible = false;
                msg = '请登录';
            }
            else if (!params.uid) {
                eligible = false;
                me.getUidByPid(params.pId, function () {
                    if (callback) {
                        callback();
                    }
                });
                return false;
            }
            else if (!params.price) {
                eligible = false;
                msg = '成交价不能为0';
            }
            else {
                for (var key in params) {
                    if (!params[key] && key != 'cardType' && key != 'name') {
                        eligible = false;
                        msg = '下单失败';
                    }
                }
            }

            return {
                eligible: eligible,
                msg: msg
            }
        },
        checkNetwork: function (domId, callback) {
            var me = this;

            Daze.network.getType(function (typeObj) {
                if (!typeObj.isOnline) {
                    me.renderNetworkTip(domId, 0);
                    return false;
                }
                else {
                    if (callback) {
                        callback();
                    }
                }
            });
        },
        renderNetworkTip: function (domId, type) {
            Daze.showMsg({
                type: 'loading',
                visible: false
            });
            var tipClass = 'tip-network caption',
                tipId = 'networkTip',
                text = '',
                msg = '',
                imgUrl = '',
                btnId = 'btnRefresh',
                btnValue = '立即刷新';

            switch (type) {
                case 0://无网络
                    text = '没有检测到网络连接<br>请确认连接后刷新';
                    imgUrl = './images/nonetwork.png';
                    break;
                case 1://网络信号差
                    text = '网络不给力<br>请稍后刷新';
                    msg = '网络不给力,请稍后刷新';
                    imgUrl = './images/badconnection.png';
                    break;
                case 2://定位失败
                    text = '定位失败<br>请选择服务城市';
                    msg = '定位失败请选择服务城市';
                    imgUrl = './images/locatingfail.png';
                    btnId = 'btnSelect';
                    btnValue = '选择';
                    break;
            }

            if (domId) {
                var networkTip = $('<div>').attr({
                    id: tipId,
                    class: tipClass
                }).append(
                    $('<img>').attr('src', imgUrl),
                    $('<p>').attr('class', 'body2').html(text),
                    $('<input>').attr({
                        type: 'button',
                        id: btnId,
                        class: 'btn btn-normal',
                        value: btnValue
                    })
                );

                domId = (domId == 'body') ? 'body' : '#' + domId;
                $(domId).empty().append(networkTip);

                $('#btnRefresh').on('click', function () {
                    location.reload();
                });
            }
            else {
                Daze.showMsg(msg);
            }
        },

        /**
         * @method setCurService
         * @description 根据id获取对应service的详细信息并存储到本地
         * @param serviceId
         */
        setCurService: function (serviceId) {
            var globalData = storage.getGlobalData();
            if (!globalData) {
                return false;
            }

            var serviceList = globalData.serviceList,
                curService = {};

            if (!serviceList || !serviceList.length) {
                storage.storeInfo('curService', curService);
                return false;
            }

            for (var i = 0; i < serviceList.length; i++) {
                if (serviceList[i].serviceId == serviceId) {
                    curService = serviceList[i];
                    curService.id = serviceId;
                    storage.storeInfo('curService', curService);
                    break;
                }
            }
        },
        setImg: function (img, containerW, containerH) {
            var imgW = img[0].naturalWidth,
                imgH = img[0].naturalHeight;

            var w = 0, h = 0, top = 0, left = 0;
            if (imgW / containerW < imgH / containerH) {
                w = containerW;
                h = imgH / imgW * w;
                top = -(h - containerH) / 2;
            }
            else {
                h = containerH;
                w = imgW / imgH * containerH;
                left = -(w - containerW) / 2;
            }
            img.css({
                width: w,
                height: h,
                marginTop: top,
                marginLeft: left
            });
        },

        /**
         * @method getSystem
         * @description 获取系统类型
         * @returns {string} android/ios
         */
        getSystem: function () {
            var system = '';

            if (!Daze.dazeClientVersion) {
                return system;
            }

            if (Daze.dazeClientVersion.indexOf('android') >= 0) {
                system = 'android';
            }
            else if (Daze.dazeClientVersion.indexOf('iOS') >= 0) {
                system = 'ios';
            }

            return system;
        },
        /**
         * @method getVersion
         * @description 获取版本号
         * @returns {*}
         */
        getVersion: function () {
            if (Daze.dazeClientVersion) {
                return Daze.dazeClientVersion.split('_').slice(-1)[0];
            }
            else {
                return '';
            }
        },
        /**
         * @method compareVersion
         * @description 版本比较
         * @param latestVersion 固定版本值
         * @returns {boolean} 当前版本与固定版本比较，>= 则返回 true ，否则返回 false
         */
        compareVersion: function (latestVersion) {
            if (!latestVersion) {
                return false;
            }

            var curVersion = Daze.dazeClientVersion.split('_').slice(-1)[0];
            var latestVersionArray = latestVersion.split('.');
            var curVersionArray = curVersion.split('.');
            var len = latestVersionArray.length;
            var result = true;

            for (var i = 0; i < len; i++) {
                if (curVersionArray[i] < latestVersionArray[i]) {
                    result = false;
                    break;
                }
                else if (curVersionArray[i] > latestVersionArray[i]) {
                    break;
                }
            }

            return result;
        },
        /**
         * @method getToday
         * @description 获取当天日期，日期格式：Y-M-D
         * @returns {string}
         */
        getToday: function () {
            var date = new Date(), day = date.getDate(), month = date.getMonth() + 1, year = date.getFullYear();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;

            return year + "-" + month + "-" + day;
        },
        setToday: function ($date) {
            var today = this.getToday();
            $date.val(today);
        },
        /**
         * @method loadCss
         * @description 动态加载css
         * @param url
         */
        loadCss: function (url) {
            var _id = url.split('.')[0].replace('/','');
            if(!document.getElementById(_id)){
                var link = $('<link type="text/html" rel="stylesheet">');
                    link.attr({'href' : url , id : _id});
                    $('head').append(link);
            }
        },
        /**
         * @method getUserId
         * @description 获取userId
         * @param callback
         */
        getUserId: function (callback) {
            var fn = Daze.system.getUserId;
            if (fn && typeof(fn) == 'function') {
                Daze.system.getUserId({}, function (resp) {
                    if (resp.userId) {
                        storage.storeInfo('userId', resp.userId);
                        if (callback) {
                            callback(resp.userId);
                        }
                    }
                });
            }
        },
        /**
         * @method getCityPrefix
         * @description 获取当前定位城市的简称
         * @param callback
         */
        getCityPrefix: function (callback) {
            var fn = Daze.geolocation.getCityPrefix;
            if (fn && typeof(fn) == 'function') {
                Daze.geolocation.getCityPrefix({}, function (resp) {
                    if (resp.prefix) {
                        if (callback) {
                            callback(resp.prefix);
                        }
                    }
                });
            }
        }
    }
});
