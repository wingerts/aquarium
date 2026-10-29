#!/usr/bin/env python3
# Read the file
with open('aquarium.js', 'r') as f:
    content = f.read()

# Find the position to insert the ship (after castle)
search_str = '''    // Add castle to the bottom of the aquarium
    const castle = createCastle();
    castle.position.set(0, -13, 0);
    scene.add(castle);
    
    // Start bubble generation'''

replace_str = '''    // Add castle to the bottom of the aquarium
    const castle = createCastle();
    castle.position.set(0, -13, 0);
    scene.add(castle);
    
    // Add ship to the bottom of the aquarium
    const ship = createShip();
    ship.userData = { isShip: true };
    ship.position.set(8, -13, -8);
    scene.add(ship);
    decorations.push(ship);
    
    // Start bubble generation'''

if search_str not in content:
    print("Could not find insertion point")
else:
    # Replace
    new_content = content.replace(search_str, replace_str)
    
    # Write back
    with open('aquarium.js', 'w') as f:
        f.write(new_content)
    
    print("Ship added to init function successfully")
