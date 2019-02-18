/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { OECommonMixin } from "oe-mixins/oe-common-mixin";
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { IronFormElementBehavior } from '@polymer/iron-form-element-behavior/iron-form-element-behavior';

import "@polymer/paper-input/paper-input-container.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import "@polymer/paper-input/paper-input-error.js";

import "oe-i18n-msg/oe-i18n-msg.js";
import "oe-input/oe-input.js";
import "oe-combo/oe-combo.js";
import "oe-input/oe-decimal.js";
import { OEFieldMixin } from "oe-mixins/oe-field-mixin";

/**
 * `oe-amount`
 *  An element which combines the currency and amount inputs.
 *  Example:
 *    <oe-amount label="Amount Input"></oe-amount>
 * 
 * @customElement
 * @polymer
 * @appliesMixin OECommonMixin
 * @appliesMixin OEFieldMixin
 * @demo demo/demo-oe-amount.html
 */
class OeAmount extends mixinBehaviors([IronFormElementBehavior], OECommonMixin(PolymerElement)) {

  static get is() { return 'oe-amount'; }

  static get template() {
    return html`
    <style include="iron-flex iron-flex-alignment iron-flex-factors">
      :host {
        display: block;
      }
      .nolabel {
        --paper-input-container-label:{
          display: none;
        }
        --paper-input-container-label-floating:{
          display: none;
        }
        --paper-input-container-label-focus:{
          display: none;
        }            
      }
      .bottomless {
        --paper-input-container-underline: {
          display: none;
        }
        --paper-input-container-underline-disabled: {
         display: none;
        }
        --paper-input-container-underline-focus: {
          display: none;
        }
        --paper-input-container :{
          padding: 0px;
        }
      }
      #ccy {
        --paper-font-caption: {
          display: none;
        }        
      }
      #amt {
        --paper-font-caption: {
          display: none;
        }        
      }
    </style>
    <paper-input-container id="container" 
    no-label-float="[[noLabelFloat]]" 
    always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]"
    auto-validate$="[[autoValidate]]" 
    disabled$="[[disabled]]" 
    invalid="[[invalid]]">
      <slot slot="prefix" name="prefix"></slot>
        <!--Hide the label since we will use amount's label field. -->
      <label hidden slot="label"></label>
      <div class="layout horizontal flex end" slot="input">
        <!--Fool the paper-input-container with a dummy input box -->
         <input hidden id="shadowinput" />
        <oe-decimal on-addon-attached="__preventAddOnEvent" id="amt" required$=[[required]] disabled$=[[disabled]] user-error-message=[[amtErrorMessage]] error-message={{_amtError}} placeholders$={{errorPlaceholders}} invalid={{_amtInvalid}} label=[[label]] class="bottomless flex-8" always-float-label="[[isFocused]]" precision="[[_getPrecision(selectedCurrency, precision)]]" value={{amount}} min=[[min]] max=[[max]]></oe-decimal>
        <oe-combo on-addon-attached="__preventAddOnEvent" no-label-float id="ccy" required$=[[required]] disabled$=[[disabled]] user-error-message=[[ccyErrorMessage]] error-message={{_ccyError}} invalid={{_ccyInvalid}} class="nolabel bottomless flex-2" value={{currency}} valueproperty="[[ccyValueField]]" displayproperty="[[ccyDisplayField]]" listurl=[[ccyListUrl]] listdata={{ccyList}} selected-item={{selectedCurrency}}></oe-combo>        
      </div>
      <slot slot="suffix" name="suffix"></slot>
      <paper-input-error invalid={{invalid}} slot="add-on">
        <oe-i18n-msg id="i18n-error" msgid={{errorMessage}} placeholders={{placeholders}}></oe-i18n-msg>
      </paper-input-error>

</paper-input-container>
    `;
  }

  static get properties() {
    return {
      /**
       * Label for the component
       */
      label: {
        type: String
      },
      /**
       * Describes the value of the element, which has currency and amount.
       *
       * @type {{currency: Object, amount: number}}
       */
      value: {
        type: Object,
        notify: true,
        observer: '_valueChanged'
      },
      amount: {
        type: Number,
        notify: true,
        observer: '_amountChanged'
      },
      currency: {
        type: Object,
        notify: true,
        observer: '_currencyChanged'
      },

      /*
      * Default initial currency code
      */
      defaultCcy: {
        type: String
      },
      /**
       * An array of currencies.
       */
      ccyList: {
        type: Array,
        observer: '_ccyListChanged'
      },

      /**
       * Remote URL to fetch the currency list.
       */
      ccyListUrl: {
        type: String,
      },

      /**
       * Stores the property from the currency list items to be 
       * used as display property for oe-combo.
       */
      ccyDisplayField: {
        type: String
      },
      /**
       * Stores the property from the currency list items to be 
       * used as value property for oe-combo.
       */
      ccyValueField: {
        type: String
      },
      /**
       * Boolean that floats the label on focus on the input.
       */
      isFocused: {
        type: Boolean,
        value: false,
      },
      /**
       * The error message to be displayed
       */
      errorMessage: {
        type: String,
        notify: true
      },
      /**
      * Max limit for value 
      */
      max: {
        type: Object
      },
      /**
      * Min limit for value 
      */
      min: {
        type: Object
      },
      /**
      * Is field mandatoty
      */
      required: {
        type: Boolean,
        value: false
      },
      /**
     * Is field disabled
     */
      disabled: {
        type: Boolean,
        value: false
      },
      /**
      * Default precision used when not available on currency.
      */
      precision: {
        type: Number,
        value: 2
      },
      /**
      * Show this error when currency field is in error
      */
      ccyErrorMessage: {
        type: String
      },
      /**
      * Show this error when amount field is in error
      */
      amtErrorMessage: {
        type: String
      },
      _amtInvalid: {
        type: Boolean,
        observer: '_updateValidity'
      },
      _ccyInvalid: {
        type: Boolean,
        observer: '_updateValidity'
      },
      _amtError: {
        type: String,
        observer: '_updateValidity'
      },
      _ccyError: {
        type: String,
        observer: '_updateValidity'
      }
    };
  }

  __preventAddOnEvent(e) {
    /**
     * Stops the "addon-attached" from oe-decimal,oe-combo.
     * Else the paper-input-container will try to register oe-decimal as a add-on component and fail.
     */
    e.stopPropagation();
  }


  connectedCallback() {
    super.connectedCallback();
    /* Well.. here's the hack I hate.
     * CSS Mixins used in styles section for .bottomless class only hide the 
     * underline but div still occupies the vertical space and causes misalignment.
     * The paper-input-container does not provide means to hide the div 
     * for underline completely 
     * (.underline class in paper-input-container exposes no mixins)
     * 
     * So we nail it through a sledge hammer. Forgive me.
     */

    /* SOH */
    var amtUnderline = this.$.amt.shadowRoot.querySelector('paper-input-container').shadowRoot.querySelector('.underline');
    var ccyUnderline = this.$.ccy.shadowRoot.querySelector('paper-input-container').shadowRoot.querySelector('.underline');
    amtUnderline.style.display = 'none';
    ccyUnderline.style.display = 'none';
    var amtError = this.$.amt.shadowRoot.querySelector('paper-input-container').shadowRoot.querySelector('.add-on-content');
    var ccyError = this.$.ccy.shadowRoot.querySelector('paper-input-container').shadowRoot.querySelector('.add-on-content');
    amtError.style.display = 'none';
    ccyError.style.display = 'none';
    /* EOH */
  }

  _valueChanged(newValue, oldValue) {
    if (newValue) {
      this.set('amount', newValue.amount);
      this.set('currency', newValue.currency);
    } else {
      this.set('amount', undefined);
      this.set('currency', undefined);
    }
  }
  _amountChanged(newVal, oldVal) {
    if (!this.currency && !this.amount) {
      this.set('value', undefined);
    } else {
      if (this.value) {
        this.value.amount = newVal;
      } else {
        this.set('value', {
          amount: newVal,
          currency: this.currency
        });
      }
    }
  }
  _currencyChanged(newVal, oldVal) {
    if (!this.currency && !this.amount) {
      this.set('value', undefined);
    } else {
      if (this.value) {
        this.value.currency = newVal;
      } else {
        this.set('value', {
          amount: this.amount,
          currency: newVal
        });
      }
    }
  }

  /**
   * Returns a reference to the input element.
   */
  get inputElement() {
    return this.$.amt;
  }

  _getPrecision(currency, precision) {
    return (!currency || currency.precision === undefined) ? precision : currency.precision;
  }
  _updateValidity() {
    var isValid = !(this._amtInvalid || this._ccyInvalid);
    var newError = this._amtError || this._ccyError;
    this.setValidity(isValid, newError);
  }
  /**
   * Applies when form validate method is called to check
   * if the values are provided.
   *
   * @return {boolean} Returns true/false, according to validation success/failure respectively.
   */
  _validate() {
    var value = this.value;
    var isValid = true;
    if (value) {
      if (!value.currency && !value.amount) {
        this.setValidity(false, 'valueMissing');
        isValid = false;
      } else if (value.currency && !value.amount) {
        this.setValidity(false, this.amtErrorMessage || 'amountMissing');
        isValid = false;
      } else if (value.amount && !value.currency) {
        this.setValidity(false, this.ccyErrorMessage || 'currencyMissing');
        isValid = false;
      }
    } else if (this.required) {
      this.setValidity(false, 'valueMissing');
      isValid = false;
    }
    return isValid;
  }
  /**
   * Applies when currency list is set/updated.
   * If existing currency is present in newList, find and set as new selectedCurrency
   * otherwise, select first currency by default.
   * @param {Object} newVal
   * @param {Object} oldVal
   */
  _ccyListChanged(newVal, oldVal) {
    var self = this;
    if (newVal && Array.isArray(newVal) && newVal.length > 0) {
      var newCcy;
      if (self.currency) {
        newCcy = newVal.find(function (c) {
          return self.currency === (self.ccyValueField ? c[self.ccyValueField] : c);
        });
        if (!newCcy) {
          self.setValidity(false, self.ccyErrorMessage || 'invalidCurrency');
        }
      } else if (self.required) {
        /*Set currency only if amount is required*/
        if (self.defaultCcy) {
          /* Look for default currency */
          newCcy = newVal.find(function (c) {
            return self.defaultCcy === (self.ccyValueField ? c[self.ccyValueField] : c);
          });
        }
        newCcy = (newCcy || newVal[0]);
        this.set('currency', this.ccyValueField ? newCcy[this.ccyValueField] : newCcy);
      }
    } else {
      this.set('currency', undefined);
    }
  }

}

window.customElements.define(OeAmount.is, OEFieldMixin(OeAmount));