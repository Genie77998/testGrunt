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
        _req = common.getObj('bjing'),
        $mainBox = $('#mainBox');
    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        init();
    }, false);

    function init() {
        renderHeader();
        renderTempl();
        if(typeof _req != 'undefined' && _req == 'ed' ){
            $mainBox.find('#goToInsure').addClass('disabled').val('您有保单在核保中...');
        }else{
            bindEvents();
        }
        ga_storage._trackPageview('insurancefinal/insure', "汽车服务-橙牛车险管家-在线车险");
    }

    function bindEvents() {
        $mainBox.on({
            click : function(){
                var $_this = $(this),
                    _click = $(this).data('click'),
                    $span = $(this).children('span'),
                    $input = $(this).children('input'),
                    arr = [$_this.data('false'),$_this.data('true')];
                    if(!_click){
                        return;
                    }
                $span.toggleClass('active');
                $input.val($span.hasClass('active'));
                $_this.closest('.itemThree').find('.itemzt').text(arr[Number($span.hasClass('active'))]);
                if($(this).data('name') == 'syx'){
                    $mainBox.find('.itemOther').toggleClass('hidden' , !$span.hasClass('active'));
                    setForm($span.hasClass('active'));
                }
            }
        },'.dir').on({
            click:function(){
                var $this = $(this);
                if($(this).prev().find('select').val() == '0'){
                    return false;
                }
                $this.toggleClass('active').find('input').val($this.hasClass('active'));
            }
        },'.itemOther .item_ico').on({
            click : function(){
                if($(this).hasClass('disabled')){
                    return;
                }
                goToInsure();
            }
        },'#goToInsure').on({
            change : function(){
                if(this.value == '0'){
                    $(this).closest('.itemInput').find('.item_ico').removeClass('active').find('input[type=hidden]').val('false');
                }
            }
        },'select');
    }

    function renderHeader() {
        Daze.setTitle('投保方案');
    }

    function setForm(type){
        var $box = $mainBox.find('.itemOther'),
            $select = $box.find('select'),
            $btn = $box.find('.item_ico'),
            $input = $btn.children('input');
        if(type){
            $select.each(function(){
                $(this).val($(this).data('default'));
            });
            $btn.each(function(){
                var _class = $(this).data('default');
                if(_class){
                    $(this).addClass(_class);
                }
            });
            $input.each(function(){
                $(this).val($(this).data('default'));
            });
        }else{
            $select.each(function(){
                $(this).val(0);
            });
            $btn.removeClass('active');
            $input.val(0);
        }
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
        data.baoxianCompanyName = _data.baoxianCompanyName;
        data.baseInfoId = _data.baoxianBaseInfoId;
        data.baoxianCompanyCode = _data.baoxianCompanyCode;
        data.id = common.getObj('id') || '';
        data.userId = _data.uid;
        DZ_COM.checkNetwork(domId, function() {
            $.ajax({
                url: host.HOST_URL + "/appclient/baoxian/report.htm",
                data: DZ_COM.convertParams(data),
                success: function(r) {
                        console.log(r);
                    if (r.code == '0' && r.data && r.data.result) {
                        Daze.showMsg({
                            type: 'loading',
                            visible: false
                        });
                        common.setObj('id',r.data.id);
                        common.setObj('bjing','ed');
                        $mainBox.find('#goToInsure').addClass('disabled').val('您有保单在核保中...');
                        storage.clearItem('bxlsit');
                        Daze.pushWindow("underWriting.html");
                    } else {
                        Daze.showMsg(r.msg);
                    }
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-核保', '/appclient/baoxian/report.htm', '成功');
                },
                error: function(r) {
                    DZ_COM.renderNetworkTip(domId, 1);
                    ga_storage._trackEvent('汽车服务-橙牛车险管家-核保', '/appclient/baoxian/report.htm', '失败');
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
        $mainBox.html(template('insureTmpl', {
            data: _re
        }));
        setForm(true);
    }
});
