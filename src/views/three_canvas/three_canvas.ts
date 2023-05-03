import { autoinject } from 'aurelia-framework';
import { ArInitiator } from 'resources/ar_initiator';
import { GlobalDefinition } from 'resources/global_definitions';
import { Initiator } from 'resources/initiator';





@autoinject()
export class ThreeCanvas {


  constructor(
    private initiator: Initiator,
    private ARInitator: ArInitiator,
    private globalObjectInstance: GlobalDefinition
  ) { }


  async attached() {
    //set globalObjectInstance html elements
    await this.initiator.initDomObjectElements().then(
      async () => await this.initiator.sceneInit()
    ).then(
      async () => await this.initiator.controlsInit()
    ).then(
      async () => await this.initiator.setupControls()
    ).then(
      async () => this.ARInitator.ARInit()
    )

    window.addEventListener('resize', this.resize.bind(this));
    
  }

  resize() {
    this.globalObjectInstance.camera.aspect = this.globalObjectInstance.elementContainer.clientWidth / this.globalObjectInstance.elementContainer.clientHeight;
    this.globalObjectInstance.camera.updateProjectionMatrix();
    this.globalObjectInstance.renderer.setSize(this.globalObjectInstance.elementContainer.clientWidth, this.globalObjectInstance.elementContainer.clientHeight);

    console.log("resized");
  }





}


