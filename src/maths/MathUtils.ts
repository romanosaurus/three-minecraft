export default class MathUtils {
    public static clamp(val: number, min: number, max: number) {
        return Math.max(min, Math.min(max, val));
    }
}