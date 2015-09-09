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
        _re = common.getObj(),
        _flag = false,
        _type = tool.getQueryString().type,
        $mainBox = $('#mainBox');

    document.addEventListener("DazeJSObjReady", function () {
        console.log("DazeJSObjReady");
        init();
    }, false);


    function init() {
        console.log(_re);
        renderHeader();
        renderTempl(_re);
        getList('province',0);
        bindEvents();
        ga_storage._trackPageview('insurancefinal/delivery', "汽车服务-橙牛车险管家-确认配送信息");
    }

    function getList(type,level, cityCode) {
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
                    if (r.code == '0') {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        renderList(type, r.data);
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

    function renderList(type, list) {
        var tmpl = template('optionTmpl', {
                list: list,
                type: type
            }),
            $province = $('#province'),
            $city = $("#city"),
            $district = $('#district');
        switch (type) {
            case 'province':
                if(!_flag && _re.cityCode){
                    var n = 0;
                    for(var i = 0 ; i < list.length ; i++){
                        if(_re.cityCode.substr(0,3) == list[i].cityCode.substr(0,3)){
                            n = i;
                        }
                    }
                    $province.html(tmpl).attr('data-name',list[n].cityName).val(list[n].cityCode);
                    getList('city' , 1 , list[n].cityCode);
                }else{
                    $province.html(tmpl).attr('data-name',list[0].cityName);
                    getList('city' , 1 , $province.val());
                }
                break;
            case 'city':
                if(!_flag && _re.cityCode){
                    var n = 0;
                    for(var i = 0 ; i < list.length ; i++){
                        if(_re.cityCode== list[i].cityCode){
                            n = i;
                        }
                    }
                    $city.html(tmpl).attr('data-name',list[n].cityName).val(list[n].cityCode);
                    getList('district' , 2 , list[n].cityCode);
                    _flag = true;
                }else{
                    $city.html(tmpl).attr('data-name',list[0].cityName);
                    getList('district' , 2 , $city.val());
                }
                break;
            case 'district':
                $district.html(tmpl).attr('data-name',list[0].cityName);
                break;
        }
    }

    function renderTempl(data){
        $mainBox.html(template('deliveryTmpl',{
            data : data
        }));
    }

    function bindEvents() {
        var $province = $('#province'),
            $city = $("#city"),
            $district = $('#district');
        $mainBox.on({
            click : function(){
                saveAddress();
            }
        },'input[name=saveAddress]');

        // 选择省份
        $province.change(function () {
            console.log('province changed');
            $(this).attr('data-name',$(this).find('option:selected').html());
            getList('city', 1  , $(this).val());
        });

        // 选择城市
        $city.change(function () {
            console.log('city changed');
            $(this).attr('data-name',$(this).find('option:selected').html());
            getList('district', 2 , $(this).val());
        });

        //区域选择
        $district.change(function () {
            console.log('district changed');
            $(this).attr('data-name',$(this).find('option:selected').html());
        });

        $('input').on('blur',function(){
            this.value = this.value.replace(/\s/g,'');
        });

    }


    function saveAddress() {
        var data = validate();
        if (!data) {
            return false;
        }
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        data.provinceName = $('select[name=provinceCode]').attr('data-name');
        data.cityName = $('select[name=cityCode]').attr('data-name');
        data.townName = $('select[name=townCode]').attr('data-name');
        data.baoxianUnderwritingReportId = _re.baoxianUnderwritingReportId;
        data.userId = _re.uid; 
        console.log(data);
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/appclient/baoxian/peisong.htm",
                data: DZ_COM.convertParams(data),
                success: function(r) {
                    console.log(r);
                    if (r.code == '0' && r.data && r.data.result) {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        Daze.system.postObserver({
                            name: 'daze_saveAddress',
                            eventData: {
                                result : 'saveOk'
                            }
                        });
                        common.setObj('payStatus',{
                            result : 'saveOk'
                        });
                        if(_type == '1'){
                            Daze.popTo(-1);
                        }else{
                            Daze.popTo(-2);
                        }
                    } else {
                        Daze.showMsg(r.msg);
                    }
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-配送地址', 'appclient/baoxian/peisong.htm', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-配送地址', 'appclient/baoxian/peisong.htm', '失败');
                }
            });
        });
    }

    function getData() {
        var formData = tool.getFormDataAsObj($('form'));
        return formData;
    }

    function validate() {
        var data = getData(),
            phoneReg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/, // 11位手机号码
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

    function renderHeader() {
        Daze.setTitle('确认配送信息');
    }
});
