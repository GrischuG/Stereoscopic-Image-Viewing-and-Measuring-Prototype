import { Animator } from './animator';
import { singleton, autoinject } from 'aurelia-framework';
import * as THREE from 'three';
import { GlobalDefinition } from './global_definitions';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';


@singleton()
@autoinject()
export class VrInitiator {

  constructor(
    private globalObjectInstance: GlobalDefinition,
    private animator: Animator,
  ) {
    
  }


  /**
   * Calls the animate()-function from the Animator.
   */
  async render() {
    await this.animator.animate();
  }


  /**
   * Creates the 'Enter VR' Button for entering the VR environment on a website.
   */
  async VRInit() {
    this.globalObjectInstance.vrButton = VRButton.createButton(this.globalObjectInstance.renderer);
    document.body.appendChild(this.globalObjectInstance.vrButton);
  }

  
}
