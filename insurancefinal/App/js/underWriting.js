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
        orderId = 0,
        $mainBox = $('#mainBox');
    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        init();
    }, false);

    document.addEventListener('daze_payStatus', function(e) {
        var data = e.eventData;
        if (!data) {
            data = common.getObj('_payStatus');
        }
        setpayStatus(data);
    });

    document.addEventListener('daze_saveAddress', function(e) {
        var data = e.eventData;
        if (!data) {
            data = common.getObj('saveAddress');
        }
        setsaveAddress(data);
    });

    function init() {
        queryReport();
        renderHeader();
        bindEvents();
        ga_storage._trackPageview('insurancefinal/underWriting', "汽车服务-橙牛车险管家-核保结果");
    }

    function bindEvents() {
        $mainBox.on({
            click : function(){
                common.removeItem('bjing');
                Daze.pushWindow('insure.html');
            }
        },'.updateBtn').on({
            click : function(){
                Daze.pushWindow('delivery.html?type=1');
            }
        },'.addressBtn').on({
            click : function(){
                var id = $(this).data('id');
                saveOrders(id);
            }
        },'input[name=saveOrders]').on({
            click : function(){
                common.removeItem('bjing');
                common.removeItem('idCardUrl');
                Daze.pushWindow("cardInfo.html");
            }
        },'input[name=gotoUpdateCarda]').on({
            click : function(){
                common.removeItem('bjing');
                if($(this).attr('name')=='gotoUpdateCardb'){
                    common.removeItem('drivingUrl');
                }
                Daze.pushWindow("index.html?type=1");
            }
        },'input[name=gotoNewOrder],input[name=gotoUpdateCardb]');
    }

    function queryReport(){
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/appclient/baoxian/queryReport.htm",
                data: DZ_COM.convertParams({
                    id: _re.id
                }),
                success: function(r) {
                    if (r.code == '0' && r.data) {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        renderTmpl(r.data,common.getObj());
                    } else {
                        Daze.showMsg(r.msg);
                    }
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-核保结果', '/appclient/baoxian/queryReport.htm', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-核保结果', '/appclient/baoxian/queryReport.htm', '失败');
                }
            });
        });
    }

    function renderHeader() {
        Daze.setTitle('核保结果');
    }

    function saveOrders(id){
        if(!common.getObj('payInfo')){
            var _data = common.getObj();
            Daze.showMsg({
                type: 'loading',
                visible: true
            });
            DZ_COM.checkNetwork(domId, function() {
                $.ajax({
                    url: host.HOST_URL + "/appclient/baoxian/saveOrders.htm",
                    data: DZ_COM.convertParams({
                        id : id,
                        userId : _data.uid
                    }),
                    success: function(r) {
                        if (r.data && r.data.result && r.data.id) {
                            Daze.showMsg({
                                type: 'loading',
                                visible: false
                            });
                            common.setObj('payInfo',r.data);
                            common.setObj('payStatus','0');
                            payOrder();
                        } else {
                            Daze.showMsg(r.msg);
                        }
                        console.log(r);
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-提交订单', '/appclient/baoxian/saveOrders.htm', '成功');
                    },
                    error: function(r) {
                        DZ_COM.renderNetworkTip(domId, 1);
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-提交订单', '/appclient/baoxian/saveOrders.htm', '失败');
                    }
                });
            });
        }else{
            payOrder();
        }
    }

    function setpayStatus(data){
        document.removeEventListener('daze_payStatus', function(e) {
            setpayStatus(e.data);
        });
        if(data && typeof data.result !='undefined' && data.result=='payOk'){
            $('.sendPrvice').addClass('hidden');
            $('.updateInsure').addClass('hidden');
        }
    }

    function payOrder(){
        var _info = common.getObj('payInfo');
        if(!_info.id){
            return;
        }
        Daze.system.addObserver({
            name: 'daze_payStatus'
        });
        Daze.system.addObserver({
            name: 'daze_saveAddress'
        });
        Daze.pushWindow('orderPay.html');
    }
    function setsaveAddress(data){
        document.removeEventListener('daze_saveAddress', function(e) {
            setpayStatus(e.data);
        });
        if(data && typeof data.result !='undefined' && data.result=='saveOk'){
            location.reload();
        }
    }

    function renderTmpl(data1,data2){
        var data = $.extend(data2,data1);
        common.setObj(data);
        console.log(data);
        if(data.status == '0'){
            data.successTime = new checkDate(data1.createTime).result;
        }
        $mainBox.html(template('underWritingTmpl', {
            data : data
        }));
        if(data.status=='1' && (data.jqx || data.ccs || data.szx)){
            $mainBox.find('.orderdetail .pri').each(function(){
                var _html = this.innerHTML.replace('￥' , '');
                if(/^\d+\.\d+$/.test(_html)){
                    this.innerHTML = '￥'+Number(_html).toFixed(2);
                }
                if(_html == 'NaN'){
                    this.innerHTML = '0';
                }
            });
        }
    }
});
