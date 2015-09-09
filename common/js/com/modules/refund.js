define([
    'lib/zepto.min',
    'lib/jquery.raty.min',
    'com/host',
    'com/tools',
    'com/storage',
    'com/common',
    'com/modules/tpl'
], function (a, b, host, tool, storage, DZ_COM, template) {
    'use strict';

    var type = 1;

    function init(refundInfo) {
        if (tool.isEmpty(refundInfo)) {
            refundInfo = {
                type: type
            };
        }
        renderWrapAccount(refundInfo);
    }

    function bindEvents() {
        var $mask = $('#mask'),
            $wrapModifyAccount = $('#wrapModifyAccount'),
            $form = $('#form'),
            $type = $('#type'),
            $btnSubmit = $('#btnSubmit');

        $mask.click(function () {
            $mask.remove();
            $wrapModifyAccount.remove();
        });

        $form.on('input', function () {
            renderBtn();
        });

        $type.change(function () {
            type = $(this).val();

            renderToggleContent({
                type: type
            });
        });

        //添加退款账号
        $btnSubmit.click(function () {
            var result = validate();
            if (!result.valid) {
                Daze.showMsg(result.msg);
                return false;
            }

            result.data.uid = storage.getGlobalData().uid;

            DZ_COM.checkNetwork(null, function () {
                $.ajax({
                    url: host.HOST_URL + '/refund/add.htm',
                    type: 'post',
                    data: DZ_COM.convertParams(result.data),
                    success: function (r) {
                        if (r.code == 0) {
                            if (r.data && r.data.result) {
                                var evt = document.createEvent('Events');
                                evt.initEvent('updateRefundInfoEvent', false, false);
                                document.dispatchEvent(evt);
                                $wrapModifyAccount.remove();
                            }
                            else {
                                Daze.showMsg(r.msg);
                            }
                        }
                        else {
                            Daze.showMsg(r.msg);
                        }
                    },
                    error: function (r) {
                        DZ_COM.renderNetworkTip(null, 1);
                    }
                });
            });
        });
    }

    function renderWrapAccount(data) {
        $('body').append(
            template('account', data)
        );

        $('#type').val(data.type);
        renderToggleContent(data);
        renderBtn();
        bindEvents();
    }

    function renderToggleContent(data) {
        var $toggleContent = $('#toggleContent');

        switch (Number(data.type)) {
            case 1:
                $toggleContent.html(
                    template('alipay', data)
                );
                break;
            case 2:
                $toggleContent.html(
                    template('card', data)
                );
                break;
        }
    }

    function renderBtn() {
        var $btnSubmit = $('#btnSubmit');
        var result = validate();
        if (result.valid) {
            $btnSubmit.prop('disabled', false);
        }
        else {
            $btnSubmit.prop('disabled', true);
        }
    }

    function getFormData() {
        var $form = $('#form');
        var obj = {},
            arr = $form.serializeArray();
        for (var i in arr) {
            var name = arr[i].name,
                value = arr[i].value;
            obj[name] = value;
        }
        return obj;
    }

    function validate() {
        var data = getFormData(),
            valid = true,
            msg = '';
        if (!data.type) {
            valid = false;
            msg = '请选择收款方式';
        }
        else {
            if (type == 2) {//银行卡
                if (!data.name) {
                    valid = false;
                    msg = '请填写持卡人姓名';
                }
                else if (!data.bank) {
                    valid = false;
                    msg = '请填写开户行';
                }
                else if (!data.account) {
                    valid = false;
                    msg = '请填写借记卡卡号';
                }
            }
            else if (type == 1) {//支付宝
                if (!data.name) {
                    valid = false;
                    msg = '请填写支付宝真实姓名';
                }
                else if (!data.account) {
                    valid = false;
                    msg = '请填写支付宝账号';
                }
            }
        }

        return {
            data: data,
            valid: valid,
            msg: msg
        };
    }

    return {
        init: init
    }
});
