import { html } from "@polymer/polymer/polymer-element.js";
const inputStyles = html`
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
    font-family: inherit;
    font-weight: inherit;
    font-size: inherit;
    letter-spacing: inherit;
    word-spacing: inherit;
    line-height: inherit;
    text-shadow: inherit;
    color: inherit;
    cursor: inherit;
  }

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    @apply --paper-input-container-input-webkit-spinner;
  }

  input::-webkit-clear-button {
    @apply --paper-input-container-input-webkit-clear;
  }

  input::-webkit-calendar-picker-indicator {
    @apply --paper-input-container-input-webkit-calendar-picker-indicator;
  }

  input::-ms-clear {
    @apply --paper-input-container-ms-clear;
  }

  input::-ms-reveal {
    @apply --paper-input-container-ms-reveal;
  }
  
  input::-webkit-input-placeholder {
    color: var(--paper-input-container-color, var(--secondary-text-color));
  }

  input:-moz-placeholder {
    color: var(--paper-input-container-color, var(--secondary-text-color));
  }

  input::-moz-placeholder {
    color: var(--paper-input-container-color, var(--secondary-text-color));
  }

  input:-ms-input-placeholder {
    color: var(--paper-input-container-color, var(--secondary-text-color));
  }
  iron-input {
    @apply --iron-input;
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

  ::slotted([slot=suffix]) {
    @apply --oe-input-suffix;
  }

`;

export default inputStyles;