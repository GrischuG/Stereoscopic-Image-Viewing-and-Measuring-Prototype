import { Animator } from './animator';
import { singleton, autoinject } from 'aurelia-framework';
import * as THREE from 'three';
import { GlobalDefinition } from './global_definitions';
import { VRButton } from 'three/examples/jsm/webxr/VRButton';
//import { XRPose, XRReferenceSpace } from 'three'; Not working in version 0.150.0, working in version 0.135.0. I don't know why, but it is nt impoortant for now
//import { ThreeCanvas } from 'views/three_canvas/three_canvas';


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

