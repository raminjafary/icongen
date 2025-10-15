/**
 * Browser Vanilla JavaScript Example for IconGen Icons
 * 
 * This example demonstrates how to use IconGen Icons in a browser environment
 * with vanilla JavaScript, including dynamic icon loading, sprite usage,
 * and programmatic icon management.
 */

// Import sprite utilities (in a real application, this would be a proper import)
// For this example, we'll define the utilities inline
const SPRITE_URL = './dist/sprite/icongen-sprite-0d9087cc0f.svg';

function getSpriteIconHref(iconName) {
  return `${SPRITE_URL}#${iconName}`;
}

// Icon data - using the actual generated icon names from the SVG files
const iconData = [
    { name: 'Home', class: 'icongen-icons-home', spriteId: 'Home' },
    { name: 'Search', class: 'icongen-icons-search', spriteId: 'Search' },
    { name: 'user', class: 'icongen-icons-user', spriteId: 'user' },
    { name: 'Bell', class: 'icongen-icons-bell', spriteId: 'Bell' },
    { name: 'Calendar', class: 'icongen-icons-calendar', spriteId: 'Calendar' },
    { name: 'Location', class: 'icongen-icons-location', spriteId: 'Location' },
    { name: 'Money', class: 'icongen-icons-money', spriteId: 'Money' },
    { name: 'Train', class: 'icongen-icons-train', spriteId: 'Train' },
    { name: 'Hotel', class: 'icongen-icons-hotel', spriteId: 'Hotel' },
    { name: 'Journey', class: 'icongen-icons-journey', spriteId: 'Journey' },
    { name: 'Checkmark', class: 'icongen-icons-checkmark', spriteId: 'Checkmark' },
    { name: 'Close', class: 'icongen-icons-close', spriteId: 'Close' },
    { name: 'Plus', class: 'icongen-icons-plus', spriteId: 'Plus' },
    { name: 'Minus', class: 'icongen-icons-minus', spriteId: 'Minus' },
    { name: 'Arrow---Up', class: 'icongen-icons-arrow-up', spriteId: 'Arrow---Up' },
    { name: 'Arrow---Down', class: 'icongen-icons-arrow-down', spriteId: 'Arrow---Down' },
    { name: 'Arrow---Left', class: 'icongen-icons-arrow-left', spriteId: 'Arrow---Left' },
    { name: 'Arrow---Right', class: 'icongen-icons-arrow-right', spriteId: 'Arrow---Right' },
    { name: 'Chevron Up', class: 'icongen-icons-chevron-up', spriteId: 'Chevron Up' },
    { name: 'Chevron Down', class: 'icongen-icons-chevron-down', spriteId: 'Chevron Down' },
    { name: 'Chevron Left', class: 'icongen-icons-chevron-left', spriteId: 'Chevron Left' },
    { name: 'Chevron Right', class: 'icongen-icons-chevron-right', spriteId: 'Chevron Right' }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 IconGen Icons Browser Example Initialized');
    loadIconFont();
    loadSpriteIcons();
});

/**
 * Load and display icon font icons
 */
function loadIconFont() {
    const iconGrid = document.getElementById('iconGrid');
    
    // Create icon items for the font-based icons
    iconData.slice(0, 12).forEach(icon => {
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item';
        
        iconItem.innerHTML = `
            <i class="${icon.class}"></i>
            <span>${icon.name}</span>
        `;
        
        iconGrid.appendChild(iconItem);
    });
    
    console.log('✅ Icon font loaded');
}

/**
 * Load and display sprite-based icons
 */
function loadSpriteIcons() {
    const spriteGrid = document.getElementById('spriteGrid');
    
    // Create sprite icon items
    iconData.slice(12, 24).forEach(icon => {
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item';
        
        iconItem.innerHTML = `
            <svg class="icon" width="24" height="24" viewBox="0 0 24 24">
                <use href="${getSpriteIconHref(icon.spriteId)}"></use>
            </svg>
            <span>${icon.name}</span>
        `;
        
        spriteGrid.appendChild(iconItem);
    });
    
    console.log('✅ Sprite icons loaded');
}

/**
 * Load random icons dynamically
 */
function loadRandomIcons() {
    const dynamicGrid = document.getElementById('dynamicGrid');
    const status = document.getElementById('status');
    
    // Clear existing icons
    dynamicGrid.innerHTML = '';
    
    // Get random icons
    const randomIcons = iconData.sort(() => 0.5 - Math.random()).slice(0, 6);
    
    randomIcons.forEach(icon => {
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item';
        
        iconItem.innerHTML = `
            <i class="${icon.class}"></i>
            <span>${icon.name}</span>
        `;
        
        dynamicGrid.appendChild(iconItem);
    });
    
    status.innerHTML = '<div class="status success">✅ Random icons loaded successfully!</div>';
    console.log('✅ Random icons loaded');
}

/**
 * Load all available icons
 */
function loadAllIcons() {
    const dynamicGrid = document.getElementById('dynamicGrid');
    const status = document.getElementById('status');
    
    // Clear existing icons
    dynamicGrid.innerHTML = '';
    
    // Load all icons
    iconData.forEach(icon => {
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item';
        
        iconItem.innerHTML = `
            <i class="${icon.class}"></i>
            <span>${icon.name}</span>
        `;
        
        dynamicGrid.appendChild(iconItem);
    });
    
    status.innerHTML = '<div class="status success">✅ All icons loaded successfully!</div>';
    console.log('✅ All icons loaded');
}

/**
 * Clear all dynamic icons
 */
function clearIcons() {
    const dynamicGrid = document.getElementById('dynamicGrid');
    const status = document.getElementById('status');
    
    dynamicGrid.innerHTML = '';
    status.innerHTML = '<div class="status info">ℹ️ Icons cleared</div>';
    console.log('✅ Icons cleared');
}

/**
 * Simulate icon optimization
 */
function optimizeIcons() {
    const apiStatus = document.getElementById('apiStatus');
    const apiOutput = document.getElementById('apiOutput');
    
    apiStatus.innerHTML = '<div class="status info">⚡ Optimizing icons...</div>';
    
    // Simulate optimization process
    setTimeout(() => {
        apiStatus.innerHTML = '<div class="status success">✅ Icons optimized successfully!</div>';
        apiOutput.innerHTML = `
<pre>Optimization Results:
- Removed unnecessary attributes: 15
- Optimized paths: 22
- Reduced file size: 23%
- Generated optimized sprites: 3
- Created font files: 4 formats

Generated files:
- ./optimized/icons.svg
- ./optimized/sprite.svg
- ./fonts/icongen-icons.woff2
- ./fonts/icongen-icons.woff
- ./fonts/icongen-icons.ttf
- ./fonts/icongen-icons.eot</pre>`;
        console.log('✅ Icons optimized');
    }, 2000);
}

/**
 * Simulate sprite generation
 */
function generateSprite() {
    const apiStatus = document.getElementById('apiStatus');
    const apiOutput = document.getElementById('apiOutput');
    
    apiStatus.innerHTML = '<div class="status info">🎨 Generating sprite...</div>';
    
    // Simulate sprite generation
    setTimeout(() => {
        apiStatus.innerHTML = '<div class="status success">✅ Sprite generated successfully!</div>';
        apiOutput.innerHTML = `
<pre>Sprite Generation Results:
- Processed icons: 22
- Generated sprite: sprite.svg
- Created CSS: sprite.css
- Optimized size: 18KB
- Generated symbols: 22

Usage:
&lt;svg class="icon"&gt;
  &lt;use href="./sprite/sprite.svg#icon-home"&gt;&lt;/use&gt;
&lt;/svg&gt;</pre>`;
        console.log('✅ Sprite generated');
    }, 1500);
}

/**
 * Simulate icon export
 */
function exportIcons() {
    const apiStatus = document.getElementById('apiStatus');
    const apiOutput = document.getElementById('apiOutput');
    
    apiStatus.innerHTML = '<div class="status info">📤 Exporting icons...</div>';
    
    // Simulate export process
    setTimeout(() => {
        apiStatus.innerHTML = '<div class="status success">✅ Icons exported successfully!</div>';
        apiOutput.innerHTML = `
<pre>Export Results:
- Exported formats: SVG, PNG, ICO
- Generated sizes: 16px, 24px, 32px, 48px, 64px
- Created archive: icons-export.zip
- Total files: 110

Download: <a href="#" onclick="downloadIcons()">icons-export.zip</a></pre>`;
        console.log('✅ Icons exported');
    }, 1000);
}

/**
 * Simulate icon download
 */
function downloadIcons() {
    console.log('📥 Downloading icons...');
    // In a real application, this would trigger an actual download
    alert('Icons download started! (This is a demo)');
}

/**
 * Utility function to create icon elements
 */
function createIconElement(iconName, iconClass, size = 24) {
    const icon = document.createElement('i');
    icon.className = iconClass;
    icon.style.fontSize = `${size}px`;
    return icon;
}

/**
 * Utility function to create sprite icon elements
 */
function createSpriteIcon(iconName, size = 24) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('class', 'icon');
    
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', getSpriteIconHref(iconName));
    
    svg.appendChild(use);
    return svg;
}

// Export functions for global access
window.loadRandomIcons = loadRandomIcons;
window.loadAllIcons = loadAllIcons;
window.clearIcons = clearIcons;
window.optimizeIcons = optimizeIcons;
window.generateSprite = generateSprite;
window.exportIcons = exportIcons;
window.downloadIcons = downloadIcons;
