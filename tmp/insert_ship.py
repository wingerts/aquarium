#!/usr/bin/env python3
# Read the file
with open('aquarium.js', 'r') as f:
    content = f.read()

# Find the position to insert the ship function (before createRock)
insert_pos = content.find('// Create a rock decoration\nfunction createRock()')

if insert_pos == -1:
    print("Could not find insertion point")
else:
    # Ship function code
    ship_function = '''// Create a shipwreck decoration
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

'''
    
    # Insert the function
    new_content = content[:insert_pos] + ship_function + content[insert_pos:]
    
    # Write back
    with open('aquarium.js', 'w') as f:
        f.write(new_content)
    
    print("Ship function inserted successfully")
