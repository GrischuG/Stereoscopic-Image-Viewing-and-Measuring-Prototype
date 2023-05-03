import { singleton, autoinject } from 'aurelia-framework';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GlobalDefinition } from "./global_definitions";
import { ArInitiator } from './ar_initiator';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import { on } from 'events';
import { Animator } from './animator';
import { createText } from 'three/examples/jsm/webxr/Text2D.js';


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


  async initDomObjectElements() {
    // event on pointermove call updateMousePosText
    console.log('init DomElementObjects to globalObject')
    await this.setElementsById('container', this.globalObjectInstance, 'elementContainer')
  }

  async controlsInit() {

    const renderer = this.globalObjectInstance.renderer;

    this.globalObjectInstance.controller1 = renderer.xr.getController(0); 
    this.globalObjectInstance.controller2 = renderer.xr.getController(1);
    
    this.globalObjectInstance.controllerGrip1 = renderer.xr.getControllerGrip(0); 
    this.globalObjectInstance.controllerGrip2 = renderer.xr.getControllerGrip(1);;
    
    this.globalObjectInstance.hand1 = renderer.xr.getHand(0);
    this.globalObjectInstance.hand2 = renderer.xr.getHand(1);

    console.log("Controls Init Finished!");

    
  }

  

  async setupControls() {

    //-------------------------------
    //set up controls
    //-------------------------------
    
    const controller1 = this.globalObjectInstance.controller1;
    const controller2 = this.globalObjectInstance.controller2;

    const controllerGrip1 = this.globalObjectInstance.controllerGrip1;
    const controllerGrip2 = this.globalObjectInstance.controllerGrip2;

    const hand1 = this.globalObjectInstance.hand1;
    const hand2 = this.globalObjectInstance.hand2;

    const tmpVector1 = new THREE.Vector3();
		const tmpVector2 = new THREE.Vector3();

    const handModels = {
      left: null,
      right: null
    };


    //orbit controls to move camera
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


    // hand 1

    // get controller left (0)
    controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
    this.globalObjectInstance.scene.add(controllerGrip1);


    // get controller right (1)
    controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
    this.globalObjectInstance.scene.add(controllerGrip2);

    // Add event listeners to controllers to detect input
    controller1.addEventListener('selectstart', this.onSelectStartLeft.bind(this));
    controller1.addEventListener('selectend', this.onSelectEnd.bind(this));

    //controller2.addEventListener('selectstart', this.onSelectStartLeft.bind(this));


    // get hand left (0)
    hand1.userData.currentHandModel = 0;
    this.globalObjectInstance.scene.add(hand1);
    
    let changeHandModels = false;
    // change hand models seen in VR by pinching fingers if changeHandModels variable is set to 'true'
    if (changeHandModels) {
      handModels.left = [
      handModelFactory.createHandModel(hand1, 'boxes'),
			handModelFactory.createHandModel(hand1, 'spheres'),
      handModelFactory.createHandModel(hand1, 'mesh'), 
			
      ];

      for (let i = 0; i < 3; i++) {
        const model = handModels.left[i];
        model.visible = i == 0;
        hand1.add(model);
      }

      hand1.addEventListener('selectstart', function() {
        handModels.left[this.userData.currentHandModel].visible = false;
        this.userData.currentHandModel = (this.userData.currentHandModel + 1) % 3;
        handModels.left[this.userData.currentHandModel].visible = true;
      } );

    } else {
      hand1.add(handModelFactory.createHandModel(hand1, 'mesh'));
    }


    // hand 2

    // get hand right (1)
    hand2.userData.currentHandModel = 1;
    this.globalObjectInstance.scene.add(hand2);
    
    // change hand models seen in VR by pinching fingers if changeHandModels variable is set to 'true'
    if (changeHandModels) {
      handModels.right = [
      handModelFactory.createHandModel(hand2, 'boxes'),
			handModelFactory.createHandModel(hand2, 'spheres'),
      handModelFactory.createHandModel(hand2, 'mesh')			
      ];

      for (let i = 0; i < 3; i++) {
        const model = handModels.right[i];
        model.visible = i == 0;
        hand2.add(model);
      }

      hand2.addEventListener('selectstart', function() {
        handModels.right[this.userData.currentHandModel].visible = false;
        this.userData.currentHandModel = (this.userData.currentHandModel + 1) % 3;
        handModels.right[this.userData.currentHandModel].visible = true;
      } );

    } else {
      hand2.add(handModelFactory.createHandModel(hand2, 'mesh')); 
    }


    // create lines pointing away from controller in VR
    const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, - 1)]);

    const line = new THREE.Line(geometry);
		line.name = 'line';
		line.scale.z = 2;

		controller1.add(line.clone());
		controller2.add(line.clone());

    hand1.add(line.clone());
    hand2.add(line.clone());


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

      //this.globalObjectInstance.scene.add(box0);
    }

    
      
		//
  
    console.log('Setup Controlls Finished');

  }


  async sceneInit() {

    console.log('init scene');

    this.globalObjectInstance.elementContainer = document.getElementById('container');
    this.globalObjectInstance.camera.aspect = this.globalObjectInstance.elementContainer.clientWidth / this.globalObjectInstance.elementContainer.clientHeight;
    this.globalObjectInstance.camera.updateProjectionMatrix();
    this.globalObjectInstance.renderer.setSize(this.globalObjectInstance.elementContainer.clientWidth, this.globalObjectInstance.elementContainer.clientHeight);
    // this.globalObjectInstance.renderer.shadowMap.enabled = true;
    this.globalObjectInstance.elementContainer.appendChild(this.globalObjectInstance.renderer.domElement);
    this.globalObjectInstance.scene.add(this.globalObjectInstance.boxesGroup);
    this.globalObjectInstance.scene.add(this.globalObjectInstance.linesGroup);
    this.globalObjectInstance.renderer.xr.enabled = true;


    //added for VR support
    // we set the animation loop that is always called.
    //we bind .this since a callback has a higher order function
    this.globalObjectInstance.renderer.setAnimationLoop(await this.arInitiator.render.bind(this.arInitiator))

    //add directional light at camera position
    const dLight = new THREE.DirectionalLight(0xffffff, 1);
    dLight.position.set(this.globalObjectInstance.camera.position.x, this.globalObjectInstance.camera.position.y + 0.1, this.globalObjectInstance.camera.position.z);
    // dLight.position.set(0, 6, 0);
    // dLight.castShadow  = true;
    // dLight.shadow.camera.top = 2;
    // dLight.shadow.camera.bottom = -2;
    // dLight.shadow.camera.right = 2;
    // dLight.shadow.camera.left = -2;
    // dLight.shadow.mapSize.set(4096, 4096);
    this.globalObjectInstance.scene.add(dLight);

    //add hemisphere light
    const hemiLight = new THREE.HemisphereLight('white', 'white', 0.7);
    hemiLight.position.set(0, 0, -10);
    this.globalObjectInstance.scene.add(hemiLight);

    this.initStereoImage()

  }


  initStereoImage() {

    this.globalObjectInstance.camera.layers.enable(1); // render left view when no stereo available


    const texture = new THREE.TextureLoader().load('../../testImages/PIC_20230315_Stereo_Right_Eye_on_Top.jpg');
    const texture2 = new THREE.TextureLoader().load('../../testImages/PIC_20230315_Stereo_Right_Eye_on_Top.jpg');


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


  onSelectEnd(event) {
    const controller = event.target;

    if (controller.userData.selected !== undefined) {
      const object = controller.userData.selected;
      object.material.emissive.b = 0;
      object.userData.other_Box.material.emissive.b = 0;
      this.globalObjectInstance.boxesGroup.attach(object);
      controller.userData.selected = undefined;
    }

  }


  onSelectStartLeft(event) {

    let controllerLeft = event.target;

    let intersections = this.animator.getIntersections(controllerLeft);

    if (intersections.length > 0) {
      this.setIntersection(controllerLeft, intersections);
    } else {
      this.createNewBoxes(controllerLeft);
    }
    
  }

  setIntersection(controller, intersections) {
    const intersection = intersections[0];
    const object = intersection.object;
    object.material.emissive.b = 1;
    //object.userData.other_Box.material.emissive.b = 1;
    controller.attach(object);

    controller.userData.selected = object;

  }

  createNewBoxes(controllerLeft) {
    const boxSize = this.globalObjectInstance.boxSize; 

    let geometry_Box = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    let material_Box = new THREE.MeshStandardMaterial( {
      color: Math.random() * 0xffffff,
      roughness: 1.0,
      metalness: 0.0,
      transparent: true,
      opacity: 0.5
    } );

    let boxLeft = new THREE.Mesh(geometry_Box, material_Box);
    let boxRight = new THREE.Mesh(geometry_Box, material_Box);

    boxLeft.userData.other_Box = boxRight;
    boxRight.userData.other_Box = boxLeft;

    let f = false;
    if (f) {
      const indexTip = controllerLeft.joints['index-finger-tip'];
      boxLeft.position.copy(indexTip.position);
      boxLeft.quaternion.copy(indexTip.quaternion);
    } else {
      boxLeft.position.set(controllerLeft.position.x, controllerLeft.position.y, controllerLeft.position.z);
      boxLeft.quaternion.copy(controllerLeft.quaternion);
    }

    if (f) {
      const indexTip = this.globalObjectInstance.hand2['index-finger-tip']; 
      //const indexTip = controller.joints['index-finger-tip'];
      boxRight.position.copy(indexTip.position);
      boxRight.quaternion.copy(indexTip.quaternion);
    } else {
      let controllerRight = this.globalObjectInstance.controller2;
      boxRight.position.set(controllerRight.position.x, controllerRight.position.y, controllerRight.position.z);
      boxRight.quaternion.copy(controllerRight.quaternion);
    }
    /*
    const points = [];
    points.push(boxLeft.position);
    points.push(boxRight.position)
    */
    let lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setFromPoints([boxLeft.position, boxRight.position]);
    let lineMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff
    });
    let line = new THREE.Line(lineGeometry, lineMaterial);

    line.userData.geometry = line.geometry;

    boxLeft.userData.thisLine = line;
    boxRight.userData.thisLine = line;

    line.userData.boxLeft = boxLeft;
    line.userData.boxRight = boxRight;

    let distance = boxLeft.position.distanceTo(boxRight.position).toFixed(5);
    let text = `Distance: ${distance}`;
    let distanceText = createText(text, 0.05);
    distanceText.position.set(boxLeft.position.x, boxLeft.position.y + boxSize*2, boxLeft.position.z);
    this.globalObjectInstance.scene.add(distanceText);
    

    line.userData.distanceText = distanceText;
    
    this.globalObjectInstance.linesGroup.add(line);
    //this.globalObjectInstance.scene.add(line);

    boxLeft.add(new THREE.AxesHelper(0.03));
    boxRight.add(new THREE.AxesHelper(0.03));

    this.globalObjectInstance.boxesGroup.add(boxLeft);
    this.globalObjectInstance.boxesGroup.add(boxRight);
    
    //this.globalObjectInstance.scene.add(boxLeft);
    //this.globalObjectInstance.scene.add(boxRight);
    
  }

}



