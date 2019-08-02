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
 * ### oe-textarea
 * 
 * `<oe-textarea>` is a control for multiline text input based on Polymer's `paper-textarea` control with following additional features.
 * 
 *   1. control level validations
 *   2. model-level/cross-field validations. When any UI control is placed on the form, the control needs to be 'aware' of 'which property' on the model it is bound to. This is required specially since, many times two or more controls take part in deciding the model validity. (cross-field-validations)
 *   3. support internationalization of labels and error-messages out of box.
 *   4. `oe-textarea` adds a little red-asterisk if the field is 'required'.
 * 
 *     <oe-textarea required field-id="accountName" label="Account Name"></oe-textarea>
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
 * @customElement
 * @polymer
 * @appliesMixin OEFieldMixin
 * @demo demo/demo-oe-textarea.html
 */
class OeTextarea extends mixinBehaviors([IronFormElementBehavior, PaperInputBehavior], PolymerElement) {
    static get is() { return 'oe-textarea'; }

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
            
            label{
                @apply --oe-label-mixin;
              }
              paper-input-char-counter{
                @apply --oe-input-char-counter;
              }
              paper-input-error{
                @apply --oe-input-error;
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

            <iron-autogrow-textarea slot="input" id="input" class="paper-input-input" aria-required$="[[required]]" aria-labelledby$="[[_ariaLabelledBy]]" aria-describedby$="[[_ariaDescribedBy]]" bind-value="{{value}}" disabled$="[[disabled]]" autocomplete$="[[autocomplete]]"
                autofocus$="[[autofocus]]" inputmode$="[[inputmode]]" placeholder$="[[placeholder]]" readonly$="[[readonly]]"
                required$="[[required]]" maxlength$="[[maxlength]]" autocapitalize$="[[autocapitalize]]" rows$="[[rows]]" max-rows$="[[maxRows]]"
                on-value-changed="validate" invalid="{{invalid}}" tabindex$="[[tabindex]]">
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
    //Name attribute doesn't get attached to the textarea,
    //iron-autogrow-textarea deosnt have property called 'name' , 
    //refer https://github.com/PolymerElements/iron-autogrow-textarea/issues/33
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
            invalid: {
                type: Boolean,
                value: false, 
                notify: true,
                reflectToAttribute: true
              }
        };
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
     * Returns a reference to the focusable element. Overridden from
     * PaperInputBehavior to correctly focus the native textarea.
     *
     * @return {HTMLElement}
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

}

window.customElements.define(OeTextarea.is, OEFieldMixin(OeTextarea));