// Aquarium simulation with plants attached to the bottom

class Aquarium {
    constructor() {
        this.aquarium = document.getElementById('aquarium');
        this.plants = document.querySelectorAll('.plant');
        this.init();
    }

    init() {
        console.log('Aquarium initialized');
        console.log(`Number of plants attached to bottom: ${this.plants.length}`);
        
        // Verify all plants are attached to the bottom
        this.plants.forEach((plant, index) => {
            const styles = window.getComputedStyle(plant);
            console.log(`Plant ${index + 1}: bottom position = ${styles.bottom}`);
        });
    }

    // Method to add a new plant attached to the bottom
    addPlant(leftPosition, height) {
        const plant = document.createElement('div');
        plant.className = 'plant';
        plant.style.left = `${leftPosition}px`;
        plant.style.height = `${height}px`;
        plant.style.bottom = '0'; // Ensure it's attached to the bottom
        this.aquarium.appendChild(plant);
        console.log(`New plant added at position ${leftPosition}px, attached to bottom`);
    }
}

// Initialize the aquarium when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const aquarium = new Aquarium();
    
    // Example: Add a new plant after 2 seconds
    setTimeout(() => {
        aquarium.addPlant(500, 160);
    }, 2000);
});
