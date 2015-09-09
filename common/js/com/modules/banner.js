define([
    'lib/zepto.min',
    'lib/tpl.min',
    'lib/swiper.jquery.min',
    'com/host',
    'com/tools',
    'com/storage',
    'com/common',
    'com/modules/tpl',
    'com/GALocalStorage'
], function (a, b, swiper, host, tool, storage, common, tpl) {
    'use strict';

    var _callback = null;

    function init(place, callback) {
        if (!storage.getUserId()) {
            common.getUserId(function () {
                getBanner(place);
            });
        }
        else {
            getBanner(place);
        }

        if (callback) {
            _callback = callback;
        }
    }

    function getBanner(place) {
        var clientType = common.getSystem(),
            clientVersion = common.getVersion().replace(/\./g, ''),
            cityId = storage.getCurCity().id,
            userId = storage.getUserId();
        $.ajax({
            url: host.HOST_URL + '/advert/getData.htm',
            type: 'post',
            data: common.convertParams({
                clientType: clientType,
                clientVersion: clientVersion,
                cityId: cityId,
                userId: userId
            }),
            success: function (r) {
                if (r.code == 0) {
                    if(place.constructor == Array){
                        for(var i = 0 ; i < place.length ; i++){
                            renderBanner(r.data[place[i]]);
                        }
                    }else{
                        renderBanner(r.data[place]);
                    }
                }
                else {
                    Daze.showMsg(r.msg);
                    return false;
                }
                ga_storage._trackEvent('广告位', 'advert/getData.htm', '成功');
            },
            error: function (r) {
                common.renderNetworkTip(null, 1);
                ga_storage._trackEvent('广告位', 'advert/getData.htm', '失败');
            }
        });
    }

    function renderBanner(items) {
        if (!items || !items.length) {
            return false;
        }

        if (items.length == 1) {
            if (items[0].motionType == 'custom') { // 全屏弹出广告
                require(['lib/layer.min'], function (layer) {
                    var $fullScreenAdvert = $('<div>').append(
                        $('<div>').attr({
                            'id': 'fullScreenAdvert',
                            'data-id': items[0].id,
                            'data-identity': items[0].identity
                        }).append(
                            $('<img>').attr('src', items[0].imgUrl).css({'display': 'block', 'width': '100%'})
                        )
                    );
                    layer.open({
                        type: 1,
                        content: $fullScreenAdvert.html()
                    });
                    bindEvents(items, 'fullScreenAdvert');
                });
            }else if(items[0].identity == 'serviceBodyRight' || items[0].identity == 'serviceBodyLeft'){
                $('#'+items[0].identity).html(tpl('banner', {list: items}));
                bindEvents(items, items[0].identity);
            }
            else { // single
                $('#banner').html(tpl('banner', {list: items}));
                bindEvents(items, 'banner');
            }
        }
        else { // several
            common.loadCss('css/swiper.css');
            var _id = 'banner',
                obj = {
                    autoplay : 5000,
                    autoplayDisableOnInteraction : false
                };
            if(items[0].identity == 'serviceBodyRight' || items[0].identity == 'serviceBodyLeft'){
                _id = items[0].identity;
            }else{
                obj.pagination = '.swiper-pagination';
                obj.paginationClickable = true;
            }
            $('#'+_id).html(tpl('banner', {list: items}));
            new Swiper('#'+_id, obj);
            bindEvents(items, _id);
        }

        if (_callback) {
            setTimeout(function () {
                _callback();
            }, 100);
        }
    }

    function bindEvents(items, id) {
        var item = null;
        if (id == 'banner' || id == 'serviceBodyLeft' || id == 'serviceBodyRight') {
            item = $('#' + id).find('.swiper-slide');
        }
        else if (id == 'fullScreenAdvert') {
            item = $('#' + id);
        }

        item.click(function () {
            var id = $(this).data('id'),
                advertObj = null;
            for (var i in items) {
                if (items[i].id == id) {
                    advertObj = items[i];
                    break;
                }
            }

            var fn = Daze.advert;

            if (fn && fn.advertClick && typeof(fn.advertClick) == 'function') {
                Daze.advert.advertClick(advertObj);
            } else {
                //兼容没有存在此方法的老版本
                //仅支持webapp和url两种类型
                var motionValue = advertObj.motionValue;
                if (motionValue && motionValue.length > 0) {
                    if (advertObj.motionType == 'webapp') {
                        var motionValueObj = JSON.parse(motionValue);
                        Daze.pushWindow({
                            appId: motionValueObj.appId + "",
                            url: motionValueObj.startPage + ""
                        });
                    } else if (advertObj.motionType == 'url') {
                        Daze.pushWindow("" + motionValue);
                    }else{
                        Daze.showMsg('服务暂不可用');
                    }
                }
            }
        });
    }

    return {
        init: init
    }
});