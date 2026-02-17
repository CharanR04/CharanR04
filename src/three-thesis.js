/**
 * Three.js Thesis Visualization — White Box PNN Neural Network
 * Shows layered polynomial nodes with animated data-flow lines.
 */
import * as THREE from 'three';

export function initThesisScene(canvas) {
    const scene = new THREE.Scene();
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    // --- Create layered neural network structure ---
    const layers = [3, 5, 6, 5, 3, 2]; // Node counts per layer
    const layerSpacing = 4.5;
    const nodeRadius = 0.3;
    const nodeMeshes = [];
    const nodePositions = [];

    const nodeMaterial = new THREE.MeshBasicMaterial({
        color: 0x888888,
        transparent: true,
        opacity: 0.5,
    });

    const activeNodeMaterial = new THREE.MeshBasicMaterial({
        color: 0x555555,
        transparent: true,
        opacity: 0.8,
    });

    const nodeGeometry = new THREE.SphereGeometry(nodeRadius, 16, 16);
    const totalWidth = (layers.length - 1) * layerSpacing;

    layers.forEach((count, layerIdx) => {
        const layerNodes = [];
        const layerPositions = [];
        const x = -totalWidth / 2 + layerIdx * layerSpacing;
        const totalHeight = (count - 1) * 2;

        for (let i = 0; i < count; i++) {
            const y = -totalHeight / 2 + i * 2;
            const mesh = new THREE.Mesh(nodeGeometry, nodeMaterial.clone());
            mesh.position.set(x, y, 0);
            scene.add(mesh);
            layerNodes.push(mesh);
            layerPositions.push(new THREE.Vector3(x, y, 0));
        }

        nodeMeshes.push(layerNodes);
        nodePositions.push(layerPositions);
    });

    // --- Create connections between layers ---
    const connectionMaterial = new THREE.LineBasicMaterial({
        color: 0xbbbbbb,
        transparent: true,
        opacity: 0.1,
    });

    const connections = [];

    for (let l = 0; l < layers.length - 1; l++) {
        for (let i = 0; i < nodePositions[l].length; i++) {
            for (let j = 0; j < nodePositions[l + 1].length; j++) {
                const geo = new THREE.BufferGeometry().setFromPoints([
                    nodePositions[l][i],
                    nodePositions[l + 1][j],
                ]);
                const line = new THREE.Line(geo, connectionMaterial.clone());
                scene.add(line);
                connections.push({
                    line,
                    from: { layer: l, node: i },
                    to: { layer: l + 1, node: j },
                });
            }
        }
    }

    // --- Data flow particles ---
    const particleCount = 30;
    const particles = [];
    const particleMaterial = new THREE.MeshBasicMaterial({
        color: 0x666666,
        transparent: true,
        opacity: 0.7,
    });
    const particleGeometry = new THREE.SphereGeometry(0.1, 8, 8);

    for (let i = 0; i < particleCount; i++) {
        const mesh = new THREE.Mesh(particleGeometry, particleMaterial.clone());
        const startLayer = Math.floor(Math.random() * (layers.length - 1));
        const startNode = Math.floor(Math.random() * layers[startLayer]);
        const endNode = Math.floor(Math.random() * layers[startLayer + 1]);

        particles.push({
            mesh,
            from: nodePositions[startLayer][startNode],
            to: nodePositions[startLayer + 1][endNode],
            progress: Math.random(),
            speed: 0.003 + Math.random() * 0.006,
            startLayer,
        });

        scene.add(mesh);
    }

    // --- Mouse interaction ---
    const mouseTarget = { x: 0, y: 0 };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouseTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseTarget.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    });

    // --- Animate ---
    let time = 0;

    function animate() {
        requestAnimationFrame(animate);
        time += 0.01;

        // Subtle rotation based on mouse
        scene.rotation.y += (mouseTarget.x * 0.3 - scene.rotation.y) * 0.03;
        scene.rotation.x += (mouseTarget.y * 0.15 - scene.rotation.x) * 0.03;

        // Pulse nodes
        nodeMeshes.forEach((layer, layerIdx) => {
            layer.forEach((node, nodeIdx) => {
                const pulse = Math.sin(time * 2 + layerIdx * 0.8 + nodeIdx * 0.4) * 0.15 + 1;
                node.scale.setScalar(pulse);
                node.material.opacity = 0.3 + Math.sin(time * 1.5 + layerIdx) * 0.15;
            });
        });

        // Animate data flow particles
        particles.forEach((p) => {
            p.progress += p.speed;
            if (p.progress >= 1) {
                p.progress = 0;
                // Move to next layer
                p.startLayer = (p.startLayer + 1) % (layers.length - 1);
                const startNode = Math.floor(Math.random() * layers[p.startLayer]);
                const endNode = Math.floor(Math.random() * layers[p.startLayer + 1]);
                p.from = nodePositions[p.startLayer][startNode];
                p.to = nodePositions[p.startLayer + 1][endNode];
            }

            p.mesh.position.lerpVectors(p.from, p.to, p.progress);
            p.mesh.material.opacity = Math.sin(p.progress * Math.PI) * 0.6;
        });

        // Highlight active connections
        const activeLayer = Math.floor((time * 0.5) % (layers.length - 1));
        connections.forEach((conn) => {
            if (conn.from.layer === activeLayer) {
                conn.line.material.opacity = 0.15 + Math.sin(time * 3) * 0.1;
            } else {
                conn.line.material.opacity = 0.05;
            }
        });

        renderer.render(scene, camera);
    }

    animate();

    // --- Resize ---
    function onResize() {
        const w = canvas.clientWidth;
        const h = canvas.clientHeight;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
    }

    window.addEventListener('resize', onResize);

    return {
        destroy: () => {
            window.removeEventListener('resize', onResize);
            renderer.dispose();
        }
    };
}
