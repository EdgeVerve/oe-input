import { html, PolymerElement } from '@polymer/polymer/polymer-element.js';
import { mixinBehaviors } from '@polymer/polymer/lib/legacy/class.js';
import { IronValidatorBehavior } from '@polymer/iron-validator-behavior/iron-validator-behavior.js';
class LettersOnly extends mixinBehaviors([IronValidatorBehavior],PolymerElement){
  static get is(){
    return "letters-only"
  }

  validate (value){
    return !value || value.match(/^[a-zA-Z]*$/) !== null;
  }
}

window.customElements.define(LettersOnly.is, LettersOnly);
