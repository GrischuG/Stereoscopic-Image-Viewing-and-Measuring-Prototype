import { autoinject, singleton } from 'aurelia-framework';
import { GlobalDefinition } from './global_definitions';
import * as THREE from 'three';



@singleton()
@autoinject()
export class Animator {

  private tempMatrix: THREE.Matrix4;

  constructor(
    private globalObjectInstance: GlobalDefinition
  ) {
    this.tempMatrix = new THREE.Matrix4();
  }


  /**
   * Animation loop: 
   *      clears global intersected variable,
   *      calls 'intersectObjects()'-method with both controllers, 
   *      and calls the render method to render the ThreeJS VR enviromnet
   */
  async animate() {
    this.clearIntersected();

    this.intersectObjects(this.globalObjectInstance.controller1);
    this.intersectObjects(this.globalObjectInstance.controller2);

    this.globalObjectInstance.renderer.render(this.globalObjectInstance.scene, this.globalObjectInstance.camera);
  }


  /**
   * If intersected objects are found, this function hights the first object in the array by setting the emissive variable 'r' to 1. 
   * Additionally, the length of the line coming from the controller is set to the distance to the intersected object and pushes the object to the global 'intersected' array.
   * 
   * @param controller 
   */
  intersectObjects(controller) {
    if (controller.userData.selected !== undefined) return;

    const line = controller.getObjectByName('line');
    const intersections = this.getIntersections(controller);

    if (intersections.length > 0) {
      const intersection = intersections[0];
      const object = intersection.object;
      object.material.emissive.r = 1;
      this.globalObjectInstance.intersected.push(object);

      line.scale.z = intersection.distance;
      
    } else {
      line.scale.z = 5;
    }
  }


  /**
   * Returns an array of intersections between the raycaster's ray and the boxes in boxesGroup.
   * 
   * @param controller 
   * @returns array of intersected boxes
   */
  getIntersections(controller) {
    let raycaster = this.globalObjectInstance.raycaster;

    // Gets rotation (direction) of controller position
    this.tempMatrix.identity().extractRotation(controller.matrixWorld);

    // Casts raycaster ray away from controller
    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
    return raycaster.intersectObjects(this.globalObjectInstance.boxesGroup.children, false);
  }


  /**
   * Clears the global intersected array and sets the contained object's emissive variable 'r' to 0.
   */
  clearIntersected() {
    let intersected = this.globalObjectInstance.intersected;

    while (intersected.length) {
      const object = intersected.pop();
      object.material.emissive.r = 0;
    }
  }


}
