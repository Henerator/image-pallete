const urls = [
    'https://picsum.photos/600/400',
    'https://i.picsum.photos/id/447/720/800.jpg?hmac=u3EH7wVElkIJ8d9SxEesc5Pp7ZVcu0NQWNEM9MwSk7w',
    'https://i.picsum.photos/id/131/720/800.jpg?hmac=D5DbSLu0Hi-cCiRvSJAtgDALs85Z1nVWQ3AI2trC29E',
    'https://images.pexels.com/photos/807598/pexels-photo-807598.jpeg',
    'https://cdn.pixabay.com/photo/2020/06/02/01/33/sakura-5248955__340.jpg',
    'https://cdn.pixabay.com/photo/2017/08/30/01/05/milky-way-2695569_960_720.jpg',
    'https://images.freeimages.com/images/small-previews/199/sunflowers-6-1392951.jpg',
    'https://images.pexels.com/photos/3026368/pexels-photo-3026368.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885__340.jpg',
    'https://cdn.pixabay.com/photo/2016/04/25/18/07/halcyon-1352522_960_720.jpg',
    'https://cdn.pixabay.com/photo/2020/06/13/03/39/lotus-5292554_960_720.jpg',
    'https://cdn.pixabay.com/photo/2020/06/02/01/33/sakura-5248955_960_720.jpg',
];

const imageContainer = document.getElementById('image-container');
const medianСontainer = document.getElementById('median-container');
const kMeansСontainer = document.getElementById('k-means-container');
const controls = {
    random: document.getElementById('control-random'),
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
        for (let x = 0; x < countPixels; x++) {
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

function getRandomImage() {
    const imageLink = `${urls[0]}?id=${Math.random() * 999999}`;
    loadImagePixels(imageLink, pixels => {
        generateMedianCut(pixels);
        // generateKMeansColors(pixels);
    });
}

controls.random.addEventListener('click', () => getRandomImage());

getRandomImage();
