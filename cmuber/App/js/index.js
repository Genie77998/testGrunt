/**
 * author:wj77998
 */
require([
    'lib/zepto.min',
    'lib/tpl.min',
    'com/host',
    'com/tools',
    'com/storage',
    'com/common',
    'com/GALocalStorage'
], function (a, b, host, tool, storage, DZ_COM) {
    var domId = 'mainBox',
        lists = [],
        uid = 0,
        car_model = storage.getItem('cmuber_car_model'),
        curcity = {},
        $mainBox = $('#mainBox'),
        $wrapBrand = $('#wrapBrand'),
        $zmCode = $('#zmCode'),
        $carModel = $('#carModel'),
        listCar = {},
        $carNmae = $('#carNmae');

    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        DZ_COM.login(function() {
            DZ_COM.getCurCity(function(){
                init();
            });
        });
    }, false);

    function init() {
        uid = storage.getUid();
        curcity = storage.getCurCity();
        renderHeader();
        bindEvents();
        renderDefault();
        ga_storage._trackPageview('cmuber/index', "汽车服务-车猫Uber-车猫卖车");
    }

    function renderDefault(){
        var cmuber_car_info = storage.getItem('cmuber_car_info'),
            data = storage.getItem('cmuber_man_info') || {};
        getCity(function(){
            $mainBox.html(template('indexTemplate',{
                lists : lists,
                data : data,
                carInfo : cmuber_car_info
            }));
            if(!tool.isEmpty(curcity) && curcity.name){
                $mainBox.find('select option').each(function(){
                    if(this.innerHTML == curcity.name){
                        this.selected = true;
                    }
                });
            }
        });
    }

    function bindEvents() {
        $mainBox.on({
            click: function() {
                getCarList();
            }
        }, '.carItem').on({
            click : function(){
                carCatAdd();
            }
        },'input[name=sendCarInfo]').on({
            blur : function(){
                var a = storage.getItem('cmuber_man_info') || {},
                    _name = this.name;
                    a[_name] = this.value;
                    storage.setItem('cmuber_man_info',a);
            }
        },'input');

        $zmCode.on({
            click: function() {
                var code = $(this).data('code'),
                    $code = $carModel.find('dt[data-code=' + code + ']');
                $carModel.scrollTop(0).scrollTop($code.offset().top);
                $(this).addClass('active').siblings('li').removeClass('active');
            }
        }, 'li');

        $carModel.on({
            click: function() {
                if ($(this).hasClass('active')) {
                    return;
                }
                var _index = $(this).data('index'),
                    _key = $(this).data('key');
                $(this).addClass('active').siblings('dd').removeClass('active');
                renderCarNmae(listCar.result[_index].data[_key].sub);
            }
        }, 'dd').on({
            scroll : function(){
                $(this).find('dd').each(function(){
                    if($(this).offset().top <= 0 && $(this).offset().top > -41){
                        var code = $(this).data('code');
                        $zmCode.find('li').each(function(){
                            var _code = $(this).data('code');
                            if(code == _code){
                                $(this).addClass('active').siblings('li').removeClass('active');
                            }
                        });
                    }
                });
            }
        });

        $carNmae.on({
            click: function() {
                var classfy = $(this).data('classfy'),
                    id = $(this).data('id'),
                    name = $(this).text();
                $mainBox.find('input[name=vehicleFullName]').val(name).attr({
                    'data-id' : id,
                    'data-name' : classfy
                });
                storage.setItem('cmuber_car_info',{
                    vehicleId : id,
                    name : classfy,
                    fullname : name
                });
                $wrapBrand.hide();
                $mainBox.show();
            }
        }, 'dd');
    }

    function getCarList() { //获取车辆型号
        if(tool.isEmpty(car_model)){
            Daze.showMsg({
                type: 'loading',
                visible: true
            });
            DZ_COM.checkNetwork(domId, function() {
                $.ajax({
                    url: host.HOST_URL + "/data/getVehicleModels.htm",
                    data: DZ_COM.convertParams(),
                    success: function(r) {
                        if (r.code == 0) {
                            Daze.showMsg({
                                type: 'loading',
                                visible: false
                            });
                            if (r.data && r.data.list) {
                                listCar = searchZm(r.data.list);
                                storage.setItem("cmuber_car_model",r.data.list);
                                //console.log(listCar);
                                renderWrapBefore(listCar);
                            }
                        } else {
                            Daze.showMsg(r.msg);
                        }
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-选择品牌车型', 'baoxian/queryFamily.htm', '成功');
                    },
                    error: function(r) {
                        DZ_COM.renderNetworkTip(domId, 1);
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-选择品牌车型', 'baoxian/queryFamily.htm', '失败');
                    }
                });
            });
        }else{
            if(tool.isEmpty(listCar)){
                listCar = searchZm(car_model);
            }
            renderWrapBefore(listCar);
        }

    }

    function renderWrapBefore(data) { //写入车辆品牌
        if (data.zimu && data.zimu.length) {
            $zmCode.html(template('queryzmCode', {
                data: data.zimu
            }));
        }
        if (data.result && data.result.length) {
            $carModel.html(template('querycarModel', {
                data: data.result
            }));
        }
        $carModel.find('dd:first').click();
        $zmCode.find('li').eq(0).addClass('active');
        $wrapBrand.show();
        $mainBox.hide();
    }

    function renderCarNmae(data) { //写入车辆型号
        $carNmae.html(template('querycarNmae', {
            data: data
        }));
    }

    function searchZm(data) { //车辆品牌结果处理
        var _zimu = [],
            _result = [],
            obj = {};
        for (var i = 0; i < data.length; i++) {
            if (_zimu.indexOf(data[i].code) == -1) {
                var _name = data[i].code;
                _zimu.push(_name);
                if (!tool.isEmpty(obj)) {
                    _result.push(obj);
                    obj = {};
                }
                if (!obj['data']) {
                    obj['data'] = [];
                }
                obj['code'] = data[i].code;
            }
            obj['data'] && obj['data'].push(data[i]);
            if (i == (data.length - 1)) {
                _result.push(obj);
            }
        }

        return {
            zimu: _zimu,
            result: _result
        };
    }

    function getCity(callback){
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        var domId = 'page';
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/car_cat/locations.htm",
                data: DZ_COM.convertParams({
                    uid : uid
                }),
                success: function(r) {
                    if (r.data && r.data.length) {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        lists = r.data;
                        callback&&callback();
                    } else {
                        DZ_COM.renderNetworkTip(domId, 1);
                    }
                    ga_storage._trackEvent('汽车服务-车猫Uber-选择城市', '/car_cat/locations.htm', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-车猫Uber-选择城市', '/car_cat/locations.htm', '失败');
                }
            });
        });
    }

    function renderHeader() {
        Daze.setTitle('车猫卖车');
    }

    function carCatAdd() {
        var data = validate();
        if (!data) {
            return false;
        }
        data.uid = uid;
        //console.log(data);
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/car_cat/add.htm",
                data: DZ_COM.convertParams(data),
                success: function(r) {
                    if (r.result && r.result == 'success') {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        renderSuccess();
                    } else {
                        Daze.showMsg(r.msg);
                    }
                    ga_storage._trackEvent('汽车服务-车猫Uber-卖车', '/car_cat/add.htm', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-车猫Uber-卖车', '/car_cat/add.htm', '失败');
                }
            });
        });
    }

    function renderSuccess(){
        $('body').css({
            background : 'white'
        });
        storage.clearItem('cmuber_car_info');
        storage.clearItem('cmuber_man_info');
        $mainBox.html(template('successTemplate'));
    }

    function getData() {
        var formData = tool.getFormDataAsObj($('form')),
            $input = $mainBox.find('input[name=vehicleFullName]');
            formData.vehicleId = $input.data('id') || 0;
            formData.vehicleName = $input.data('name') || '未知';
            formData.cityCode = $mainBox.find('select option:selected').data('citycode');
        return formData;
    }

    function validate() {
        var data = getData(),
            phoneReg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/,
            privce = /^\d+(\.\d+)?$/g,
            valid = true;
        for (var i in data) {
            var value = data[i],
                $item = $('[name=' + i + ']'),
                require = $item.data('require'),
                nullMsg = $item.data('null'),
                errorMsg = $item.data('error'),
                ruleName = $item.data('rule') || '',
                rule = eval(ruleName);

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

});
