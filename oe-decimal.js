/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { mixinBehaviors } from "@polymer/polymer/lib/legacy/class.js";
import { PaperInputBehavior } from "@polymer/paper-input/paper-input-behavior.js";
import { IronFormElementBehavior } from "@polymer/iron-form-element-behavior/iron-form-element-behavior.js";
import { IronValidatableBehavior } from "@polymer/iron-validatable-behavior/iron-validatable-behavior.js";
import { OEFieldMixin } from "oe-mixins/oe-field-mixin.js";
import DecimalMixin from "./oe-decimal-mixin.js";
import "@polymer/paper-input/paper-input-char-counter.js";
import "@polymer/paper-input/paper-input-container.js";
import "@polymer/paper-input/paper-input-error.js";
import "@polymer/iron-input/iron-input.js";
import "oe-i18n-msg/oe-i18n-msg.js";

/**
 * ### oe-decimal
 * `<oe-decimal>` is a control for capturing number inputs with following features.
 * 
 *   1. control level validations
 *   2. model-level/cross-field validations. When any UI control is placed on the form, the control needs to be 'aware' of 'which property' on the model it is bound to. This is required specially since, many times two or more controls take part in deciding the model validity. (cross-field-validations)
 *   3. support internationalization of labels and error-messages out of box.
 *   4. `oe-decimal` adds a little red-asterisk if the field is 'required'.
 *   5. Handling of decimal display, parsing and formatting.
 * 
 *     <oe-decimal required field-id="interestRate" label="Rate" precision=2></oe-decimal>
 * 
 * ### Styling
 * 
 * The following custom properties and mixins are available for styling:
 * 
 * CSS Variable | Description | Default
 * ----------------|-------------|----------
 * `--paper-input-container-invalid-color` | Color applied to asterisk indicating, required field | --paper-deep-orange-a700`
 * `--paper-input-container-color`         | Default container color        | `--secondary-text-color`
 * 
 * @customElement
 * @polymer
 * @appliesMixin OEFieldMixin
 * @appliesMixin DecimalMixin
 * @demo demo/demo-oe-decimal.html
 */
class OeDecimal extends mixinBehaviors([IronFormElementBehavior, IronValidatableBehavior, PaperInputBehavior], PolymerElement) {
    static get is() { return 'oe-decimal'; }

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
    
            paper-input-container {
                display: inline-block;
                width: 100%;
            }

            input{
                @apply --paper-input-container-shared-input-style;
            }

            input::-webkit-input-placeholder {
                color: var(--paper-input-container-color, --secondary-text-color);
            }
    
            input:-moz-placeholder {
                color: var(--paper-input-container-color, --secondary-text-color);
            }
    
            input::-moz-placeholder {
                color: var(--paper-input-container-color, --secondary-text-color);
            }
    
            input:-ms-input-placeholder {
                color: var(--paper-input-container-color, --secondary-text-color);
            }
    
        </style>
        <paper-input-container no-label-float="[[noLabelFloat]]" always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]"
            auto-validate$="[[autoValidate]]" disabled$="[[disabled]]" invalid="[[invalid]]">
            <slot name="prefix" slot="prefix"></slot>
            <label slot="label" hidden$="[[!label]]" aria-hidden="true">
                <oe-i18n-msg msgid=[[label]]>[[label]]</oe-i18n-msg>
                <template is="dom-if" if={{required}}>
                    <span class="required" aria-hidden="true"> *</span>
                </template>
            </label>
            <iron-input id="[[_inputId]]" slot="input" on-change="_displayChanged" allowed-pattern="[[allowedPattern]]" invalid="{{invalid}}" validator="[[validator]]">
                <input minlength$="[[minlength]]" maxlength$="[[maxlength]]" aria-required$="[[required]]" aria-labelledby$="[[_ariaLabelledBy]]" aria-describedby$="[[_ariaDescribedBy]]" disabled$="[[disabled]]"  prevent-invalid-input="[[preventInvalidInput]]"
                type$="[[type]]" pattern$="[[pattern]]" required$="[[required]]" autocomplete$="[[autocomplete]]" autofocus$="[[autofocus]]" inputmode$="[[inputmode]]" min$="[[min]]"
                max$="[[max]]" step$="[[step]]" name$="[[name]]" placeholder$="[[placeholder]]" readonly$="[[readonly]]" list$="[[list]]" size$="[[size]]" autocapitalize$="[[autocapitalize]]" autocorrect$="[[autocorrect]]"  tabindex$="[[tabindex]]"
                autosave$="[[autosave]]" results$="[[results]]" accept$="[[accept]]" multiple$="[[multiple]]">
            </iron-input>
            <template id="x" is="dom-if" if="{{percentage}}">
                <div slot="suffix">%</div>
            </template>
            <template is="dom-if" if="{{!percentage}}">
                <slot name="suffix" slot="suffix"></slot>
            </template>
            <paper-input-error invalid={{invalid}} slot="add-on">
                <oe-i18n-msg id="i18n-error" msgid={{errorMessage}} placeholders={{placeholders}}></oe-i18n-msg>
            </paper-input-error>
        </paper-input-container>
        `;
    }

    /**
     * Returns a reference to the focusable element. Overridden from
     * PaperInputBehavior to correctly focus the native input.
     *
     * @return {HTMLElement} Element to focus
     */
    get _focusableElement() {
        return PolymerElement ? this.inputElement._inputElement :
            this.inputElement;
    }

}

window.customElements.define(OeDecimal.is, DecimalMixin(OEFieldMixin(OeDecimal)));