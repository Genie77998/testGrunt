/**
 * author:wj77998
 */
define([
    'com/storage',
    'com/tools'
], function (storage, tool) {
    'use strict';
    function CheckDate(date) {
        this.dateString = date;
        this.holiday = [
            "2015-9-3",
            "2015-9-4",
            "2015-9-5",
            "2015-10-1",
            "2015-10-2",
            "2015-10-3",
            "2015-10-4",
            "2015-10-5",
            "2015-10-6",
            "2015-10-7"
        ];
        this.workingDays = [
            "2015-9-6",
            "2015-10-10"
        ];
        this.init();
    }

    CheckDate.prototype = {
        constructor: CheckDate,
        init : function(){
            var re = this.checkDate();
            this.result = re;
        },
        setMyDate: function(date, num) {
            num = num || 30;
            date.setMinutes(date.getMinutes() + num);
            var result = '',
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear(),
                hour = date.getHours(),
                minute = date.getMinutes(),
                second = date.getSeconds();
            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;
            if (hour < 10) hour = "0" + hour;
            if (minute < 10) minute = "0" + minute;
            if (second < 10) second = "0" + second;
            return year + "-" + month + "-" + day + ' ' + hour + ':' + minute + ':' + second;
        },
        setTmorroy: function(date, _tmorrom, _hour, _minute) {
            _tmorrom = _tmorrom || 0;
            _hour = _hour || 10;
            _minute = _minute || 0;
            date.setDate(date.getDate() + _tmorrom);
            date.setHours(_hour);
            date.setMinutes(_minute);
            date.setSeconds(0);
            var a = this.isHoliday(date);
            if (a) {
                date = a;
            }
            var result = '',
                day = date.getDate(),
                month = date.getMonth() + 1,
                year = date.getFullYear(),
                hour = date.getHours(),
                minute = date.getMinutes(),
                second = date.getSeconds();

            if (month < 10) month = "0" + month;
            if (day < 10) day = "0" + day;
            if (hour < 10) hour = "0" + hour;
            if (minute < 10) minute = "0" + minute;
            if (second < 10) second = "0" + second;
            return year + "-" + month + "-" + day + ' ' + hour + ':' + minute + ':' + second;
        },
        checkDate: function() {
            var str = this.dateString;
            var date = this.dataFormt(this.getMyTime(str));
            var a = this.isHoliday(this.dataFormt(this.getMyTime(str)));
            var b = this.isWorkingDays(this.dataFormt(this.getMyTime(str)));
            var c = this.isWorkingDayst(this.dataFormt(this.getMyTime(str)));
            var result = '',
                wd = date.getDay();
            if (a) {
                result = this.setTmorroy(a);
            } else {
                if (wd == '6' && !b) {
                    if (!c) {
                        result = this.setTmorroy(date, 2);
                    } else {
                        result = this.setTmorroy(date);
                    }
                } else if (wd == '0' && !b) {
                    result = this.setTmorroy(date, 1);
                } else {
                    var _hour = date.getHours(),
                        _minute = date.getMinutes();
                    if (_hour < 9) {
                        result = this.setTmorroy(date);
                    } else if (_hour >= 9 && _hour < 14) {
                        if (_hour < 11) {
                            result = this.setMyDate(date);
                        } else {
                            if (_hour == 11 && _minute < 30) {
                                result = this.setMyDate(date);
                            } else {
                                result = this.setTmorroy(date, 0, 14, 30);
                            }
                        }
                    } else if (_hour >= 14 && _hour < 17) {
                        result = this.setMyDate(date);
                    } else if (_hour == 17) {
                        if (_minute < 30) {
                            result = this.setMyDate(date);
                        } else {
                            if (wd == '5' && !c) {
                                result = this.setTmorroy(date, 3);
                            } else {
                                if(!c){
                                    result = this.setTmorroy(date,2);
                                }else{
                                    result = this.setTmorroy(date,1);
                                } 
                            }
                        }
                    } else if (_hour >= 18) {
                        if (wd == '5' && !c) {
                            result = this.setTmorroy(date, 3);
                        } else if(wd == '6'){
                            if(!c){
                                result = this.setTmorroy(date, 2);
                            }else{
                                result = this.setTmorroy(date, 1);
                            }
                        }else if(wd == '0'){
                            result = this.setTmorroy(date, 1);
                        }else{
                            result = this.setTmorroy(date,1);
                        }
                    }
                }
            }
            return result;
        },
        getMyTime: function(time) {
            var a = time.split(' '),
                b = a[0].split('-'),
                c = a[1].split(':');
            return {
                Y: b[0],
                M: b[1],
                D: b[2],
                h: c[0],
                m: c[1],
                s: c[2]
            };
        },
        dataFormt: function(obj) {
            var mydate = new Date();
            mydate.setFullYear(obj.Y);
            mydate.setMonth(obj.M - 1);
            mydate.setDate(obj.D);
            mydate.setHours(obj.h);
            mydate.setMinutes(obj.m);
            mydate.setSeconds(obj.s);
            return mydate;
        },
        _indexOf: function(arr, elem) {
            var i = 0,
                len = arr.length;
            for (; i < len; i++) {
                if (arr[i] === elem) {
                    return i;
                }
            }
            return -1;
        },
        isHoliday: function(bb) {
            var _this = this;
            var day = bb.getFullYear() + '-' + (bb.getMonth() + 1) + '-' + bb.getDate();
            var a = _this._indexOf(_this.holiday, day);
            if (a != -1) {
                bb.setDate(bb.getDate() + 1);
                _this.isHoliday(bb);
                return bb;
            } else {
                return false;
            }
        },
        isWorkingDays: function(aa) {
            var day = aa.getFullYear() + '-' + (aa.getMonth() + 1) + '-' + aa.getDate();
            var a = this._indexOf(this.workingDays, day);
            if (a != -1) {
                return aa;
            } else {
                return false;
            }
        },
        isWorkingDayst: function(date) {
            date.setDate(date.getDate() + 1);
            var day = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
            var a = this._indexOf(this.workingDays, day);
            if (a != -1) {
                return date;
            } else {
                return false;
            }
        }
    };

    return CheckDate;
});
