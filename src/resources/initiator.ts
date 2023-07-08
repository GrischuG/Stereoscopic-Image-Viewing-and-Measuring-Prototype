import { singleton, autoinject } from 'aurelia-framework';
import * as THREE from 'three';
import { GlobalDefinition } from "./global_definitions";
import { VrInitiator } from './vr_initiator';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import { Animator } from './animator';
import {Text} from 'troika-three-text';



@singleton()
@autoinject()
export class Initiator {

  constructor(
    private globalObjectInstance: GlobalDefinition,
    private vrInitiator: VrInitiator,
    private animator: Animator
  ) {
    
  }

  // 
  /** 
   * Custom function that tries to query an element from the 'document' until it is available.
   * 
   * @param id 
   * @param object 
   * @param propertyToAssign 
   */
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
        console.log(`element ${id} not defined`);
      }
    }, 1000);
  }


  /**
   * globalObjectInstance is set to DomElementObjects from three_canvas.html.
   */
  async initDomObjectElements() {
    console.log('init DomElementObjects to globalObject')
    await this.setElementsById('container', this.globalObjectInstance, 'elementContainer')
  }


  /**
   * Initiates a suitable VR environment.
   */
  async vrEnvInit() {
    console.log('init scene');
    
    // This eventlistener prevents uneccessary errors in a browser while not in VR
    this.globalObjectInstance.renderer.xr.addEventListener('sessionstart', () => {
      this.globalObjectInstance.sessionStarted = true;
    });
    
    this.globalObjectInstance.elementContainer = document.getElementById('container');
    this.globalObjectInstance.elementContainer.appendChild(this.globalObjectInstance.renderer.domElement);
    this.globalObjectInstance.renderer.xr.enabled = true; // Added for VR support
    this.globalObjectInstance.renderer.setSize(this.globalObjectInstance.elementContainer.clientWidth, this.globalObjectInstance.elementContainer.clientHeight);
    this.globalObjectInstance.renderer.setAnimationLoop(await this.vrInitiator.render.bind(this.vrInitiator)); // We set the animation loop that is always called. We bind .this since a callback has a higher order function

    this.globalObjectInstance.scene.add(this.globalObjectInstance.boxesGroup);
    this.globalObjectInstance.scene.add(this.globalObjectInstance.linesGroup);

    // Add ambient light
    const aLight = new THREE.AmbientLight(0xffffff, 0.7);
    this.globalObjectInstance.scene.add(aLight);

    // Add directional light at camera position
    const dLight = new THREE.DirectionalLight(0xffffff, 1);
    this.globalObjectInstance.scene.add(dLight);

    this.initStereoImage()
  }


  /**
   * Initiates the stereoscopic imagery viewing capabilities. The combined left and right image imported is changed so that each part of the image (right & left, i.e., in the .jpg top & bottom) are used for their respective eye.
   */
  initStereoImage() {
    // --------------- IMPORTANT! --------------- //
    // Use 'Right Eye on Top' mode for stitching! //

    // Loads the textures
    const texture = new THREE.TextureLoader().load('../../testImages/Television.jpg');
    const texture2 = new THREE.TextureLoader().load('../../testImages/Television.jpg');

    // Takes only top half of the image, i.e., the right eye.
    texture.repeat = new THREE.Vector2(1, 0.5);

    // Flip texture2 to take lower half for left eye.
    texture2.flipY = true;
    texture2.repeat = new THREE.Vector2(1, 0.5);
    texture2.offset = new THREE.Vector2(0, 0.5);

    this.globalObjectInstance.camera.layers.enable(1); // render left view when no stereo available
    this.globalObjectInstance.scene.background = new THREE.Color(0x101010);

    // Left eye
    const geometry1 = new THREE.SphereGeometry(500, 60, 40);
    geometry1.scale(- 1, 1, 1); // invert the geometry on the x-axis so that all of the faces point inward
    const material1 = new THREE.MeshBasicMaterial({ map: texture });
    const mesh1 = new THREE.Mesh(geometry1, material1);
    mesh1.rotation.y = - Math.PI / 2;
    mesh1.layers.set(1); // display in left eye only
    this.globalObjectInstance.scene.add(mesh1);


    // Right eye
    const geometry2 = new THREE.SphereGeometry(500, 60, 40);
    geometry2.scale(- 1, 1, 1);
    const material2 = new THREE.MeshBasicMaterial({ map: texture2 });
    const mesh2 = new THREE.Mesh(geometry2, material2);
    mesh2.rotation.y = - Math.PI / 2;
    mesh2.layers.set(2); // display in right eye only
    this.globalObjectInstance.scene.add(mesh2);
  }


  /**
   * Performs initiations for the controls.
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
    this.setupControls();
  }


  /**
   * Creates the controllers to be used in VR and adds a line pointing away from controllers which will be used to better grab objects further away. Additionally, some event listeners are added to the controllers to be able to track controller input.
   */
  setupControls() {

    const controller1 = this.globalObjectInstance.controller1;
    const controller2 = this.globalObjectInstance.controller2;

    const controllerGrip1 = this.globalObjectInstance.controllerGrip1;
    const controllerGrip2 = this.globalObjectInstance.controllerGrip2;

    const hand1 = this.globalObjectInstance.hand1;
    const hand2 = this.globalObjectInstance.hand2;

    // Orbit controls
    this.globalObjectInstance.orbitControls.target = new THREE.Vector3(0, 0, 0);
    
    // Max and min Zoom for OrbitControls
    this.globalObjectInstance.orbitControls.minDistance = 0.2;
    this.globalObjectInstance.orbitControls.maxDistance = 20;
    this.globalObjectInstance.orbitControls.update();

    // controllers
    this.globalObjectInstance.scene.add(controller1)
    this.globalObjectInstance.scene.add(controller2)

    const controllerModelFactory = new XRControllerModelFactory();

    // Create virtual controller left (0)
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    this.globalObjectInstance.scene.add(controllerGrip1);

    // Create virtual controller right (1)
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    this.globalObjectInstance.scene.add(controllerGrip2);

    // Add event listeners to controllers to detect input
    controller1.addEventListener('selectstart', this.onSelectStart.bind(this));
    controller1.addEventListener('selectend', this.onSelectEnd.bind(this));

    controller2.addEventListener('selectstart', this.onSelectStart.bind(this));
    controller2.addEventListener('selectend', this.onSelectEnd.bind(this));

    const handModelFactory = new XRHandModelFactory();

    // hand 1
    hand1.add(handModelFactory.createHandModel(hand1, 'mesh'));
    this.globalObjectInstance.scene.add(hand1);

    // hand 2
    hand2.add(handModelFactory.createHandModel(hand2, 'mesh')); 
    this.globalObjectInstance.scene.add(hand2);

    // Create lines pointing away from controller in VR
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
   * Called when 'selectend' event occured on controller. If a box is attached to the controller, i.e., can be moved around by the user, it is released. 
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
   * Called when 'selectstart' event occured on controller. 
   *  - If a box intersects with the controller's line, the box is grabbed, i.e., attached to the controller. 
   *  - If no objects are present yet, two boxes are created.
   * 
   * @param event 
   */
  onSelectStart(event) {
    const controller = event.target;
    const intersections = this.animator.getIntersections(controller);

    if (intersections.length > 0) {
      this.takeBox(controller, intersections);
    } else {
      if (!this.globalObjectInstance.boxesCreated) {
        this.createNewBoxes(controller);
      }
    }
  }


  /**
   * The first object intersecting with a controller's line is attached to the controller, thus, movable by the user.
   * 
   * @param controller 
   * @param intersections 
   */
  takeBox(controller, intersections) {
    const intersection = intersections[0];
    const object = intersection.object;
    object.material.emissive.b = 1;
    controller.attach(object);
    
    controller.userData.selected = object;
  }


  /**
   * Creates two new boxes at both controllers' respective positions. Additionally, adds a line connecting the two boxes and a text displaying their distance.
   * 
   * @param controller 
   */
  createNewBoxes(controller) {
    const boxSize = this.globalObjectInstance.boxSize; 

    // Create two new boxes
    let geometryBox = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    let materialBox = new THREE.MeshStandardMaterial( {
      color: 0xff8800,
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

    // Set position and rotation of boxes to respective controller position and rotation
    box01.position.set(controller.position.x, controller.position.y, controller.position.z);
    box01.quaternion.copy(controller.quaternion);
    let otherController = controller.userData.other_Controller;
    box02.position.set(otherController.position.x, otherController.position.y, otherController.position.z);
    box02.quaternion.copy(otherController.quaternion);

    // Add axes to both boxes to better see their center point
    box01.add(new THREE.AxesHelper(0.03));
    box02.add(new THREE.AxesHelper(0.03));

    // Create a line between the boxes
    let lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setFromPoints([box01.position, box02.position]);
    let lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    });
    let line = new THREE.Line(lineGeometry, lineMaterial);

    // Save reference for line geometry to userData explicitly for use in updateLines()-method
    line.userData.lineGeometry = line.geometry;

    // Save reference for line to each box
    box01.userData.thisLine = line;
    box02.userData.thisLine = line;

    // Save reference for both boxes to line
    line.userData.box01 = box01;
    line.userData.box02 = box02;
    
    // calculate distance between boxes, create, and display text facing the camera
    let distance = box01.position.distanceTo(box02.position).toFixed(5);
    let text = `Distance: ${distance}`;
    let distText = new Text();
    box01.add(distText);
    distText.position.y = 0.1;
    distText.position.x = -0.17;
    distText.text = text;
    distText.fontSize = 0.05;
    distText.color = 0xff0000; 

    // Save reference for distance text to line
    line.userData.distanceText = distText;

    // Updates the text rendering configuration properties
    distText.sync();

    // Makes the text face the camera
    distText.lookAt(this.globalObjectInstance.camera.position);    

    // Add everything to the respective groups
    this.globalObjectInstance.linesGroup.add(line);
    this.globalObjectInstance.boxesGroup.add(box01);
    this.globalObjectInstance.boxesGroup.add(box02);

    this.globalObjectInstance.boxesCreated = true;
  }


  /**
   * Updates the line connecting the two boxes after one of their positions has changed.
   */
  updateLines() {
    const lines = this.globalObjectInstance.linesGroup.children;

    lines.forEach(line => {
      let box01 = line.userData.box01;
      let box02 = line.userData.box02;
      
      line.userData.lineGeometry.setFromPoints([box01.position, box02.position]);
      const distText = line.userData.distanceText;
      let distance = box01.position.distanceTo(box02.position).toFixed(5);
      let text = `Distance: ${distance}`;
      
      distText.text = text;
      distText.lookAt(this.globalObjectInstance.camera.position);
    });
  }


}

