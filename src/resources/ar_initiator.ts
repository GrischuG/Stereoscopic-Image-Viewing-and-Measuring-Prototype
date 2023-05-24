import { Animator } from './animator';
import { singleton, autoinject } from 'aurelia-framework';
import * as THREE from 'three';
import { GlobalDefinition } from './global_definitions';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';


@singleton()
@autoinject()
export class ArInitiator {

  worldOriginMesh: THREE.Mesh;
  jumpMesh: THREE.Mesh;

  constructor(
    private globalObjectInstance: GlobalDefinition,
    private animator: Animator,
  ) {
  }


  async render(timestamp, frame) {
    // animate the animator

    

    await this.animator.animate();
  }



  async ARInit() {
    //create AR button
    this.globalObjectInstance.arButton = VRButton.createButton(this.globalObjectInstance.renderer);
    document.body.appendChild(this.globalObjectInstance.arButton);
  }

  

}

