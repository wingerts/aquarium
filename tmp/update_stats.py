#!/usr/bin/env python3
# Read the file
with open('aquarium.js', 'r') as f:
    content = f.read()

# Find and replace the updateStats function
old_stats = '''function updateStats() {
    document.getElementById('fishCount').textContent = fish.length;
    document.getElementById('turtleCount').textContent = turtles.length;
    document.getElementById('plantCount').textContent = plants.length;
    document.getElementById('rockCount').textContent = decorations.length;
    document.getElementById('bubbleCount').textContent = bubbles.length;
}'''

new_stats = '''function updateStats() {
    document.getElementById('fishCount').textContent = fish.length;
    document.getElementById('turtleCount').textContent = turtles.length;
    document.getElementById('plantCount').textContent = plants.length;
    const shipCount = decorations.filter(d => d.userData && d.userData.isShip).length;
    const rockCount = decorations.length - shipCount;
    document.getElementById('rockCount').textContent = rockCount;
    document.getElementById('shipCount').textContent = shipCount;
    document.getElementById('bubbleCount').textContent = bubbles.length;
}'''

if old_stats not in content:
    print("Could not find updateStats function")
else:
    # Replace
    new_content = content.replace(old_stats, new_stats)
    
    # Write back
    with open('aquarium.js', 'w') as f:
        f.write(new_content)
    
    print("updateStats function updated successfully")
