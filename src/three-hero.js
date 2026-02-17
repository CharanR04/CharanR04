/**
 * Three.js Hero — Mathematical Mesh / Polynomial Cloud
 * A network of nodes that reacts subtly to mouse movement.
 */
import * as THREE from 'three';

export function initHeroScene(canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setClearColor(0x000000, 0);

    // --- Create node particles ---
    const nodeCount = 180;
    const spread = 40;
    const positions = [];
    const velocities = [];

    for (let i = 0; i < nodeCount; i++) {
        positions.push(
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * 15
        );
        velocities.push(
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.005,
            (Math.random() - 0.5) * 0.002
        );
    }

    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const nodeMaterial = new THREE.PointsMaterial({
        color: 0xaaaaaa,
        size: 2.5,
        transparent: true,
        opacity: 0.35,
        sizeAttenuation: true,
    });

    const nodes = new THREE.Points(nodeGeometry, nodeMaterial);
    scene.add(nodes);

    // --- Create connection lines ---
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0xbbbbbb,
        transparent: true,
        opacity: 0.08,
    });

    const lineSegments = [];
    const maxDistance = 8;

    function updateLines() {
        // Remove old lines
        lineSegments.forEach(l => scene.remove(l));
        lineSegments.length = 0;

        const posArr = nodeGeometry.attributes.position.array;
        const linePositions = [];

        for (let i = 0; i < nodeCount; i++) {
            for (let j = i + 1; j < nodeCount; j++) {
                const dx = posArr[i * 3] - posArr[j * 3];
                const dy = posArr[i * 3 + 1] - posArr[j * 3 + 1];
                const dz = posArr[i * 3 + 2] - posArr[j * 3 + 2];
                const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (dist < maxDistance) {
                    linePositions.push(
                        posArr[i * 3], posArr[i * 3 + 1], posArr[i * 3 + 2],
                        posArr[j * 3], posArr[j * 3 + 1], posArr[j * 3 + 2]
                    );
                }
            }
        }

        if (linePositions.length > 0) {
            const lineGeo = new THREE.BufferGeometry();
            lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            const lines = new THREE.LineSegments(lineGeo, lineMaterial);
            scene.add(lines);
            lineSegments.push(lines);
        }
    }

    updateLines();

    // --- Mouse interaction ---
    const mouse = { x: 0, y: 0 };
    const targetRotation = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
        targetRotation.x = mouse.y * 0.15;
        targetRotation.y = mouse.x * 0.15;
    });

    // --- Animation loop ---
    let lineUpdateTimer = 0;

    function animate() {
        requestAnimationFrame(animate);

        // Subtle auto-rotation
        nodes.rotation.y += 0.0008;
        nodes.rotation.x += 0.0003;

        // Mouse-driven rotation (lerped)
        nodes.rotation.x += (targetRotation.x - nodes.rotation.x) * 0.02;
        nodes.rotation.y += (targetRotation.y - nodes.rotation.y) * 0.02;

        // Drift particles
        const posArr = nodeGeometry.attributes.position.array;
        for (let i = 0; i < nodeCount; i++) {
            posArr[i * 3] += velocities[i * 3];
            posArr[i * 3 + 1] += velocities[i * 3 + 1];
            posArr[i * 3 + 2] += velocities[i * 3 + 2];

            // Boundary bounce
            for (let axis = 0; axis < 3; axis++) {
                const limit = axis === 2 ? 7.5 : spread / 2;
                if (Math.abs(posArr[i * 3 + axis]) > limit) {
                    velocities[i * 3 + axis] *= -1;
                }
            }
        }
        nodeGeometry.attributes.position.needsUpdate = true;

        // Update lines periodically
        lineUpdateTimer++;
        if (lineUpdateTimer % 30 === 0) {
            updateLines();
        }

        // Apply node rotation to lines too
        lineSegments.forEach(l => {
            l.rotation.copy(nodes.rotation);
        });

        renderer.render(scene, camera);
    }

    animate();

    // --- Resize handler ---
    function onResize() {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    }

    window.addEventListener('resize', onResize);

    return {
        scene, camera, renderer, destroy: () => {
            window.removeEventListener('resize', onResize);
            renderer.dispose();
        }
    };
}
