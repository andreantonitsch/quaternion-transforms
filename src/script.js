import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { DragControls } from 'three/examples/jsm/controls/DragControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import * as dat from 'lil-gui'

// Shaders
// Quaternion math snippets
import quat_snippet from './shaders/util/quaternion.glsl'
import dist_snippet from './shaders/util/distances.glsl'

/**
 * Base
 */
//#region
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

scene.background = new THREE.Color(0xB6C9E3)

/**
 * Loaders
 */
const textureLoader = new THREE.TextureLoader()
const gltfLoader = new GLTFLoader()

/**
 * Update all materials
 */
const updateAllMaterials = () =>
{
    scene.traverse((child) =>
    {
        if(child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial)
        {
            child.material.needsUpdate = true
            child.castShadow = true
            child.receiveShadow = true
        }
    })
}

//#endregion

/**
 * Material
 */


// Materia;
const customUniforms = {
    uTime: { value: 0 },
    uTwistAxis : {value : new THREE.Vector3(1.0, 0.0, 0.0)},
    uStretchAxis : {value : new THREE.Vector3(0.0, 1.0, 0.0)},
    uDisplacementAxis: {value : new THREE.Vector3(0.0, 0.0, 1.0)}, 
    uTwistIntensity : {value : 0.5 },
    uStretchIntensity : {value : 0.1 },
    uDisplacementIntensity : {value : 0.1 },
    uTimeScale : { value  : 1.0 / 10.0},
    uFrequency : { value : 2.0},
    uTwistMode : {value : 0.0},
    uInverseModelMatrix : { value : new THREE.Matrix4()}
}

function extend_shader_uniforms(shader){
    shader.uniforms = {...shader.uniforms, ...customUniforms}
}

gui.add(customUniforms.uTwistIntensity, 'value', -2.5, 2.5, 0.0001).name('Twist (Yellow Axis)')
gui.add(customUniforms.uStretchIntensity, 'value', -5, 5, 0.0001).name('Stretch (Fucsia Axis))')
gui.add(customUniforms.uDisplacementIntensity, 'value', 0, 5, 0.0001).name('Displacement (Cyan Axis)')
gui.add(customUniforms.uTimeScale, 'value', 0, 2, 0.0001).name('Time Scale')
gui.add(customUniforms.uTwistMode, 'value', {"outwards": 0.0, "inwards" : 1.0}).name('Twist Type')


const depthMaterial = new THREE.MeshDepthMaterial({
    depthPacking: THREE.RGBADepthPacking
})

const common_unifrom_snippet = quat_snippet + dist_snippet +
`
#include <common>
uniform float uTime; 
uniform float uTimeScale; 
uniform vec3 uTwistAxis;
uniform vec3 uStretchAxis;
uniform vec3 uDisplacementAxis;
uniform float uTwistIntensity;
uniform float uStretchIntensity;
uniform float uDisplacementIntensity;
uniform float uTwistMode;
uniform mat4 uInverseModelMatrix;
` 

const main_snippet = 
`
// Puts the world coordinates axis in the model space
vec3 twist_axis = (uInverseModelMatrix * vec4(uTwistAxis, 1.0)).xyz;
vec3 stretch_axis = (uInverseModelMatrix * vec4(uStretchAxis, 1.0)).xyz;
vec3 disp_axis = (uInverseModelMatrix * vec4(uDisplacementAxis, 1.0)).xyz;

float twist_distance =point_line_distance(position, twist_axis);
twist_distance = mix( twist_distance, 1.0 / twist_distance, uTwistMode);
vec4 rotation = quat_from_euler(twist_axis, twist_distance * uTwistIntensity);

float stretch_distance = point_line_distance(position, stretch_axis);
float displace_distance = length(cross(dot(uDisplacementAxis, position) * uDisplacementAxis, vec3(0.0, 1.0, 0.0)));
`

const vertex_snippet = 
`
// transformed = transformed + uStretchIntensity * sin(stretch_distance * uStretchIntensity) / (stretch_distance * uStretchIntensity) * stretch_axis;
transformed += (sin(displace_distance + uTime * uTimeScale) - 0.5) * uDisplacementIntensity * disp_axis;
transformed += - stretch_distance * uStretchIntensity * stretch_axis;
transformed = conjugation(transformed, rotation);
`


const set_material_shader = (shader) => {
    
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        common_unifrom_snippet
    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <beginnormal_vertex>',
        `#include <beginnormal_vertex>`
        + main_snippet + 
        `objectNormal = conjugation(objectNormal, rotation);`
    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>` + vertex_snippet
    )

    extend_shader_uniforms(shader)
}
 

const set_depth_shader = (shader) => { 
    shader.vertexShader = shader.vertexShader.replace(
        '#include <common>',
        common_unifrom_snippet
    )

    shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        ` +  main_snippet + vertex_snippet
    )

    extend_shader_uniforms(shader)
}



/**
 * Models
 */
//#region
let mesh;
gltfLoader.load(
    './models/Suzanne/Suzanne.gltf',
    (gltf) =>
    {
        // Model
        mesh = gltf.scene.children[0]
        mesh.rotation.y = 0.5 * Math.PI
        //mesh.material = material
        mesh.customDepthMaterial = depthMaterial
        scene.add(mesh)
        mesh.material.metalness = 0.0
        mesh.material.onBeforeCompile = set_material_shader
        mesh.customDepthMaterial.onBeforeCompile = set_depth_shader
        // The World -> Model matrix
        mesh.updateMatrixWorld()
        customUniforms.uInverseModelMatrix.value.copy(mesh.matrix).invert()
        
        // Update materials
        updateAllMaterials()
    }
)
//#endregion


/**
 * Lights
 */
//#region
const directionalLight = new THREE.DirectionalLight('#ffffff', 10)
directionalLight.castShadow = true
directionalLight.shadow.mapSize.set(1024, 1024)
directionalLight.shadow.camera.far = 15
directionalLight.shadow.normalBias = 0.05
directionalLight.position.set(0.25, 2, 2.25)
scene.add(directionalLight)

const ambient_light = new THREE.AmbientLight('#ffffff', 4)
scene.add(ambient_light)
//#endregion

/**
 * Window Sizes
 */
//#region
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})
//#endregion

/**
 * Camera
 */
//#region Camera  Setup and Control Block
// Base camera
const camera = new THREE.PerspectiveCamera(27, sizes.width / sizes.height, 0.1, 300)
camera.position.set(6, 3, 6)
camera.lookAt(0, 0, 0)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
//#endregion

/**
 * Controllers
 */ 
//#region Axis Controller functions Block
let drag_objects = []
const CONTROLLER_DISTANCE = 2.0

function set_axis(axis_obj){
    axis_obj.position.normalize().multiplyScalar(CONTROLLER_DISTANCE)
    axis_obj.userData.line_axis.geometry.attributes.position.setXYZ(0, axis_obj.position.x, axis_obj.position.y, axis_obj.position.z)
    axis_obj.userData.line_axis.geometry.attributes.position.setXYZ(1, -axis_obj.position.x, -axis_obj.position.y, -axis_obj.position.z)
    axis_obj.userData.line_axis.geometry.attributes.position.needsUpdate = true;
    axis_obj.userData.uniform.value.copy(axis_obj.position).multiplyScalar(1/CONTROLLER_DISTANCE)

}

function add_uniform_axis(axis_color, uniform)
{
    const axis_control = new THREE.Mesh( 
        new THREE.BoxGeometry( 0.15, 0.15, 0.15 ), 
        new THREE.MeshNormalMaterial())
    const initial_direction = new THREE.Vector3().copy(uniform.value).multiplyScalar(CONTROLLER_DISTANCE)
    axis_control.position.copy(initial_direction)
    scene.add( axis_control )

    const points = [initial_direction, initial_direction.clone().multiplyScalar(-1)] 
    const line_geom = new THREE.BufferGeometry().setFromPoints(points)
    const axis_line = new THREE.Line(
        line_geom,
    new THREE.LineBasicMaterial( { color: axis_color })
    ) 
    
    scene.add(axis_line)
    drag_objects.push(axis_control)
    scene.add(axis_control)

    axis_control.userData.line_axis= axis_line
    axis_control.userData.uniform = uniform
    return axis_control
}

//Attaches contro axis to shader axis uniforms
drag_objects.push(add_uniform_axis(new THREE.Color(0xFFFF00), customUniforms.uTwistAxis))
drag_objects.push(add_uniform_axis(new THREE.Color(0x00FFFF), customUniforms.uDisplacementAxis))
drag_objects.push(add_uniform_axis(new THREE.Color(0xFF00FF), customUniforms.uStretchAxis))

//Adds drag controls to the axis
let all_axis_controls = new DragControls(drag_objects, camera, canvas)
all_axis_controls.addEventListener( 'dragstart', () => { controls.enabled = false; } )
all_axis_controls.addEventListener( 'drag', (event) => 
{    
    set_axis(event.object)
} )
all_axis_controls.addEventListener( 'dragend',  (event) =>  { controls.enabled = true; } )
//#endregion


/**
 * Renderer
 */
//#region Renderer Block
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFShadowMap
renderer.physicallyCorrectLights = true
//renderer.outputEncoding = THREE.sRGBEncoding
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//#endregion


/**
 * Animate
 */
//#region
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    customUniforms.uTime.value = elapsedTime

    //console.log(axis_control.position)
    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
//#endregion