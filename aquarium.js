// Three.js Aquarium Scene
let scene, camera, renderer, controls;
let aquarium, fish = [], plants = [], bubbles = [], decorations = [];
let autoRotate = true;
let showBubbles = true;
let schoolingEnabled = true;

// Initialize the scene
function init() {
    // Scene setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 200);

    // Camera setup
    const canvas = document.getElementById('canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 15, 25);
    camera.lookAt(0, 0, 0);

    // Renderer setup
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowShadowMap;

    // Lighting
    setupLighting();

    // Create aquarium
    createAquarium();

    // Add initial fish and plants
    for (let i = 0; i < 3; i++) {
        addFish();
    }
    for (let i = 0; i < 4; i++) {
        addPlant();
    }
    
    // Add initial rocks
    for (let i = 0; i < 2; i++) {
        addRock();
    }
    
    // Start bubble generation
    setInterval(addBubbles, 500);

    // Mouse controls
    setupMouseControls();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start animation loop
    animate();
}

// Setup lighting
function setupLighting() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Point light inside aquarium
    const pointLight = new THREE.PointLight(0x87ceeb, 0.5);
    pointLight.position.set(0, 15, 0);
    scene.add(pointLight);
}

// Create the aquarium structure
function createAquarium() {
    const group = new THREE.Group();

    // Aquarium dimensions
    const width = 40;
    const height = 30;
    const depth = 30;

    // Glass material
    const glassMaterial = new THREE.MeshStandardMaterial({
        color: 0x88ccff,
        metalness: 0.1,
        roughness: 0.1,
        transparent: true,
        opacity: 0.3,
        side: THREE.BackSide
    });

    // Front and back walls
    const wallGeometry = new THREE.BoxGeometry(width, height, 0.5);
    const frontWall = new THREE.Mesh(wallGeometry, glassMaterial);
    frontWall.position.z = depth / 2;
    group.add(frontWall);

    const backWall = new THREE.Mesh(wallGeometry, glassMaterial);
    backWall.position.z = -depth / 2;
    group.add(backWall);

    // Left and right walls
    const sideWallGeometry = new THREE.BoxGeometry(0.5, height, depth);
    const leftWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    leftWall.position.x = -width / 2;
    group.add(leftWall);

    const rightWall = new THREE.Mesh(sideWallGeometry, glassMaterial);
    rightWall.position.x = width / 2;
    group.add(rightWall);

    // Bottom (gravel)
    createGravelFloor(width, depth, group);

    // Top (water surface effect)
    const topGeometry = new THREE.PlaneGeometry(width, depth);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0xccddff,
        metalness: 0.3,
        roughness: 0.2,
        emissive: 0x4488ff,
        emissiveIntensity: 0.1
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.rotation.x = Math.PI / 2;
    top.position.y = height / 2;
    group.add(top);

    // Frame (dark edges)
    createFrame(width, height, depth, group);

    scene.add(group);
    aquarium = group;
}

// Create gravel floor with realistic texture
function createGravelFloor(width, depth, parentGroup) {
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    
    // Create a canvas texture for gravel
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Fill with base color
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add gravel particles
    for (let i = 0; i < 5000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 3 + 1;
        const shade = Math.floor(Math.random() * 60) + 100;
        ctx.fillStyle = `rgb(${shade}, ${shade - 20}, ${shade - 40})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    
    const floorMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        metalness: 0.1,
        roughness: 0.8,
        side: THREE.DoubleSide
    });
    
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -15;
    floor.receiveShadow = true;
    parentGroup.add(floor);
}

// Create frame around aquarium
function createFrame(width, height, depth, parentGroup) {
    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.5,
        roughness: 0.5
    });

    const frameThickness = 1;

    // Top frame
    const topFrameGeometry = new THREE.BoxGeometry(width + frameThickness * 2, frameThickness, depth + frameThickness * 2);
    const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    topFrame.position.y = height / 2 + frameThickness / 2;
    parentGroup.add(topFrame);

    // Bottom frame
    const bottomFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
    bottomFrame.position.y = -height / 2 - frameThickness / 2;
    parentGroup.add(bottomFrame);
}

// Create different fish species
function createFishSpecies(species = 'default') {
    const fishGroup = new THREE.Group();
    let bodyColor, bodySize, headSize, tailSize;
    
    // Define species characteristics
    switch(species) {
        case 'goldfish':
            bodyColor = new THREE.Color(0xffa500);
            bodySize = { radius: 1.2, length: 3.5 };
            headSize = 1.0;
            tailSize = 1.3;
            break;
        case 'tropical':
            bodyColor = new THREE.Color().setHSL(Math.random(), 0.9, 0.5);
            bodySize = { radius: 1.0, length: 3.0 };
            headSize = 0.9;
            tailSize = 1.2;
            break;
        case 'large':
            bodyColor = new THREE.Color().setHSL(Math.random() * 0.3, 0.6, 0.4);
            bodySize = { radius: 2.0, length: 5.0 };
            headSize = 1.5;
            tailSize = 1.8;
            break;
        default:
            bodyColor = new THREE.Color().setHSL(Math.random(), 0.7, 0.5);
            bodySize = { radius: 1.5, length: 4 };
            headSize = 1.2;
            tailSize = 1.5;
    }

    // Body
    const bodyGeometry = new THREE.CapsuleGeometry(bodySize.radius, bodySize.length, 4, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.3,
        roughness: 0.4
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.castShadow = true;
    body.receiveShadow = true;
    fishGroup.add(body);

    // Head
    const headGeometry = new THREE.SphereGeometry(headSize, 16, 16);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.z = bodySize.length / 2 + headSize * 0.5;
    head.scale.set(1, 0.9, 0.8);
    head.castShadow = true;
    head.receiveShadow = true;
    fishGroup.add(head);

    // Eye
    const eyeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.8,
        roughness: 0.2
    });
    const eye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eye.position.set(0.5, 0.5, bodySize.length / 2 + headSize + 0.5);
    fishGroup.add(eye);

    // Tail
    const tailGeometry = new THREE.ConeGeometry(tailSize, 3, 8);
    const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
    tail.position.z = -bodySize.length / 2 - 1;
    tail.rotation.y = Math.PI / 2;
    tail.castShadow = true;
    tail.receiveShadow = true;
    fishGroup.add(tail);

    // Dorsal fin
    const finGeometry = new THREE.ConeGeometry(0.8, 2, 8);
    const finMaterial = new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.2,
        roughness: 0.5,
        transparent: true,
        opacity: 0.8
    });
    const dorsalFin = new THREE.Mesh(finGeometry, finMaterial);
    dorsalFin.position.set(0, bodySize.radius + 1, 0);
    dorsalFin.rotation.z = Math.PI / 2;
    dorsalFin.scale.set(0.6, 1, 1);
    fishGroup.add(dorsalFin);

    // Pectoral fins
    const pectoralFin = new THREE.Mesh(finGeometry, finMaterial);
    pectoralFin.position.set(bodySize.radius + 0.5, 0, 0.5);
    pectoralFin.rotation.z = Math.PI / 3;
    pectoralFin.scale.set(0.5, 0.8, 1);
    fishGroup.add(pectoralFin);

    const pectoralFin2 = pectoralFin.clone();
    pectoralFin2.position.x = -(bodySize.radius + 0.5);
    fishGroup.add(pectoralFin2);

    // Animation properties
    fishGroup.userData = {
        speed: Math.random() * 0.02 + 0.01,
        angle: Math.random() * Math.PI * 2,
        depth: Math.random() * 10 - 5,
        tailWave: 0,
        finWave: 0,
        species: species
    };

    return fishGroup;
}

// Create a realistic fish (default species)
function createFish() {
    const species = ['default', 'goldfish', 'tropical', 'large'];
    const randomSpecies = species[Math.floor(Math.random() * species.length)];
    return createFishSpecies(randomSpecies);
}

// Create an aquatic plant
function createPlant() {
    const plantGroup = new THREE.Group();

    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.15, 0.15, 12, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({
        color: 0x2d5016,
        metalness: 0.1,
        roughness: 0.7
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 6;
    stem.castShadow = true;
    stem.receiveShadow = true;
    plantGroup.add(stem);

    // Leaves
    const leafMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a7c2c,
        metalness: 0.05,
        roughness: 0.8,
        side: THREE.DoubleSide
    });

    for (let i = 0; i < 8; i++) {
        const leafGeometry = new THREE.PlaneGeometry(1.5, 4);
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        leaf.position.y = 2 + i * 1.2;
        leaf.rotation.z = (Math.PI / 4) * i;
        leaf.rotation.x = Math.PI / 6;
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        plantGroup.add(leaf);
    }

    // Root
    const rootGeometry = new THREE.SphereGeometry(0.8, 8, 8);
    const rootMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a3a0a,
        metalness: 0.1,
        roughness: 0.9
    });
    const root = new THREE.Mesh(rootGeometry, rootMaterial);
    root.position.y = -14.5;
    root.scale.set(1, 0.5, 1);
    root.castShadow = true;
    root.receiveShadow = true;
    plantGroup.add(root);

    // Animation properties
    plantGroup.userData = {
        swayAmount: Math.random() * 0.3 + 0.2,
        swaySpeed: Math.random() * 0.01 + 0.005,
        swayPhase: Math.random() * Math.PI * 2,
        originalRotation: 0
    };

    return plantGroup;
}

// Create a bubble
function createBubble() {
    const bubbleGeometry = new THREE.SphereGeometry(Math.random() * 0.3 + 0.1, 16, 16);
    const bubbleMaterial = new THREE.MeshStandardMaterial({
        color: 0xccffff,
        metalness: 0.8,
        roughness: 0.1,
        transparent: true,
        opacity: 0.6
    });
    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    
    bubble.userData = {
        velocity: Math.random() * 0.02 + 0.01,
        wobble: Math.random() * 0.02,
        wobblePhase: Math.random() * Math.PI * 2,
        lifetime: Math.random() * 200 + 100,
        age: 0
    };
    
    return bubble;
}

// Add bubbles to the scene
function addBubbles() {
    if (!showBubbles) return;
    
    for (let i = 0; i < 3; i++) {
        const bubble = createBubble();
        const x = Math.random() * 30 - 15;
        const y = Math.random() * 20 - 12;
        const z = Math.random() * 20 - 10;
        bubble.position.set(x, y, z);
        scene.add(bubble);
        bubbles.push(bubble);
    }
}

// Create a rock decoration
function createRock() {
    const rockGeometry = new THREE.IcosahedronGeometry(Math.random() * 1.5 + 1, 3);
    const rockMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color().setHSL(0.1, 0.3, 0.4),
        metalness: 0.1,
        roughness: 0.9
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    rock.castShadow = true;
    rock.receiveShadow = true;
    rock.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
    return rock;
}

// Add rock to the scene
function addRock() {
    // Limit to 10 rocks for performance
    if (decorations.length >= 10) {
        alert('Maximum 10 rocks allowed for performance');
        return;
    }
    const rock = createRock();
    const x = Math.random() * 30 - 15;
    const z = Math.random() * 20 - 10;
    rock.position.set(x, -13, z);
    scene.add(rock);
    decorations.push(rock);
    updateStats();
}

// Add fish to the scene
function addFish() {
    // Limit to 20 fish for performance
    if (fish.length >= 20) {
        alert('Maximum 20 fish allowed for performance');
        return;
    }
    const fish_obj = createFish();
    const x = Math.random() * 30 - 15;
    const y = Math.random() * 15 - 5;
    const z = Math.random() * 20 - 10;
    fish_obj.position.set(x, y, z);
    scene.add(fish_obj);
    fish.push(fish_obj);
    updateStats();
}

// Add plant to the scene
function addPlant() {
    // Limit to 15 plants for performance
    if (plants.length >= 15) {
        alert('Maximum 15 plants allowed for performance');
        return;
    }
    const plant = createPlant();
    const x = Math.random() * 30 - 15;
    const z = Math.random() * 20 - 10;
    plant.position.set(x, 0, z);
    scene.add(plant);
    plants.push(plant);
    updateStats();
}

// Update fish positions and animations
function updateFish() {
    fish.forEach((f, index) => {
        const data = f.userData;

        // Schooling behavior - fish tend to move together
        if (schoolingEnabled && index > 0) {
            const nearbyFish = fish.filter((other, i) => {
                const dist = f.position.distanceTo(other.position);
                return dist < 8 && i !== index;
            });
            
            if (nearbyFish.length > 0) {
                // Average direction of nearby fish
                let avgAngle = 0;
                nearbyFish.forEach(other => {
                    avgAngle += other.userData.angle;
                });
                avgAngle /= nearbyFish.length;
                
                // Gradually align with school
                data.angle += (avgAngle - data.angle) * 0.02;
            }
        }

        // Swimming motion
        data.angle += data.speed;
        f.position.x += Math.cos(data.angle) * data.speed * 2;
        f.position.z += Math.sin(data.angle) * data.speed * 2;

        // Keep fish in bounds
        if (Math.abs(f.position.x) > 18) data.angle += Math.PI;
        if (Math.abs(f.position.z) > 13) data.angle += Math.PI;
        if (f.position.y > 12) f.position.y = 12;
        if (f.position.y < -12) f.position.y = -12;

        // Tail animation
        data.tailWave += 0.1;
        f.children[2].rotation.z = Math.sin(data.tailWave) * 0.3;

        // Fin animation
        data.finWave += 0.08;
        f.children[4].rotation.x = Math.sin(data.finWave) * 0.2;

        // Face direction
        f.rotation.y = data.angle;
    });
}

// Update plant animations
function updatePlants() {
    plants.forEach(p => {
        const data = p.userData;
        data.swayPhase += data.swaySpeed;
        p.rotation.z = Math.sin(data.swayPhase) * data.swayAmount;
    });
}

// Update bubbles
function updateBubbles() {
    bubbles = bubbles.filter(bubble => {
        const data = bubble.userData;
        data.age++;
        
        // Move bubble up
        bubble.position.y += data.velocity;
        
        // Wobble motion
        data.wobblePhase += data.wobble;
        bubble.position.x += Math.sin(data.wobblePhase) * 0.01;
        
        // Fade out as it rises
        bubble.material.opacity = 0.6 * (1 - data.age / data.lifetime);
        
        // Remove old bubbles
        if (data.age > data.lifetime) {
            scene.remove(bubble);
            return false;
        }
        return true;
    });
}

// Setup mouse controls
function setupMouseControls() {
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    document.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    document.addEventListener('mousemove', (e) => {
        if (isDragging) {
            const deltaX = e.clientX - previousMousePosition.x;
            const deltaY = e.clientY - previousMousePosition.y;

            aquarium.rotation.y += deltaX * 0.005;
            aquarium.rotation.x += deltaY * 0.005;

            previousMousePosition = { x: e.clientX, y: e.clientY };
        }
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Zoom with scroll
    document.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z += e.deltaY * 0.05;
        camera.position.z = Math.max(15, Math.min(50, camera.position.z));
    }, { passive: false });
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Update animations
    updateFish();
    updatePlants();
    updateBubbles();

    // Auto-rotate
    if (autoRotate) {
        aquarium.rotation.y += 0.0005;
    }

    renderer.render(scene, camera);
}

// Toggle auto-rotate
function toggleAutoRotate() {
    autoRotate = !autoRotate;
}

// Toggle bubbles
function toggleBubbles() {
    showBubbles = !showBubbles;
    if (!showBubbles) {
        bubbles.forEach(b => scene.remove(b));
        bubbles = [];
    }
}

// Toggle schooling
function toggleSchooling() {
    schoolingEnabled = !schoolingEnabled;
}

// Reset view
function resetView() {
    camera.position.set(0, 15, 25);
    aquarium.rotation.set(0, 0, 0);
}

// Clear all objects
function clearAll() {
    // Remove all fish
    fish.forEach(f => scene.remove(f));
    fish = [];
    
    // Remove all plants
    plants.forEach(p => scene.remove(p));
    plants = [];
    
    // Remove all rocks
    decorations.forEach(d => scene.remove(d));
    decorations = [];
    
    // Remove all bubbles
    bubbles.forEach(b => scene.remove(b));
    bubbles = [];
    
    updateStats();
}

// Handle window resize
function onWindowResize() {
    const canvas = document.getElementById('canvas');
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
}

// Update statistics display
function updateStats() {
    document.getElementById('fishCount').textContent = fish.length;
    document.getElementById('plantCount').textContent = plants.length;
    document.getElementById('rockCount').textContent = decorations.length;
    document.getElementById('bubbleCount').textContent = bubbles.length;
}

// Start the application
window.addEventListener('DOMContentLoaded', init);
