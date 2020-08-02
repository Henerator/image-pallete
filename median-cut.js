class MedianCutClusterizer {
    static getClusters(pixels, count) {
        const clusters = [pixels];
        for (let i = 0; i < count; i++) {
            this.splitClusters(clusters);
        }

        return clusters;
        // return this.sortClusters(clusters);
    }

    static splitClusters(clusters) {
        const clustersCount = clusters.length;
        for (let i = 0; i < clustersCount; i++) {
            const cluster = clusters.shift();

            const ranges = this.getRanges(cluster);
            const maxRangeIndex = this.getMaxRange(ranges).index;
            this.sortPixels(cluster, maxRangeIndex);

            const centerIndex = Math.floor(cluster.length / 2);
            const leftPixels = cluster.slice(0, centerIndex);
            const rightPixels = cluster.slice(centerIndex);
            clusters.push(leftPixels);
            clusters.push(rightPixels);
        }
    }

    static getRanges(pixels) {
        return pixels.reduce((ranges, pixel) => {
            pixel.forEach((value, index) => {
                ranges[index].min = Math.min(ranges[index].min, value);
                ranges[index].max = Math.max(ranges[index].max, value);
            })

            return ranges;
        }, [
            { index: 0, min: Infinity, max: -Infinity },
            { index: 1, min: Infinity, max: -Infinity },
            { index: 2, min: Infinity, max: -Infinity },
        ]);
    }

    static getMaxRange(ranges) {
        return ranges.reduce((maxRange, range) => {
            const maxRangeValue = maxRange.max - maxRange.min;
            const rangeValue = range.max - range.min;

            return maxRangeValue > rangeValue
                ? maxRangeValue
                : rangeValue;
        });
    }

    static sortPixels(pixels, sortIndex) {
        pixels.sort((a, b) => a[sortIndex] - b[sortIndex]);
    }

    static sortClusters(clusters) {
        return clusters
            .map(cluster => {
                const ranges = this.getRanges(cluster);
                const maxRange = this.getMaxRange(ranges);

                return {
                    maxRangeValue: maxRange.max - maxRange.min,
                    cluster: cluster,
                };
            })
            .sort((a, b) => b.maxRangeValue - a.maxRangeValue)
            .map(data => data.cluster);
    }
}