/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */
// https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/Math/round#Decimal_rounding
(function () {

    /**
     * Decimal adjustment of a number.
     *
     * @param {string}  type  The type of adjustment.
     * @param {number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @return {number} The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
        // If the exp is undefined or zero...
        if (typeof exp === 'undefined' || +exp === 0) {
            return Math[type](value);
        }
        value = +value;
        exp = +exp;
        // If the value is not a number or the exp is not an integer...
        if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
            return NaN;
        }
        // Shift
        value = value.toString().split('e');
        value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
        // Shift back
        value = value.toString().split('e');
        return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    if (!Math.round10) {
        Math.round10 = function (value, exp) {
            return decimalAdjust('round', value, exp);
        };
    }
    // Decimal floor
    if (!Math.floor10) {
        Math.floor10 = function (value, exp) {
            return decimalAdjust('floor', value, exp);
        };
    }
    // Decimal ceil
    if (!Math.ceil10) {
        Math.ceil10 = function (value, exp) {
            return decimalAdjust('ceil', value, exp);
        };
    }
})();

import { dedupingMixin } from "@polymer/polymer/lib/utils/mixin.js";
/**
 * This is the Mixin that takes care of default validation of oe-ui input components
 * 
 * @polymer
 * @mixinFunction
 */
const DecimalMixin = function (BaseClass) {

    /**
     * @polymer
     * @mixinClass
     */
    return class extends BaseClass {
        static get properties() {
            return {

                value: {
                    type: Number,
                    notify: true,
                    observer: '_valueChanged'
                },
                /**
                 * Boolean flag specify if the value is a percentage.
                 */
                percentage: {
                    type: Boolean,
                    notify: true,
                    value: false,
                    observer: '_formattingChanged'
                },

                /**
                 * Precision to show in the display when the value is entered.
                 */
                precision: {
                    type: Number,
                    value: 2,
                    observer: '_formattingChanged'
                },

                /**
                 * Boolean flag to specify if grouping should not be done on the display value.
                 * This changes the display between 100000 and 1,00,000. Will override "grouping" property
                 */
                noGrouping: {
                    type: Boolean,
                    value: false,
                    observer: '_formattingChanged'
                },
                
                /**
                 * String denoting the Intl.NumberFormat to display
                 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/NumberFormat
                 * 
                 */
                format:{
                    type:String,
                    observer: '_formattingChanged'
                }
            };
        }

        /**
         * Gets the default decimal seperator and group seperator from the browser.
         */
        constructor() {
            super();
            let number = 111111111.111111111;
            let numberString = number.toLocaleString();
            //111 111 111.111111
            //Now take first non-1 character from end.
            let decimalSeparator;
            let decimalDigits; // eslint-disable-line no-unused-vars
            for (var i = numberString.length - 1; i >= 0; i--) {
                var char = numberString.charAt(i);
                if (char !== '1') {
                    decimalSeparator = char;
                    decimalDigits = numberString.length - i - 1;
                    break;
                }
            }

            let groupSeparator;
            for (var i = 0; i < numberString.length; i++) { // eslint-disable-line no-redeclare
                var char = numberString.charAt(i); // eslint-disable-line no-redeclare
                if (char !== '1') {
                    groupSeparator = char;
                    break;
                }
            }

            this._decimalSeparator = decimalSeparator;
            this._groupSeparator = groupSeparator;
        }

        /**
         * Initializes the default formatter
         */
        ready() {
            super.ready();
            this._initialiseFormatter();
        }

        /**
         * Formats the value and set it in the inputElement
         */
        _formattingChanged() {
            this._initialiseFormatter();
            this.inputElement.bindValue = this._format(this.value);
        }

        /**
         * Gets the navigator language and creates a Internationalization number formatter
         */
        _initialiseFormatter() {
            if (!this._defaultSetting) {
                var OEUtils = window.OEUtils;
                OEUtils = OEUtils || {};
                OEUtils.componentDefaults = OEUtils.componentDefaults || {};
                OEUtils.componentDefaults["oe-decimal-behavior"] = OEUtils.componentDefaults["oe-decimal-behavior"] || {};
                this._defaultSetting = OEUtils.componentDefaults["oe-decimal-behavior"];
            }
            let lLang = this.format || this._defaultSetting.IntlLanguage || navigator.language || navigator.userLanguage || 'en';

            //if precision is incorrectly calculated
            if (this.precision !== undefined && isNaN(this.precision)) {
                console.warn('Invalid precision, defaulting to 2');
                this.precision = 2;
            }
            this._formatter = new Intl.NumberFormat(lLang, {
                minimumFractionDigits: this.precision,
                maximumFractionDigits: this.precision,
                useGrouping: (!this.noGrouping && !this.percentage)
            });
        }

        /**
         * Parses short-hand inputs like 2K or 1M into respective values.
         * @param {string} inputStr String entered in the input.
         * @return {number} Decimal value of the parsed shortHand input.
         */
        _parseShorthand(inputStr) {
            if (!inputStr || inputStr.trim().length === 0) {
                return undefined;
            }
            inputStr = inputStr.trim().toUpperCase();
            let scale = 1;
            if (inputStr[inputStr.length - 1] === 'K') {
                scale = 1000;
                inputStr = inputStr.slice(0, inputStr.length - 1);
            } else if (inputStr[inputStr.length - 1] === 'L') {
                scale = 100000;
                inputStr = inputStr.slice(0, inputStr.length - 1);
            } else if (inputStr[inputStr.length - 1] === 'M') {
                scale = 1000000;
                inputStr = inputStr.slice(0, inputStr.length - 1);
            } else if (inputStr[inputStr.length - 1] === 'C') {
                scale = 10000000;
                inputStr = inputStr.slice(0, inputStr.length - 1);
            } else if (inputStr[inputStr.length - 1] === 'B') {
                scale = 1000000000;
                inputStr = inputStr.slice(0, inputStr.length - 1);
            } else if (inputStr[inputStr.length - 1] === 'T') {
                scale = 1000000000000;
                inputStr = inputStr.slice(0, inputStr.length - 1);
            }
            let multiplier = 1.0;
            if (inputStr.length > 0) {
                multiplier = this._parseDecimal(inputStr);
            }
            if (isNaN(multiplier)) {
                return undefined;
            } else {
                return multiplier * scale;
            }
        }

        /**
         * Parses the input string with groupSeperators like ','
         * @param {string} inputStr String to be parsed to decimal
         * @return {number|Undefined} decimal of parsed String or undefined if the input string is invalid.
         */
        _parseDecimal(inputStr) {
            if (!inputStr || inputStr.length === 0) {
                return undefined;
            }

            let tmp = inputStr.split(this._groupSeparator).join(''),
                isInvalid;
            tmp.replace(this._decimalSeparator, '.');

            isInvalid = tmp.split('.').length > 2 || tmp.lastIndexOf('+') > 0 || tmp.lastIndexOf('-') > 0 || tmp.replace(  /* eslint-disable no-useless-escape */
                /[\+\-0-9\.]/g, '').length > 0;
            if (isInvalid) {
                return undefined;
            }
            return parseFloat(tmp);
        }

        /**
         * Formats the number based on the formatter.
         * @param {number} numVal Numerical value to format
         * @return {string} formatted string of the number
         */
        _format(numVal) {
            let retVal = '';
            if (numVal || numVal === 0) {
                //if formatting as percentage, multiply by 100
                numVal = this.percentage ? numVal *= 100 : numVal;

                if (this._formatter) {
                    retVal = this._formatter.format(numVal);
                } else {
                    retVal = numVal.toLocaleString();
                }
            }
            return retVal;
        }

        /**
         * Observer called on value changed to format the input value
         */
        _valueChanged(newValue, oldValue) { // eslint-disable-line no-unused-vars

            if (!newValue && newValue !== 0) {
                this.inputElement.bindValue = '';
                return;
            }

            if (typeof (newValue) !== 'number') {
                this.set('value', this._parseDecimal(this.value));
                return;
            }

            this.inputElement.bindValue = this._format(newValue);

        }

        /**
         * Observer called when the user enters the value in the input
         * @param {Event} evt 
         */
        _displayChanged(evt) { // eslint-disable-line no-unused-vars

            let newstr = this.inputElement.value;
            newstr = newstr.trim();
            if (newstr !== '') {
                let number = this._parseShorthand(newstr);
                if (isNaN(number)) {
                    this.value = undefined;
                    this.setValidity(false, 'numberFormat');
                    return;
                }
                number = Math.round10(number, -this.precision);

                //divide by 100 if entered value is a percentage
                number = this.percentage ? number / 100 : number;

                this.set('value', number);
                //this.inputElement.bindValue = this._format(number);
            } else {
                this.value = undefined;
                this.inputElement.bindValue = '';
            }
            this.validate();
        }

        /**
         * Checks for min/max validation for the value
         * @param {number} value number to validate
         */
        _checkMinMaxValidity(value) {
            if (this.max && value > this.max) {
                this.setValidity(false, 'rangeOverflow');
            }
            if (this.min && value < this.min) {
                this.setValidity(false, 'rangeUnderflow');
            }
        }
    };
};

export default dedupingMixin(DecimalMixin);