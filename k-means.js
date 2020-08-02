class KMeansClusterizer {
    static getClusters(pixels, clustersCount, maxIterations = 5) {
        const clusters = new Array(clustersCount)
            .fill()
            .map(() => {
                const rndIndex = this.getRandomIndex(pixels.length);
                return {
                    center: pixels[rndIndex],
                    pixels: [],
                    prevCount: 0,
                };
            });

        for (let i = 0; i < maxIterations; i++) {
            pixels.forEach(pixel => {
                const nearestCluster = clusters.reduce((nearest, current) => {
                    const nearestDistance = this.getDistance(pixel, nearest.center);
                    const currentDistance = this.getDistance(pixel, current.center);
                    return nearestDistance <= currentDistance
                        ? nearest
                        : current;
                });

                nearestCluster.pixels.push(pixel);
            });

            const noChanges = clusters.every(cluster => cluster.prevCount === cluster.pixels.length);
            if (noChanges) {
                break;
            }

            clusters.forEach(cluster => {
                const center = cluster.pixels
                    .reduce((sum, pixel) => {
                        return sum.map((value, index) => value + pixel[index]);
                    }, [0, 0, 0])
                    .map((value) => Math.floor(value / cluster.pixels.length));

                cluster.center = center;
                cluster.prevCount = cluster.pixels.length;
            });
        }

        return clusters
            .filter(cluster => cluster.pixels.length > 0)
            .map(cluster => cluster.pixels);
    }

    static getDistance(a, b) {
        const dR = b[0] - a[0];
        const dG = b[1] - a[1];
        const dB = b[2] - a[2];
        return Math.sqrt(dR * dR + dG * dG + dB * dB);
    }

    static getRandomIndex(max) {
        return Math.floor(Math.random() * max);
    }
}