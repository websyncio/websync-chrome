export function getNextIndex(currentIndex: number, totalCount: number, isPrevious: boolean) {
    if (isPrevious) {
        if (currentIndex === 0) {
            return totalCount - 1;
        } else {
            return currentIndex - 1;
        }
    } else {
        if (currentIndex === totalCount - 1) {
            return 0;
        } else {
            return currentIndex + 1;
        }
    }
}
