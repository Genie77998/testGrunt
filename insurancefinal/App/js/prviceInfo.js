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
        _data = tool.getQueryString(),
        $mainBox = $('#mainBox');

    document.addEventListener("DazeJSObjReady", function() {
        console.log("DazeJSObjReady");
        init();
    }, false);

    function init() {
        renderHeader();
        renderTmpl();
        bindEvents();
        ga_storage._trackPageview('insurancefinal/prviceInfo', "汽车服务-橙牛车险管家-闪电报价");
    }

    function bindEvents() {
        $mainBox.on({
            click : function(){
                var index = $(this).index(),
                    dl = $mainBox.find('.resultBox dl');
                if($(this).attr('data-click') === 'false'){
                    Daze.showMsg('暂无该套餐!');
                    return;
                }
                $(this).addClass('active').siblings('li').removeClass('active');
                dl.addClass('hidden').eq(index).removeClass('hidden');
                $mainBox.find('.price').text('￥'+dl.eq(index).data('price'));
            }
        },'.headChoose li').on({
            click : function(){
                Daze.pushWindow('cardInfo.html');
            }
        },'input[name=goInsure]');
    }

    function renderHeader() {
        Daze.setTitle(_re.baoxianCompanyName);
    }

    function renderTmpl(){
        Daze.showMsg({
            type: 'loading',
            visible: true
        });
        console.log(_re);
        var bjList = _re.bjList,
            val = _data.val,
            data = [];
        if(typeof bjList != 'undefined' && !tool.isEmpty(bjList)){
            for(var i = 0 ; i < bjList.length ; i++){
                var _flag = false;
                if(bjList[i].length > 0){
                    for(var m = 0 ; m < bjList[i].length ; m ++){
                        if(bjList[i][m]){
                            if(bjList[i][m].baoxianCompanyCode == val){
                                data.push(bjList[i][m]);
                                _flag = true;
                            }
                            if(m == bjList[i].length-1 && !_flag){
                                data.push([]);
                                _flag = true;
                            }
                        }
                    }
                }else{
                    data.push([]);
                }
                
            }
            $mainBox.html(template('privceTemplate',{
                data : data,
                keya : _data.index
            }));
        }else{
            DZ_COM.renderNetworkTip(domId, 1);
            return;
        }
        Daze.showMsg({
            type: 'loading',
            visible: false
        });
    }
});
