// Three.js Aquarium Scene
let scene, camera, renderer, controls;
let aquarium, fish = [], plants = [], bubbles = [], decorations = [], turtles = [], eels = [], snails = [];
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
    
    // Add initial snails
    for (let i = 0; i < 2; i++) {
        addSnail();
    }
    
    // Add castle to the bottom of the aquarium
    const castle = createCastle();
    castle.position.set(0, -13, 0);
    scene.add(castle);
    
    // Add ship to the bottom of the aquarium
    const ship = createShip();
    ship.userData = { isShip: true };
    ship.position.set(8, -13, -8);
    scene.add(ship);
    decorations.push(ship);
    
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

// Create procedural scale texture for realistic fish skin
function createScaleTexture(baseColor) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Base color
    ctx.fillStyle = `rgb(${baseColor.r * 255}, ${baseColor.g * 255}, ${baseColor.b * 255})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw scales pattern
    const scaleSize = 12;
    const rows = Math.ceil(canvas.height / (scaleSize * 0.7));
    const cols = Math.ceil(canvas.width / scaleSize);
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const x = col * scaleSize + (row % 2) * (scaleSize / 2);
            const y = row * scaleSize * 0.7;
            
            // Scale outline
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, scaleSize / 2);
            const brightness = 0.9 + Math.random() * 0.1;
            gradient.addColorStop(0, `rgba(255, 255, 255, ${0.3 * brightness})`);
            gradient.addColorStop(0.7, `rgba(255, 255, 255, ${0.1 * brightness})`);
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, scaleSize / 2, 0, Math.PI * 2);
            ctx.fill();
            
            // Scale edge highlight
            ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * brightness})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(x, y, scaleSize / 2.2, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    
    return new THREE.CanvasTexture(canvas);
}

// Create different fish species
function createFishSpecies(species = 'default') {
    const fishGroup = new THREE.Group();
    let bodyColor, accentColor, bodySize, headSize, tailSize, finSize, iridescence, metalness;
    
    // Define species characteristics
    switch(species) {
        case 'goldfish':
            bodyColor = new THREE.Color(0xff8c00);
            accentColor = new THREE.Color(0xffd700);
            bodySize = { radiusFront: 1.4, radiusBack: 0.8, length: 4.0 };
            headSize = 1.3;
            tailSize = { width: 2.5, height: 2.0 };
            finSize = 1.2;
            iridescence = 0.6;
            metalness = 0.4;
            break;
        case 'tropical':
            bodyColor = new THREE.Color().setHSL(Math.random(), 0.95, 0.55);
            accentColor = new THREE.Color().setHSL((Math.random() + 0.5) % 1, 0.9, 0.7);
            bodySize = { radiusFront: 1.1, radiusBack: 0.6, length: 3.5 };
            headSize = 1.0;
            tailSize = { width: 2.0, height: 1.8 };
            finSize = 1.0;
            iridescence = 0.8;
            metalness = 0.5;
            break;
        case 'angelfish':
            bodyColor = new THREE.Color(0x4169e1);
            accentColor = new THREE.Color(0x87ceeb);
            bodySize = { radiusFront: 0.8, radiusBack: 0.5, length: 2.5 };
            headSize = 0.8;
            tailSize = { width: 1.5, height: 3.0 };
            finSize = 2.0;
            iridescence = 0.7;
            metalness = 0.3;
            break;
        case 'koi':
            bodyColor = new THREE.Color(0xffffff);
            accentColor = new THREE.Color(0xff4500);
            bodySize = { radiusFront: 1.8, radiusBack: 1.0, length: 5.5 };
            headSize = 1.6;
            tailSize = { width: 3.0, height: 2.5 };
            finSize = 1.5;
            iridescence = 0.5;
            metalness = 0.3;
            break;
        case 'tetra':
            bodyColor = new THREE.Color(0xff3333);
            accentColor = new THREE.Color(0xffff00);
            bodySize = { radiusFront: 0.6, radiusBack: 0.4, length: 2.0 };
            headSize = 0.6;
            tailSize = { width: 1.2, height: 1.5 };
            finSize = 0.7;
            iridescence = 0.9;
            metalness = 0.6;
            break;
        case 'pleco':
            bodyColor = new THREE.Color(0x4a4a4a);
            accentColor = new THREE.Color(0x666666);
            bodySize = { radiusFront: 1.3, radiusBack: 0.9, length: 4.2 };
            headSize = 1.1;
            tailSize = { width: 2.0, height: 1.8 };
            finSize = 1.3;
            iridescence = 0.2;
            metalness = 0.1;
            break;
        default:
            bodyColor = new THREE.Color().setHSL(Math.random(), 0.75, 0.55);
            accentColor = new THREE.Color().setHSL(Math.random(), 0.6, 0.7);
            bodySize = { radiusFront: 1.5, radiusBack: 0.8, length: 4.5 };
            headSize = 1.3;
            tailSize = { width: 2.2, height: 2.0 };
            finSize = 1.2;
            iridescence = 0.6;
            metalness = 0.4;
    }

    // Create realistic body material with scales and iridescence
    const scaleTexture = createScaleTexture(bodyColor);
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: bodyColor,
        map: scaleTexture,
        metalness: metalness,
        roughness: 0.3,
        emissive: bodyColor,
        emissiveIntensity: iridescence * 0.15
    });

    // Main body segments for smooth fish shape with higher detail
    const segments = 7;
    for (let i = 0; i < segments; i++) {
        const t = i / (segments - 1);
        const radius = bodySize.radiusFront * (1 - t) + bodySize.radiusBack * t;
        const segmentGeometry = new THREE.SphereGeometry(radius, 24, 24);
        const segment = new THREE.Mesh(segmentGeometry, bodyMaterial);
        segment.position.z = (t - 0.5) * bodySize.length;
        segment.scale.set(1, 0.85, 1.2);
        segment.castShadow = true;
        segment.receiveShadow = true;
        fishGroup.add(segment);
    }

    // Head with more detail
    const headGeometry = new THREE.SphereGeometry(headSize, 32, 32);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.z = bodySize.length / 2 + headSize * 0.4;
    head.scale.set(0.9, 0.85, 0.75);
    head.castShadow = true;
    head.receiveShadow = true;
    fishGroup.add(head);

    // Add gill slits for realism
    const gillMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(bodyColor.r * 0.6, bodyColor.g * 0.6, bodyColor.b * 0.6),
        metalness: 0.2,
        roughness: 0.7
    });
    
    for (let side of [-1, 1]) {
        for (let i = 0; i < 3; i++) {
            const gillGeometry = new THREE.PlaneGeometry(0.15, headSize * 0.4);
            const gill = new THREE.Mesh(gillGeometry, gillMaterial);
            gill.position.set(
                side * headSize * 0.6,
                headSize * 0.1,
                bodySize.length / 2 - i * 0.2
            );
            gill.rotation.y = side * Math.PI / 2;
            gill.rotation.z = side * 0.2;
            fishGroup.add(gill);
        }
    }

    // Eyes - more realistic with white, iris, and pupil
    const eyeWhiteGeometry = new THREE.SphereGeometry(0.4, 20, 20);
    const eyeWhiteMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.1,
        roughness: 0.2
    });
    const eyeLeft = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeLeft.position.set(headSize * 0.5, headSize * 0.3, bodySize.length / 2 + headSize * 0.6);
    eyeLeft.castShadow = true;
    fishGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(eyeWhiteGeometry, eyeWhiteMaterial);
    eyeRight.position.set(-headSize * 0.5, headSize * 0.3, bodySize.length / 2 + headSize * 0.6);
    eyeRight.castShadow = true;
    fishGroup.add(eyeRight);

    // Iris
    const irisGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const irisColor = new THREE.Color().setHSL(Math.random() * 0.15, 0.6, 0.4);
    const irisMaterial = new THREE.MeshStandardMaterial({ 
        color: irisColor,
        metalness: 0.3,
        roughness: 0.4
    });
    const irisLeft = new THREE.Mesh(irisGeometry, irisMaterial);
    irisLeft.position.set(headSize * 0.55, headSize * 0.3, bodySize.length / 2 + headSize * 0.75);
    fishGroup.add(irisLeft);

    const irisRight = new THREE.Mesh(irisGeometry, irisMaterial);
    irisRight.position.set(-headSize * 0.55, headSize * 0.3, bodySize.length / 2 + headSize * 0.75);
    fishGroup.add(irisRight);

    // Pupils - glossy black
    const pupilGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const pupilMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x000000,
        metalness: 0.8,
        roughness: 0.1
    });
    const pupilLeft = new THREE.Mesh(pupilGeometry, pupilMaterial);
    pupilLeft.position.set(headSize * 0.58, headSize * 0.3, bodySize.length / 2 + headSize * 0.82);
    fishGroup.add(pupilLeft);

    const pupilRight = new THREE.Mesh(pupilGeometry, pupilMaterial);
    pupilRight.position.set(-headSize * 0.58, headSize * 0.3, bodySize.length / 2 + headSize * 0.82);
    fishGroup.add(pupilRight);

    // Mouth with more detail
    const mouthGeometry = new THREE.SphereGeometry(0.25, 16, 16);
    const mouthMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x2a2a2a,
        metalness: 0.1,
        roughness: 0.8
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -headSize * 0.25, bodySize.length / 2 + headSize * 0.75);
    mouth.scale.set(1.3, 0.7, 0.6);
    fishGroup.add(mouth);

    // Lateral line (sensory organ line along body)
    const lateralLineMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(bodyColor.r * 0.7, bodyColor.g * 0.7, bodyColor.b * 0.7),
        metalness: 0.5,
        roughness: 0.5
    });
    
    for (let i = 0; i < 8; i++) {
        const t = i / 7;
        const lineGeometry = new THREE.SphereGeometry(0.08, 8, 8);
        const lineDot = new THREE.Mesh(lineGeometry, lateralLineMaterial);
        lineDot.position.set(
            bodySize.radiusFront * 0.9,
            0,
            (t - 0.5) * bodySize.length * 0.9
        );
        fishGroup.add(lineDot);
        
        // Mirror on other side
        const lineDot2 = lineDot.clone();
        lineDot2.position.x = -bodySize.radiusFront * 0.9;
        fishGroup.add(lineDot2);
    }

    // Tail fin - more detailed and realistic
    const tailGeometry = new THREE.ConeGeometry(tailSize.width / 2, tailSize.height, 16);
    const tailMaterial = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: metalness * 0.8,
        roughness: 0.4,
        transparent: true,
        opacity: 0.95,
        side: THREE.DoubleSide
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -bodySize.length / 2 - tailSize.height / 2;
    tail.rotation.x = Math.PI / 2;
    tail.castShadow = true;
    tail.receiveShadow = true;
    fishGroup.add(tail);
    
    // Add tail fin rays for detail
    for (let i = 0; i < 5; i++) {
        const rayGeometry = new THREE.CylinderGeometry(0.02, 0.02, tailSize.height * 0.9, 8);
        const rayMaterial = new THREE.MeshStandardMaterial({
            color: new THREE.Color(accentColor.r * 0.8, accentColor.g * 0.8, accentColor.b * 0.8),
            metalness: 0.3,
            roughness: 0.6
        });
        const ray = new THREE.Mesh(rayGeometry, rayMaterial);
        const angle = (i - 2) * 0.3;
        ray.position.z = -bodySize.length / 2 - tailSize.height / 2;
        ray.rotation.x = Math.PI / 2;
        ray.rotation.z = angle;
        fishGroup.add(ray);
    }

    // Dorsal fin with more detail
    const dorsalGeometry = new THREE.ConeGeometry(finSize * 0.7, finSize * 1.8, 12);
    const dorsalMaterial = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: metalness * 0.7,
        roughness: 0.4,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    const dorsalFin = new THREE.Mesh(dorsalGeometry, dorsalMaterial);
    dorsalFin.position.set(0, bodySize.radiusFront * 0.9, 0);
    dorsalFin.rotation.z = Math.PI / 2;
    dorsalFin.castShadow = true;
    dorsalFin.receiveShadow = true;
    fishGroup.add(dorsalFin);
    
    // Dorsal fin rays
    for (let i = 0; i < 4; i++) {
        const rayGeometry = new THREE.CylinderGeometry(0.015, 0.015, finSize * 1.5, 8);
        const ray = new THREE.Mesh(rayGeometry, new THREE.MeshStandardMaterial({
            color: new THREE.Color(accentColor.r * 0.8, accentColor.g * 0.8, accentColor.b * 0.8),
            metalness: 0.3,
            roughness: 0.6
        }));
        ray.position.set((i - 1.5) * 0.2, bodySize.radiusFront * 0.9 + finSize * 0.7, 0);
        ray.rotation.z = Math.PI / 2;
        fishGroup.add(ray);
    }

    // Pectoral fins (left and right) - more realistic
    const pectoralGeometry = new THREE.ConeGeometry(finSize * 0.6, finSize * 1.2, 10);
    const pectoralMaterial = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: metalness * 0.6,
        roughness: 0.4,
        transparent: true,
        opacity: 0.85,
        side: THREE.DoubleSide
    });

    const pectoralLeft = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
    pectoralLeft.position.set(bodySize.radiusFront * 0.8, -0.2, bodySize.length * 0.15);
    pectoralLeft.rotation.z = Math.PI / 2.5;
    pectoralLeft.rotation.y = -0.3;
    pectoralLeft.castShadow = true;
    fishGroup.add(pectoralLeft);

    const pectoralRight = new THREE.Mesh(pectoralGeometry, pectoralMaterial);
    pectoralRight.position.set(-bodySize.radiusFront * 0.8, -0.2, bodySize.length * 0.15);
    pectoralRight.rotation.z = -Math.PI / 2.5;
    pectoralRight.rotation.y = 0.3;
    pectoralRight.castShadow = true;
    fishGroup.add(pectoralRight);
    
    // Ventral (pelvic) fins
    const ventralGeometry = new THREE.ConeGeometry(finSize * 0.4, finSize * 0.8, 8);
    const ventralMaterial = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: metalness * 0.5,
        roughness: 0.5,
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
    });
    
    const ventralLeft = new THREE.Mesh(ventralGeometry, ventralMaterial);
    ventralLeft.position.set(bodySize.radiusFront * 0.5, -bodySize.radiusFront * 0.7, 0);
    ventralLeft.rotation.z = Math.PI / 3;
    ventralLeft.rotation.x = 0.3;
    fishGroup.add(ventralLeft);
    
    const ventralRight = new THREE.Mesh(ventralGeometry, ventralMaterial);
    ventralRight.position.set(-bodySize.radiusFront * 0.5, -bodySize.radiusFront * 0.7, 0);
    ventralRight.rotation.z = -Math.PI / 3;
    ventralRight.rotation.x = 0.3;
    fishGroup.add(ventralRight);

    // Store animation data with enhanced properties
    fishGroup.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.015 + 0.008,
        baseSpeed: Math.random() * 0.015 + 0.008,
        targetSpeed: Math.random() * 0.015 + 0.008,
        acceleration: 0,
        tailWave: 0,
        finWave: 0,
        bodyWave: 0,
        breathingPhase: Math.random() * Math.PI * 2,
        depthPreference: Math.random() * 20 - 10, // preferred Y position
        bodySize: bodySize,
        headSize: headSize,
        tailSize: tailSize,
        finSize: finSize,
        species: species,
        iridescence: iridescence,
        // Store indices for animation
        bodySegmentCount: 7,
        gillStartIndex: 7 + 1, // after body segments and head
        eyeLeftIndex: 7 + 1 + 6, // after gills
        eyeRightIndex: 7 + 1 + 6 + 1,
        irisLeftIndex: 7 + 1 + 6 + 2,
        irisRightIndex: 7 + 1 + 6 + 3,
        pupilLeftIndex: 7 + 1 + 6 + 4,
        pupilRightIndex: 7 + 1 + 6 + 5
    };

    return fishGroup;
}

// Create a fish
function createFish() {
    const species = ['goldfish', 'tropical', 'angelfish', 'koi', 'tetra', 'pleco'];
    const randomSpecies = species[Math.floor(Math.random() * species.length)];
    return createFishSpecies(randomSpecies);
}

// Create a turtle
function createTurtle() {
    const turtleGroup = new THREE.Group();
    
    // Shell - main body
    const shellGeometry = new THREE.SphereGeometry(1.5, 32, 32);
    shellGeometry.scale(1.2, 0.8, 1.4); // Elongated ellipsoid shape
    const shellMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x6b4423),
        metalness: 0.1,
        roughness: 0.7,
        emissive: new THREE.Color(0x3d2817),
        emissiveIntensity: 0.1
    });
    const shell = new THREE.Mesh(shellGeometry, shellMaterial);
    shell.castShadow = true;
    shell.receiveShadow = true;
    turtleGroup.add(shell);
    
    // Shell pattern - hexagonal scutes
    const scuteMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x8b5a2b),
        metalness: 0.05,
        roughness: 0.8
    });
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 4; col++) {
            const scuteGeometry = new THREE.SphereGeometry(0.35, 16, 16);
            const scute = new THREE.Mesh(scuteGeometry, scuteMaterial);
            scute.position.set(
                (col - 1.5) * 0.7,
                0.3 - row * 0.5,
                (row - 1) * 0.4
            );
            scute.scale.set(0.9, 0.7, 0.9);
            scute.castShadow = true;
            turtleGroup.add(scute);
        }
    }
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.6, 24, 24);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x7a9b3d),
        metalness: 0.1,
        roughness: 0.6
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, 0.3, 1.8);
    head.scale.set(0.8, 0.9, 1.0);
    head.castShadow = true;
    head.receiveShadow = true;
    turtleGroup.add(head);
    
    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.5,
        roughness: 0.3
    });
    
    const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeLeft.position.set(0.25, 0.5, 2.2);
    eyeLeft.castShadow = true;
    turtleGroup.add(eyeLeft);
    
    const eyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeRight.position.set(-0.25, 0.5, 2.2);
    eyeRight.castShadow = true;
    turtleGroup.add(eyeRight);
    
    // Eye highlights
    const eyeHighlightGeometry = new THREE.SphereGeometry(0.06, 12, 12);
    const eyeHighlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.8,
        roughness: 0.1
    });
    
    const highlightLeft = new THREE.Mesh(eyeHighlightGeometry, eyeHighlightMaterial);
    highlightLeft.position.set(0.3, 0.55, 2.3);
    turtleGroup.add(highlightLeft);
    
    const highlightRight = new THREE.Mesh(eyeHighlightGeometry, eyeHighlightMaterial);
    highlightRight.position.set(-0.2, 0.55, 2.3);
    turtleGroup.add(highlightRight);
    
    // Mouth
    const mouthGeometry = new THREE.SphereGeometry(0.2, 12, 12);
    const mouthMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x5a7a2d),
        metalness: 0.05,
        roughness: 0.8
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, 0.1, 2.3);
    mouth.scale.set(1.2, 0.6, 0.8);
    turtleGroup.add(mouth);
    
    // Front left flipper
    const flipperGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const flipperMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x6b8e23),
        metalness: 0.1,
        roughness: 0.7
    });
    
    const flipperFL = new THREE.Mesh(flipperGeometry, flipperMaterial);
    flipperFL.position.set(1.3, -0.3, 0.8);
    flipperFL.scale.set(0.6, 0.8, 0.5);
    flipperFL.rotation.z = Math.PI / 4;
    flipperFL.castShadow = true;
    flipperFL.receiveShadow = true;
    turtleGroup.add(flipperFL);
    
    // Front right flipper
    const flipperFR = new THREE.Mesh(flipperGeometry, flipperMaterial);
    flipperFR.position.set(-1.3, -0.3, 0.8);
    flipperFR.scale.set(0.6, 0.8, 0.5);
    flipperFR.rotation.z = -Math.PI / 4;
    flipperFR.castShadow = true;
    flipperFR.receiveShadow = true;
    turtleGroup.add(flipperFR);
    
    // Back left flipper
    const flipperBL = new THREE.Mesh(flipperGeometry, flipperMaterial);
    flipperBL.position.set(1.2, -0.3, -0.8);
    flipperBL.scale.set(0.5, 0.7, 0.5);
    flipperBL.rotation.z = Math.PI / 4;
    flipperBL.castShadow = true;
    flipperBL.receiveShadow = true;
    turtleGroup.add(flipperBL);
    
    // Back right flipper
    const flipperBR = new THREE.Mesh(flipperGeometry, flipperMaterial);
    flipperBR.position.set(-1.2, -0.3, -0.8);
    flipperBR.scale.set(0.5, 0.7, 0.5);
    flipperBR.rotation.z = -Math.PI / 4;
    flipperBR.castShadow = true;
    flipperBR.receiveShadow = true;
    turtleGroup.add(flipperBR);
    
    // Tail
    const tailGeometry = new THREE.ConeGeometry(0.25, 1.2, 12);
    const tailMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x6b8e23),
        metalness: 0.1,
        roughness: 0.7
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(0, -0.2, -1.8);
    tail.rotation.x = Math.PI / 2;
    tail.castShadow = true;
    tail.receiveShadow = true;
    turtleGroup.add(tail);
    
    // Store animation data
    turtleGroup.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.005 + 0.002, // Slower than fish
        baseSpeed: Math.random() * 0.005 + 0.002,
        targetSpeed: Math.random() * 0.005 + 0.002,
        acceleration: 0,
        depthPreference: Math.random() * 10 - 5, // Turtles prefer lower depths
        flipperWave: 0,
        headBob: 0,
        tailWave: 0,
        // Indices for animation
        shellIndex: 0,
        scuteStartIndex: 1,
        headIndex: 13,
        eyeLeftIndex: 14,
        eyeRightIndex: 15,
        flipperFLIndex: 18,
        flipperFRIndex: 19,
        flipperBLIndex: 20,
        flipperBRIndex: 21,
        tailIndex: 22
    };
    
    return turtleGroup;
}

// Create an eel
function createEel() {
    const eelGroup = new THREE.Group();
    
    // Eel body - long and sinuous with multiple segments
    const bodyColor = new THREE.Color().setHSL(Math.random() * 0.15 + 0.05, 0.7, 0.35); // Yellow-green to brown
    const accentColor = new THREE.Color().setHSL(Math.random() * 0.1, 0.8, 0.5);
    
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.3,
        roughness: 0.6,
        emissive: bodyColor,
        emissiveIntensity: 0.1
    });
    
    // Create eel body with 12 segments for smooth, sinuous movement
    const segmentCount = 12;
    const bodyLength = 8;
    const bodyRadiusFront = 0.5;
    const bodyRadiusBack = 0.3;
    
    for (let i = 0; i < segmentCount; i++) {
        const t = i / (segmentCount - 1);
        const radius = bodyRadiusFront * (1 - t) + bodyRadiusBack * t;
        const segmentGeometry = new THREE.SphereGeometry(radius, 16, 16);
        const segment = new THREE.Mesh(segmentGeometry, bodyMaterial);
        segment.position.z = (t - 0.5) * bodyLength;
        segment.scale.set(1, 0.7, 1.3); // Elongated
        segment.castShadow = true;
        segment.receiveShadow = true;
        eelGroup.add(segment);
    }
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.5, 24, 24);
    const head = new THREE.Mesh(headGeometry, bodyMaterial);
    head.position.z = bodyLength / 2 + 0.4;
    head.scale.set(0.85, 0.75, 0.7);
    head.castShadow = true;
    head.receiveShadow = true;
    eelGroup.add(head);
    
    // Eyes - small and beady
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.6,
        roughness: 0.2
    });
    
    const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeLeft.position.set(0.2, 0.15, bodyLength / 2 + 0.6);
    eyeLeft.castShadow = true;
    eelGroup.add(eyeLeft);
    
    const eyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeRight.position.set(-0.2, 0.15, bodyLength / 2 + 0.6);
    eyeRight.castShadow = true;
    eelGroup.add(eyeRight);
    
    // Eye highlights
    const eyeHighlightGeometry = new THREE.SphereGeometry(0.05, 12, 12);
    const eyeHighlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.9,
        roughness: 0.1
    });
    
    const highlightLeft = new THREE.Mesh(eyeHighlightGeometry, eyeHighlightMaterial);
    highlightLeft.position.set(0.25, 0.2, bodyLength / 2 + 0.7);
    eelGroup.add(highlightLeft);
    
    const highlightRight = new THREE.Mesh(eyeHighlightGeometry, eyeHighlightMaterial);
    highlightRight.position.set(-0.15, 0.2, bodyLength / 2 + 0.7);
    eelGroup.add(highlightRight);
    
    // Mouth
    const mouthGeometry = new THREE.SphereGeometry(0.15, 12, 12);
    const mouthMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0.1,
        roughness: 0.8
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.1, bodyLength / 2 + 0.65);
    mouth.scale.set(1.2, 0.6, 0.5);
    eelGroup.add(mouth);
    
    // Dorsal fin - runs along the back
    const dorsalSegments = 8;
    for (let i = 0; i < dorsalSegments; i++) {
        const t = i / (dorsalSegments - 1);
        const finGeometry = new THREE.ConeGeometry(0.3, 0.8, 8);
        const finMaterial = new THREE.MeshStandardMaterial({
            color: accentColor,
            metalness: 0.2,
            roughness: 0.5,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide
        });
        const fin = new THREE.Mesh(finGeometry, finMaterial);
        fin.position.set(0, bodyRadiusFront * 0.8, (t - 0.5) * bodyLength * 0.9);
        fin.rotation.z = Math.PI / 2;
        fin.castShadow = true;
        eelGroup.add(fin);
    }
    
    // Tail fin - pointed
    const tailGeometry = new THREE.ConeGeometry(0.25, 1.2, 12);
    const tailMaterial = new THREE.MeshStandardMaterial({
        color: accentColor,
        metalness: 0.2,
        roughness: 0.5,
        transparent: true,
        opacity: 0.9,
        side: THREE.DoubleSide
    });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.z = -bodyLength / 2 - 0.6;
    tail.rotation.x = Math.PI / 2;
    tail.castShadow = true;
    tail.receiveShadow = true;
    eelGroup.add(tail);
    
    // Store animation data
    eelGroup.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.012 + 0.006,
        baseSpeed: Math.random() * 0.012 + 0.006,
        targetSpeed: Math.random() * 0.012 + 0.006,
        acceleration: 0,
        depthPreference: Math.random() * 15 - 8,
        bodyWave: 0,
        tailWave: 0,
        segmentCount: segmentCount,
        headIndex: segmentCount,
        eyeLeftIndex: segmentCount + 1,
        eyeRightIndex: segmentCount + 2
    };
    
    return eelGroup;
}

// Create a snail
function createSnail() {
    const snailGroup = new THREE.Group();
    
    // Snail shell - spiral cone shape
    const shellColor = new THREE.Color().setHSL(Math.random() * 0.15 + 0.05, 0.6, 0.4); // Brown/tan colors
    const shellMaterial = new THREE.MeshStandardMaterial({
        color: shellColor,
        metalness: 0.2,
        roughness: 0.7,
        emissive: shellColor,
        emissiveIntensity: 0.05
    });
    
    // Create shell as a series of scaled spheres to form a spiral
    const shellSegments = 8;
    for (let i = 0; i < shellSegments; i++) {
        const t = i / shellSegments;
        const scale = 1 - t * 0.6; // Gradually smaller
        const height = t * 2;
        const angle = t * Math.PI * 3; // Spiral rotation
        
        const segmentGeometry = new THREE.SphereGeometry(0.6 * scale, 16, 16);
        const segment = new THREE.Mesh(segmentGeometry, shellMaterial);
        segment.position.set(
            Math.cos(angle) * 0.5 * scale,
            height,
            Math.sin(angle) * 0.5 * scale
        );
        segment.scale.set(scale, scale * 0.8, scale);
        segment.castShadow = true;
        segment.receiveShadow = true;
        snailGroup.add(segment);
    }
    
    // Shell opening - darker material
    const shellOpeningGeometry = new THREE.SphereGeometry(0.5, 16, 16);
    const shellOpeningMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x4a3728),
        metalness: 0.1,
        roughness: 0.8
    });
    const shellOpening = new THREE.Mesh(shellOpeningGeometry, shellOpeningMaterial);
    shellOpening.position.set(0, 1.8, 0);
    shellOpening.scale.set(0.7, 0.5, 0.7);
    shellOpening.castShadow = true;
    snailGroup.add(shellOpening);
    
    // Snail body - soft tissue
    const bodyColor = new THREE.Color().setHSL(Math.random() * 0.1 + 0.08, 0.5, 0.35); // Darker brown
    const bodyMaterial = new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.15,
        roughness: 0.8
    });
    
    // Body segments
    const bodyGeometry = new THREE.SphereGeometry(0.4, 16, 16);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.set(0, 0.3, 0);
    body.scale.set(1, 0.7, 1.2);
    body.castShadow = true;
    body.receiveShadow = true;
    snailGroup.add(body);
    
    // Head
    const headGeometry = new THREE.SphereGeometry(0.35, 16, 16);
    const headMaterial = new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.15,
        roughness: 0.8
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.position.set(0, -0.2, 0);
    head.scale.set(0.9, 0.8, 1.1);
    head.castShadow = true;
    head.receiveShadow = true;
    snailGroup.add(head);
    
    // Eyes on tentacles - upper tentacles
    const tentacleLength = 0.6;
    const eyeGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const eyeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 0.6,
        roughness: 0.2
    });
    
    // Left upper tentacle with eye
    const tentacleLeftGeometry = new THREE.CylinderGeometry(0.05, 0.04, tentacleLength, 8);
    const tentacleMaterial = new THREE.MeshStandardMaterial({
        color: bodyColor,
        metalness: 0.1,
        roughness: 0.8
    });
    const tentacleLeft = new THREE.Mesh(tentacleLeftGeometry, tentacleMaterial);
    tentacleLeft.position.set(-0.25, -0.1, 0);
    tentacleLeft.rotation.z = Math.PI / 3;
    tentacleLeft.castShadow = true;
    snailGroup.add(tentacleLeft);
    
    const eyeLeft = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeLeft.position.set(-0.4, 0.35, 0);
    eyeLeft.castShadow = true;
    snailGroup.add(eyeLeft);
    
    // Right upper tentacle with eye
    const tentacleRight = new THREE.Mesh(tentacleLeftGeometry, tentacleMaterial);
    tentacleRight.position.set(0.25, -0.1, 0);
    tentacleRight.rotation.z = -Math.PI / 3;
    tentacleRight.castShadow = true;
    snailGroup.add(tentacleRight);
    
    const eyeRight = new THREE.Mesh(eyeGeometry, eyeMaterial);
    eyeRight.position.set(0.4, 0.35, 0);
    eyeRight.castShadow = true;
    snailGroup.add(eyeRight);
    
    // Lower tentacles (shorter, no eyes)
    const lowerTentacleLength = 0.4;
    const tentacleLowerLeftGeometry = new THREE.CylinderGeometry(0.04, 0.03, lowerTentacleLength, 8);
    
    const tentacleLowerLeft = new THREE.Mesh(tentacleLowerLeftGeometry, tentacleMaterial);
    tentacleLowerLeft.position.set(-0.15, -0.3, 0);
    tentacleLowerLeft.rotation.z = Math.PI / 4;
    tentacleLowerLeft.castShadow = true;
    snailGroup.add(tentacleLowerLeft);
    
    const tentacleLowerRight = new THREE.Mesh(tentacleLowerLeftGeometry, tentacleMaterial);
    tentacleLowerRight.position.set(0.15, -0.3, 0);
    tentacleLowerRight.rotation.z = -Math.PI / 4;
    tentacleLowerRight.castShadow = true;
    snailGroup.add(tentacleLowerRight);
    
    // Mouth
    const mouthGeometry = new THREE.SphereGeometry(0.08, 12, 12);
    const mouthMaterial = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x3a2817),
        metalness: 0.05,
        roughness: 0.9
    });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.35, 0.35);
    mouth.scale.set(0.8, 0.6, 0.5);
    snailGroup.add(mouth);
    
    // Store animation data
    snailGroup.userData = {
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.003 + 0.001, // Very slow movement
        baseSpeed: Math.random() * 0.003 + 0.001,
        targetSpeed: Math.random() * 0.003 + 0.001,
        depthPreference: Math.random() * 8 - 10, // Prefer lower depths
        tentacleWave: 0,
        headBob: 0,
        shellRotation: 0,
        tentacleLeftIndex: 8,
        tentacleRightIndex: 9,
        tentacleLowerLeftIndex: 10,
        tentacleLowerRightIndex: 11,
        eyeLeftIndex: 7,
        eyeRightIndex: 8
    };
    
    return snailGroup;
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

// Create a castle decoration
function createCastle() {
    const castleGroup = new THREE.Group();
    
    // Castle material - stone color
    const stoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B7355,
        metalness: 0.1,
        roughness: 0.8
    });
    
    const darkStoneMaterial = new THREE.MeshStandardMaterial({
        color: 0x6B5345,
        metalness: 0.05,
        roughness: 0.9
    });
    
    // Main castle base - large rectangular structure
    const baseGeometry = new THREE.BoxGeometry(8, 6, 6);
    const base = new THREE.Mesh(baseGeometry, stoneMaterial);
    base.position.y = 0;
    base.castShadow = true;
    base.receiveShadow = true;
    castleGroup.add(base);
    
    // Four corner towers
    const towerRadius = 1.2;
    const towerHeight = 8;
    const towerGeometry = new THREE.CylinderGeometry(towerRadius, towerRadius, towerHeight, 8);
    
    const towerPositions = [
        [-3.5, 0, -2.5],
        [3.5, 0, -2.5],
        [-3.5, 0, 2.5],
        [3.5, 0, 2.5]
    ];
    
    towerPositions.forEach(pos => {
        const tower = new THREE.Mesh(towerGeometry, stoneMaterial);
        tower.position.set(pos[0], pos[1], pos[2]);
        tower.castShadow = true;
        tower.receiveShadow = true;
        castleGroup.add(tower);
        
        // Tower roof - cone
        const roofGeometry = new THREE.ConeGeometry(towerRadius + 0.3, 1.5, 8);
        const roof = new THREE.Mesh(roofGeometry, darkStoneMaterial);
        roof.position.set(pos[0], towerHeight / 2 + 0.75, pos[2]);
        roof.castShadow = true;
        castleGroup.add(roof);
    });
    
    // Central tower - taller
    const centralTowerGeometry = new THREE.CylinderGeometry(1.5, 1.5, 10, 8);
    const centralTower = new THREE.Mesh(centralTowerGeometry, stoneMaterial);
    centralTower.position.y = 0;
    centralTower.castShadow = true;
    centralTower.receiveShadow = true;
    castleGroup.add(centralTower);
    
    // Central tower roof
    const centralRoofGeometry = new THREE.ConeGeometry(1.8, 2, 8);
    const centralRoof = new THREE.Mesh(centralRoofGeometry, darkStoneMaterial);
    centralRoof.position.y = 5.5;
    centralRoof.castShadow = true;
    castleGroup.add(centralRoof);
    
    // Front gate - arch opening
    const gateWidth = 2;
    const gateHeight = 3;
    const gateGeometry = new THREE.BoxGeometry(gateWidth, gateHeight, 0.5);
    const gate = new THREE.Mesh(gateGeometry, darkStoneMaterial);
    gate.position.set(0, -1.5, -3.2);
    gate.castShadow = true;
    castleGroup.add(gate);
    
    // Gate arch - top curved part
    const archGeometry = new THREE.CylinderGeometry(gateWidth / 2, gateWidth / 2, 0.5, 8, 1, true);
    const arch = new THREE.Mesh(archGeometry, stoneMaterial);
    arch.rotation.z = Math.PI / 2;
    arch.position.set(0, 0.5, -3.2);
    arch.castShadow = true;
    castleGroup.add(arch);
    
    // Battlements on top of main structure
    const battlementWidth = 0.4;
    const battlementHeight = 1;
    const battlementSpacing = 1.2;
    
    for (let i = -3; i <= 3; i++) {
        const battlementGeometry = new THREE.BoxGeometry(battlementWidth, battlementHeight, battlementWidth);
        const battlement = new THREE.Mesh(battlementGeometry, stoneMaterial);
        battlement.position.set(i * battlementSpacing, 3.5, -4);
        battlement.castShadow = true;
        castleGroup.add(battlement);
    }
    
    // Side battlements
    for (let i = -2; i <= 2; i++) {
        const battlementGeometry = new THREE.BoxGeometry(battlementWidth, battlementHeight, battlementWidth);
        const battlement = new THREE.Mesh(battlementGeometry, stoneMaterial);
        battlement.position.set(4.2, 3.5, i * battlementSpacing);
        battlement.castShadow = true;
        castleGroup.add(battlement);
    }
    
    // Windows on towers
    const windowGeometry = new THREE.BoxGeometry(0.6, 0.6, 0.2);
    const windowMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0,
        roughness: 1
    });
    
    towerPositions.forEach(pos => {
        for (let i = 0; i < 3; i++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(pos[0] + 1.3, -2 + i * 2, pos[2]);
            castleGroup.add(window);
        }
    });
    
    // Central tower windows
    for (let i = 0; i < 4; i++) {
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(1.8, -3 + i * 2.5, 0);
        castleGroup.add(window);
    }
    
    return castleGroup;
}

// Create a shipwreck decoration
function createShip() {
    const shipGroup = new THREE.Group();
    
    // Ship material - weathered wood
    const woodMaterial = new THREE.MeshStandardMaterial({
        color: 0x8B4513,
        metalness: 0.1,
        roughness: 0.8
    });
    
    const darkWoodMaterial = new THREE.MeshStandardMaterial({
        color: 0x654321,
        metalness: 0.05,
        roughness: 0.9
    });
    
    // Main ship hull - boat shaped
    const hullGeometry = new THREE.BoxGeometry(8, 3, 4);
    const hull = new THREE.Mesh(hullGeometry, woodMaterial);
    hull.position.y = 0;
    hull.castShadow = true;
    hull.receiveShadow = true;
    shipGroup.add(hull);
    
    // Ship bow - pointed front
    const bowGeometry = new THREE.ConeGeometry(2, 3, 8);
    const bow = new THREE.Mesh(bowGeometry, darkWoodMaterial);
    bow.position.set(4.5, 0, 0);
    bow.rotation.z = Math.PI / 2;
    bow.castShadow = true;
    shipGroup.add(bow);
    
    // Ship stern - back part
    const sternGeometry = new THREE.BoxGeometry(2, 3, 4);
    const stern = new THREE.Mesh(sternGeometry, woodMaterial);
    stern.position.set(-4.5, 0, 0);
    stern.castShadow = true;
    stern.receiveShadow = true;
    shipGroup.add(stern);
    
    // Main mast - tall wooden pole
    const mastGeometry = new THREE.CylinderGeometry(0.3, 0.3, 8, 8);
    const mast = new THREE.Mesh(mastGeometry, darkWoodMaterial);
    mast.position.set(0, 4, 0);
    mast.castShadow = true;
    mast.receiveShadow = true;
    shipGroup.add(mast);
    
    // Sail - tattered cloth
    const sailGeometry = new THREE.PlaneGeometry(4, 5);
    const sailMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0,
        roughness: 0.7,
        side: THREE.DoubleSide
    });
    const sail = new THREE.Mesh(sailGeometry, sailMaterial);
    sail.position.set(1, 3, 1.5);
    sail.rotation.y = Math.PI / 6;
    sail.castShadow = true;
    shipGroup.add(sail);
    
    // Cabin - small structure on deck
    const cabinGeometry = new THREE.BoxGeometry(2, 2, 2);
    const cabin = new THREE.Mesh(cabinGeometry, woodMaterial);
    cabin.position.set(-1.5, 1.5, 0);
    cabin.castShadow = true;
    cabin.receiveShadow = true;
    shipGroup.add(cabin);
    
    // Cabin roof - peaked
    const roofGeometry = new THREE.ConeGeometry(1.5, 1, 4);
    const roof = new THREE.Mesh(roofGeometry, darkWoodMaterial);
    roof.position.set(-1.5, 2.5, 0);
    roof.castShadow = true;
    shipGroup.add(roof);
    
    // Anchor - hanging from side
    const anchorGeometry = new THREE.BoxGeometry(0.4, 1.5, 0.4);
    const anchor = new THREE.Mesh(anchorGeometry, new THREE.MeshStandardMaterial({
        color: 0x444444,
        metalness: 0.8,
        roughness: 0.3
    }));
    anchor.position.set(4, 1, 2);
    anchor.castShadow = true;
    shipGroup.add(anchor);
    
    // Anchor chain
    const chainGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 4);
    const chain = new THREE.Mesh(chainGeometry, new THREE.MeshStandardMaterial({
        color: 0x555555,
        metalness: 0.7,
        roughness: 0.4
    }));
    chain.position.set(4, 2.5, 2);
    chain.castShadow = true;
    shipGroup.add(chain);
    
    // Porthole windows
    const portholeGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 16);
    const portholeMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        metalness: 0,
        roughness: 1
    });
    
    for (let i = 0; i < 3; i++) {
        const porthole = new THREE.Mesh(portholeGeometry, portholeMaterial);
        porthole.position.set(-2 + i * 1.5, 0.5, 2.1);
        porthole.rotation.y = Math.PI / 2;
        shipGroup.add(porthole);
    }
    
    // Deck planks - visual detail
    const plankGeometry = new THREE.BoxGeometry(8, 0.2, 0.5);
    const plank1 = new THREE.Mesh(plankGeometry, darkWoodMaterial);
    plank1.position.set(0, 1.5, 1.5);
    shipGroup.add(plank1);
    
    const plank2 = new THREE.Mesh(plankGeometry, darkWoodMaterial);
    plank2.position.set(0, 1.5, -1.5);
    shipGroup.add(plank2);
    
    return shipGroup;
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
// Add ship to the scene
function addShip() {
    // Limit to 3 ships for performance
    if (decorations.filter(d => d.userData && d.userData.isShip).length >= 3) {
        alert('Maximum 3 ships allowed for performance');
        return;
    }
    const ship = createShip();
    ship.userData = { isShip: true };
    const x = Math.random() * 20 - 10;
    const z = Math.random() * 15 - 7.5;
    ship.position.set(x, -13, z);
    scene.add(ship);
    decorations.push(ship);
    updateStats();
}

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
    // Position plant so roots are attached to the bottom of the aquarium (y = -15)
    // Plant roots are at y = -0.25 relative to plant group, so position group at y = -14.75
    plant.position.set(x, -14.75, z);
    scene.add(plant);
    plants.push(plant);
    updateStats();
}

// Add turtle to the scene
function addTurtle() {
    // Limit to 5 turtles for performance
    if (turtles.length >= 5) {
        alert('Maximum 5 turtles allowed for performance');
        return;
    }
    const turtle = createTurtle();
    const x = Math.random() * 30 - 15;
    const y = Math.random() * 8 - 8; // Turtles prefer lower depths
    const z = Math.random() * 20 - 10;
    turtle.position.set(x, y, z);
    scene.add(turtle);
    turtles.push(turtle);
    updateStats();
}

// Add eel to the scene
function addEel() {
    // Limit to 8 eels for performance
    if (eels.length >= 8) {
        alert('Maximum 8 eels allowed for performance');
        return;
    }
    const eel = createEel();
    const x = Math.random() * 30 - 15;
    const y = Math.random() * 12 - 6; // Eels prefer mid-depth
    const z = Math.random() * 20 - 10;
    eel.position.set(x, y, z);
    scene.add(eel);
    eels.push(eel);
    updateStats();
}

// Add snail to the scene
function addSnail() {
    // Limit to 10 snails for performance
    if (snails.length >= 10) {
        alert('Maximum 10 snails allowed for performance');
        return;
    }
    const snail = createSnail();
    const x = Math.random() * 30 - 15;
    const y = Math.random() * 6 - 10; // Snails prefer lower depths
    const z = Math.random() * 20 - 10;
    snail.position.set(x, y, z);
    scene.add(snail);
    snails.push(snail);
    updateStats();
}

// Remove fish from the scene
function removeFish() {
    if (fish.length === 0) {
        alert('No fish to remove');
        return;
    }
    const fishToRemove = fish.pop();
    scene.remove(fishToRemove);
    updateStats();
}

// Remove plant from the scene
function removePlant() {
    if (plants.length === 0) {
        alert('No plants to remove');
        return;
    }
    const plantToRemove = plants.pop();
    scene.remove(plantToRemove);
    updateStats();
}

// Remove turtle from the scene
function removeTurtle() {
    if (turtles.length === 0) {
        alert('No turtles to remove');
        return;
    }
    const turtleToRemove = turtles.pop();
    scene.remove(turtleToRemove);
    updateStats();
}

// Remove eel from the scene
function removeEel() {
    if (eels.length === 0) {
        alert('No eels to remove');
        return;
    }
    const eelToRemove = eels.pop();
    scene.remove(eelToRemove);
    updateStats();
}

// Remove snail from the scene
function removeSnail() {
    if (snails.length === 0) {
        alert('No snails to remove');
        return;
    }
    const snailToRemove = snails.pop();
    scene.remove(snailToRemove);
    updateStats();
}

// Remove rock from the scene
function removeRock() {
    // Find the last rock (non-ship decoration)
    let rockIndex = -1;
    for (let i = decorations.length - 1; i >= 0; i--) {
        if (!decorations[i].userData || !decorations[i].userData.isShip) {
            rockIndex = i;
            break;
        }
    }
    
    if (rockIndex === -1) {
        alert('No rocks to remove');
        return;
    }
    
    const rockToRemove = decorations[rockIndex];
    scene.remove(rockToRemove);
    decorations.splice(rockIndex, 1);
    updateStats();
}

// Remove ship from the scene
function removeShip() {
    // Find the last ship decoration
    let shipIndex = -1;
    for (let i = decorations.length - 1; i >= 0; i--) {
        if (decorations[i].userData && decorations[i].userData.isShip) {
            shipIndex = i;
            break;
        }
    }
    
    if (shipIndex === -1) {
        alert('No ships to remove');
        return;
    }
    
    const shipToRemove = decorations[shipIndex];
    scene.remove(shipToRemove);
    decorations.splice(shipIndex, 1);
    updateStats();
}

// Update fish positions and animations
function updateFish() {
    const time = Date.now() * 0.001;
    
    fish.forEach((f, index) => {
        const data = f.userData;

        // Realistic acceleration and deceleration
        const speedVariation = Math.sin(time * 0.5 + index) * 0.005;
        data.targetSpeed = data.baseSpeed + speedVariation;
        data.speed += (data.targetSpeed - data.speed) * 0.05;

        // Schooling behavior - fish tend to move together
        if (schoolingEnabled && index > 0) {
            const nearbyFish = fish.filter((other, i) => {
                const dist = f.position.distanceTo(other.position);
                return dist < 8 && i !== index;
            });
            
            if (nearbyFish.length > 0) {
                // Average direction of nearby fish
                let avgAngle = 0;
                let avgY = 0;
                nearbyFish.forEach(other => {
                    avgAngle += other.userData.angle;
                    avgY += other.position.y;
                });
                avgAngle /= nearbyFish.length;
                avgY /= nearbyFish.length;
                
                // Gradually align with school
                data.angle += (avgAngle - data.angle) * 0.03;
                
                // Maintain similar depth
                const depthDiff = avgY - f.position.y;
                f.position.y += depthDiff * 0.01;
            }
        }

        // Swimming motion with realistic turning
        const turnRate = 0.015;
        data.angle += (Math.random() - 0.5) * turnRate;
        
        // Move towards depth preference
        const depthDiff = data.depthPreference - f.position.y;
        f.position.y += depthDiff * 0.005;
        
        // Occasionally change depth preference
        if (Math.random() < 0.001) {
            data.depthPreference = Math.random() * 20 - 10;
        }
        
        // Forward movement with realistic speed
        const moveSpeed = data.speed * 2.5;
        f.position.x += Math.cos(data.angle) * moveSpeed;
        f.position.z += Math.sin(data.angle) * moveSpeed;

        // Gentle bobbing motion
        f.position.y += Math.sin(time * 0.8 + index) * 0.015;

        // Keep fish in bounds with smooth turning, accounting for fish size
        const fishLength = data.bodySize.length;
        const fishRadiusFront = data.bodySize.radiusFront;
        const headSize = data.headSize;
        const tailSize = data.tailSize;
        const finSize = data.finSize || 1.0;
        
        const headExtentZ = fishLength / 2 + headSize * 0.6 + 0.4;
        const tailExtentZ = fishLength / 2 + tailSize.height / 2;
        const fishExtentZ = Math.max(headExtentZ, tailExtentZ) + 0.5;
        
        const pectoralExtentX = fishRadiusFront * 0.8 + finSize * 0.6;
        const fishExtentX = Math.max(fishRadiusFront, pectoralExtentX) + 0.5;
        
        const dorsalExtentY = fishRadiusFront * 0.9 + finSize * 1.8;
        const bodyExtentY = Math.max(fishRadiusFront, headSize * 0.85);
        const fishExtentY = Math.max(dorsalExtentY, bodyExtentY) + 0.5;
        
        const maxX = 20 - fishExtentX;
        const minX = -20 + fishExtentX;
        const maxZ = 15 - fishExtentZ;
        const minZ = -15 + fishExtentZ;
        const maxY = 15 - fishExtentY;
        const minY = -15 + fishExtentY;
        
        // Boundary checking with smooth turning
        if (f.position.x > maxX || f.position.x < minX) {
            data.angle += Math.PI * 0.15;
            f.position.x = Math.max(minX, Math.min(maxX, f.position.x));
        }
        if (f.position.z > maxZ || f.position.z < minZ) {
            data.angle += Math.PI * 0.15;
            f.position.z = Math.max(minZ, Math.min(maxZ, f.position.z));
        }
        if (f.position.y > maxY) {
            f.position.y = maxY;
            data.depthPreference = maxY - 2;
        }
        if (f.position.y < minY) {
            f.position.y = minY;
            data.depthPreference = minY + 2;
        }

        // Enhanced tail animation - more fluid and speed-dependent
        data.tailWave += 0.12 + data.speed * 5;
        const tailWaveAmplitude = 0.3 + data.speed * 10;
        
        // Find tail and animate
        f.children.forEach((child, i) => {
            if (child.geometry && child.geometry.type === 'ConeGeometry') {
                // Check if it's the main tail (larger cone)
                if (child.position.z < 0 && child.scale.x === 1) {
                    child.rotation.y = Math.sin(data.tailWave) * tailWaveAmplitude;
                    child.rotation.z = Math.sin(data.tailWave * 0.7) * tailWaveAmplitude * 0.5;
                }
                // Dorsal fin
                else if (child.position.y > 0 && child.position.z === 0) {
                    child.rotation.z = Math.PI / 2 + Math.sin(data.tailWave * 0.6) * 0.08;
                }
                // Pectoral fins - alternating rowing motion
                else if (child.position.z > 0) {
                    const side = child.position.x > 0 ? 1 : -1;
                    const baseRotation = side > 0 ? Math.PI / 2.5 : -Math.PI / 2.5;
                    child.rotation.z = baseRotation + Math.sin(data.tailWave + side * Math.PI) * 0.4;
                    child.rotation.x = Math.sin(data.tailWave + side * Math.PI) * 0.2;
                }
                // Ventral fins
                else if (child.position.y < 0) {
                    const side = child.position.x > 0 ? 1 : -1;
                    const baseRotation = side > 0 ? Math.PI / 3 : -Math.PI / 3;
                    child.rotation.z = baseRotation + Math.sin(data.tailWave * 0.5) * 0.15;
                }
            }
        });

        // Body undulation - realistic wave motion
        data.bodyWave += 0.08 + data.speed * 3;
        for (let i = 0; i < data.bodySegmentCount; i++) {
            const segment = f.children[i];
            if (segment && segment.geometry && segment.geometry.type === 'SphereGeometry') {
                const phase = data.bodyWave + i * 0.4;
                const amplitude = 0.04 * (i / data.bodySegmentCount);
                segment.rotation.y = Math.sin(phase) * amplitude;
                segment.position.y = Math.sin(phase) * amplitude * 0.5;
            }
        }
        
        // Breathing animation - gill movement
        data.breathingPhase += 0.08;
        const breathingAmount = Math.sin(data.breathingPhase) * 0.15 + 0.15;
        
        for (let i = data.gillStartIndex; i < data.gillStartIndex + 6; i++) {
            const gill = f.children[i];
            if (gill && gill.geometry && gill.geometry.type === 'PlaneGeometry') {
                gill.scale.x = 1 + breathingAmount;
            }
        }

        // Face direction with smooth rotation
        const targetRotation = data.angle;
        const currentRotation = f.rotation.y;
        let rotationDiff = targetRotation - currentRotation;
        
        // Normalize rotation difference to [-PI, PI]
        while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        f.rotation.y += rotationDiff * 0.12;

        // Realistic pitch based on vertical movement and speed
        const verticalVelocity = (f.position.y - (f.userData.lastY || f.position.y));
        f.rotation.x = verticalVelocity * 0.5 + Math.sin(time * 0.5 + index) * 0.05;
        f.userData.lastY = f.position.y;
        
        // Slight roll during turns
        f.rotation.z = Math.sin(rotationDiff) * 0.2;
    });
}

// Update turtle animations and movement
function updateTurtles() {
    const time = Date.now() * 0.001;
    
    turtles.forEach((t, index) => {
        const data = t.userData;
        
        // Slower, more deliberate movement than fish
        const speedVariation = Math.sin(time * 0.3 + index) * 0.002;
        data.targetSpeed = data.baseSpeed + speedVariation;
        data.speed += (data.targetSpeed - data.speed) * 0.03;
        
        // Swimming motion with slower turning
        const turnRate = 0.008;
        data.angle += (Math.random() - 0.5) * turnRate;
        
        // Move towards depth preference
        const depthDiff = data.depthPreference - t.position.y;
        t.position.y += depthDiff * 0.003;
        
        // Occasionally change depth preference
        if (Math.random() < 0.0005) {
            data.depthPreference = Math.random() * 10 - 8;
        }
        
        // Forward movement - slower than fish
        const moveSpeed = data.speed * 1.5;
        t.position.x += Math.cos(data.angle) * moveSpeed;
        t.position.z += Math.sin(data.angle) * moveSpeed;
        
        // Gentle bobbing motion
        t.position.y += Math.sin(time * 0.5 + index) * 0.008;
        
        // Keep turtle in bounds
        const turtleExtentX = 1.5;
        const turtleExtentZ = 1.8;
        const turtleExtentY = 1.0;
        
        const maxX = 20 - turtleExtentX;
        const minX = -20 + turtleExtentX;
        const maxZ = 15 - turtleExtentZ;
        const minZ = -15 + turtleExtentZ;
        const maxY = 15 - turtleExtentY;
        const minY = -13 + turtleExtentY;
        
        // Boundary checking
        if (t.position.x > maxX || t.position.x < minX) {
            data.angle += Math.PI * 0.15;
            t.position.x = Math.max(minX, Math.min(maxX, t.position.x));
        }
        if (t.position.z > maxZ || t.position.z < minZ) {
            data.angle += Math.PI * 0.15;
            t.position.z = Math.max(minZ, Math.min(maxZ, t.position.z));
        }
        if (t.position.y > maxY) {
            t.position.y = maxY;
            data.depthPreference = maxY - 2;
        }
        if (t.position.y < minY) {
            t.position.y = minY;
            data.depthPreference = minY + 1;
        }
        
        // Flipper animation - paddling motion
        data.flipperWave += 0.06 + data.speed * 2;
        
        t.children.forEach((child, i) => {
            // Animate flippers
            if (i >= data.flipperFLIndex && i <= data.flipperBRIndex) {
                const flipperIndex = i - data.flipperFLIndex;
                const side = flipperIndex % 2 === 0 ? 1 : -1;
                const isBack = flipperIndex >= 2;
                const baseRotation = side > 0 ? Math.PI / 4 : -Math.PI / 4;
                
                child.rotation.z = baseRotation + Math.sin(data.flipperWave + side * Math.PI) * 0.3;
                child.rotation.x = Math.sin(data.flipperWave + side * Math.PI) * 0.15;
            }
            
            // Head bobbing
            if (i === data.headIndex) {
                data.headBob += 0.04;
                child.position.y = 0.3 + Math.sin(data.headBob) * 0.1;
            }
            
            // Tail waving
            if (i === data.tailIndex) {
                data.tailWave += 0.08;
                child.rotation.y = Math.sin(data.tailWave) * 0.2;
            }
        });
        
        // Face direction with smooth rotation
        const targetRotation = data.angle;
        const currentRotation = t.rotation.y;
        let rotationDiff = targetRotation - currentRotation;
        
        // Normalize rotation difference to [-PI, PI]
        while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        t.rotation.y += rotationDiff * 0.08;
        
        // Slight pitch based on vertical movement
        const verticalVelocity = (t.position.y - (t.userData.lastY || t.position.y));
        t.rotation.x = verticalVelocity * 0.3 + Math.sin(time * 0.3 + index) * 0.03;
        t.userData.lastY = t.position.y;
    });
}

// Update eel positions and animations
function updateEels() {
    const time = Date.now() * 0.001;
    
    eels.forEach((e, index) => {
        const data = e.userData;
        
        // Sinuous swimming motion - eels move with a wave-like pattern
        const speedVariation = Math.sin(time * 0.4 + index) * 0.003;
        data.targetSpeed = data.baseSpeed + speedVariation;
        data.speed += (data.targetSpeed - data.speed) * 0.04;
        
        // Swimming motion with smooth turning
        const turnRate = 0.012;
        data.angle += (Math.random() - 0.5) * turnRate;
        
        // Move towards depth preference
        const depthDiff = data.depthPreference - e.position.y;
        e.position.y += depthDiff * 0.004;
        
        // Occasionally change depth preference
        if (Math.random() < 0.0008) {
            data.depthPreference = Math.random() * 15 - 6;
        }
        
        // Forward movement
        const moveSpeed = data.speed * 1.8;
        e.position.x += Math.cos(data.angle) * moveSpeed;
        e.position.z += Math.sin(data.angle) * moveSpeed;
        
        // Gentle bobbing motion
        e.position.y += Math.sin(time * 0.6 + index) * 0.01;
        
        // Keep eel in bounds
        const eelExtentX = 1.5;
        const eelExtentZ = 2.0;
        const eelExtentY = 1.0;
        
        const maxX = 20 - eelExtentX;
        const minX = -20 + eelExtentX;
        const maxZ = 15 - eelExtentZ;
        const minZ = -15 + eelExtentZ;
        const maxY = 15 - eelExtentY;
        const minY = -13 + eelExtentY;
        
        // Boundary checking
        if (e.position.x > maxX || e.position.x < minX) {
            data.angle += Math.PI * 0.2;
            e.position.x = Math.max(minX, Math.min(maxX, e.position.x));
        }
        if (e.position.z > maxZ || e.position.z < minZ) {
            data.angle += Math.PI * 0.2;
            e.position.z = Math.max(minZ, Math.min(maxZ, e.position.z));
        }
        if (e.position.y > maxY) {
            e.position.y = maxY;
            data.depthPreference = maxY - 2;
        }
        if (e.position.y < minY) {
            e.position.y = minY;
            data.depthPreference = minY + 1;
        }
        
        // Body wave animation - creates sinuous swimming motion
        data.bodyWave += 0.08 + data.speed * 2.5;
        data.tailWave += 0.12 + data.speed * 3;
        
        e.children.forEach((child, i) => {
            // Animate body segments with wave motion
            if (i < data.segmentCount) {
                const segmentIndex = i;
                const t = segmentIndex / (data.segmentCount - 1);
                const waveOffset = data.bodyWave - t * Math.PI * 2;
                
                // Lateral wave motion
                child.position.x = Math.sin(waveOffset) * 0.3 * (1 - t);
                child.position.y = Math.cos(waveOffset * 0.5) * 0.15 * (1 - t);
                
                // Rotation for body segments
                child.rotation.z = Math.sin(waveOffset) * 0.15 * (1 - t);
                child.rotation.x = Math.sin(waveOffset * 0.7) * 0.1 * (1 - t);
            }
            
            // Tail fin animation
            if (i === data.segmentCount + 3) { // Tail is after head and eyes
                child.rotation.y = Math.sin(data.tailWave) * 0.3;
                child.rotation.z = Math.cos(data.tailWave) * 0.15;
            }
        });
        
        // Face direction with smooth rotation
        const targetRotation = data.angle;
        const currentRotation = e.rotation.y;
        let rotationDiff = targetRotation - currentRotation;
        
        // Normalize rotation difference to [-PI, PI]
        while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        e.rotation.y += rotationDiff * 0.1;
        
        // Pitch based on vertical movement
        const verticalVelocity = (e.position.y - (e.userData.lastY || e.position.y));
        e.rotation.x = verticalVelocity * 0.4 + Math.sin(time * 0.4 + index) * 0.04;
        e.userData.lastY = e.position.y;
    });
}

// Update snail positions and animations
function updateSnails() {
    const time = Date.now() * 0.001;
    
    snails.forEach((s, index) => {
        const data = s.userData;
        
        // Very slow, deliberate movement - snails are slow
        const speedVariation = Math.sin(time * 0.2 + index) * 0.0005;
        data.targetSpeed = data.baseSpeed + speedVariation;
        data.speed += (data.targetSpeed - data.speed) * 0.02;
        
        // Slow turning
        const turnRate = 0.004;
        data.angle += (Math.random() - 0.5) * turnRate;
        
        // Move towards depth preference
        const depthDiff = data.depthPreference - s.position.y;
        s.position.y += depthDiff * 0.002;
        
        // Occasionally change depth preference (rarely)
        if (Math.random() < 0.0002) {
            data.depthPreference = Math.random() * 6 - 10;
        }
        
        // Forward movement - very slow
        const moveSpeed = data.speed * 1.2;
        s.position.x += Math.cos(data.angle) * moveSpeed;
        s.position.z += Math.sin(data.angle) * moveSpeed;
        
        // Very gentle bobbing motion
        s.position.y += Math.sin(time * 0.3 + index) * 0.003;
        
        // Keep snail in bounds
        const snailExtentX = 0.8;
        const snailExtentZ = 1.0;
        const snailExtentY = 0.8;
        
        const maxX = 20 - snailExtentX;
        const minX = -20 + snailExtentX;
        const maxZ = 15 - snailExtentZ;
        const minZ = -15 + snailExtentZ;
        const maxY = 15 - snailExtentY;
        const minY = -13 + snailExtentY;
        
        // Boundary checking
        if (s.position.x > maxX || s.position.x < minX) {
            data.angle += Math.PI * 0.1;
            s.position.x = Math.max(minX, Math.min(maxX, s.position.x));
        }
        if (s.position.z > maxZ || s.position.z < minZ) {
            data.angle += Math.PI * 0.1;
            s.position.z = Math.max(minZ, Math.min(maxZ, s.position.z));
        }
        if (s.position.y > maxY) {
            s.position.y = maxY;
            data.depthPreference = maxY - 2;
        }
        if (s.position.y < minY) {
            s.position.y = minY;
            data.depthPreference = minY + 1;
        }
        
        // Tentacle wave animation
        data.tentacleWave += 0.04 + data.speed * 1.5;
        data.headBob += 0.03;
        
        // Animate tentacles and head
        s.children.forEach((child, i) => {
            // Upper left tentacle
            if (i === data.tentacleLeftIndex) {
                child.rotation.z = Math.PI / 3 + Math.sin(data.tentacleWave) * 0.15;
            }
            
            // Upper right tentacle
            if (i === data.tentacleRightIndex) {
                child.rotation.z = -Math.PI / 3 + Math.sin(data.tentacleWave + Math.PI) * 0.15;
            }
            
            // Lower left tentacle
            if (i === data.tentacleLowerLeftIndex) {
                child.rotation.z = Math.PI / 4 + Math.sin(data.tentacleWave + Math.PI / 2) * 0.1;
            }
            
            // Lower right tentacle
            if (i === data.tentacleLowerRightIndex) {
                child.rotation.z = -Math.PI / 4 + Math.sin(data.tentacleWave + Math.PI * 1.5) * 0.1;
            }
        });
        
        // Face direction with smooth rotation
        const targetRotation = data.angle;
        const currentRotation = s.rotation.y;
        let rotationDiff = targetRotation - currentRotation;
        
        // Normalize rotation difference to [-PI, PI]
        while (rotationDiff > Math.PI) rotationDiff -= Math.PI * 2;
        while (rotationDiff < -Math.PI) rotationDiff += Math.PI * 2;
        
        s.rotation.y += rotationDiff * 0.05;
        
        // Slight pitch based on vertical movement
        const verticalVelocity = (s.position.y - (s.userData.lastY || s.position.y));
        s.rotation.x = verticalVelocity * 0.2 + Math.sin(time * 0.2 + index) * 0.02;
        s.userData.lastY = s.position.y;
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
    updateTurtles();
    updateEels();
    updateSnails();
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
    
    // Remove all turtles
    turtles.forEach(t => scene.remove(t));
    turtles = [];
    
    // Remove all eels
    eels.forEach(e => scene.remove(e));
    eels = [];
    
    // Remove all snails
    snails.forEach(s => scene.remove(s));
    snails = [];
    
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
    document.getElementById('turtleCount').textContent = turtles.length;
    document.getElementById('eelCount').textContent = eels.length;
    document.getElementById('snailCount').textContent = snails.length;
    document.getElementById('plantCount').textContent = plants.length;
    const shipCount = decorations.filter(d => d.userData && d.userData.isShip).length;
    const rockCount = decorations.length - shipCount;
    document.getElementById('rockCount').textContent = rockCount;
    document.getElementById('shipCount').textContent = shipCount;
    document.getElementById('bubbleCount').textContent = bubbles.length;
}

// Start the application
window.addEventListener('DOMContentLoaded', init);
