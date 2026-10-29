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
