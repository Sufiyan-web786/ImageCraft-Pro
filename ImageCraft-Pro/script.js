// DOM Elements
const toolCards = document.querySelectorAll('.tool-card');
const uploadBox = document.getElementById('uploadBox');
const browseBtn = document.getElementById('browseBtn');
const fileInput = document.getElementById('fileInput');
const optionsBox = document.getElementById('optionsBox');
const cancelBtn = document.getElementById('cancelBtn');
const processBtn = document.getElementById('processBtn');
const progressContainer = document.getElementById('progressContainer');
const downloadBox = document.getElementById('downloadBox');
const downloadBtn = document.getElementById('downloadBtn');
const newFileBtn = document.getElementById('newFileBtn');
const imagePreview = document.getElementById('imagePreview');
const resultPreview = document.getElementById('resultPreview');
const converterTitle = document.getElementById('converter-title');
const converterDescription = document.getElementById('converter-description');
const toolOptions = document.getElementById('toolOptions');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const originalSize = document.getElementById('originalSize');
const convertedSize = document.getElementById('convertedSize');
const savedSize = document.getElementById('savedSize');
const savedPercent = document.getElementById('savedPercent');

// Global Variables
let currentTool = null;
let originalFile = null;
let processedFile = null;

// Tool Options Configuration
const toolsConfig = {
    'jpg-to-png': {
        title: 'JPG to PNG Converter',
        description: 'Convert your JPG image to PNG format with transparency support',
        options: `
            <div class="option-group">
                <label for="pngQuality">Quality</label>
                <input type="range" id="pngQuality" min="1" max="100" value="90">
                <span id="qualityValue">90%</span>
            </div>
            <div class="option-group">
                <label for="pngTransparency">Transparent Background</label>
                <select id="pngTransparency">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
        `
    },
    'png-to-jpg': {
        title: 'PNG to JPG Converter',
        description: 'Convert your PNG image to high quality JPG format',
        options: `
            <div class="option-group">
                <label for="jpgQuality">Quality</label>
                <input type="range" id="jpgQuality" min="1" max="100" value="85">
                <span id="qualityValue">85%</span>
            </div>
            <div class="option-group">
                <label for="jpgBackground">Background Color</label>
                <input type="color" id="jpgBackground" value="#ffffff">
            </div>
        `
    },
    'webp-convert': {
        title: 'WebP Converter',
        description: 'Convert your image to WebP format for smaller file sizes',
        options: `
            <div class="option-group">
                <label for="webpQuality">Quality</label>
                <input type="range" id="webpQuality" min="1" max="100" value="80">
                <span id="qualityValue">80%</span>
            </div>
            <div class="option-group">
                <label for="webpLossless">Lossless Compression</label>
                <select id="webpLossless">
                    <option value="false">No</option>
                    <option value="true">Yes</option>
                </select>
            </div>
        `
    },
    'compress': {
        title: 'Image Compressor',
        description: 'Reduce your image file size without noticeable quality loss',
        options: `
            <div class="option-group">
                <label for="compressQuality">Compression Level</label>
                <input type="range" id="compressQuality" min="1" max="100" value="70">
                <span id="qualityValue">70%</span>
            </div>
            <div class="option-group">
                <label for="compressFormat">Output Format</label>
                <select id="compressFormat">
                    <option value="original">Original Format</option>
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                </select>
            </div>
        `
    },
    'resize': {
        title: 'Image Resizer',
        description: 'Resize your image to any dimension while maintaining aspect ratio',
        options: `
            <div class="option-group">
                <label for="resizeWidth">Width (px)</label>
                <input type="number" id="resizeWidth" placeholder="Auto">
            </div>
            <div class="option-group">
                <label for="resizeHeight">Height (px)</label>
                <input type="number" id="resizeHeight" placeholder="Auto">
            </div>
            <div class="option-group">
                <label for="resizeMaintainAspect">Maintain Aspect Ratio</label>
                <select id="resizeMaintainAspect">
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                </select>
            </div>
            <div class="option-group">
                <label for="resizeFormat">Output Format</label>
                <select id="resizeFormat">
                    <option value="original">Original Format</option>
                    <option value="jpg">JPG</option>
                    <option value="png">PNG</option>
                    <option value="webp">WebP</option>
                </select>
            </div>
        `
    }
};

// Event Listeners
toolCards.forEach(card => {
    card.addEventListener('click', () => {
        currentTool = card.getAttribute('data-tool');
        const tool = toolsConfig[currentTool];
        
        converterTitle.textContent = tool.title;
        converterDescription.textContent = tool.description;
        
        // Scroll to converter section
        document.getElementById('converter').scrollIntoView({ behavior: 'smooth' });
    });
});

browseBtn.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', handleFileSelect);
uploadBox.addEventListener('dragover', handleDragOver);
uploadBox.addEventListener('drop', handleDrop);
cancelBtn.addEventListener('click', resetConverter);
processBtn.addEventListener('click', processImage);
downloadBtn.addEventListener('click', downloadImage);
newFileBtn.addEventListener('click', resetConverter);

// Quality slider event delegation
document.addEventListener('input', (e) => {
    if (e.target.id.includes('Quality') || e.target.id.includes('quality')) {
        const valueSpan = e.target.nextElementSibling;
        if (valueSpan && valueSpan.id === 'qualityValue') {
            valueSpan.textContent = `${e.target.value}%`;
        }
    }
});

// Functions
function handleFileSelect(e) {
    const file = e.target.files[0] || (e.dataTransfer && e.dataTransfer.files[0]);
    if (!file) return;
    
    if (!file.type.match('image.*')) {
        alert('Please select an image file.');
        return;
    }
    
    originalFile = file;
    displayImagePreview(file);
}

function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadBox.style.borderColor = var(--primary-color);
    uploadBox.style.backgroundColor = 'rgba(67, 97, 238, 0.1)';
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    uploadBox.style.borderColor = var(--light-gray);
    uploadBox.style.backgroundColor = 'transparent';
    
    const file = e.dataTransfer.files[0];
    if (!file.type.match('image.*')) {
        alert('Please drop an image file.');
        return;
    }
    
    originalFile = file;
    displayImagePreview(file);
}

function displayImagePreview(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        imagePreview.src = e.target.result;
        uploadBox.style.display = 'none';
        optionsBox.style.display = 'flex';
        
        // Set tool-specific options
        if (currentTool && toolsConfig[currentTool]) {
            toolOptions.innerHTML = toolsConfig[currentTool].options;
        }
        
        // Display original file size
        originalSize.textContent = formatFileSize(file.size);
    };
    
    reader.readAsDataURL(file);
}

function processImage() {
    if (!originalFile) return;
    
    optionsBox.style.display = 'none';
    progressContainer.style.display = 'block';
    
    // Simulate processing with progress updates
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress > 100) progress = 100;
        
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}% Complete`;
        
        if (progress === 100) {
            clearInterval(interval);
            setTimeout(() => {
                finishProcessing();
            }, 500);
        }
    }, 200);
}

function finishProcessing() {
    progressContainer.style.display = 'none';
    downloadBox.style.display = 'block';
    
    // In a real app, you would actually process the image here
    // For demo purposes, we'll just use the original image
    processedFile = originalFile;
    
    // Display the result (in real app, this would be the processed image)
    resultPreview.src = imagePreview.src;
    
    // Calculate file sizes (in real app, these would be actual values)
    const originalSizeBytes = originalFile.size;
    const convertedSizeBytes = Math.round(originalSizeBytes * 0.7); // Simulate 30% reduction
    const savedBytes = originalSizeBytes - convertedSizeBytes;
    const savedPercentage = Math.round((savedBytes / originalSizeBytes) * 100);
    
    convertedSize.textContent = formatFileSize(convertedSizeBytes);
    savedSize.textContent = formatFileSize(savedBytes);
    savedPercent.textContent = `${savedPercentage}%`;
}

function downloadImage() {
    if (!processedFile) return;
    
    // Create a temporary link to download the file
    const link = document.createElement('a');
    link.href = resultPreview.src;
    link.download = `converted_${processedFile.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function resetConverter() {
    currentTool = null;
    originalFile = null;
    processedFile = null;
    
    uploadBox.style.display = 'block';
    optionsBox.style.display = 'none';
    progressContainer.style.display = 'none';
    downloadBox.style.display = 'none';
    
    fileInput.value = '';
    imagePreview.src = '';
    resultPreview.src = '';
    
    converterTitle.textContent = 'Select a Tool to Begin';
    converterDescription.textContent = 'Choose from our powerful image tools above';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Initialize
resetConverter();
