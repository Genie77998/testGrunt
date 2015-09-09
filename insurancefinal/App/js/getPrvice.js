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
        renderHeader();
        bindEvents();
        getUserBaseInfo(function(){
            var _res = common.getObj(),
                bjList = _res.bjList,
                _in = -1,
                companyInfo = _res.companyInfo;
            if(typeof bjList != 'undefined' && !tool.isEmpty(bjList) && typeof companyInfo != 'undefined' && !tool.isEmpty(companyInfo)){
                for(var i = 0 ; i < companyInfo.length ; i++){
                    for(var s = 0 ; s < bjList.length ; s++){
                        for(var m = 0 ; m < bjList[s].length ; m++){
                            if(bjList[s][m].baoxianCompanyCode == companyInfo[i].code){
                                if(companyInfo[i].pic){
                                    bjList[s][m].pic=companyInfo[i].pic;
                                }
                                if(companyInfo[i].remark){
                                    bjList[s][m].remark=companyInfo[i].remark;
                                }
                            }
                        }
                    }
                }
                common.setObj('bjList',bjList);
                renderTmpl(bjList);
                for(var s = 0 ; s < bjList.length ; s++ ){
                    if(_in == -1 && bjList[s].length > 0){
                        _in = s;
                    }
                }
                if(_in != -1){
                    $mainBox.find('.headChoose li').eq(_in).trigger('click');
                }
            }
        });
        ga_storage._trackPageview('insurancefinal/getPrvice', "汽车服务-橙牛车险管家-闪电报价");
    }

    function bindEvents(){
        $mainBox.on({
            click : function(){
                var index = $(this).index(),
                    dl = $mainBox.find('.resultBox dl');
                $(this).addClass('active').siblings('li').removeClass('active');
                dl.addClass('hidden').eq(index).removeClass('hidden').find('input[type=radio]').eq(0).prop('checked',true);
            }
        },'.headChoose li').on({
            click : function(){
                 var $_ipt = $mainBox.find('input[type=radio]:checked'),
                    _res = common.getObj(),
                    _a = $_ipt.closest('dl').data('index'),
                    _b = $_ipt.closest('dd').data('index'),
                    _index = $mainBox.find('.headChoose li.active').index(),
                    _info = _res.bjList[_a][_b];
                    if(_res.bjList[_index].length == '0'){
                        Daze.showMsg('暂无该套餐!');
                        return;
                    }
                    common.setObj('baoxianCompanyCode',_info.baoxianCompanyCode);
                    common.setObj('baoxianCompanyName',_info.baoxianCompanyName);
                    common.setObj('baoxianCompanyPic',_info.pic);
                    common.setObj('baoxianCompanyRemark',_info.remark);
                    Daze.pushWindow('cardInfo.html');
            }
        },'input[name=goInsure]').on({
            click : function(){
                var $dd = $(this).closest('dd'),
                    _res = common.getObj(),
                    _a = $dd.closest('dl').data('index'),
                    _b = $dd.data('index'),
                    _v = $dd.find('input[type=radio]').val(),
                    _info = _res.bjList[_a][_b];
                    common.setObj('baoxianCompanyCode',_info.baoxianCompanyCode);
                    common.setObj('baoxianCompanyName',_info.baoxianCompanyName);
                    common.setObj('baoxianCompanyPic',_info.pic);
                    common.setObj('baoxianCompanyRemark',_info.remark);
                    Daze.pushWindow('prviceInfo.html?index='+_a+'&val='+_v);
            }
        },'.itemGo');
    }


    function getUserBaseInfo(callback){
        if(!_re.userInfo){
            Daze.showMsg({
                type: 'loading',
                visible: true
            });
            DZ_COM.checkNetwork(domId, function() {
                $.ajax({
                    url: host.HOST_URL + "/appclient/baoxian/userBaseInfo.htm",
                    data: DZ_COM.convertParams({
                        userId : _re.uid,
                        id : _re.baoxianBaseInfoId
                    }),
                    success: function(r) {
                        if (r.code == '0' && r.data) {
                            Daze.showMsg({
                                type: 'loading',
                                visible: false
                            });
                            common.setObj('userInfo',r.data);
                            getCompany(callback);
                        } else {
                            Daze.showMsg(r.msg);
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
            getCompany(callback);
        }
    }

    function getCompany(callback){
        if(!_re.companyInfo){
            Daze.showMsg({
                type: 'loading',
                visible: true
            });
            DZ_COM.checkNetwork(domId, function() {
                $.ajax({
                    url: host.HOST_URL + "/appclient/baoxian/company.htm",
                    data: DZ_COM.convertParams({}),
                    success: function(r) {
                        if (r.code == '0' && r.data && r.data.list) {
                            Daze.showMsg({
                                type: 'loading',
                                visible: false
                            });
                            common.setObj('companyInfo',r.data.list);
                            callback&&callback();
                        } else {
                            Daze.showMsg(r.msg);
                        }
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-保险公司信息', 'appclient/baoxian/company.htm', '成功');
                    },
                    error: function(r) {
                        DZ_COM.renderNetworkTip(domId, 1);
                        ga_storage._trackEvent('汽车服务-橙牛车险管家-保险公司信息', 'appclient/baoxian/company.htm', '失败');
                    }
                });
            });
        }else{
            callback&&callback();
        }
    }

    function renderHeader() {
        Daze.setTitle('闪电报价');
    }

    function renderTmpl(data){
        $mainBox.html(template('privceTemplate',{
            data : data
        }));
    }

});
