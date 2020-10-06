/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class.js";
import { PaperInputBehavior } from "@polymer/paper-input/paper-input-behavior.js";
import { IronFormElementBehavior } from "@polymer/iron-form-element-behavior/iron-form-element-behavior.js";
import { OEFieldMixin } from "oe-mixins/oe-field-mixin.js";
import { OEDataMaskMixin } from "oe-mixins/data-mask-mixin.js";
import "@polymer/paper-input/paper-input-char-counter.js";
import "@polymer/paper-input/paper-input-container.js";
import "@polymer/paper-input/paper-input-error.js";
import "@polymer/iron-input/iron-input.js";
import "oe-i18n-msg/oe-i18n-msg.js";
import inputStyles from "./oe-input-styles";


/**
 * ### oe-input-masked
 * 
 * `<oe-input-masked>` is a control for text input based on `oe-input`control with following additional features.
 * 
 *   1. mask the each char with a specified char, based on a RegExp pattern
 *   2. mask the each matched pattern with a specified string, based on a RegExp pattern
 *   3. add specified number of mask char(s) at the end of the specified input.
 * 
 * @customElement
 * @polymer
 * @appliesMixin OEFieldMixin
 * @appliesMixin OEDataMaskMixin
 * @demo demo/demo-oe-input-masked.html
 */
class OeInputMasked extends mixinBehaviors([IronFormElementBehavior, PaperInputBehavior], PolymerElement) {
    static get is() { return 'oe-input-masked'; }

    static get template() {
        return html`
      <style>
        ${inputStyles}
      </style>
      <paper-input-container no-label-float="[[noLabelFloat]]" always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]"
        auto-validate$="[[autoValidate]]" disabled$="[[disabled]]" invalid="[[invalid]]">
        <slot name="prefix" slot="prefix"></slot>
        <label slot="label" hidden$="[[!label]]"  aria-hidden="true">
            <oe-i18n-msg msgid=[[label]]>[[label]]</oe-i18n-msg>
            <template is="dom-if" if={{required}}>
              <span class="required"  aria-hidden="true"> *</span>
            </template>
        </label>
        <iron-input id="[[_inputId]]" slot="input" bind-value="{{display}}" allowed-pattern="[[allowedPattern]]" invalid="{{invalid}}" validator="[[validator]]">
          <input minlength$="[[minlength]]" maxlength$="[[maxlength]]" aria-required$="[[required]]" aria-labelledby$="[[_ariaLabelledBy]]" aria-describedby$="[[_ariaDescribedBy]]" disabled$="[[disabled]]"  prevent-invalid-input="[[preventInvalidInput]]"
           type$="[[type]]" pattern$="[[pattern]]" required$="[[required]]" autocomplete$="[[autocomplete]]" autofocus$="[[autofocus]]" inputmode$="[[inputmode]]" min$="[[min]]"
          max$="[[max]]" step$="[[step]]" name$="[[name]]" placeholder$="[[placeholder]]" readonly$="[[readonly]]" list$="[[list]]" size$="[[size]]" autocapitalize$="[[autocapitalize]]" autocorrect$="[[autocorrect]]"  tabindex$="[[tabindex]]"
          autosave$="[[autosave]]" results$="[[results]]" accept$="[[accept]]" multiple$="[[multiple]]">
        </iron-input>
        <slot name="suffix" slot="suffix"></slot>
        <paper-input-error invalid={{invalid}} slot="add-on">
          <oe-i18n-msg id="i18n-error" msgid={{errorMessage}} placeholders={{errorPlaceholders}}></oe-i18n-msg>
        </paper-input-error>
        <template is="dom-if" if="[[charCounter]]">
          <paper-input-char-counter slot="add-on"></paper-input-char-counter>
        </template>
      </paper-input-container>
    `;
    }

    static get properties() {
        return {
            /**
             * Masked value to display in the control
             */
            display: {
                type: String
            }
            
            /**
             * Fired when the value of the field is changed by the user
             *
             * @event oe-field-changed
             */
        };
    }

    static get observers() {
        return ['_reformat(value,maskPattern,maskChar)'];
    }

    /**
     * Returns a reference to the focusable element. Overridden from
     * PaperInputBehavior to correctly focus the native input.
     *
     * @return {HTMLElement}
     */
    get _focusableElement() {
        return PolymerElement ? this.inputElement._inputElement :
            this.inputElement;
    }

    /**
     * Returns a validity flag to check maxlength and minlength validation. Overridden from
     * OEFieldMixin to provide validation function.
     *
     * @return {boolean} Valid flag
     */
    _validate() {
        let isValid = true;
        if (this.maxlength && this.value && this.value.length > this.maxlength) {
            this.setValidity(false, 'tooLong');
            isValid = false;
        } else if (this.minlength && (!this.value || this.value.length < this.minlength)) {
            this.setValidity(false, 'tooShort');
            isValid = false;
        }
        return isValid;
    }

    _displayChanged(){
      var status = this.validate();
      if(status && this.fieldId) {
        this.fire('oe-field-changed', {fieldId: this.fieldId, value: this.value});
      }
    }    
    /**
     * Connected Callback to initiate event listeners.
     * 
     */
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('change', e => this._displayChanged(e));
        this.addEventListener('keydown', e => this._buildValue(e));
        this.addEventListener('keypress', e => this._buildValue(e));
        this.addEventListener('blur', e => this._blured(e));
        this.addEventListener('focus', e => this._focused(e));
    }


    /**
     * Builds the maked display based on the `value` of the input
     * @param {Event} evt 
     */
    _buildValue(evt) { /* eslint-disable no-unused-vars */
        let inputEle = this.$.input.inputElement,
            s = this.value,
            newCursorPosition;
        let charToAppend = '';
        this.value || (this.value = '');
        let start = Math.min(inputEle.selectionStart, inputEle.selectionEnd);
        let end = Math.max(inputEle.selectionStart, inputEle.selectionEnd);

        //don't do anything if ctrl or alt key is pressed
        if (evt.ctrlKey || evt.altKey) {
            if ([8, 46].indexOf(evt.keyCode) > -1)
                evt.preventDefault();
            return;
        }

        // handle for delete and backspace key when nothing is selected
        if (evt.type == 'keydown') {
            switch (evt.keyCode) {
                case 8:
                    (start == end) && (this.value = s.substring(0, start - 1) + s.substring(start, s.length));
                    newCursorPosition = end - 1;
                    break;
                case 46:
                    (start == end) && (this.value = s.substring(0, start) + s.substring(start + 1, s.length));
                    newCursorPosition = end;
                    break;
                default:
                    return;
            }
        } else {

            //ignore enter key
            let keysToIgnore = [13];

            if (keysToIgnore.indexOf(evt.keyCode) != -1) return;

            //convert keycode to char
            charToAppend = String.fromCharCode(evt.keyCode);

            if (start != this.value.length) {
                //if  the cursor is in middle or begining
                this.value = s.substring(0, start) + charToAppend + s.substring(start, s.length);
                newCursorPosition = start + 1;
            } else {
                //if  the cursor is in the end
                this.value += charToAppend;
                newCursorPosition = this.value.length;
            }

        }

        evt.preventDefault();

        //if some selection is made, remove the selected character(s) and insert the new character
        if (start != end) {
            this.value = s.substring(0, start) + charToAppend + s.substring(end, s.length);
            newCursorPosition = start + 1;
        }

        this.set('formattedDisplay', this.value);

        //set the cursor position according to the newly inserted
        inputEle.selectionStart = inputEle.selectionEnd = newCursorPosition;
    }

    /**
     * Appends specified number of characters to the input on blur
     */
    _blured(evt) { /* eslint-disable no-unused-vars */
        (this.appendCharLength > 0 && this.display && this.display.length) && this.set('display', this.display + new Array(this.appendCharLength +
            1).join(this.maskChar));
    }

    /**
     * Removes the appended characters to the input on focus
     */
    _focused(evt) { /* eslint-disable no-unused-vars */
        this.set('formattedDisplay', '');
        this.set('formattedDisplay', this.value);
    }

    /**
     * Mask the value and set masked display
     * @param {string} v value to mask
     * @param {string} p pattern to mask
     * @param {string} c character to be used for masking
     */
    _reformat(v, p, c) { /* eslint-disable no-unused-vars */
        this.set('formattedDisplay', '');
        this.set('formattedDisplay', this.value);
        (this.appendCharLength > 0 && this.display && this.display.length) && this.set('display', this.display + new Array(this.appendCharLength +
            1).join(this.maskChar));
    }

}

window.customElements.define(OeInputMasked.is, OEDataMaskMixin(OEFieldMixin(OeInputMasked)));