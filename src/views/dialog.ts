import {DialogController} from 'aurelia-dialog';
import { autoinject } from 'aurelia-framework';
import Notiflix from 'notiflix';
 
@autoinject
export class Dialog {    
    title?: string;
    message?: string;
    action?: (args?: any) => {};
    cancelAction?: (args?: any) => {};
    parameters?: any;

 
    constructor(public dialogController : DialogController) {
        dialogController.settings.centerHorizontalOnly = true;
    }
 
    activate(model : any) {
        this.message = model.message;
        this.title = model.title;
        this.action = model.action;
        this.parameters = model.parameters;
     }
 
     ok() : void {
        this.action();
        this.dialogController.ok();
     }

     cancel() : void {
       this.cancelAction();
       this.dialogController.cancel();
     }
}
