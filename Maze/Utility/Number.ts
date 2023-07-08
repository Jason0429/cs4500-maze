export class NumUtil {
    static isInteger(n: number): boolean {
        return n % 1 === 0;
    }

    static isPositive(n: number): boolean {
        return n > 0;
    }

    static isNegative(n: number): boolean {
        return n < 0;
    }

    static isNatural(n: number): boolean {
        return NumUtil.isInteger(n) && !NumUtil.isNegative(n);
    }

    // mod function that always returns positive values
    static mod(n: number, m: number): number {
        return ((n % m) + m) % m;
    }
}
