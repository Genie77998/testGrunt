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
        uid = 0,
        curcity = {},
        $mainBox = $('#mainBox');

    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        DZ_COM.login(function() {
            init();
        });
    }, false);

    function init() {
        uid = storage.getUid();
        curcity = storage.getCurCity();
        renderHeader();
        bindEvents();
        renderDefault();

        ga_storage._trackPageview('cmuber/uber', "汽车服务-车猫Uber-成为Uber司机");
    }

    function renderDefault(){
        $mainBox.html(template('uberTemplate'));
    }

    function bindEvents() {
        $mainBox.on({
            click : function(){
                carUberAdd();
            }
        },'input[name=sendCarInfo]').on({
            click : function(){
                var index = $(this).index();
                $(this).addClass('active').siblings('.hd').removeClass('active');
                $(this).parent().find('input').val(Number(!index));
            }
        },'.hd');
    }

    function renderHeader() {
        Daze.setTitle('成为Uber司机');
    }

    function carUberAdd() {
        var data = validate();
        if (!data) {
            return false;
        }
        data.uid = uid;
        data.cityCode = curcity.id || 3;
        data.cityName = curcity.name || '上海';
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/car_uber/add.htm",
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
                    ga_storage._trackEvent('汽车服务-车猫Uber-成为Uber司机', '/car_cat/add.htm', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-车猫Uber-成为Uber司机', '/car_cat/add.htm', '失败');
                }
            });
        });
    }

    function renderSuccess(){
        $('body').css({
            background : 'white'
        });
        $mainBox.html(template('successTemplate'));
    }

    function getData() {
        var formData = tool.getFormDataAsObj($('form'));
        return formData;
    }

    function validate() {
        var data = getData(),
            phoneReg = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/,
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
