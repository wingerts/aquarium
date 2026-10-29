#!/usr/bin/env python3
# Read the file
with open('aquarium.js', 'r') as f:
    content = f.read()

# Find the position to insert the addShip function (before addRock)
insert_pos = content.find('function addRock()')

if insert_pos == -1:
    print("Could not find insertion point")
else:
    # addShip function code
    addship_function = '''// Add ship to the scene
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

'''
    
    # Insert the function
    new_content = content[:insert_pos] + addship_function + content[insert_pos:]
    
    # Write back
    with open('aquarium.js', 'w') as f:
        f.write(new_content)
    
    print("addShip function inserted successfully")
