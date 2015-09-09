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
        _re = common.getObj(),
        $mainBox = $('#mainBox');
    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        init();
    }, false);

    function init() {
        console.log(_re);
        renderTempl();
        renderHeader();
        bindEvents();
        if(tool.isEmpty(common.getObj('mobile'))){
            DZ_COM.checkNetwork(domId, function() {
                $.ajax({
                    url: host.HOST_URL + "/user/getUserInfo.htm",
                    data: DZ_COM.convertParams({
                        uid: _re.uid
                    }),
                    success: function(r) {
                        if (r.code == '0') {
                            cash = r.data.userInfo.accounts[0].userName;
                            common.setObj('mobile', cash);
                            $mainBox.find('input[name=mobile]').val(cash);
                        } else {
                            Daze.showMsg(r.msg);
                        }
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-基本信息', '/user/getUserInfo.htm', '成功');
                    },
                    error: function(r) {
                        DZ_COM.renderNetworkTip(null, 1);
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-基本信息', '/user/getUserInfo.htm', '失败');
                    }
                });
            });
        }
        ga_storage._trackPageview('insurancefinal/cardInfo', "汽车服务-橙牛车险管家-在线车险");
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
                var _click = $(this).data('click');
                if (_click) {
                    $mainBox.find('.reUpload').removeClass('hidden');
                } else {
                    uploadFile.call(this);
                }
            }
        }, '.itemsfz').on({
            click: function() {
                $(this).closest('.reUpload').addClass('hidden');
            }
        }, '.reUpload .closed').on({
            click: function() {
                $(this).closest('.reUpload').addClass('hidden');
                uploadFile.call($mainBox.find('.itemsfz'));
            }
        }, '.reUpload .btn').on({
            click : function(){
                var _lg = $(this).hasClass('active');
                $(this).toggleClass('active').find('input[type=hidden]').val(!_lg ? 1 : '');
            }
        },'.itembx').on({
            click : function(){
                var $this = $(this);
                $this.toggleClass('active').closest('.itemGuohu').find('input').val(Number($this.hasClass('active')));
            }
        },'.itemGuohu .ghzt').on({
            click: function() {
                goToInsure();
            }
        }, '#goToInsure');
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
            $('input[name="idCardUrl"]').val(o.url);
            $mainBox.find('.reUpload').find('img').attr('src', o.url);
            common.setObj('idCardUrl', o.url);
        });
    }

    function renderHeader() {
        Daze.setTitle('在线车险');
    }

    function goToInsure(){
        var data = validate(),
            _data = common.getObj();
        if (!data) {
            return false;
        }
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        _data = $.extend(_data,data);
        common.setObj(_data);
        data.id = _data.baoxianBaseInfoId;
        data.userId = _data.uid;
        delete data.isone;
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/appclient/baoxian/fixUserInfo.htm",
                data: DZ_COM.convertParams(data),
                success: function(r) {
                    if (r.code == '0' && r.data.result) {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        Daze.pushWindow("insure.html");
                    } else {
                        Daze.showMsg(r.msg);
                    }
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-补齐基本信息', '/appclient/baoxian/fixUserInfo', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-补齐基本信息', '/appclient/baoxian/fixUserInfo', '失败');
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

    function renderTempl() {
        //初始化写入
        var data = common.getObj();
        $mainBox.html(template('cardInfoTmpl', {
            data: data
        }));
    }
});
