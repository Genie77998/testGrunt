/**
 * Created by libin on 14/11/12.
 */
;(window.DazeJSBridge || (function () {
    if (navigator.userAgent.indexOf('DazeClient') < 0) {
        //return;
    }

    var iframe = null;

    function renderIframe() {
        if (iframe) return;
        try {
            iframe = document.createElement("iframe");
            iframe.id = "__DazeJSBridgeIframe";
            iframe.style.display = "none";


            document.documentElement.appendChild(iframe);
        } catch (e) {

        }
    }

    function onDOMReady(callback) {
        var readyRE = /complete|loaded|interactive/;
        if (readyRE.test(document.readyState)) {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', function () {
                callback()
            }, false);
        }
    }

    var callbackPool = {};
    var sendMessageQueue = [];
    var receiveMessageQueue = [];

    var JSAPI = {

        /**
         * @name call
         * @description 调用Native功能
         */
        call: function (func, param, callback) {
            renderIframe();
            if (!iframe) return;

            if ('string' !== typeof func) {
                return;
            }

            if ('function' === typeof  param) {
                callback = param;
                param = null;
            } else if (typeof param !== 'object') {
                param = null;
            }

            //    防止时间戳重复
            var callbackId = func + '_' + new Date().getTime() + (Math.random());
            if ('function' === typeof callback) {
                callbackPool[callbackId] = callback;
            }

            if (param && param.callbackId) {
                //    从Native调用过来的请求，再回调到Native的callback里去
                func = {
                    responseId: param.callbackId,
                    responseData: param
                };

                delete param.callbackId;
            } else {
                //    从页面直接发起到Native的请求
                func = {
                    handlerName: func,
                    data: param
                };

                func.callbackId = '' + callbackId;
            }
            sendMessageQueue.push(func);
            iframe.src = "dazebridge://__DWJB_QUEUE_MESSAGE__";

        },

        trigger: function (name, data) {
            if (name) {
                var triggerEvent = function (name, data) {
                    var callbackId;
                    if (data && data.callbackId) {
                        callbackId = data.callbackId;
                        data.callbackId = null;
                    }

                    var evt = document.createEvent("Events");
                    evt.initEvent(name, false, true);
                    if (data) {
                        if (data.__pull__) {
                            delete data.__pull__;
                            for (var k in data) {
                                evt[k] = data[k];
                            }
                        } else {
                            evt.data = data;
                        }
                    }

                    var canceled = !document.dispatchEvent(evt);
                    if (callbackId) {
                        var callbackData = {};
                        callbackData.callbackId = callbackId;
                        callbackData[name + 'EventCanceled'] = canceled;
                        JSAPI.call('__nofunc__', callbackData);
                    };
                };

                setTimeout(function () {
                    triggerEvent(name, data);
                }, 1);
            }
        },

        /**
         * Native调用JS函数，传输消息
         */
        __invokeJS: function (resp) {
            resp = JSON.parse(resp);
            if (resp.responseId) {
                var func = callbackPool[resp.responseId];
                //    某些情况需要多次回调，添加keepCallback标识，防删除
                if (!(typeof resp.keepCallback == 'boolean' && resp.keepCallback)) {
                    delete callbackPool[resp.responseId];
                }

                if ('function' === typeof func) {
                    //    避免死锁问题
                    setTimeout(function () {
                        func(resp.responseData);
                    }, 1);
                }
            } else if (resp.handlerName) {
                if (resp.callbackId) {
                    resp.data = resp.data || {};
                    resp.data.callbackId = resp.callbackId;
                }

                JSAPI.trigger(resp.handlerName, resp.data);
            }
        },

        /**
         * WebViewJavascriptBridge.js库兼容
         */
        _handleMessageFromObjC: function (message) {
            if (receiveMessageQueue) {
                receiveMessageQueue.push(message);
            } else {
                JSAPI.__invokeJS(message);
            }
        },

        _fetchQueue: function () {
            var messageQueueString = JSON.stringify(sendMessageQueue);
            sendMessageQueue = [];

            // only for Android
            if (window.JSResult && (typeof window.JSResult.fetchQueueResult === 'function')) {
                window.JSResult.fetchQueueResult(messageQueueString);
            }

            return messageQueueString;
        }

    };

    /**
     * 初始化，在webview的 didFinishLoad后调用
     */
    JSAPI.init = function () {

        //仅允许运行一次
        JSAPI.init = null;

        JSAPI.startupParams = window.DAZEH5STARTUPPARAMS || {};
        window.DAZEH5STARTUPPARAMS = null;

        var readyEvent = document.createEvent("Events");
        readyEvent.initEvent('DazeJSBridgeReady', false, false);

        //处理ready时间后才addEventListener的情况
        var docAddEventListener = document.addEventListener;
        document.addEventListener = function (name, func) {
            if (name == readyEvent.type) {
                // 保持func执行的异步性
                setTimeout(function () {
                    func(readyEvent);
                }, 1);
            } else {
                docAddEventListener.apply(document, arguments);
            }
        };

        document.dispatchEvent(readyEvent);

        var receivedMessages = receiveMessageQueue;
        receiveMessageQueue = null;

        for (var i = 0; i < receivedMessages.length; i++) {
            JSAPI.__invokeJS(receivedMessages[i]);
        }

    };

    window.DazeJSBridge = JSAPI;
    onDOMReady(JSAPI.init);

})());
