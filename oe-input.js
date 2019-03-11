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
import "@polymer/iron-input/iron-input.js";
import "oe-i18n-msg/oe-i18n-msg.js";

/**
 * # oe-input
 * 
 * `<oe-input>` is a control for text input based on Polymer's `paper-input` control with following additional features.
 *
 * ## Features 
 *   1. Control level validations.
 *   2. Model-level/cross-field validations. When any UI control is placed on the form, the control needs to be 'aware' of 'which property' on the model it is bound to. This is required specially since, many times two or more controls take part in deciding the model validity. (cross-field-validations)
 *   3. Support internationalization of labels and error-messages out of box.
 *   4. `oe-input` adds a little red-asterisk if the field is 'required'.
 * 
 *     <oe-input required field-id="accountName" label="Account Name"></oe-input>
 * 
 * ## Styling
 * 
 * The following custom properties and mixins are available for styling
 * 
 * CSS Variable | Description | Default
 * ----------------|-------------|----------
 * `--paper-input-container-invalid-color` | Color applied to asterisk indicating, required field | `--paper-deep-orange-a700`
 * `--paper-input-container-color`         | Default container color        | `--secondary-text-color`
 * `--oe-label-mixin`                      | Mixin applied on label         | 
 * 
 * @customElement
 * @polymer
 * @appliesMixin OEFieldMixin
 * @demo demo/demo-oe-input.html
 */
class OeInput extends mixinBehaviors([IronFormElementBehavior, PaperInputBehavior], PolymerElement) {
  static get is() { return 'oe-input'; }

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

        label{
          @apply --oe-label-mixin;
        }
      </style>
      <paper-input-container no-label-float="[[noLabelFloat]]" always-float-label="[[_computeAlwaysFloatLabel(alwaysFloatLabel,placeholder)]]"
        auto-validate$="[[autoValidate]]" disabled$="[[disabled]]" invalid="[[invalid]]">
        <slot name="prefix" slot="prefix"></slot>
        <label slot="label" hidden$="[[!label]]"  aria-hidden="true">
            <oe-i18n-msg msgid=[[label]]>[[label]]</oe-i18n-msg>
            <template is="dom-if" if={{required}}>
              <span class="required" aria-hidden="true"> *</span>
            </template>
        </label>
        <iron-input id="[[_inputId]]" slot="input" bind-value="{{value}}" on-change="validate" allowed-pattern="[[allowedPattern]]" invalid="{{invalid}}" validator="[[validator]]">
          <input minlength$="[[minlength]]" maxlength$="[[maxlength]]" aria-required$="[[required]]" aria-labelledby$="[[_ariaLabelledBy]]" aria-describedby$="[[_ariaDescribedBy]]" disabled$="[[disabled]]"  prevent-invalid-input="[[preventInvalidInput]]"
           type$="[[type]]" pattern$="[[pattern]]" required$="[[required]]" autocomplete$="[[autocomplete]]" autofocus$="[[autofocus]]" inputmode$="[[inputmode]]" min$="[[min]]"
          max$="[[max]]" step$="[[step]]" name$="[[name]]" placeholder$="[[placeholder]]" readonly$="[[readonly]]" list$="[[list]]" size$="[[size]]" autocapitalize$="[[autocapitalize]]" autocorrect$="[[autocorrect]]"  tabindex$="[[tabindex]]"
          autosave$="[[autosave]]" results$="[[results]]" accept$="[[accept]]" multiple$="[[multiple]]">
        </iron-input>
        <slot name="suffix" slot="suffix"></slot>
        <paper-input-error invalid={{invalid}} slot="add-on">
          <oe-i18n-msg id="i18n-error" msgid={{errorMessage}} placeholders={{placeholders}}></oe-i18n-msg>
        </paper-input-error>
        <template is="dom-if" if="[[charCounter]]">
          <paper-input-char-counter slot="add-on"></paper-input-char-counter>
        </template>
      </paper-input-container>
    `;
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
   * @return {boolean}
   */
  _validate() {
    let isValid = true;
    if (this.maxlength && this.value && this.value.length > this.maxlength) {
      this.setValidity(false, 'tooLong');
      isValid = false;
    } else if (this.minlength && this.value && this.value.length < this.minlength) {
      this.setValidity(false, 'tooShort');
      isValid = false;
    }
    return isValid;
  }

  /**
   * Connected Callback to initiate 'change' listener with validation function.
   * 
   */
  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change', e => this.validate(e));
  }

}

window.customElements.define(OeInput.is, OEFieldMixin(OeInput));