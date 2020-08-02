class Histogram {
    static getClusters(pixels, cellsCount = 3, count = 4) {
        const cellWidth = 256 / cellsCount;
        const clusters = new Array(Math.pow(cellsCount, 3))
            .fill()
            .map(() => []);

        pixels.forEach(pixel => {
            const clusterIndex = pixel.map(value => Math.floor(value / cellWidth))
                .reduce((clusterIndex, value, dimensionIndex) => {
                    return clusterIndex + value * Math.pow(cellsCount, dimensionIndex);
                }, 0);
            clusters[clusterIndex].push(pixel);
        });

        return clusters
            .filter(cluster => cluster.length > 0)
            .sort((a, b) => b.length - a.length)
            .slice(0, count);
    }
}