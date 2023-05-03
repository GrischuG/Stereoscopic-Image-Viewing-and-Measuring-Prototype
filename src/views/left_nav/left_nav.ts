
import { autoinject, observable } from 'aurelia-framework';



@autoinject

export class LeftNav{

  
  //injections needed for html
  constructor(

    ) {
      
  }


  instanceChanged(newValue, oldValue) { 
    console.log("run")
  }
}


  