import {Gem, GemPair} from '../../Common/Tile/Gem';
import { Set as ImmutableSet } from 'immutable';

describe('Test GemPair.equals()', () => {
    const getGemPair1 = () => new GemPair(Gem.LABRADORITE, Gem.ALEXANDRITE);
    const getGemPair2 = () => new GemPair(Gem.ALEXANDRITE, Gem.LABRADORITE);
    const getGemPair3 = () => new GemPair(Gem.ALEXANDRITE, Gem.ALEXANDRITE);
    const getGemPair4 = () => new GemPair(Gem.ALEXANDRITE, Gem.APLITE);

    test('Equivalent GemPairs', () => {
        expect(getGemPair1().equals(getGemPair1())).toBe(true);
        expect(getGemPair1().equals(getGemPair2())).toBe(true);
        expect(getGemPair2().equals(getGemPair1())).toBe(true);
        expect(getGemPair3().equals(getGemPair3())).toBe(true);
    });

    test('Non-equivalent GemPairs', () => {
        expect(getGemPair1().equals(getGemPair4())).toBe(false);
        expect(getGemPair4().equals(getGemPair1())).toBe(false);
        expect(getGemPair2().equals(getGemPair3())).toBe(false);
        expect(getGemPair3().equals(getGemPair4())).toBe(false);
    });

    test('GemPairs in ImmutableSets are compared by value', () => {
        let gemset = ImmutableSet<GemPair>();
        const gempair1_1 = getGemPair1();
        const gempair1_2 = getGemPair1();

        // These aren't the same object, but are equal
        expect(gempair1_1).not.toBe(gempair1_2);
        expect(gempair1_1).toEqual(gempair1_2);

        expect(gemset.has(gempair1_1)).toBeFalsy();
        expect(gemset.has(gempair1_2)).toBeFalsy();
        gemset = gemset.add(gempair1_1);
        expect(gemset.has(gempair1_1)).toBeTruthy();
        expect(gemset.has(gempair1_2)).toBeTruthy();
    })
});
