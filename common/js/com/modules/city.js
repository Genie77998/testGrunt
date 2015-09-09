/**
 * author:DZ
 * time:2014/11/27
 */
define([
    'lib/zepto.min',
    'com/host',
    'com/tools',
    'com/storage',
    'com/common',
    'com/modules/tpl',
    'com/modules/city-list'
], function (a, host, tool, storage, common, tpl, list) {

    function init() {
        var cityData = storage.getCityData();

        if (tool.isEmpty(cityData) || !cityData.directCities || !cityData.provinces) {
            convertList();
        }
        if (Daze && Daze.geolocation && Daze.geolocation.getGPSCity) { // 获取定位城市
            Daze.geolocation.getGPSCity({}, function (gpsCity) {
                var gpsCityInfo = getCityInfoByName(gpsCity.city);
                if (!tool.isEmpty(gpsCityInfo)) {
                    storage.storeInfo('gpsCity', gpsCityInfo);
                }
                renderProvince();
            });
        }
        else {
            renderProvince();
        }
    }

    function bindProvinceEvents() {
        $('#gpsCity, #directCities').on('click', 'dd', function () {
            if ($(this).data('city_id') && $(this).text() != '定位失败') {
                selectHandler($(this));
            }
        });

        $('#provinces').on('click', 'dd', function () {
            var province = $(this).text();
            renderCity(province);
        });
    }

    function bindCityEvents() {
        var $wrapCity = $('#wrapCity');
        $wrapCity.on('click', 'dd', function (e) {
            selectHandler($(e.target));
        });

        $wrapCity.on('click', '.mask', function () {
            $('#wrapCity').remove();
            $(this).remove();
        });
    }

    /**
     * @method getCurrentCity
     * @description 首次进入应用的定位城市/用户选择的城市
     */
    function getCurrentCity(callback) {
        var isSuccess = false;
        Daze.geolocation.getCurrentPosition(function (cityObj) {
            var curCity = storage.getCurCity();
            // 城市信息
            if (!tool.isEmpty(cityObj)) {
                var cityName = cityObj.city;
                var cityInfo = getCityInfoByName(cityName);
                if (!tool.isEmpty(cityInfo)) {
                    isSuccess = true;
                    storage.storeInfo('curCity', cityInfo);
                }
            }
            // 城市坐标
            if (!tool.isEmpty(cityObj.coords)) {
                storage.storeInfo('coords', cityObj.coords);
            }
            if (callback) {
                callback(isSuccess);
            }
        });
    }

    function convertList() {
        var directCityNames = ["北京", "上海", "天津", "重庆"],
            directCities = [],
            provinces = {};
        for (var i = 0; i < list.length; i++) {
            if (directCityNames.indexOf(list[i].province) > -1) {
                directCities.push(list[i]);
                continue;
            }
            if (!provinces[list[i].province]) {
                provinces[list[i].province] = [];
            }
            provinces[list[i].province].push(list[i]);
        }

        storage.setCityData({
            directCities: directCities,
            provinces: provinces
        });
    }

    /**
     * @method renderProvince
     * @description 渲染省份和直辖市列表
     */
    function renderProvince() {
        var provinceArr = [],
            cityData = storage.getCityData(),
            directCities = cityData.directCities,
            provinces = cityData.provinces;
        for (var key in provinces) {
            provinceArr.push(key);
        }

        $('body').append(
            tpl('province', {
                gpsCity: storage.getGPSCity(),
                directCities: directCities,
                provinces: provinceArr
            })
        );

        $('#wrapProvince').show().addClass('slideUp');

        bindProvinceEvents();
    }

    /**
     * @method renderCity
     * @description 渲染市区列表
     * @param {string} province 选择的省份
     */
    function renderCity(province) {
        var cityData = storage.getCityData(),
            provinces = cityData.provinces,
            city = provinces[province];

        $('body').append(
            tpl('city', {
                province: province,
                city: city
            })
        );
        $('#wrapCity').show();

        bindCityEvents();
    }

    /**
     * @method selectHandler
     * @description 选择城市后的操作
     * @param $this
     */
    function selectHandler($this) {
        var id = $this.data('city_id'),
            name = $this.text(),
            province = $this.data('province');

            //兼容安卓城市不切换不刷新
        if(common.getSystem() == 'android'){
            var change = true,
                cacha = storage.getCurCity(),
                cityNowPage = storage.getItem('cityNowPage');
            if(tool.isEmpty(cacha) || !cacha.id || tool.isEmpty(cityNowPage) || !cityNowPage.page){
                return;
            }
            if(cacha.id == id){
                change = false;
            }
            storage.setItem('cityChanged', {
                change : change,
                page : cityNowPage.page
            });
        }

        //将curCity存于globalData中
        storage.storeInfo('curCity', {
            id: id,
            name: name,
            province: province
        });


        //传递城市信息到客户端
        Daze.system.postObserver({
            name: 'cityChange',
            eventData: {
                id: id,
                name: name,
                province: province
            }
        });

        closeWin();

        var selectEvent = document.createEvent("Events");
        selectEvent.initEvent("selectEvent", false, false);
        document.dispatchEvent(selectEvent);
    }

    /**
     * @method closeWin
     * @description 关闭选择城市
     */
    function closeWin() {
        $('#wrapProvince').removeClass('slideUp').remove();
        $('#wrapCity').remove();
    }

    /**
     * @method getCityInfoByName
     * @description 根据城市名获取城市信息
     * @param name
     * @returns {{object}}
     */
    function getCityInfoByName(name) {
        var cityInfo = {};
        for (var i = 0; i < list.length; i++) {
            if (name == list[i].name) {
                cityInfo = {
                    id: list[i].id,
                    name: list[i].name,
                    province: list[i].province
                };
                break;
            }
        }
        return cityInfo;
    }

    return {
        init: init,
        getCurrentCity: getCurrentCity,
        closeWin: closeWin
    }
});