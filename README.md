# 🐠 3D Aquarium

A beautiful, interactive 3D aquarium built with Three.js featuring realistic fish, aquatic plants, and gravel flooring.

## Features

### Visual Elements
- **Realistic 3D Environment**: Glass aquarium with proper lighting and shadows
- **Five Fish Species**: Goldfish, Tropical, Angelfish, Koi, and Default - each with unique colors and proportions
- **Highly Detailed Fish**: 
  - Multi-segment ellipsoid bodies for smooth, organic shapes
  - Realistic eyes with white sclera and black pupils
  - Detailed mouth geometry
  - Forked tail fins with curved shapes
  - Dorsal, pectoral, and ventral fins
  - Subtle scale patterns with stripes
  - Specular highlights and shininess
- **Advanced Fish Animations**:
  - Body undulation (all 5 segments wave naturally)
  - Multi-axis tail movement
  - Alternating pectoral fin motion
  - Dorsal fin sway
  - Vertical bobbing
  - Smooth rotation and pitch adjustment
- **Aquatic Plants**: Swaying plants with stems, leaves, and roots anchored to the gravel floor
- **Gravel Floor**: Textured sand/gravel bottom with realistic procedurally-generated appearance
- **Decorative Rocks**: Randomly shaped rocks for natural aquarium decoration
- **Bubble Effects**: Rising bubbles with wobble motion and fade effects
- **Fish Schooling**: Fish naturally group together and swim in coordinated patterns

### Interaction
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

#### Fish (5 Species)
- **Goldfish**: Orange/gold coloring with larger body
- **Tropical**: Vibrant random colors with medium size
- **Angelfish**: Blue with tall fins and compressed body
- **Koi**: White with orange accents, largest species
- **Default**: Colorful general fish with balanced proportions

Each fish features:
- Multi-segment ellipsoid body (5 overlapping spheres)
- Realistic eyes with white sclera and black pupils
- Detailed mouth geometry
- Forked tail fin with curved shape
- Dorsal fin on top
- Pectoral fins on sides (animated alternately)
- Ventral fin on bottom
- Subtle scale patterns with stripes
- Specular highlights (shininess: 60-120)
- Swimming AI with boundary detection and smooth turning
- Body undulation animation (all segments wave)
- Multi-axis tail and fin animations
- Vertical bobbing and pitch adjustment
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
- More fish species with unique behaviors
- Coral and rock formations with more variety
- Additional particle effects (water ripples, food particles)
- Sound effects and background music
- Save/load aquarium state
- Mobile touch controls
- VR support
- Day/night cycle
- Feeding interaction

## License

Open source - feel free to use and modify!
