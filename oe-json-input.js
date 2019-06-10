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
import "@polymer/paper-input/paper-input-char-counter.js";
import "@polymer/paper-input/paper-input-container.js";
import "@polymer/paper-input/paper-input-error.js";
import "@polymer/iron-autogrow-textarea/iron-autogrow-textarea.js";
import "oe-i18n-msg/oe-i18n-msg.js";

/**
 * ### oe-json-input
 * 
 * `<oe-json-input>` is a control for multiline text input based on Polymer's `paper-textarea` control with following additional features.
 * 
 *   1. control level validations
 *   2. model-level/cross-field validations. When any UI control is placed on the form, the control needs to be 'aware' of 'which property' on the model it is bound to. This is required specially since, many times two or more controls take part in deciding the model validity. (cross-field-validations)
 *   3. support internationalization of labels and error-messages out of box.
 *   4. `oe-json-input` adds a little red-asterisk if the field is 'required'.
 * 
 * 
 * ### Styling
 * 
 * The following custom properties and mixins are available for styling:
 * 
 * CSS Variable | Description | Default
 * ----------------|-------------|----------
 * `--paper-input-container-invalid-color` | Color applied to asterisk indicating, required field | `--google-red-500`
 * `--paper-input-container-color`         | Default container color        | `--secondary-text-color`
 * 
 * 
 * @customElement
 * @polymer
 * @appliesMixin OEFieldMixin
 * @demo demo/demo-oe-json-input.html
 */
class OeJsonInput extends mixinBehaviors([IronFormElementBehavior, PaperInputBehavior], PolymerElement) {
    static get is() { return 'oe-json-input'; }

    static get template() {
        return html`
        <style>
            :host {
                display: block;
            }
            span.required {
                vertical-align: bottom;
                color: var(--paper-input-container-invalid-color, var(--google-red-500));
                @apply --oe-required-mixin;
            }

            iron-autogrow-textarea{
                --iron-autogrow-textarea:{
                    padding:0px;
                }
            }
        </style>
        <paper-input-container no-label-float$="[[noLabelFloat]]" always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]"
            auto-validate$="[[autoValidate]]" disabled$="[[disabled]]" invalid="[[invalid]]">
            <label slot="label" hidden$="[[!label]]" aria-hidden="true">
                <oe-i18n-msg msgid=[[label]]>[[label]]</oe-i18n-msg>
                <template is="dom-if" if=[[required]]>
                    <span class="required" aria-hidden="true"> *</span>
                </template>
            </label>
            <iron-autogrow-textarea slot="input" id="input" aria-required$="[[required]]" aria-labelledby$="[[_ariaLabelledBy]]"  class="paper-input-input" bind-value="{{displayValue}}" disabled$="[[disabled]]" autocomplete$="[[autocomplete]]"
                autofocus$="[[autofocus]]" inputmode$="[[inputmode]]" name$="[[name]]" placeholder$="[[placeholder]]" readonly$="[[readonly]]"
                required$="[[required]]" maxlength$="[[maxlength]]" autocapitalize$="[[autocapitalize]]" rows$="[[rows]]" max-rows$="[[maxRows]]"
                on-change="_displayChanged" tabindex$="[[tabindex]]">
            </iron-autogrow-textarea>
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
            _ariaLabelledBy: {
                observer: '_ariaLabelledByChanged',
                type: String
            },

            _ariaDescribedBy: {
                observer: '_ariaDescribedByChanged',
                type: String
            },

            /**
             * Inital number of rows of the textarea
             */
            rows: {
                type: Number,
                value: 1
            },

            /**
             * Maximum number of rows the textarea can grow untill it scrolls.
             * 0 means no limit.
             */
            maxRows: {
                type: Number,
                value: 0
            },

            displayValue: {
                type: String
            },

            value: {
                type: Object,
                notify: true,
                observer: '_valueChanged'
            }

        };
    }

    /**
     * Parses the entered input as JSON and validates
     */
    _displayChanged(e) { //eslint-disable-line no-unused-vars
        let obj = undefined;
        try {
            obj = JSON.parse(this.displayValue);
        } catch (e) {
            obj = null;
        }
        this.set('value', obj);
        this.validate();
    }

    /**
     * Displays the prettified JSON value
     */
    _valueChanged(nVal, oVal) { //eslint-disable-line no-unused-vars
        let text = undefined;
        if (nVal) {
            if (typeof nVal === 'string') {
                let obj;
                try {
                    obj = JSON.parse(nVal);
                    this.set('value', obj);
                } catch (e) {
                    this.displayValue = nVal;
                    this.set('value', null);
                }
                //do not proceed further. Lets get into this function with value-type as Object.
                return;
            } else {
                text = JSON.stringify(nVal, null, 2);
            }
        }
        if (nVal !== null) {
            this.displayValue = text;
        }

        this.validate();
    }

    /**
     * Validates if the entered value is a valid JSON object.
     */
    _validate() {
        let isValid = true;
        if (this.displayValue && !this.value) {
            this.setValidity(false, 'invalidValue');
            isValid = false;
        } else if (this.required && !this.value) {
            this.setValidity(false, 'valueMissing');
            isValid = false;
        }
        return isValid;
    }

    /**
     * Returns a reference to the focusable element. Overridden from
     * PaperInputBehavior to correctly focus the native textarea.
     *
     * @return {HTMLElement}
     */
    get _focusableElement() {
        return this.$.input.textarea;
    }

    /**
     * Returns a reference to the input element.
     */
    get inputElement() {
        return this.$.input.textarea;
    }


    /**
     * Set aria-labelledby on the textarea within iron-autogrow-textarea
     * @param {string} ariaLabelledBy 
     */
    _ariaLabelledByChanged(ariaLabelledBy) {
        this.$.input.textarea.setAttribute('aria-labelledby', ariaLabelledBy);
    }

    /**
     * Set aria-describedby on the textarea within iron-autogrow-textarea
     * @param {string} ariaDescribedBy 
     */
    _ariaDescribedByChanged(ariaDescribedBy) {
        this.$.input.textarea.setAttribute('aria-describedby', ariaDescribedBy);
    }


    /**
     * Attaches change event listener on inputElement
     */
    connectedCallback() {
        super.connectedCallback();
        this.inputElement.addEventListener('change', e => this._displayChanged(e));
    }
}

window.customElements.define(OeJsonInput.is, OEFieldMixin(OeJsonInput));