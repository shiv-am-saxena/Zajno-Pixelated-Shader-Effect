import LocomotiveScroll from "locomotive-scroll";
import * as THREE from "three";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import gsap  from "gsap";
const locomotiveScroll = new LocomotiveScroll();


const far = 1000;
const fov = 2 * Math.atan(window.innerHeight / (2 * 5)) * (180 / Math.PI); // 5 is camera.position.z
// Create scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
    fov,
    window.innerWidth / window.innerHeight,
    0.1,
    far
);
camera.position.z = 5;

// Create renderer
const canvas = document.querySelector('#canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const images = document.querySelectorAll('img');
const planes = [];
images.forEach((img) => {
    const rect = img.getBoundingClientRect();
    const geometry = new THREE.PlaneGeometry(rect.width, rect.height);
    const texture = new THREE.TextureLoader().load(img.src);
    const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
            uTexture: { value: texture },
            uTime: { value: 0.0 },
            uMouse: { value: new THREE.Vector2(0., 0.)},
            uHover : { value: 0.0 }
        }
    });
    const mesh = new THREE.Mesh(geometry, material);
    planes.push(mesh);
    mesh.position.x = rect.left - window.innerWidth / 2 + rect.width / 2;
    mesh.position.y = -(rect.top - window.innerHeight / 2 + rect.height / 2);
    scene.add(mesh);
});


// Update plane positions on scroll
const updatePlanePositions = () => {
    planes.forEach((mesh, index) => {
        const img = images[index];
        const newRect = img.getBoundingClientRect();
        mesh.position.x = newRect.left - window.innerWidth / 2 + newRect.width / 2;
        mesh.position.y = -(newRect.top - window.innerHeight / 2 + newRect.height / 2);
    });
};
const raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

window.addEventListener("mousemove", (event) => {
    mouse.x = (event.clientX / window.innerWidth);
    mouse.y = -((event.clientY / window.innerHeight) *2 -1);
console.log(mouse.x, mouse.y)
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(planes);

    planes.forEach((mesh) => {
        const isHovered = intersects.find(i => i.object === mesh);
        if (isHovered) {
            gsap.to(mesh.material.uniforms.uMouse.value, {
                x: mouse.x,
                y: mouse.y,
                duration: 0.3,
                overwrite: true
            });
            gsap.to(mesh.material.uniforms.uHover, {
                value: 1.0,
                duration: 0.3,
                overwrite: true
            });
        } else {
            gsap.to(mesh.material.uniforms.uMouse.value, {
                x: 0.0,
                y: 0.0,
                duration: 0.3,
                overwrite: true
            });
            gsap.to(mesh.material.uniforms.uHover, {
                value: 0.0,
                duration: 0.3,
                overwrite: true
            });
        }
    });
});

// Reset uHover when mouse leaves the window
window.addEventListener("mouseout", () => {
    planes.forEach((mesh) => {
        gsap.to(mesh.material.uniforms.uHover, {
            value: 0.0,
            duration: 0.3,
            overwrite: true
        });
    });
});


// Handle window resize and device pixel ratio
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    updatePlanePositions();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Set initial device pixel ratio
renderer.setPixelRatio(window.devicePixelRatio);
// Animation loop
function animate() {
    requestAnimationFrame(animate);
    updatePlanePositions();
    renderer.render(scene, camera);
}
animate();