/**
 * author:wj77998
 */
require([
    'lib/zepto.min',
    'lib/tpl.min',
    'com/host',
    'com/tools',
    'com/storage',
    'common',
    'com/common',
    'checkDate',
    'com/GALocalStorage'
], function (a, b, host, tool, storage, common, DZ_COM,checkDate) {
    var domId = 'mainBox',
        _re = common.getObj(),
        $mainBox = $('#mainBox');
    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        init();
    }, false);

    function init() {
        console.log(_re);
        renderHeader();
        bindEvents();
        $mainBox.html(
            template('orderPayTmpl', {
                data: common.getObj()
            })
        );
        getBalance(function(){
            var re = common.getObj();
            $mainBox.find('.payWay .payOffline').find('p').html('余额支付(￥'+common.getObj("cashBalance")+')');
        });
        
        ga_storage._trackPageview('insurancefinal/orderPay', "汽车服务-橙牛车险管家-确认支付信息");
    }

    function bindEvents() {
        $mainBox.on({
            click : function(){
                var _res = common.getObj();
                if(_res.cashBalance > _res.totalPrice){
                    $(this).addClass('active').siblings('dd').removeClass('active');
                }else{
                    if($(this).hasClass('active')){
                        $(this).removeClass('active');
                    }else{
                        $(this).addClass('active');
                    }
                }
            }
        },'.payWay .payOffline').on({
            click : function(){
                var _res = common.getObj();
                if(_res.cashBalance > _res.totalPrice){
                    $(this).addClass('active').siblings('dd').removeClass('active');
                }else{
                    $(this).addClass('active').siblings('.payOnline').removeClass('active');
                }
            }
        },'.payWay .payOnline').on({
            click : function(){
                var _res = common.getObj();
                if(_res.cashBalance > _res.totalPrice){
                    var payType = $mainBox.find('.payWay dd.active').attr('data-type');
                }else{
                    var payType = $mainBox.find('.payWay dd.payOnline.active').attr('data-type');
                }
                
                handerPay(payType);
            }
        },'input[name=goToPay]').on({
            click : function(){
                $(this).addClass('hidden');
                Daze.pushWindow("delivery.html?type=2");
            }
        },'input[name=saveAddress]');
    }

    function handerPay(payType){
        if(!payType){
            Daze.showMsg('请选择支付方式');
            return false;
        }
        var useBalance = $mainBox.find('.payWay .payOffline').hasClass('active'),
            payOnline = Boolean($mainBox.find('.payWay .payOnline.active').length);
            if(useBalance){
                if(payType == '16'){
                    payType = 17;
                }
                if(payType == '12'){
                    payType = 14;
                }
            }
        var pay = {
            orderId : _re.payInfo.id,
            useBalance: useBalance,
            payOnline: payOnline,
            payType : payType
        };
        Daze.pay(pay, function (resp) {
            if (resp.isSuccess) {
                if(pay.payOnline){
                    Daze.showMsg({
                        type: 'loading',
                        visible: true,
                        text : '订单处理中'
                    });
                    setTimeout(function () {
                        Daze.showMsg({
                            type: 'loading',
                            visible: true,
                            text : ''
                        });
                        paySuccess();
                    }, 5000);
                }else{
                    paySuccess();
                }
                function paySuccess(){
                    $.ajax({
                        url: host.HOST_URL + '/appclient/common/pay.htm',
                        type: 'post',
                        data: {orderNum:_re.payInfo.orderNum},
                        success : function(r){
                            console.log(r);
                        }
                    });
                    $.ajax({
                        url: host.HOST_URL + '/formOrder/updatePayStatus.htm',
                        type: 'post',
                        data: DZ_COM.convertParams({
                            orderId:_re.payInfo.id
                        }),
                        success : function(r){
                            console.log(r);
                        }
                    });
                    
                    Daze.system.postObserver({
                        name: 'daze_payStatus',
                        eventData: {
                            result : 'payOk'
                        }
                    });
                    common.setObj('_payStatus',{
                        result : 'payOk'
                    });
                    Daze.showMsg('支付成功');
                    common.setObj('payStatus',1);
                    setTimeout(function() {
                        location.reload();
                        Daze.pushWindow('delivery.html?type=2');
                    }, 3000);
                }
            }else {
                Daze.showMsg('支付失败');
            }
        });
    }

    function getBalance(callback){
        if(typeof common.getObj('cashBalance') != 'number'){
            Daze.showMsg({
                type: 'loading',
                visible: true
            });
            DZ_COM.checkNetwork(domId, function() {
                $.ajax({
                    url: host.HOST_URL + "/user/getUserInfo.htm",
                    data: DZ_COM.convertParams({
                        uid: _re.uid
                    }),
                    success: function(r) {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        if (r.code == '0') {
                            common.setObj('cashBalance', r.data.userInfo.cashBalance);
                            typeof callback != 'undefined' && callback.constructor == Function && callback();
                        } else {
                            Daze.showMsg(r.msg);
                        }
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-基本信息', '/user/getUserInfo.htm', '成功');
                    },
                    error: function(r) {
                        DZ_COM.renderNetworkTip(domId, 1);
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-基本信息', '/user/getUserInfo.htm', '失败');
                    }
                });
            });
        }
    }

    function renderHeader() {
        Daze.setTitle('确认支付信息');
    }

});
