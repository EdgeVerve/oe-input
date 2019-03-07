/**
 * @license
 * ©2018-2019 EdgeVerve Systems Limited (a fully owned Infosys subsidiary),
 * Bangalore, India. All Rights Reserved.
 */

import { html, PolymerElement } from "@polymer/polymer/polymer-element.js";
import { timeOut } from "@polymer/polymer/lib/utils/async.js";
import {LegacyElementMixin} from "@polymer/polymer/lib/legacy/legacy-element-mixin.js";
import "@polymer/iron-image/iron-image.js";
import "@polymer/paper-button/paper-button.js";
import "@polymer/paper-icon-button/paper-icon-button.js";
import "@polymer/iron-flex-layout/iron-flex-layout-classes.js";
import { OEFieldMixin } from "oe-mixins/oe-field-mixin.js";
import { OETemplatizeMixin } from "oe-mixins/oe-templatize-mixin.js";
/**
 * ### oe-file-input
 * 
 * `<oe-file-input>` is a input control that lets the user to select single or multiple file(s) and POST them to a specified URL.
 * The files can be selected either by using the file picker dialog or by dragging and dropping into the control.
 * Images can be previewed before uploading.
 * 
 * `valueType` property specifies how the selected file data is loaded and set as `value` property.
 * 
 * |multiple |valueType|value    |Description|
 * |---------|---------|---------|-----------|
 * | true    |   -     | [File]| When `multiple` is set as true, the `valueType` is ignored and `value` is always set as Array[`File`].|
 * | false   | file    | File    | Selected `File` object is set as-it-is to the value|
 * | false   | stream  | Data Stream| The selected file is read as data-url and is set as value|
 * | false   | binary  | Binary file content| The file contents are read as binary string and set as value|
 * 
 * 
 * @customElement
 * @polymer
 * @appliesMixin OEFieldMixin
 * @appliesMixin OETemplatizeMixin
 * @demo demo/demo-oe-file-input.html
 */
class OeFileInput extends LegacyElementMixin(PolymerElement) {
    static get is() { return 'oe-file-input'; }

    static get template() {
        return html`
        <style is="custom-style" include="iron-flex iron-flex-alignment"></style>
        <style>
          .preview-img {
            border: 1px solid var(--image-preview-border, #D4D4D4);
            margin: 8px 0px;
          }
    
          .launch-button {
            height: auto;
          }
    
        </style>
        <input type="file" id="fileInput" multiple$=[[multiple]] hidden accept="[[accept]]" on-change="_fileSelected" />
        <slot></slot>
        <template is="dom-if" if={{!hasCustomUpload}}>
            <div id="dropArea" class="layout horizontal" on-dragenter="dragEnterOver" on-dragover="dragEnterOver" on-drop="drop">
                <paper-button on-tap="_selectFile" raised>
                    <div hidden$="[[value]]">
                        Choose or drop files
                    </div>
                    <template is="dom-if" if=[[value]]>
                        <div class="file-preview layout vertical">
                            <template is="dom-if" if=[[_isImage(fileType)]]>
                                <iron-image src="[[value]]" style="width:100px;height:100px" sizing="contain" class="preview-img"></iron-image>
                            </template>
                            <template is="dom-repeat" items={{listToArray(files)}}>
                                <label>{{item.name}}</label>
                            </template>
                        </div>
                    </template>
                </paper-button>
                <template is="dom-if" if="[[_enableUpload]]">
                    <paper-icon-button icon="file-upload" on-tap="uploadFiles"></paper-icon-button>
                </template>
            </div>
        </template>  
      `;
    }

    static get properties() {
        return {

             /**
              * Flag to allow multiple files to be selected
              */
             multiple: {
                type: Boolean,
                value:false
            },
            
            /**
             * Flag to send files in a single upload
             */
            isbulkUpload: {
                type: Boolean,
                value: false
            },
            
            /**
             * File types to be allowed 
             * As specified by (https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#attr-accept)
             */
            accept: {
                type: String
            },
            
            /**
             * Specifies what information is extracted from the selected file and set as value.
             * file | stream | binary
             */
            valueType: {
                type: String
            },
            
            /**
             * Current value depending on the specified _valueType_
             */
            value: {
                type: Object,
                notify: true,
                observer: '_updateValue'
            },
            
            /**
             * Name of the currently selected file.It is undefined or empty for multiple upload
             */
            fileName: {
                type: String,
                notify: true,
                observer: '_updateFileName'
            },
            
            /**
             * Currently selected files
             */
            files: {
                type: Object,
                observer: '_updateTemplate'
            },

            /**
             * If set, the selected file data is uploaded to this Url
             */
            postUrl: {
                type: String
            },
            
            /**
             * Passes the required fields to the file upload method.
             * It is a key value pair passed as it is to the formdata.
             */
            uploadAttributes: {
                type: Object
            },
            
            /**
             * Gives the details of progress of the files being uploaded
             */
            uploadProgress: {
                type: Object,
                value: function() {
                    return {};
                }
            },

            /**
             * Private property to check if upload is availabel.
             */
            _enableUpload:{
                type:Boolean,
                value:false
            },

            _uploadResult: {
                type: Object
            }

            /**
             * Occurs on succesful upload of the files
             *
             * @event files-uploaded
             */

            /**
             * Occurs on succesful cancel or abort of the files
             *
             * @event files-upload-aborted
             */

        };
    }

    static get observers(){
        return ['__checkEnableUpload(postUrl,files)'];
    }

    /**
     * Prevent default drag event
     * @param {DragEvent} e 
     */
    dragEnterOver(e) {
        e.preventDefault();
    }
    
    /**
     * Calls process files on the dropped files.
     * @param {DropEvent} e 
     */
    drop(e) {
        e.preventDefault();
        this.processFiles(e.dataTransfer.files);
    }
    
    /**
     * Checks if the file type is a image
     * @param {FileType} type 
     */
    _isImage(type) {
        return type && type.startsWith('image');
    }

    /**
     * Checks if user can post the files.
     * @param {string} postUrl Url to post files
     * @param {FileList} files files from input
     */
    __checkEnableUpload(postUrl,files){
        this.set('_enableUpload',!!(postUrl&&files));
    }

    /**
     * Calls processFiles with the files from input element.
     * @param {Event} e change event from input
     */
    _fileSelected(e) {
        this.processFiles(e.target.files);
    }

    /**
     * Processes the files based on 'valueType' and sets 'value','fileName' and 'fileType'.
     * @param {FilesList} files files list to process
     */
    processFiles(files) {
        let fileName,fileType;
        this.set('files', files);
        if(this.files && this.files.length > 0){
            //files selected
            if(this.multiple){
                this.set('value', files);
            }else{
                //selects first file
                let file = this.files[0];
                fileName = file.name;
                fileType = file.type;
                
                let reader = new FileReader();
                reader.onloadend = function(evt) {
                    if (evt.target.readyState == FileReader.DONE) {
                        let result = evt.target.result;
                        this.set('value', result);
                    } else if (evt.target.readyState == FileReader.EMPTY) {
                        this.set('value', undefined);
                    }
                }.bind(this);

                switch(this.valueType){
                    case "file": this.set('value',file);
                        break;
                    case "binary":reader.readAsBinaryString(file);
                        break;
                    default:reader.readAsDataURL(file);
                }
            }
        }else{
            this.set('value', undefined);
        }
        this.set('fileName', fileName);
        this.set('fileType', fileType);
    }

    /**
     * Launches fileInput after resetting its value
     */
    _selectFile() {
        this.$.fileInput.value = null;
        this.$.fileInput.click();
    }

    /**
     * Converts fileList to array of files
     * @param {FileList} list fileList to be converted
     * @return {array} Array of files
     */
    listToArray(list) {
        if(list){
            return Array.from(list);
        }
    }

    /**
     * Uploads files to the 'postUrl' and fires 
     * 'files-uploaded' event on success
     */
    uploadFiles(e) { // eslint-disable-line no-unused-vars
        let self = this;
        if (this._enableUpload) {
            if (this.isbulkUpload) {
                let promises = [];
                for (let i = 0; i < this.files.length; i++) {
                    promises.push(this._sendFile(this.files[i], this.postUrl));
                }
                Promise.all(promises).then(function(results) {
                    self.fire('files-uploaded', results);
                });
            } else {
                let promise = this._sendFile(e.model.item, this.postUrl);
                promise.then(function(results) {
                    self.fire('files-uploaded', results);
                });
            }
        }
    }

    /**
     * Posts a file to the given Url using XHR and sets the result in '__uploadResult'
     * @param {File} file file to post
     * @param {string} url postUrl
     * @return {Promise} Promise of XHR request
     */
    _sendFile(file, url) {
        let attributes = this.uploadAttributes || {};
        let self = this;
        return new Promise(function(resolve, reject) { // eslint-disable-line no-unused-vars
            //Creates a formdata and appends the file before making an XHR call
            let xhr = new XMLHttpRequest();
            let fd = new FormData();
            let data = self.uploadProgress || {};
            let fileName = file.name;
            data[fileName] = {
                "xhr":xhr
            };
            
            //Listener for readyState change
            xhr.onreadystatechange = function() {
                var value;
                if (xhr.readyState == 4 && xhr.status == 200) {
                    value = {
                        "fileName": JSON.parse(xhr.responseText).result[0]
                    };
                    self.set("__uploadResult", value);
                    resolve(self.__uploadResult);
                } else if (xhr.readyState == 4 && xhr.status == 0) { 
                    //request abort
                    value = {
                        "fileName": "Aborted File Upload"
                    };
                    self.set("__uploadResult", value);
                    resolve(self.__uploadResult);
                }
            };

            //Listener for progress update
            xhr.upload.addEventListener("progress", function(evt) {
                let percent = (evt.loaded / evt.total) * 100;
                data[file.name]["percentageUploaded"] = percent;
                self.set('uploadProgress', data);
            }, false);

            Object.keys(attributes).forEach(function(attr) {
                fd.append(attr, attributes[attr]);
            });
            fd.append(fileName, file);
            xhr.open('POST', url, true);
            xhr.send(fd);
        });
    }
    
    /**
     * Aborts file upload of files that are still uploading and fires
     * 'files-upload-aborted' event.
     */
    abortFileUpload(e) {
        if (!this.isbulkUpload) {
            let fileName = e.model.item.name || this.fileName;
            let uploadProgress = this.uploadProgress[fileName];
            var xhr ;
            if (fileName && uploadProgress) {
                xhr = uploadProgress["xhr"];
                if (xhr && xhr.readyState != 4) {
                    xhr.abort();
                }
                self.fire('files-upload-aborted', e.model.item);
            }
        } else {
            for (let key in this.uploadProgress) {
                xhr = this.uploadProgress[key]["xhr"];
                if (xhr && xhr.readyState != 4) {
                    xhr.abort();
                }
            }
            this.fire('files-upload-aborted');
        }
    }

    /**
     * Constructor gets the light-dom element for templating
     */
    constructor() {
        super();
        if (!this.ctor && !this.multi) {
            this.childTemplate = this.queryEffectiveChildren('template[custom-upload]');
        }
    }

    /**
     * Connected callback to handle templating if custom template is present.
     * 
     */
    connectedCallback() {
        super.connectedCallback();
        this.set('hasCustomUpload',false);
        if(this.childTemplate){
            timeOut.run(function(){
                let instanceProps = {
                    files: true,
                    uploadProgress: true,
                    fileName: true,
                    value: true,
                    _enableUpload:true
                };
                let stampClass = this.__customTemplatize(null,this.childTemplate,{
                    instanceProps:instanceProps
                });
                this.instance = new stampClass({
                    files: this.files || null,
                    uploadProgress: this.uploadProgress,
                    fileName: this.fileName,
                    value: this.value,
                    _enableUpload:this._enableUpload || false
                });
                Object.keys(instanceProps).forEach(function(key){
                    if(instanceProps[key]){
                        this._createPropertyObserver(key,function(){
                            if(this.instance){
                                this.instance[key] = this[key];
                            }
                        }.bind(this));
                    }
                }.bind(this));
                this.shadowRoot.appendChild(this.instance.root);
                this.set('hasCustomUpload',true);
            }.bind(this), 300);
        }
    }


}

window.customElements.define(OeFileInput.is, OETemplatizeMixin(OEFieldMixin(OeFileInput)));