
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

  async animate() {


    this.clearIntersected();
    //console.log('After CLean Intersect');

    this.intersectObjects(this.globalObjectInstance.controller1);
    this.intersectObjects(this.globalObjectInstance.controller2);
    //console.log('After intersect Object with controllers');

    this.updateLines();
    
    this.globalObjectInstance.renderer.render(this.globalObjectInstance.scene, this.globalObjectInstance.camera);

  }

  
  updateLines() {
    let lines = this.globalObjectInstance.linesGroup.children;

    lines.forEach(line => {
      let boxLeft = line.userData.boxLeft;
      let boxRight = line.userData.boxRight;
      
      line.userData.geometry.setFromPoints([boxLeft.position, boxRight.position]);
      
      /*
      let distance = boxLeft.position.distanceTo(boxRight.position).toFixed(5);
      let text = `Distance: ${distance}`;
      let distanceText = createText(text, 0.05);
      distanceText.position.set(boxLeft.position.x, boxLeft.position.y + boxSize*2, boxLeft.position.z);
      
      line.userData.distanceText = distanceText; 
      */
    });
  }

  getIntersections(controller) {

    let raycaster = this.globalObjectInstance.raycaster;

    this.tempMatrix.identity().extractRotation(controller.matrixWorld);

    raycaster.ray.origin.setFromMatrixPosition(controller.matrixWorld);
    raycaster.ray.direction.set(0, 0, -1).applyMatrix4(this.tempMatrix);
    return raycaster.intersectObjects(this.globalObjectInstance.boxesGroup.children, false);

  }

  intersectObjects(controller) {
    if (controller.userData.selected !== undefined) return;

    const line = controller.getObjectByName('line');
    const intersections = this.getIntersections(controller);

    if (intersections.length > 0) {
      const intersection = intersections[0];
      const object = intersection.object;
      object.material.emissive.r = 1;
      //object.userData.other_Box.material.emissive.r = 1;
      this.globalObjectInstance.intersected.push(object);

      line.scale.z = intersection.distance;

    } else {
      line.scale.z = 5;
    }
  }


  clearIntersected() {

    let intersected = this.globalObjectInstance.intersected;

    while (intersected.length) {
      const object = intersected.pop();
      object.material.emissive.r = 0;
      //object.userData.other_Box.material.emissive.r = 0;
    }
  }

}
