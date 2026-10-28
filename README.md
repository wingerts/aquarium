# 🐠 3D Aquarium

A beautiful, interactive 3D aquarium built with Three.js featuring realistic fish, aquatic plants, and gravel flooring.

## Features

- **Realistic 3D Environment**: Glass aquarium with proper lighting and shadows
- **Animated Fish**: Multiple fish with realistic swimming patterns and fin animations
- **Aquatic Plants**: Swaying plants with natural movement
- **Gravel Floor**: Textured sand/gravel bottom with realistic appearance
- **Interactive Controls**:
  - Mouse drag to rotate the view
  - Scroll wheel to zoom in/out
  - Auto-rotate toggle
  - Add more fish and plants dynamically
  - Reset view button

## How to Use

1. Open `index.html` in a modern web browser
2. Interact with the aquarium:
   - **Drag with mouse** to rotate the view
   - **Scroll** to zoom in and out
   - **Click buttons** to add fish, add plants, toggle auto-rotate, or reset the view

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
