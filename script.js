const urls = {
    random: 'https://picsum.photos/600/400',
};

const imageContainer = document.getElementById('image-container');
const medianСontainer = document.getElementById('median-container');
const kMeansСontainer = document.getElementById('k-means-container');
const controls = {
    randomButton: document.getElementById('control-random'),
    uploadButton: document.getElementById('control-upload'),
    fileInput: document.getElementById('file-input'),
}

function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'absolute';
    textarea.style.left = '-9999px';
    textarea.style.opacity = 0;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
};

function loadImage(url, onSuccess) {
    const imageElement = new Image();
    imageElement.crossOrigin = '*';
    imageElement.onload = function () {
        onSuccess(this);
    }
    imageElement.src = url;
    imageContainer.innerHTML = '';
    imageContainer.appendChild(imageElement);
}

function loadImagePixels(url, onSuccess) {
    loadImage(url, (image) => {
        const width = image.naturalWidth;
        const height = image.naturalHeight;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        const imageData = ctx.getImageData(0, 0, width, height);

        const pixels = [];
        const countPixels = imageData.width * imageData.height;

        const ratioCuntPixels = 600 * 400;
        const ratio = Math.min(Math.floor(countPixels / ratioCuntPixels), 5);
        const pixelStep = Math.pow(2, ratio);

        for (let x = 0; x < countPixels; x += pixelStep) {
            const index = x * 4;
            pixels.push([
                imageData.data[index],
                imageData.data[index + 1],
                imageData.data[index + 2],
            ]);
        }

        onSuccess(pixels);
    });
}

function getAverageClusterColor(cluster) {
    return cluster
        .reduce((sum, pixel) => {
            return sum.map((value, index) => value + pixel[index]);
        }, [0, 0, 0])
        .map(value => Math.floor(value / cluster.length));
}

function getHexColor(pixel) {
    const hexValue = pixel.map(value => value.toString(16).padStart(2, '0'))
        .join('')
    return `#${hexValue}`;
}

function getRGBColor([r, g, b]) {
    return `rgb(${r}, ${g}, ${b})`;
}

function createColorElement(pixel) {
    const hexString = getHexColor(pixel);
    const rgbString = getRGBColor(pixel);
    const element = document.createElement('div');
    element.addEventListener('click', () => copyToClipboard(hexString));
    element.innerText = hexString;
    element.classList.add('color-item');
    element.style.background = rgbString;

    return element;
}

function updateColors(clusters, containerName) {
    const fragment = document.createDocumentFragment();
    clusters.forEach((cluster, index) => {
        const pixel = getAverageClusterColor(cluster);
        const colorElement = createColorElement(pixel);
        fragment.appendChild(colorElement);

        if (index === 0) {
            document.body.style.background = getHexColor(pixel);
        }
    });

    const container = document.getElementById(containerName);
    container.innerHTML = '';
    container.appendChild(fragment);
}

function generateMedianCut(pixels) {
    const clusters = MedianCutClusterizer.getClusters(pixels, 2);
    updateColors(clusters, 'median-container');
}

function generateKMeansColors(pixels) {
    const clusters = KMeansClusterizer.getClusters(pixels, 4, 1);
    updateColors(clusters, 'k-means-container');
}

function setImage(url) {
    loadImagePixels(url, pixels => {
        // generateMedianCut(pixels);
        generateKMeansColors(pixels);
    });
}

function setRandomImage() {
    const imageLink = `${urls.random}?id=${Math.random() * 999999}`;
    setImage(imageLink);
}

controls.fileInput.addEventListener('change', function() {
    if (this.files && this.files[0]) {
        const url = URL.createObjectURL(this.files[0]);
        setImage(url);
        this.value = '';
    }
});

controls.randomButton.addEventListener('click', () => setRandomImage());
controls.uploadButton.addEventListener('click', () => {
    controls.fileInput.click();
});

setRandomImage();
