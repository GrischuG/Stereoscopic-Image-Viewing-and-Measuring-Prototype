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
  //public baseReferenceSpace: any;
  public sessionStarted: boolean;



  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.orbitControls = new OrbitControls(this.camera, this.renderer.domElement);
    this.arButton = undefined; 
    this.vrButton = undefined;
    this.boxSize = 0.05;  
    this.boxesGroup = new THREE.Group();
    this.linesGroup = new THREE.Group();
    this.distTexts = new THREE.Group();
    this.intersected = new Array();
    this.boxesCreated = false;
    this.raycaster = new THREE.Raycaster();
    this.sessionStarted = false;

  }

}
