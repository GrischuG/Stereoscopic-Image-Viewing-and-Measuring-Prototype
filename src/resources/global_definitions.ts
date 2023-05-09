import { singleton } from 'aurelia-framework';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';



@singleton()
export class GlobalDefinition {

  public elementContainer: HTMLElement;
  public scene: THREE.Scene;
  public camera:    THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public orbitControls: OrbitControls;
  public arButton: HTMLElement;
  public vrButton: HTMLElement;
  public controller1: THREE.Group; 
  public controller2: THREE.Group;
  public controllerGrip1: THREE.Group; 
  public controllerGrip2: THREE.Group;
  public hand1: THREE.Group;
  public hand2: THREE.Group;
  public boxSize: number;
  public boxesGroup: THREE.Group;
  public linesGroup: THREE.Group;
  public distTexts: THREE.Group;
  public intersected: any;
  public boxesCreated: Boolean;
  public raycaster: any;



  constructor() {
    //this.elementContainer = undefined;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.arButton = undefined; 
    this.vrButton = undefined;
    
    //this.controllers.controller1 = this.renderer.xr.getController(0);
    //this.controllers.controller2 = this.renderer.xr.getController(1);
    //this.controllerGrips.controllerGrip1 = this.renderer.xr.getControllerGrip(0);
    //this.controllerGrips.controllerGrip2 = this.renderer.xr.getControllerGrip(1);
    //this.hands.hand1 = this.renderer.xr.getHand(0);
    //this.hands.hand2 = this.renderer.xr.getHand(1)
    this.boxSize = 0.05;  
    this.boxesGroup = new THREE.Group();
    this.linesGroup = new THREE.Group();
    this.distTexts = new THREE.Group();
    this.intersected = new Array();
    this.boxesCreated = false;
    //this.scene.add(this.attached);
    this.raycaster = new THREE.Raycaster();
  }
}
