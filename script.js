const urls = {
    random: 'https://picsum.photos/600/400',
};

const containers = {
    content: document.getElementById('content'),
    image: document.getElementById('image-container'),
    colors: document.getElementById('colors-container'),
}
const controls = {
    randomButton: document.getElementById('control-random'),
    uploadButton: document.getElementById('control-upload'),
    medianCutButton: document.getElementById('control-median-cut'),
    kMeansButton: document.getElementById('control-k-means'),
    histogramButton: document.getElementById('control-histogram'),
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
    containers.image.innerHTML = '';
    containers.image.appendChild(imageElement);
}

function getCurrentImage() {
    return containers.image.getElementsByTagName('img')[0];
}

function getImagePixels(image) {
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

    const ratioCountPixels = 600 * 400;
    const ratio = Math.min(Math.floor(countPixels / ratioCountPixels), 5);
    const pixelStep = Math.pow(2, ratio);

    for (let x = 0; x < countPixels; x += pixelStep) {
        const index = x * 4;
        pixels.push([
            imageData.data[index],
            imageData.data[index + 1],
            imageData.data[index + 2],
        ]);
    }

    return pixels;
}

function getAverageClusterColor(cluster) {
    return cluster
        .reduce((sum, pixel) => {
            return sum.map((value, index) => value + pixel[index]);
        }, [0, 0, 0])
        .map(value => Math.floor(value / cluster.length));
}

function getColorLightness([r, g, b]) {
    const cr = r / 255;
    const cg = g / 255;
    const cb = b / 255;

    const cmin = Math.min(cr, cg, cb);
    const cmax = Math.max(cr, cg, cb);

    return (cmax + cmin) / 2;
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
    const colorLightness = getColorLightness(pixel);
    const element = document.createElement('div');
    element.addEventListener('click', () => copyToClipboard(hexString));
    element.innerText = hexString;
    element.style.background = rgbString;
    element.classList.add('color-item');
    colorLightness > 0.5 && element.classList.add('color-item_dark');

    return element;
}

function updateColors(clusters) {
    const fragment = document.createDocumentFragment();
    clusters.forEach((cluster, index) => {
        const pixel = getAverageClusterColor(cluster);
        const colorElement = createColorElement(pixel);
        fragment.appendChild(colorElement);

        if (index === 0) {
            const mainColorHex = getHexColor(pixel);
            const mainColorLightness = getColorLightness(pixel);
            document.body.style.background = mainColorHex;
            mainColorLightness > 0.5
                ? document.body.classList.add('body_theme_dark')
                : document.body.classList.remove('body_theme_dark');
        }
    });

    containers.colors.innerHTML = '';
    containers.colors.appendChild(fragment);
}

function generateMedianCut(pixels) {
    const clusters = MedianCutClusterizer.getClusters(pixels, 2);
    updateColors(clusters);
}

function generateKMeansColors(pixels) {
    const clusters = KMeansClusterizer.getClusters(pixels, 4, 1);
    updateColors(clusters);
}

function generateHistogramColors(pixels) {
    const clusters = Histogram.getClusters(pixels);
    updateColors(clusters);
}

function applyMedianCut(image) {
    const pixels = getImagePixels(image);
    generateMedianCut(pixels);
}

function applyKMeans(image) {
    const pixels = getImagePixels(image);
    generateKMeansColors(pixels);
}

function applyHistogram(image) {
    const pixels = getImagePixels(image);
    generateHistogramColors(pixels);
}

function setImageLink(url) {
    loadImage(url, image => {
        applyHistogram(image);
    });
}

function setRandomImage() {
    const imageLink = `${urls.random}?id=${Math.random() * 999999}`;
    setImageLink(imageLink);
}

controls.fileInput.addEventListener('change', function () {
    if (this.files && this.files[0]) {
        const url = URL.createObjectURL(this.files[0]);
        setImageLink(url);
        this.value = '';
    }
});

controls.randomButton.addEventListener('click', () => setRandomImage());
controls.uploadButton.addEventListener('click', () => {
    controls.fileInput.click();
});

controls.medianCutButton.addEventListener('click', () => applyMedianCut(getCurrentImage()));
controls.kMeansButton.addEventListener('click', () => applyKMeans(getCurrentImage()));
controls.histogramButton.addEventListener('click', () => applyHistogram(getCurrentImage()));

setRandomImage();
