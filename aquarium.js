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
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

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
    
    // Add initial rocks and pebbles
    for (let i = 0; i < 5; i++) {
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
    // Ambient light - softer for underwater feel
    const ambientLight = new THREE.AmbientLight(0x6699cc, 0.5);
    scene.add(ambientLight);

    // Directional light (sun) - creates underwater rays effect
    const directionalLight = new THREE.DirectionalLight(0xccddff, 0.7);
    directionalLight.position.set(20, 30, 20);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.left = -50;
    directionalLight.shadow.camera.right = 50;
    directionalLight.shadow.camera.top = 50;
    directionalLight.shadow.camera.bottom = -50;
    scene.add(directionalLight);

    // Point light inside aquarium - creates underwater glow
    const pointLight = new THREE.PointLight(0x88bbdd, 0.6);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);
    
    // Additional point light for side lighting
    const sideLight = new THREE.PointLight(0x6699ff, 0.3);
    sideLight.position.set(15, 5, 15);
    scene.add(sideLight);
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

    // Top (water surface effect with animation)
    const topGeometry = new THREE.PlaneGeometry(width, depth);
    const topMaterial = new THREE.MeshStandardMaterial({
        color: 0xccddff,
        metalness: 0.4,
        roughness: 0.15,
        emissive: 0x5599ff,
        emissiveIntensity: 0.15
    });
    const top = new THREE.Mesh(topGeometry, topMaterial);
    top.rotation.x = Math.PI / 2;
    top.position.y = height / 2;
    top.userData = {
        baseY: height / 2,
        wavePhase: 0
    };
    group.add(top);

    // Frame (dark edges)
    createFrame(width, height, depth, group);

    scene.add(group);
    aquarium = group;
}

// Create gravel floor with realistic texture and sand patches
function createGravelFloor(width, depth, parentGroup) {
    const floorGeometry = new THREE.PlaneGeometry(width, depth);
    
    // Create a canvas texture for gravel with more detail
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    // Fill with base color
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add sand patches for variety
    for (let p = 0; p < 15; p++) {
        const patchX = Math.random() * canvas.width;
        const patchY = Math.random() * canvas.height;
        const patchSize = Math.random() * 80 + 40;
        const gradient = ctx.createRadialGradient(patchX, patchY, 0, patchX, patchY, patchSize);
        gradient.addColorStop(0, '#C4A57B');
        gradient.addColorStop(1, '#8B7355');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(patchX, patchY, patchSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add gravel particles with more variation
    for (let i = 0; i < 8000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 4 + 0.5;
        const shade = Math.floor(Math.random() * 80) + 80;
        ctx.fillStyle = `rgb(${shade}, ${shade - 20}, ${shade - 40})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Add some darker spots for depth
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const size = Math.random() * 2 + 0.3;
        const shade = Math.floor(Math.random() * 40) + 40;
        ctx.fillStyle = `rgb(${shade}, ${shade - 10}, ${shade - 20})`;
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
    let bodyColor, accentColor, bodySize, headSize, tailSize, finSize;
    
    // Define species characteristics
    switch(species) {
        case 'goldfish':
            bodyColor = new THREE.Color(0xff8c00);
            accentColor = new THREE.Color(0xffd700);
            bodySize = { radiusFront: 1.4, radiusBack: 0.8, length: 4.0 };
            headSize = 1.3;
            tailSize = { width: 2.5, height: 2.0 };
            finSize = 1.2;
            break;
        case 'tropical':
            bodyColor = new THREE.Color().setHSL(Math.random(), 0.95, 0.55);
            accentColor = new THREE.Color().setHSL((Math.random() + 0.5) % 1, 0.9, 0.7);
            bodySize = { radiusFront: 1.1, radiusBack: 0.6, length: 3.5 };
            headSize = 1.0;
            tailSize = { width: 2.0, height: 1.8 };
            finSize = 1.0;
            break;
        case 'angelfish':
            bodyColor = new THREE.Color(0x4169e1);
            accentColor = new THREE.Color(0x87ceeb);
            bodySize = { radiusFront: 0.8, radiusBack: 0.5, length: 2.5 };
            headSize = 0.8;
            tailSize = { width: 1.5, height: 3.0 };
            finSize = 2.0;
            break;
        case 'koi':
            bodyColor = new THREE.Color(0xffffff);
            accentColor = new THREE.Color(0xff4500);
            bodySize = { radiusFront: 1.8, radiusBack: 1.0, length: 5.5 };
            headSize = 1.6;
            tailSize = { width: 3.0, height: 2.5 };
            finSize = 1.5;
            break;
        case 'tetra':
            bodyColor = new THREE.Color(0xff3333);
            accentColor = new THREE.Color(0xffff00);
            bodySize = { radiusFront: 0.6, radiusBack: 0.4, length: 2.0 };
            headSize = 0.6;
            tailSize = { width: 1.2, height: 1.5 };
            finSize = 0.7;
            break;
        case 'pleco':
            bodyColor = new THREE.Color(0x4a4a4a);
            accentColor = new THREE.Color(0x666666);
            bodySize = { radiusFront: 1.3, radiusBack: 0.9, length: 4.2 };
            headSize = 1.1;
            tailSize = { width: 2.0, height: 1.8 };
            finSize = 1.3;
            break;
        default:
            bodyColor = new THREE.Color().setHSL(Math.random(), 0.75, 0.55);
            accentColor = new THREE.Color().setHSL(Math.random(), 0.6, 0.7);
            bodySize = { radiusFront: 1.5, radiusBack: 0.8, length: 4.5 };
            headSize = 1.3;
            tailSize = { width: 2.2, height: 2.0 };
            finSize = 1.2;
    }

    // Create realistic body using multiple spheres for smooth ellipsoid shape
    const bodyMaterial = new THREE.MeshPhongMaterial({
        color: bodyColor,
        shininess: 80,
        specular: 0x444444,
        reflectivity: 0.5
    });

    // Main body segments for smooth fish shape
    const segments = 5;
    for (let i = 0; i < segments; i++) {
        const t = i / (segments - 1);
        const radius = bodySize.radiusFront * (1 - t) + bodySize.radiusBack * t;
        const segmentGeometry = new THREE.SphereGeometry(radius, 16, 16);
        const segment = new THREE.Mesh(segmentGeometry, bodyMaterial);
        segment.position.z = (t - 0.5) * bodySize.length;
        segment.scale.set(1, 0.85, 1.2);
        segment.castShadow = true;
        segment.receiveShadow = true;
        fishGroup.add(segment);
    }

    // Head with more detail
    const headGeometry = new THREE.SphereGeometry(headSize, 20, 20);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.z = bodySize.length / 2 + headSize * 0.4;
    head.scale.set(0.9, 0.85, 0.75);
    head.castShadow = true;
    head.receiveShadow = true;
    fishGroup.add(head);

    // Eyes - more realistic with white and pupil
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const eyeWhiteMaterial = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 100
    });
    const eyeLeft = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeLeft.position.set(headSize * 0.5, headSize * 0.3, bodySize.length / 2 + headSize * 0.6);
    eyeLeft.castShadow = true;
    fishGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeRight.position.set(-headSize * 0.5, headSize * 0.3, bodySize.length / 2 + headSize * 0.6);
    eyeRight.castShadow = true;
    fishGroup.add(eyeRight);

    // Pupils
    const pupilGeometry = new THREE.SphereGeometry(0.15, 12, 12);
    const pupilMaterial = new THREE.MeshPhongMaterial({ color: 0x000000 });
    const pupilLeft = new THREE.Mesh(pupilGeometry, pupilMaterial);
    pupilLeft.position.set(headSize * 0.55, headSize * 0.3, bodySize.length / 2 + headSize * 0.75);
    fishGroup.add(pupilLeft);

    const pupilRight = new THREE.Mesh(pupilGeometry, pupilMaterial);
    pupilRight.position.set(-headSize * 0.55, headSize * 0.3, bodySize.length / 2 + headSize * 0.75);
    fishGroup.add(pupilRight);

    // Mouth
    const mouthGeometry = new THREE.SphereGeometry(0.2, 12, 12);
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -headSize * 0.2, bodySize.length / 2 + headSize * 0.7);
    mouth.scale.set(1.5, 0.8, 0.5);
    fishGroup.add(mouth);

    // Tail fin - more detailed
    const tailGeometry = new THREE.ConeGeometry(tailSize.width / 2, tailSize.height, 8);
    const tailMaterial = new THREE.MeshPhongMaterial({
        color: accentColor,
        shininess: 60,
        specular: 0x333333
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -bodySize.length / 2 - tailSize.height / 2;
    tail.rotation.x = Math.PI / 2;
    tail.castShadow = true;
    tail.receiveShadow = true;
    fishGroup.add(tail);

    // Dorsal fin
    const dorsalGeometry = new THREE.ConeGeometry(finSize * 0.6, finSize * 1.5, 8);
    const dorsalMaterial = new THREE.MeshPhongMaterial({
        color: accentColor,
        shininess: 50
    });
    const dorsalFin = new THREE.Mesh(dorsalGeometry, dorsalMaterial);
    dorsalFin.position.set(0, bodySize.radiusFront * 0.8, 0);
    dorsalFin.rotation.z = Math.PI / 2;
    dorsalFin.castShadow = true;
    dorsalFin.receiveShadow = true;
    fishGroup.add(dorsalFin);

    // Pectoral fins (left and right)
    const pectoralGeometry = new THREE.ConeGeometry(finSize * 0.5, finSize, 6);
    const pectoralMaterial = new THREE.MeshPhongMaterial({
        color: accentColor,
        shininess: 50,
        transparent: true,
        opacity: 0.8
    });

    const pectoralLeft = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
    pectoralLeft.position.set(bodySize.radiusFront * 0.7, 0, 0);
    pectoralLeft.rotation.z = Math.PI / 3;
    pectoralLeft.castShadow = true;
    fishGroup.add(pectoralLeft);

    const pectoralRight = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
    pectoralRight.position.set(-bodySize.radiusFront * 0.7, 0, 0);
    pectoralRight.rotation.z = -Math.PI / 3;
    pectoralRight.castShadow = true;
    fishGroup.add(pectoralRight);

    // Store animation data
    fishGroup.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        tailWave: 0,
        finWave: 0,
        bodyWave: 0,
        bodySize: bodySize,
        headSize: headSize,
        tailSize: tailSize,
        tailIndex: fishGroup.children.length - 3,
        dorsalFinIndex: fishGroup.children.length - 2,
        pectoralLeftIndex: fishGroup.children.length - 1,
        pectoralRightIndex: fishGroup.children.length
    };

    return fishGroup;
}

// Create a fish
function createFish() {
    const species = ['goldfish', 'tropical', 'angelfish', 'koi', 'tetra', 'pleco'];
    const randomSpecies = species[Math.floor(Math.random() * species.length)];
    return createFishSpecies(randomSpecies);
}

// Create a plant
function createPlant() {
    const plantGroup = new THREE.Group();
    
    // Plant stem
    const stemGeometry = new THREE.CylinderGeometry(0.15, 0.2, 8, 8);
    const stemMaterial = new THREE.MeshPhongMaterial({
        color: 0x2d5016,
        shininess: 30
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 4;
    stem.castShadow = true;
    stem.receiveShadow = true;
    plantGroup.add(stem);

    // Leaves - multiple for fuller look
    const leafCount = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < leafCount; i++) {
        const leafGeometry = new THREE.PlaneGeometry(1.2, 3);
        const leafMaterial = new THREE.MeshPhongMaterial({
            color: new THREE.Color().setHSL(0.35, 0.7, 0.4),
            side: THREE.DoubleSide,
            shininess: 20
        });
        const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
        
        const angle = (i / leafCount) * Math.PI * 2;
        leaf.position.set(
            Math.cos(angle) * 1.5,
            2 + Math.random() * 4,
            Math.sin(angle) * 1.5
        );
        leaf.rotation.z = angle;
        leaf.rotation.x = Math.random() * 0.3;
        leaf.castShadow = true;
        leaf.receiveShadow = true;
        plantGroup.add(leaf);
    }

    // Root system at bottom
    const rootGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 8);
    const rootMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a3a0a,
        shininess: 20
    });
    const root = new THREE.Mesh(rootGeometry, rootMaterial);
    root.position.y = -0.25;
    root.castShadow = true;
    root.receiveShadow = true;
    plantGroup.add(root);

    // Store animation data
    plantGroup.userData = {
        swayPhase: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.01,
        swayAmount: 0.1 + Math.random() * 0.1
    };

    return plantGroup;
}

// Create a bubble
function createBubble() {
    const bubbleGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const bubbleMaterial = new THREE.MeshPhongMaterial({
        color: 0x88ccff,
        transparent: true,
        opacity: 0.6,
        shininess: 100,
        specular: 0xffffff
    });
    const bubble = new THREE.Mesh(bubbleGeometry, bubbleMaterial);
    bubble.userData = {
        velocity: 0.05 + Math.random() * 0.05,
        wobble: 0.02 + Math.random() * 0.03,
        wobblePhase: 0,
        age: 0,
        lifetime: 100 + Math.random() * 50
    };
    return bubble;
}

// Add bubbles to the scene
function addBubbles() {
    if (!showBubbles) return;
    
    const bubble = createBubble();
    const x = Math.random() * 30 - 15;
    const y = -12;
    const z = Math.random() * 20 - 10;
    bubble.position.set(x, y, z);
    scene.add(bubble);
    bubbles.push(bubble);
}

// Create a rock decoration
function createRock() {
    const rockType = Math.floor(Math.random() * 3);
    let rock;
    
    if (rockType === 0) {
        // Large irregular rock
        const rockGeometry = new THREE.IcosahedronGeometry(Math.random() * 1.5 + 1, 3);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.1, 0.3, 0.4),
            metalness: 0.1,
            roughness: 0.9
        });
        rock = new THREE.Mesh(rockGeometry, rockMaterial);
    } else if (rockType === 1) {
        // Smooth rounded rock
        const rockGeometry = new THREE.SphereGeometry(Math.random() * 1.2 + 0.8, 12, 12);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.08, 0.25, 0.45),
            metalness: 0.05,
            roughness: 0.85
        });
        rock = new THREE.Mesh(rockGeometry, rockMaterial);
    } else {
        // Flat slate-like rock
        const rockGeometry = new THREE.BoxGeometry(
            Math.random() * 2 + 1.5,
            Math.random() * 0.5 + 0.3,
            Math.random() * 2 + 1.5
        );
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color().setHSL(0.12, 0.2, 0.35),
            metalness: 0.08,
            roughness: 0.95
        });
        rock = new THREE.Mesh(rockGeometry, rockMaterial);
    }
    
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

        // Swimming motion with slight randomness
        data.angle += (Math.random() - 0.5) * 0.02;
        f.position.x += Math.cos(data.angle) * data.speed * 2;
        f.position.z += Math.sin(data.angle) * data.speed * 2;

        // Vertical movement - gentle bobbing
        f.position.y += Math.sin(Date.now() * 0.0005 + index) * 0.02;

        // Keep fish in bounds with smooth turning, accounting for fish size
        // Fish body extends from -length/2 to +length/2 in Z direction
        // Fish body extends from -radius to +radius in X and Y directions
        const fishLength = data.bodySize.length;
        const fishRadius = Math.max(data.bodySize.radiusFront, data.bodySize.radiusBack);
        const headSize = data.headSize;
        const tailSize = data.tailSize.width;
        
        // Calculate total fish extent
        const fishExtentZ = (fishLength / 2) + (tailSize / 2) + 0.5; // tail extends beyond body
        const fishExtentX = fishRadius + 0.5;
        const fishExtentY = fishRadius + headSize * 0.5;
        
        // Aquarium water bounds (with some margin from glass)
        const maxX = 19 - fishExtentX;
        const minX = -19 + fishExtentX;
        const maxZ = 14 - fishExtentZ;
        const minZ = -14 + fishExtentZ;
        const maxY = 13 - fishExtentY;
        const minY = -13 + fishExtentY;
        
        // Boundary checking with smooth turning
        if (f.position.x > maxX || f.position.x < minX) {
            data.angle += Math.PI * 0.1;
            f.position.x = Math.max(minX, Math.min(maxX, f.position.x));
        }
        if (f.position.z > maxZ || f.position.z < minZ) {
            data.angle += Math.PI * 0.1;
            f.position.z = Math.max(minZ, Math.min(maxZ, f.position.z));
        }
        if (f.position.y > maxY) f.position.y = maxY;
        if (f.position.y < minY) f.position.y = minY;

        // Enhanced tail animation - more fluid
        data.tailWave += 0.15;
        const tailChild = f.children[data.tailIndex];
        if (tailChild) {
            tailChild.rotation.y = Math.sin(data.tailWave) * 0.4;
            tailChild.rotation.z = Math.sin(data.tailWave) * 0.2;
        }

        // Dorsal fin animation
        const dorsalFin = f.children[data.dorsalFinIndex];
        if (dorsalFin) {
            dorsalFin.rotation.z = Math.sin(data.tailWave * 0.8) * 0.1;
        }

        // Pectoral fins animation - alternating movement
        data.finWave += 0.12;
        const pectoralLeft = f.children[data.pectoralLeftIndex];
        const pectoralRight = f.children[data.pectoralRightIndex];
        if (pectoralLeft && pectoralRight) {
            pectoralLeft.rotation.y = Math.sin(data.finWave) * 0.3;
            pectoralRight.rotation.y = Math.sin(data.finWave + Math.PI) * 0.3;
        }

        // Body undulation - make body segments wave
        data.bodyWave += 0.1;
        for (let i = 0; i < 5; i++) {
            const segment = f.children[i];
            if (segment) {
                const phase = data.bodyWave + i * 0.3;
                segment.rotation.y = Math.sin(phase) * 0.05;
                segment.position.y = Math.sin(phase) * 0.1;
            }
        }

        // Face direction with smooth rotation
        const targetRotation = data.angle;
        const currentRotation = f.rotation.y;
        let rotationDiff = targetRotation - currentRotation;
        
        // Normalize rotation difference to [-PI, PI]
        while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        f.rotation.y += rotationDiff * 0.1;

        // Slight pitch based on vertical movement
        f.rotation.x = Math.sin(Date.now() * 0.001 + index) * 0.1;
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
    
    // Update water surface animation
    if (aquarium && aquarium.children.length > 0) {
        const waterSurface = aquarium.children.find(child => child.userData && child.userData.baseY);
        if (waterSurface) {
            waterSurface.userData.wavePhase += 0.01;
            waterSurface.position.y = waterSurface.userData.baseY + Math.sin(waterSurface.userData.wavePhase) * 0.15;
            waterSurface.rotation.z = Math.sin(waterSurface.userData.wavePhase * 0.5) * 0.02;
        }
    }

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
