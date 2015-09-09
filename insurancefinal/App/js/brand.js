require([
    'lib/zepto.min',
    'lib/tpl.min',
    'com/host',
    'com/tools',
    'com/storage',
    'com/common',
    'common',
    'com/GALocalStorage'
], function (a, b, host, tool, storage, DZ_COM, common) {

    var domId = 'mainBox',
        $mainBox = $('#mainBox'),
        $keyword = $('#keyword'),
        $resultBox = $('#resultBox'),
        $searchBtn = $('#searchBtn'),
        $tips = $('#tips'),
        pageNum = 1,
        pageSize = 10,
        totalPage = 1,
        moreResult = false;

    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        init();
    }, false);

    function init() {
        renderHeader();
        bindEvents();
        ga_storage._trackPageview('insurancefinal/brand', "汽车服务-橙牛车险管家-选择品牌型号");
    }

    function bindEvents() {
        $keyword.on({
            keydown : function(e){
                var _val = $(this).val();
                var theEvent = e || window.event;    
                var code = theEvent.keyCode || theEvent.which || theEvent.charCode;    
                if (code == 13) {
                    if (_val.replace(/\s/g, '') === '') {
                        Daze.showMsg('请输入车型');
                        return;
                    }
                    pageNum = 1;
                    vehicleModel();
                    }  
            }
        });
        $searchBtn.on({
            click: function() {
                var _val = $keyword.val();
                if (_val.replace(/\s/g, '') === '') {
                    Daze.showMsg('请输入车型');
                    return;
                }
                pageNum = 1;
                vehicleModel();
            }
        });
        /*$tips.on({
            click: function() {
                $tips.find('.tpl').removeClass('hidden');
            }
        }, 'p').on({
            click: function() {
                $(this).addClass('hidden');
                return false;
            }
        }, '.tpl');*/
        $mainBox.on({
            click: function() {
                $mainBox.find('.otherPrivce').removeClass('hidden');
            }
        }, '.tips').on({
            click: function() {
                $(this).closest('.otherPrivce').addClass('hidden');
            }
        }, '.closed').on({
            click: function() {
                var _input = $(this).closest('.otherPrivce').find('input'),
                    val = _input.val();
                if (val === '') {
                    Daze.showMsg('请输入购车价格');
                    return;
                } else {
                    if (/^\d+(\.\d+)?$/g.test(val)) {
                        $(this).closest('.otherPrivce').addClass('hidden');
                        setData({
                            vehicleModelCode: ' ',
                            vehicleModelPrice: val,
                            vehicleModelName: '未知车型  ' + val + '万元'
                        });
                    } else {
                        Daze.showMsg('您输入的价格有误');
                    }
                }
            }
        }, '.otherPrivce .btn');

        $resultBox.on({
            click: function() {
                var vehicleModelCode = $(this).attr('data-code'),
                    vehicleModelName = $(this).attr('data-name'),
                    price = $(this).attr('data-price');
                var data = {
                    vehicleModelCode: vehicleModelCode,
                    vehicleModelName: vehicleModelName,
                    vehicleModelPrice: price / 10000
                };
                setData(data);
            }
        }, 'dd').on({
            click: function() {
                ++pageNum;
                if (totalPage <= pageNum) {
                    $(this).closest('.action').addClass('hidden');
                }
                vehicleModel();
            }
        }, 'input[name=readyMore]');
    }

    function vehicleModel() {
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/appclient/common/vehicleModel.htm",
                data: DZ_COM.convertParams({
                    keyword: $keyword.val(),
                    pageNum: pageNum,
                    pageSize: pageSize
                }),
                success: function(r) {
                    Daze.showMsg({
                        type: 'loading',
                        visible: false
                    });
                    if (r.code == '0') {
                        if (r.data && r.data.list) {
                            if (pageNum == 1) {
                                totalPage = Math.ceil(r.data.total / pageSize);
                                renderList(r.data.list);
                            } else {
                                renderMore(r.data.list);
                            }
                        }
                    } else {
                        Daze.showMsg(r.msg);
                    }
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-查询车型', 'appclient/common/vehicleModel.htm', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-查询车型', 'appclient/common/vehicleModel.htm', '失败');
                }
            });
        });
    }

    function setData(obj) {
        var data = {
            vehicleModelCode: obj.vehicleModelCode,
            vehicleModelName: obj.vehicleModelName,
            vehicleModelPrice: obj.vehicleModelPrice
        };

        Daze.system.postObserver({
            name: 'daze_selectBrandEvent',
            eventData: data
        });

        // 兼容android
        common.setObj('vehicleModelCode', obj.vehicleModelCode);
        common.setObj('vehicleModelName', obj.vehicleModelName);
        common.setObj('vehicleModelPrice', obj.vehicleModelPrice);
        Daze.popTo(-1);
    }

    function renderHeader() {
        Daze.setTitle('选择车型');
    }

    function renderMore(list) {
        console.log(list);
        $resultBox.find('dl').append(template('moreList', {
            list: list
        }));
    }

    function renderList(list) {
        var data = {
            list: list
        };
        $tips.addClass('hidden');
        $mainBox.find('.tips').removeClass('hidden');
        $resultBox.html(template('brandListTmpl', data));
        if (totalPage > 1) {
            $resultBox.find('.action').removeClass('hidden');
        }
    }
});
