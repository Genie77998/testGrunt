/**
 * author:wj77998
 */
define([
    'com/storage',
    'com/tools'
], function (storage, tool) {
    'use strict';
    var obj = 'insurancefinal';
    return {
        removeItem: function(item) {
            var _re = this.getObj();
            if (item in _re) {
                delete _re[item];
                   this.setObj(_re);
            }
        },
        getObj: function(item) {
            var _re = storage.getGlobalData()[obj] || {};
            if (item) {
                if (typeof _re[item] != 'undefined') {
                    return _re[item];
                } else {
                    return undefined;
                }
            } else {
                return _re;
            }
        },
        setObj: function(a, b) {
            var _re = this.getObj();
            if (!a) {
                storage.removeInfo(obj);
            } else {
                if (typeof a == 'object') {
                    storage.storeInfo(obj, a);
                } else {
                    _re[a] = b;
                    storage.storeInfo(obj, _re);
                }
            }
        },
        setUid : function(){
            this.setObj('uid',storage.getUid());
        },
        listFn : function(data){
            var _re = {
                basic : [],
                mass : [],
                luxury : []
            };
            for(var i = 0 ; i < data.length ; i++){
                if(data[i].type == '0'){
                    _re.basic.push(data[i]);
                }else if(data[i].type == '1'){
                    _re.mass.push(data[i]);
                }else if(data[i].type == '2'){
                    _re.luxury.push(data[i]);
                }
            }
            return [_re.basic,_re.mass,_re.luxury];
        }
    };
});
