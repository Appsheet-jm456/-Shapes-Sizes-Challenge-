/**
 * Kinetic English Games – Shapes Module
 * SVG shape generation and rendering
 * 
 * @module ShapeRenderer
 */

const ShapeRenderer = (function() {
    'use strict';

    /**
     * Shape definitions with their properties
     */
    const SHAPES = {
        circle: {
            name: 'circle',
            displayName: 'Circle'
        },
        square: {
            name: 'square',
            displayName: 'Square'
        },
        triangle: {
            name: 'triangle',
            displayName: 'Triangle'
        },
        rectangle: {
            name: 'rectangle',
            displayName: 'Rectangle'
        },
        oval: {
            name: 'oval',
            displayName: 'Oval'
        },
        star: {
            name: 'star',
            displayName: 'Star'
        },
        hexagon: {
            name: 'hexagon',
            displayName: 'Hexagon'
        }
    };

    /**
     * Color definitions with hex values
     */
    const COLORS = {
        red: '#E74C3C',
        blue: '#3498DB',
        yellow: '#F1C40F',
        green: '#2ECC71',
        pink: '#E91E63',
        orange: '#FF9800',
        purple: '#9B59B6',
        white: '#FFFFFF',
        black: '#2C3E50'
    };

    /**
     * Size definitions with multipliers
     */
    const SIZES = {
        small: { multiplier: 0.6, displayName: 'Small' },
        little: { multiplier: 0.5, displayName: 'Little' },
        medium: { multiplier: 0.85, displayName: 'Medium' },
        large: { multiplier: 1.1, displayName: 'Large' },
        big: { multiplier: 1.2, displayName: 'Big' }
    };

    /** Base size for shapes in pixels */
    const BASE_SIZE = 70;

    /**
     * Get all available shape names
     * @returns {string[]}
     */
    function getShapeNames() {
        return Object.keys(SHAPES);
    }

    /**
     * Get all available color names
     * @returns {string[]}
     */
    function getColorNames() {
        return Object.keys(COLORS);
    }

    /**
     * Get all available size names
     * @returns {string[]}
     */
    function getSizeNames() {
        return Object.keys(SIZES);
    }

    /**
     * Get color hex value
     * @param {string} colorName 
     * @returns {string}
     */
    function getColorHex(colorName) {
        return COLORS[colorName] || COLORS.blue;
    }

    /**
     * Get size display name
     * @param {string} sizeName 
     * @returns {string}
     */
    function getSizeDisplayName(sizeName) {
        return SIZES[sizeName]?.displayName || sizeName;
    }

    /**
     * Get shape display name
     * @param {string} shapeName 
     * @returns {string}
     */
    function getShapeDisplayName(shapeName) {
        return SHAPES[shapeName]?.displayName || shapeName;
    }

    /**
     * Generate SVG for a specific shape
     * @param {string} shapeName - Name of the shape
     * @param {string} colorName - Name of the color
     * @param {string} sizeName - Name of the size
     * @param {boolean} highlight - Whether to add highlight effect
     * @returns {string} SVG element as HTML string
     */
    function createShapeSVG(shapeName, colorName, sizeName, highlight = false) {
        const color = COLORS[colorName] || COLORS.blue;
        const sizeData = SIZES[sizeName] || SIZES.medium;
        const size = Math.round(BASE_SIZE * sizeData.multiplier);
        
        // Determine if shape needs stroke (for white shapes)
        const needsStroke = colorName === 'white';
        const strokeAttr = needsStroke ? 'stroke="#DEE2E6" stroke-width="2"' : '';
        const shadowFilter = highlight ? 'filter: drop-shadow(0 0 10px rgba(61, 216, 230, 0.6));' : '';
        
        let svgContent = '';
        
        switch (shapeName) {
            case 'circle':
                svgContent = `
                    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="shape-item ${highlight ? 'highlight' : ''}" style="${shadowFilter}">
                        <circle cx="50" cy="50" r="45" fill="${color}" ${strokeAttr}/>
                    </svg>
                `;
                break;
                
            case 'square':
                svgContent = `
                    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="shape-item ${highlight ? 'highlight' : ''}" style="${shadowFilter}">
                        <rect x="10" y="10" width="80" height="80" fill="${color}" ${strokeAttr}/>
                    </svg>
                `;
                break;
                
            case 'triangle':
                svgContent = `
                    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="shape-item ${highlight ? 'highlight' : ''}" style="${shadowFilter}">
                        <polygon points="50,10 90,90 10,90" fill="${color}" ${strokeAttr}/>
                    </svg>
                `;
                break;
                
            case 'rectangle':
                svgContent = `
                    <svg width="${Math.round(size * 1.4)}" height="${size}" viewBox="0 0 140 100" class="shape-item ${highlight ? 'highlight' : ''}" style="${shadowFilter}">
                        <rect x="10" y="15" width="120" height="70" fill="${color}" ${strokeAttr}/>
                    </svg>
                `;
                break;
                
            case 'oval':
                svgContent = `
                    <svg width="${Math.round(size * 1.3)}" height="${size}" viewBox="0 0 130 100" class="shape-item ${highlight ? 'highlight' : ''}" style="${shadowFilter}">
                        <ellipse cx="65" cy="50" rx="55" ry="40" fill="${color}" ${strokeAttr}/>
                    </svg>
                `;
                break;
                
            case 'star':
                // 5-pointed star
                svgContent = `
                    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="shape-item ${highlight ? 'highlight' : ''}" style="${shadowFilter}">
                        <polygon points="50,5 61,40 98,40 68,60 79,95 50,75 21,95 32,60 2,40 39,40" fill="${color}" ${strokeAttr}/>
                    </svg>
                `;
                break;
                
            case 'hexagon':
                svgContent = `
                    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="shape-item ${highlight ? 'highlight' : ''}" style="${shadowFilter}">
                        <polygon points="50,5 93,27.5 93,72.5 50,95 7,72.5 7,27.5" fill="${color}" ${strokeAttr}/>
                    </svg>
                `;
                break;
                
            default:
                svgContent = `
                    <svg width="${size}" height="${size}" viewBox="0 0 100 100" class="shape-item">
                        <circle cx="50" cy="50" r="45" fill="${color}" ${strokeAttr}/>
                    </svg>
                `;
        }
        
        return svgContent.trim();
    }

    /**
     * Create a shape object with all properties
     * @param {string} shapeName 
     * @param {string} colorName 
     * @param {string} sizeName 
     * @returns {Object}
     */
    function createShapeObject(shapeName, colorName, sizeName) {
        return {
            shape: shapeName,
            color: colorName,
            size: sizeName,
            svg: createShapeSVG(shapeName, colorName, sizeName)
        };
    }

    /**
     * Render multiple shapes to a container
     * @param {HTMLElement} container - Container element
     * @param {Object[]} shapes - Array of shape objects
     * @param {number} highlightIndex - Index of shape to highlight (-1 for none)
     */
    function renderShapes(container, shapes, highlightIndex = -1) {
        container.innerHTML = '';
        
        shapes.forEach((shape, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'shape-wrapper';
            wrapper.style.display = 'inline-flex';
            wrapper.style.margin = '8px';
            wrapper.innerHTML = createShapeSVG(
                shape.shape, 
                shape.color, 
                shape.size, 
                index === highlightIndex
            );
            container.appendChild(wrapper);
        });
    }

    /**
     * Get a random shape name
     * @returns {string}
     */
    function getRandomShape() {
        const shapes = getShapeNames();
        return shapes[Math.floor(Math.random() * shapes.length)];
    }

    /**
     * Get a random color name
     * @returns {string}
     */
    function getRandomColor() {
        const colors = getColorNames().filter(c => c !== 'white' && c !== 'black');
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * Get a random size name
     * @returns {string}
     */
    function getRandomSize() {
        const sizes = getSizeNames();
        return sizes[Math.floor(Math.random() * sizes.length)];
    }

    // Public API
    return {
        SHAPES,
        COLORS,
        SIZES,
        getShapeNames,
        getColorNames,
        getSizeNames,
        getColorHex,
        getSizeDisplayName,
        getShapeDisplayName,
        createShapeSVG,
        createShapeObject,
        renderShapes,
        getRandomShape,
        getRandomColor,
        getRandomSize
    };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ShapeRenderer;
}
