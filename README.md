# aquarium

A simple aquarium simulation with plants attached to the aquarium bottom.

## Features

- **Plants attached to bottom**: All plants are positioned at the bottom of the aquarium using `bottom: 0` CSS positioning
- **Swaying animation**: Plants gently sway to simulate water movement
- **Swimming fish**: Animated fish that swim back and forth
- **Responsive design**: Clean and visually appealing aquarium display

## Files

- `aquarium.html` - Main HTML structure
- `style.css` - Styling with plants anchored to the bottom
- `aquarium.js` - JavaScript for aquarium initialization and plant management

## How to Run

Simply open `aquarium.html` in a web browser to view the aquarium simulation.

## Plant Positioning

All plants use `position: absolute` with `bottom: 0` to ensure they are firmly attached to the aquarium bottom. The `transform-origin: bottom center` ensures that swaying animations pivot from the base of the plant, maintaining the attachment point.
