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
    var $mask = $('#mask'),
        $provinces = $('#provinces'),
        $cities = $("#cities");

    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        init();
    }, false);

    function init() {
        renderHeader();
        getList(0);
        bindEvents();
        ga_storage._trackPageview('insurancefinal/city', "汽车服务-橙牛车险管家-选择城市");
    }

    function bindEvents() {
        // 选择省份
        $provinces.on('click', 'li', function() {
            var cityCode = $(this).attr('data-id');
            common.setObj('province', $(this).text());
            getList(1, cityCode);
        });

        // 选择城市
        $cities.on('click', 'li', function() {
            var cityCode = $(this).attr('data-id'),
                cityName = $(this).text();

            $cities.addClass('hidden');
            $mask.addClass('hidden');

            var data = {
                cityCode: cityCode,
                cityName: cityName
            };

            Daze.system.postObserver({
                name: 'daze_selectCityEvent',
                eventData: data
            });
            // 兼容android
            //common.setObj('city_info',data);
            common.setObj('cityCode', cityCode);
            common.setObj('cityName', cityName);
            Daze.popTo(-1);
        });

        // 关闭选择城市
        $mask.click(function() {
            $(this).addClass('hidden');
            $cities.addClass('hidden');
        });
    }

    function renderHeader() {
        Daze.setTitle('橙牛车险管家');
    }

    function getList(level, cityCode) {
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        var domId = 'page';
        DZ_COM.checkNetwork(domId, function() {
            var data = {
                level: level
            };
            if (cityCode) {
                data.cityCode = cityCode;
            }
            $.ajax({
                url: host.HOST_URL + "/appclient/common/queryCity.htm",
                data: DZ_COM.convertParams(data),
                success: function(r) {
                    if (r.code == 0) {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        renderList(level, r.data);
                    } else {
                        Daze.showMsg(r.msg);
                    }
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-选择城市', '/appclient/common/queryCity.htm', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-选择城市', '/appclient/common/queryCity.htm', '失败');
                }
            });
        });
    }

    function renderList(level, list) {
        if (level == 0) {
            $provinces.html(template('provinceTmpl', {
                provinces: list
            }));
        } else if (level == 1) {
            $cities.html(template('cityTmpl', {
                cities: list
            })).removeClass('hidden');
            $mask.removeClass('hidden');
        }
    }
});
