/**
 * author:DZ
 * time:2014/12/3
 */
define(['lib/zepto.min'], function (a) {
    'use strict';

    return {
        getQueryString: function (url) {
            if (url) {
                url = url.substr(url.indexOf("?") + 1);
            }
            var result = {}, queryString = url || location.search.substring(1),
                re = /([^&=]+)=([^&]*)/g, m;

            while (m = re.exec(queryString)) {
                result[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
            }

            return result;
        },
        isEmpty: function (o) {
            if (o) {
                var flag = true;
                for (var key in o) {
                    flag = false;
                }
                return flag;
            }
            else {
                return true;
            }
        },
        convertNumber: function (n) {
            n = n.toString();
            var isDecimal = n.indexOf('.') >= 0;
            if (isDecimal) {
                var int = n.split('.')[0],
                    dec = (n - int);
                if (n.split('.')[1].length > 2) {
                    dec = dec.toFixed(2);
                }
                n = Number(int) + Number(dec);
            }
            return Number(n);
        },
        getFormDataAsObj: function ($form) {
            var obj = {},
                arr = $form.serializeArray();
            for (var i = 0; i < arr.length; i++) {
                obj[arr[i].name] = arr[i].value;
            }
            return obj;
        }
    }
});