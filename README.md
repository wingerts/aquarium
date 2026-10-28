# 🐠 3D Aquarium

A beautiful, interactive 3D aquarium built with Three.js featuring realistic fish, aquatic plants, and gravel flooring.

## Features

- **Realistic 3D Environment**: Glass aquarium with proper lighting and shadows
- **Animated Fish**: Multiple species with realistic swimming patterns, tail and fin animations
- **Aquatic Plants**: Swaying plants with natural movement anchored to the gravel floor
- **Gravel Floor**: Textured sand/gravel bottom with realistic procedurally-generated appearance
- **Decorative Rocks**: Randomly shaped rocks for natural aquarium decoration
- **Bubble Effects**: Rising bubbles with wobble motion and fade effects
- **Fish Schooling**: Fish naturally group together and swim in coordinated patterns
- **Interactive Controls**: Full mouse control with 8 interactive buttons
- **Performance Optimized**: Smooth 60 FPS with shadow mapping and efficient rendering
- **Responsive Design**: Automatically adjusts to window resizing

## How to Run

### Quick Start
1. **Simply open `index.html` in any modern web browser** (Chrome, Firefox, Safari, Edge)
   - No installation required
   - No build process needed
   - No web server required (works directly from file system)

2. The aquarium will automatically load with:
   - 3 fish swimming around
   - 4 aquatic plants
   - 2 decorative rocks
   - Animated bubbles

### Interactive Controls

Once loaded, you can interact with the aquarium:
- **Drag with mouse** to rotate the view around the aquarium
- **Scroll wheel** to zoom in and out
- **Click buttons** to:
  - 🔄 **Auto-Rotate**: Toggle automatic rotation
  - ➕ **Fish**: Add a new fish (up to 20)
  - 🌿 **Plant**: Add a new plant (up to 15)
  - 🪨 **Rock**: Add a decorative rock (up to 10)
  - 💧 **Bubbles**: Toggle bubble effects
  - 🐟 **Schooling**: Toggle fish schooling behavior
  - 🔍 **Reset View**: Return camera to default position
  - 🗑️ **Clear All**: Remove all fish, plants, and rocks

## Technical Details

### Technologies Used
- **Three.js**: 3D graphics library for WebGL rendering
- **HTML5 Canvas**: For procedural gravel texture generation
- **WebGL**: Hardware-accelerated 3D graphics

### Components

#### Aquarium Structure
- Glass walls with transparency and reflections
- Textured gravel floor with procedurally generated particles
- Dark frame around the edges
- Water surface effect at the top

#### Fish
- Procedurally generated with random colors
- Realistic body, head, tail, and fins
- Swimming AI with boundary detection
- Tail and fin animations
- Shadow casting for depth

#### Plants
- Stem with multiple leaves
- Root system anchored to the floor
- Swaying animation based on sine waves
- Natural green coloring

#### Lighting
- Ambient lighting for overall illumination
- Directional light (sun) with shadow mapping
- Point light inside the aquarium for underwater effect
- Fog for atmospheric depth

## Browser Compatibility

Works on all modern browsers that support:
- WebGL
- ES6 JavaScript
- HTML5 Canvas

## Performance

The aquarium is optimized for smooth performance:
- Shadow mapping for realistic lighting
- Efficient mesh generation
- Smooth 60 FPS animation
- Responsive to window resizing

## Future Enhancements

Potential features for future versions:
- Different fish species with unique behaviors
- Coral and rock formations
- Particle effects (bubbles, water ripples)
- Sound effects and background music
- Save/load aquarium state
- Mobile touch controls
- VR support

## License

Open source - feel free to use and modify!
