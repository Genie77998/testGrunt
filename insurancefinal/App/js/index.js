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
    'com/GALocalStorage'
], function (a, b, host, tool, storage, common, DZ_COM) {
    var domId = 'mainBox',
        orderlists = [],
        _req = tool.getQueryString(),
        //_listCache = storage.getItem('bxlistRepot'),
        userInfo = {},
        $mainBox = $('#mainBox');

    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        DZ_COM.login(function () {
            init();
        }); 
    }, false);

    function init() {
        renderHeader();
        if(!tool.isEmpty(_req)&&_req.type=='1'){
            renderNewOrder();
        }else{
            renderCache();
        }
        bindEvents();

        document.addEventListener('daze_selectCityEvent', function(e) {
            var data = e.eventData;
            if (!data) {
                data = {
                    cityCode: common.getObj('cityCode'),
                    cityName: common.getObj('cityName')
                };
            }
            setCity(data);
        });

        document.addEventListener('daze_selectBrandEvent', function(e) {
            var data = e.eventData;
            if (!data) {
                data = {
                    vehicleModelCode: common.getObj('vehicleModelCode'),
                    vehicleModelName:common.getObj('vehicleModelName'),
                    vehicleModelPrice: common.getObj('vehicleModelPrice')
                };
            }
            setBrand(data);
        });

        ga_storage._trackPageview('insurancefinal/index', "汽车服务-橙牛车险管家-在线车险");
    }

    function renderNewOrder(){
        common.setUid();
        var _re = common.getObj();
        renderTempl({
            data : _re,
            type : 'newOrder'
        });
    }

    function renderCache(){
        var _list = storage.getItem('bxlistRepot'),
            bxlsit = storage.getItem('bxlsit');
        if(tool.isEmpty(bxlsit)){
            if(!tool.isEmpty(_list)){
                orderlists = _list;
                renderTempl({
                    data : orderlists,
                    type : 'list'
                }); 
            }
        }else{
            renderNewOrder();
        }
        listReport();
    }

    function listReport(){
        common.setUid();
        if(tool.isEmpty(storage.getItem('bxlsit')) && tool.isEmpty(storage.getItem('bxlistRepot'))){
            Daze.showMsg({
                type: 'loading',
                visible: true
            });
        }
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/appclient/baoxian/listReport.htm",
                data: DZ_COM.convertParams({
                    userId: common.getObj('uid')
                }),
                success: function(r) {
                    Daze.showMsg({
                        type: 'loading',
                        visible: false
                    });
                    if (r.code == '0' && r.data && r.data.list) {
                        if(r.data.list.length){
                            common.setObj();
                            orderlists = r.data.list;
                            storage.setItem('bxlistRepot',r.data.list);
                            storage.clearItem('bxlsit');
                            renderTempl({
                                data : r.data.list,
                                type : 'list'
                            });
                        }else{
                            storage.clearItem('bxlistRepot');
                            if(tool.isEmpty(storage.getItem('bxlsit'))){
                                storage.setItem('bxlsit',{
                                    'has' : 'true'
                                });
                                common.setObj();
                                renderNewOrder();
                            }
                        }
                    }
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-核保列表', '/appclient/baoxian/listReport.htm', '成功');
                },
                error: function(r) {
                    Daze.showMsg({
                        type: 'loading',
                        visible: false
                    });
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-核保列表', '/appclient/baoxian/listReport.htm', '失败');
                }
            });
        });
    }

    function queryReport(){
        common.setObj();
        if(tool.isEmpty(storage.getItem('bxlsit'))){
            common.setUid();
            Daze.showMsg({
                type: 'loading',
                visible: true
            });
            DZ_COM.checkNetwork(domId, function() {
                $.ajax({
                    url: host.HOST_URL + "/appclient/baoxian/listReport.htm",
                    data: DZ_COM.convertParams({
                        userId: common.getObj('uid')
                    }),
                    success: function(r) {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        if (r.code == '0' && r.data && r.data.list && r.data.list.length) {
                            renderTempl({
                                data : r.data.list,
                                type : 'list'
                            });
                            orderlists = r.data.list;
                            storage.setItem('bxlistRepot',r.data.list);
                            console.log(orderlists);
                        } else {
                            storage.setItem('bxlsit',{
                                'has' : 'true'
                            });
                            renderNewOrder();
                        }
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-核保列表', '/appclient/baoxian/listReport.htm', '成功');
                    },
                    error: function(r) {
                        DZ_COM.renderNetworkTip(domId, 1);
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-核保列表', '/appclient/baoxian/listReport.htm', '失败');
                    }
                });
            });
        }else{
            renderNewOrder();
        }
    }

    function bindEvents() {
        $mainBox.on('click', '.view-tpl p', function() {
            $(this).parent().find('.tpl').removeClass('hidden');
        }).on({
            click: function() {
                $(this).addClass('hidden');
                return false;
            }
        }, '.tpl').on({
            click: function() {
                Daze.system.addObserver({
                    name: 'daze_selectCityEvent'
                });
                Daze.pushWindow('city.html');
            }
        }, '.cityItem').on({
            click: function() {
                Daze.system.addObserver({
                    name: 'daze_selectBrandEvent'
                });
                Daze.pushWindow('brand.html');
            }
        }, '.brandItem').on({
            click: function() {
                var _click = $(this).data('click');
                if (_click) {
                    $mainBox.find('.reUpload').removeClass('hidden');
                } else {
                    uploadFile.call(this);
                }
            }
        }, '.itemxsz').on({
            click: function() {
                $(this).closest('.reUpload').addClass('hidden');
            }
        }, '.reUpload .closed').on({
            click: function() {
                $(this).closest('.reUpload').addClass('hidden');
                uploadFile.call($mainBox.find('.itemxsz'));
            }
        }, '.reUpload .btn').on({
            click: function() {
                fastReport();
            }
        }, '#goToInsure').on({
            click : function(){
                common.setObj();
                Daze.pushWindow("index.html?type=1");
            }
        },'#sendOrder').on({
            click : function(){
                    common.setObj();
                    common.setUid();
                var data = common.getObj(),
                    index = $(this).data('index'),
                    uid = data.uid,
                    baoxianBaseInfoId = $(this).data('baseinfoid');
                    getUserBaseInfo(uid,baoxianBaseInfoId,function(){
                        var _data = $.extend(data,userInfo,orderlists[index]);
                        common.setObj(_data);
                        common.setObj('baoxianBaseInfoId',baoxianBaseInfoId);
                        common.setObj('userInfo',userInfo);
                        Daze.pushWindow("underWriting.html");
                    });
            }
        },'div[data-btn=orderlist]');
    }

    function getUserBaseInfo(uid,baoxianBaseInfoId,callback){
        if(tool.isEmpty(userInfo)){
            Daze.showMsg({
                type: 'loading',
                visible: true
            });
            DZ_COM.checkNetwork(domId, function() {
                $.ajax({
                    url: host.HOST_URL + "/appclient/baoxian/userBaseInfo.htm",
                    data: DZ_COM.convertParams({
                        userId : uid,
                        id : baoxianBaseInfoId
                    }),
                    success: function(r) {
                        if (r.code == '0' && r.data) {
                            Daze.showMsg({
                                type: 'loading',
                                visible: false
                            });
                            userInfo = r.data;
                            callback&&callback();
                        } else {
                            //Daze.showMsg(r.msg);
                        }
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-基本信息', 'appclient/baoxian/userBaseInfo.htm', '成功');
                    },
                    error: function(r) {
                        DZ_COM.renderNetworkTip(domId, 1);
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-基本信息', 'appclient/baoxian/userBaseInfo.htm', '失败');
                    }
                });
            });
        }else{
            callback&&callback();
        }
    }

    function uploadFile() {
        var me = $(this);
        Daze.photo({
            type: 6
        }, function(o) {
            if (!o.url) {
                return false;
            }
            var $img = me.find('img');
            $img.attr('src', o.url);
            me.attr('data-click', 'true').find('input').val('已上传');
            $('input[name="drivingUrl"]').val(o.url);
            $mainBox.find('.reUpload').find('img').attr('src', o.url);
            common.setObj('drivingUrl', o.url);
        });
    }


    function renderHeader() {
        Daze.setTitle('在线车险');
    }

    function fastReport() {
        var data = validate();
        if (!data) {
            return false;
        }
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        data.vehicleModelCode = $('#brand').attr('data-code');
        data.vehicleModelName = $('#brand').val();
        data.userId = common.getObj('uid');
        data.id = common.getObj('baoxianBaseInfoId') || '';
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/appclient/baoxian/fastReport.htm",
                data: DZ_COM.convertParams(data),
                success: function(r) {
                    if (r.code == '0') {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        if(r.data && r.data.list.length){
                            common.setObj('bjList', common.listFn(r.data.list));
                            common.setObj('baoxianBaseInfoId', r.data.id);
                            Daze.pushWindow('getPrvice.html');
                        }else{
                            Daze.showMsg('暂无报价，请检查您的车型');
                        }
                    } else {
                        Daze.showMsg(r.msg);
                    }
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-闪电报价', 'appclient/baoxian/fastReport.htm', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-闪电报价', 'appclient/baoxian/fastReport.htm', '失败');
                }
            });
        });
    }

    function getData() {
        var formData = tool.getFormDataAsObj($('form'));
        formData.cityCode = $('#city').attr('data-code');
        formData.price = $('#brand').attr('data-price');
        return formData;
    }

    function validate() {
        var data = getData(),
            valid = true;
        for (var i in data) {
            var value = data[i],
                $item = $('[name=' + i + ']'),
                require = $item.data('require'),
                nullMsg = $item.data('null'),
                errorMsg = $item.data('error'),
                ruleName = $item.data('rule') || '';

            if (require) {
                if (!value) {
                    valid = false;
                    console.log(nullMsg);
                    Daze.showMsg(nullMsg);
                    break;
                } else if (ruleName && !rule.test(value)) {
                    valid = false;
                    console.log(errorMsg);
                    Daze.showMsg(errorMsg);
                    break;
                }
            } else {
                if (value && ruleName && !rule.test(value)) {
                    valid = false;
                    console.log(errorMsg);
                    Daze.showMsg(errorMsg);
                    break;
                }
            }
        }
        return valid ? data : false;
    }

    function renderTempl(data) {
        $mainBox.html(template('indexTemplate',data));
    }

    function setCity(data) {
        document.removeEventListener('daze_selectCityEvent', function(e) {
            setCity(e.data);
        });
        $('#city').val(data.cityName).attr('data-code', data.cityCode);
    }

    function setBrand(data) {
        document.removeEventListener('daze_selectBrandEvent', function(e) {
            setBrand(e.data);
        });
        $('input[name=vehicleModelCode]').val(data.vehicleModelName).attr({
            'data-price' : data.vehicleModelPrice,
            'data-code' : data.vehicleModelCode
        });
    }

});
