import { autoinject } from 'aurelia-framework';
import { VrInitiator } from 'resources/vr_initiator';
import { GlobalDefinition } from 'resources/global_definitions';
import { Initiator } from 'resources/initiator';



@autoinject()
export class ThreeCanvas {


  constructor(
    private initiator: Initiator,
    private vrInitator: VrInitiator,
    private globalObjectInstance: GlobalDefinition
  ) { }


  /**
   * This function comes from the Aurelia framework and attaches the code to the DOM.
   */
  async attached() {
    //set globalObjectInstance html elements
    await this.initiator.initDomObjectElements().then(
      async () => await this.initiator.vrEnvInit()
    ).then(
      async () => await this.initiator.controlsInit()
    ).then(
      async () => await this.initiator.setupControls()
    ).then(
      async () => this.vrInitator.VRInit()
    )

    window.addEventListener('resize', this.resize.bind(this));
  }


  /**
   * This function is called upon a window rezize event and rezizes the camera to display its content in the correct size. 
   */
  resize() {
    this.globalObjectInstance.camera.aspect = this.globalObjectInstance.elementContainer.clientWidth / this.globalObjectInstance.elementContainer.clientHeight;
    this.globalObjectInstance.camera.updateProjectionMatrix();
    this.globalObjectInstance.renderer.setSize(this.globalObjectInstance.elementContainer.clientWidth, this.globalObjectInstance.elementContainer.clientHeight);

    console.log("resized");
  }


}
