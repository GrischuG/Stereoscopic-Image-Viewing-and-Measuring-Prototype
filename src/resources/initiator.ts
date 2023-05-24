import { singleton, autoinject } from 'aurelia-framework';
import * as THREE from 'three';
import { GlobalDefinition } from "./global_definitions";
import { ArInitiator } from './ar_initiator';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import { Animator } from './animator';
import {Text} from 'troika-three-text';


@singleton()
@autoinject()
export class Initiator {

  constructor(
    private globalObjectInstance: GlobalDefinition,
    private arInitiator: ArInitiator,
    private animator: Animator
  ) {
  }

  // custom function that tries to query an element until it is available
  async setElementsById(id, object, propertyToAssign) {
    // set an interval to check for the element
    const intervalId = setInterval(() => {
      const element = document.querySelector(`#${id}`);

      // if element is found, assign it to the object and clear the interval
      if (element) {
        object[propertyToAssign] = element;
        clearInterval(intervalId);
      }
      // if element is not found, log a message
      else {
        console.log(`element ${id} undefined`);
      }
    }, 1000);
  }

  /**
   * 
   */
  async initDomObjectElements() {
    // event on pointermove call updateMousePosText
    console.log('init DomElementObjects to globalObject')
    await this.setElementsById('container', this.globalObjectInstance, 'elementContainer')
  }

  /**
   * 
   */
  async controlsInit() {

    const renderer = this.globalObjectInstance.renderer;

    this.globalObjectInstance.controller1 = renderer.xr.getController(0); 
    this.globalObjectInstance.controller2 = renderer.xr.getController(1);
    this.globalObjectInstance.controller1.userData.other_Controller = this.globalObjectInstance.controller2;
    this.globalObjectInstance.controller2.userData.other_Controller = this.globalObjectInstance.controller1;

    this.globalObjectInstance.controllerGrip1 = renderer.xr.getControllerGrip(0); 
    this.globalObjectInstance.controllerGrip2 = renderer.xr.getControllerGrip(1);;
    
    this.globalObjectInstance.hand1 = renderer.xr.getHand(0);
    this.globalObjectInstance.hand2 = renderer.xr.getHand(1);

    console.log("Controls Init Finished!");

    
  }

  /**
   * 
   */
  async setupControls() {

    const controller1 = this.globalObjectInstance.controller1;
    const controller2 = this.globalObjectInstance.controller2;

    const controllerGrip1 = this.globalObjectInstance.controllerGrip1;
    const controllerGrip2 = this.globalObjectInstance.controllerGrip2;

    const hand1 = this.globalObjectInstance.hand1;
    const hand2 = this.globalObjectInstance.hand2;

    //orbit controls
    this.globalObjectInstance.orbitControls.target = new THREE.Vector3(0, 0, 0);
    

    // max and min Zoom for OrbitControls
    this.globalObjectInstance.orbitControls.minDistance = 0.2;
    this.globalObjectInstance.orbitControls.maxDistance = 20;

    this.globalObjectInstance.orbitControls.update();


    // controllers
    this.globalObjectInstance.scene.add(controller1)
    this.globalObjectInstance.scene.add(controller2)

    const controllerModelFactory = new XRControllerModelFactory();
		const handModelFactory = new XRHandModelFactory();


    // get controller left (0)
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    this.globalObjectInstance.scene.add(controllerGrip1);


    // get controller right (1)
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    this.globalObjectInstance.scene.add(controllerGrip2);

    // Add event listeners to controllers to detect input
    controller1.addEventListener('selectstart', this.onSelectStart.bind(this));
    controller1.addEventListener('selectend', this.onSelectEnd.bind(this));

    controller2.addEventListener('selectstart', this.onSelectStart.bind(this));
    controller2.addEventListener('selectend', this.onSelectEnd.bind(this));


    // hand 1
    hand1.add(handModelFactory.createHandModel(hand1, 'mesh'));
    this.globalObjectInstance.scene.add(hand1);

    // hand 2
    hand2.add(handModelFactory.createHandModel(hand2, 'mesh')); 
    this.globalObjectInstance.scene.add(hand2);


    // create lines pointing away from controller in VR
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

    const line = new THREE.Line(geometry);
		line.name = 'line';
		line.scale.z = 2;

		controller1.add(line.clone());
		controller2.add(line.clone());

    hand1.add(line.clone());
    hand2.add(line.clone());

    console.log('Setup Controlls Finished');

  }


  /**
   * 
   */
  async sceneInit() {

    console.log('init scene');
    
    this.globalObjectInstance.renderer.xr.addEventListener('sessionstart', () => {
      this.globalObjectInstance.sessionStarted = true;
    });
    
    this.globalObjectInstance.elementContainer = document.getElementById('container');
    //this.globalObjectInstance.camera.aspect = this.globalObjectInstance.elementContainer.clientWidth / this.globalObjectInstance.elementContainer.clientHeight;
    //this.globalObjectInstance.camera.updateProjectionMatrix();
    this.globalObjectInstance.renderer.xr.enabled = true;
    this.globalObjectInstance.renderer.setSize(this.globalObjectInstance.elementContainer.clientWidth, this.globalObjectInstance.elementContainer.clientHeight);
    this.globalObjectInstance.elementContainer.appendChild(this.globalObjectInstance.renderer.domElement);

    this.globalObjectInstance.scene.add(this.globalObjectInstance.boxesGroup);
    this.globalObjectInstance.scene.add(this.globalObjectInstance.linesGroup);
    
    
    //added for VR support
    // we set the animation loop that is always called.
    //we bind .this since a callback has a higher order function
    this.globalObjectInstance.renderer.setAnimationLoop(await this.arInitiator.render.bind(this.arInitiator))

    //add directional light at camera position
    const dLight = new THREE.DirectionalLight(0xffffff, 1);
    this.globalObjectInstance.scene.add(dLight);

    //add hemisphere light
    const hemiLight = new THREE.HemisphereLight('white', 'white', 0.7);
    hemiLight.position.set(0, 0, -10);
    this.globalObjectInstance.scene.add(hemiLight);

    this.initStereoImage()

  }


/**
 * 
 */
  initStereoImage() {

    this.globalObjectInstance.camera.layers.enable(1); // render left view when no stereo available

    // --------------- IMPORTANT! --------------- //
    // Use 'Right Eye on Top' mode for stitching! //
    const texture = new THREE.TextureLoader().load('../../testImages/Distance_181_02.jpg');
    const texture2 = new THREE.TextureLoader().load('../../testImages/Distance_181_02.jpg');


    texture.repeat = new THREE.Vector2(1, 0.5);

    //flip texture on x axis
    texture2.flipY = true;
    texture2.repeat = new THREE.Vector2(1, 0.5);
    texture2.offset = new THREE.Vector2(0, 0.5);


    //take only lower half of the video
    this.globalObjectInstance.scene.background = new THREE.Color(0x101010);

    
    // left

    const geometry1 = new THREE.SphereGeometry(500, 60, 40);
    // invert the geometry on the x-axis so that all of the faces point inward
    geometry1.scale(- 1, 1, 1);

    const material1 = new THREE.MeshBasicMaterial({ map: texture });

    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.rotation.y = - Math.PI / 2;
    mesh1.layers.set(1); // display in left eye only
    this.globalObjectInstance.scene.add(mesh1);


    // right

    const geometry2 = new THREE.SphereGeometry(500, 60, 40);
    geometry2.scale(- 1, 1, 1);

    const material2 = new THREE.MeshBasicMaterial({ map: texture2 });

    const mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.rotation.y = - Math.PI / 2;
    mesh2.layers.set(2); // display in right eye only
    this.globalObjectInstance.scene.add(mesh2);

  }


  /**
   * 
   * @param event 
   */
  onSelectEnd(event) {
    const controller = event.target;

    if (controller.userData.selected !== undefined) {
      const object = controller.userData.selected;
      object.material.emissive.b = 0;
      this.globalObjectInstance.boxesGroup.attach(object);
      controller.userData.selected = undefined;
      this.updateLines();
    }

  }

  /**
   * 
   * @param event 
   */
  onSelectStart(event) {

    let controller = event.target;

    let intersections = this.animator.getIntersections(controller);

    if (intersections.length > 0) {
      this.setIntersection(controller, intersections);
    } else {
      if (!this.globalObjectInstance.boxesCreated) {
        this.createNewBoxes(controller);
      }
    }
    
  }

  /**
   * 
   * @param controller 
   * @param intersections 
   */
  setIntersection(controller, intersections) {
    const intersection = intersections[0];
    const object = intersection.object;
    object.material.emissive.b = 1;
    controller.attach(object);
    
    controller.userData.selected = object;

  }

  /**
   * 
   * @param controller 
   */
  createNewBoxes(controller) {
    const boxSize = this.globalObjectInstance.boxSize; 

    // Create two new boxes (random color)
    let geometryBox = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    let materialBox = new THREE.MeshStandardMaterial( {
      color: Math.random() * 0xffffff,
      roughness: 1.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.3
    } );
    let box01 = new THREE.Mesh(geometryBox, materialBox);
    let box02 = new THREE.Mesh(geometryBox, materialBox);

    // Save reference to each other in 'userData'
    box01.userData.other_Box = box02;
    box02.userData.other_Box = box01;

    // Set position an rotation of boxes to respective controller position and rotation
    box01.position.set(controller.position.x, controller.position.y, controller.position.z);
    box01.quaternion.copy(controller.quaternion);
    let otherController = controller.userData.other_Controller;
    box02.position.set(otherController.position.x, otherController.position.y, otherController.position.z);
    box02.quaternion.copy(otherController.quaternion);

    // Add axes to both boxes to better see their center point
    box01.add(new THREE.AxesHelper(0.03));
    box02.add(new THREE.AxesHelper(0.03));

    // Create a line
    let lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setFromPoints([box01.position, box02.position]);
    let lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    });
    let line = new THREE.Line(lineGeometry, lineMaterial);

    // Save reference for line geometry to userData explicitly for use in updateLines()-method
    line.userData.geometry = line.geometry;

    // Save reference for line to each box
    box01.userData.thisLine = line;
    box02.userData.thisLine = line;

    // Save reference for both boxes to line
    line.userData.box01 = box01;
    line.userData.box02 = box02;
    

    // calculate distance between boxes, create, and display text facing the camera
    let distance = box01.position.distanceTo(box02.position).toFixed(5);
    let text = `Distance: ${distance}`;

    const distText = new Text();

    box01.add(distText);

    distText.position.y = 0.1;
    distText.position.x = -0.17;

    distText.text = text;
    distText.fontSize = 0.05;
    distText.color = 0xff0000; 


    // Save reference to distance text to line
    line.userData.distanceText = distText;

    distText.sync();

    distText.lookAt(this.globalObjectInstance.camera.position);    

    // Add everything to the respective groups
    this.globalObjectInstance.linesGroup.add(line);
    this.globalObjectInstance.boxesGroup.add(box01);
    this.globalObjectInstance.boxesGroup.add(box02);

    this.globalObjectInstance.boxesCreated = true;
    
  }


  /**
   * 
   */
  updateLines() {
    
    let lines = this.globalObjectInstance.linesGroup.children;

    lines.forEach(line => {
      
      let box01 = line.userData.box01;
      let box02 = line.userData.box02;
      
      line.userData.geometry.setFromPoints([box01.position, box02.position]);
      
      const distText = line.userData.distanceText;

      let distance = box01.position.distanceTo(box02.position).toFixed(5);
      let text = `Distance: ${distance}`;
      
      distText.text = text;
      distText.lookAt(this.globalObjectInstance.camera.position);

    });
  
  }

}

/*
const enableSampleBox = false;

    if (enableSampleBox) {
      const geometry_Box0 = new THREE.BoxGeometry(0.2, 0.2, 0.2);
      const material_Box0 = new THREE.MeshStandardMaterial( {
        color: 0xffff00,
        roughness: 1.0,
        metalness: 0.0,
        transparent: true,
        opacity: 0.5
      } );
      const box0 = new THREE.Mesh(geometry_Box0, material_Box0);

      box0.position.set(0, 1, -1);

      const axesHelper = new THREE.AxesHelper(0.3);
      box0.add(axesHelper);

      this.globalObjectInstance.boxesGroup.add(box0);
    }
    */

    
  

