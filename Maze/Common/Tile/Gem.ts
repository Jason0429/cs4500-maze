/**
 * The Gem module comprises definitions relating to the
 * treasure that is the objective of the game Labrynth.
 * @module Gem
 */

import {hash, ValueObject} from 'immutable';

/**
 * An immutable data type to represent an unordered pair of {@link Gem}.
 */
 export class GemPair implements ValueObject {
  constructor(gem1: Gem, gem2: Gem) {
    this.gems = [gem1, gem2];
  }

  readonly gems: readonly [Gem, Gem];

  /**
   * Compares if the other {@link GemPair} contains all the {@link Gem} of the current {@link GemPair}.
   *
   * @param other - {@link GemPair} to be compared with
   * @returns True or false if the {@link GemPair}s are equivalent.
   */
  equals(other: GemPair): boolean {
    return (this.gems[0] === other.gems[0] && this.gems[1] === other.gems[1]) ||
      (this.gems[1] === other.gems[0] && this.gems[0] === other.gems[1]);
  }

  hashCode(): number {
     return hash(this.gems[0]) + hash(this.gems[1]);
  }
}

/**
 * Represents a Gem in the game Labyrinth.
 */
export enum Gem {
  ALEXANDRITE_PEAR_SHAPE = 'alexandrite-pear-shape',
  ALEXANDRITE = 'alexandrite',
  ALMANDINE_GARNET = 'almandine-garnet',
  AMETHYST = 'amethyst',
  AMETRINE = 'ametrine',
  AMMOLITE = 'ammolite',
  APATITE = 'apatite',
  APLITE = 'aplite',
  APRICOT_SQUARE_RADIANT = 'apricot-square-radiant',
  AQUAMARINE = 'aquamarine',
  AUSTRALIAN_MARQUISE = 'australian-marquise',
  AVENTURINE = 'aventurine',
  AZURITE = 'azurite',
  BERYL = 'beryl',
  BLACK_OBSIDIAN = 'black-obsidian',
  BLACK_ONYX = 'black-onyx',
  BLACK_SPINEL_CUSHION = 'black-spinel-cushion',
  BLUE_CEYLON_SAPPHIRE = 'blue-ceylon-sapphire',
  BLUE_CUSHION = 'blue-cushion',
  BLUE_PEAR_SHAPE = 'blue-pear-shape',
  BLUE_SPINEL_HEART = 'blue-spinel-heart',
  BULLS_EYE = 'bulls-eye',
  CARNELIAN = 'carnelian',
  CHROME_DIOPSIDE = 'chrome-diopside',
  CHRYSOBERYL_CUSHION = 'chrysoberyl-cushion',
  CHRYSOLITE = 'chrysolite',
  CITRINE_CHECKERBOARD = 'citrine-checkerboard',
  CITRINE = 'citrine',
  CLINOHUMITE = 'clinohumite',
  COLOR_CHANGE_OVAL = 'color-change-oval',
  CORDIERITE = 'cordierite',
  DIAMOND = 'diamond',
  DUMORTIERITE = 'dumortierite',
  EMERALD = 'emerald',
  FANCY_SPINEL_MARQUISE = 'fancy-spinel-marquise',
  GARNET = 'garnet',
  GOLDEN_DIAMOND_CUT = 'golden-diamond-cut',
  GOLDSTONE = 'goldstone',
  GRANDIDIERITE = 'grandidierite',
  GRAY_AGATE = 'gray-agate',
  GREEN_AVENTURINE = 'green-aventurine',
  GREEN_BERYL_ANTIQUE = 'green-beryl-antique',
  GREEN_BERYL = 'green-beryl',
  GREEN_PRINCESS_CUT = 'green-princess-cut',
  GROSSULAR_GARNET = 'grossular-garnet',
  HACKMANITE = 'hackmanite',
  HELIOTROPE = 'heliotrope',
  HEMATITE = 'hematite',
  IOLITE_EMERALD_CUT = 'iolite-emerald-cut',
  JASPER = 'jasper',
  JASPILITE = 'jaspilite',
  KUNZITE_OVAL = 'kunzite-oval',
  KUNZITE = 'kunzite',
  LABRADORITE = 'labradorite',
  LAPIS_LAZULI = 'lapis-lazuli',
  LEMON_QUARTZ_BRIOLETTE = 'lemon-quartz-briolette',
  MAGNESITE = 'magnesite',
  MEXICAN_OPAL = 'mexican-opal',
  MOONSTONE = 'moonstone',
  MORGANITE_OVAL = 'morganite-oval',
  MOSS_AGATE = 'moss-agate',
  ORANGE_RADIANT = 'orange-radiant',
  PADPARADSCHA_OVAL = 'padparadscha-oval',
  PADPARADSCHA_SAPPHIRE = 'padparadscha-sapphire',
  PERIDOT = 'peridot',
  PINK_EMERALD_CUT = 'pink-emerald-cut',
  PINK_OPAL = 'pink-opal',
  PINK_ROUND = 'pink-round',
  PINK_SPINEL_CUSHION = 'pink-spinel-cushion',
  PRASIOLITE = 'prasiolite',
  PREHNITE = 'prehnite',
  PURPLE_CABOCHON = 'purple-cabochon',
  PURPLE_OVAL = 'purple-oval',
  PURPLE_SPINEL_TRILLION = 'purple-spinel-trillion',
  PURPLE_SQUARE_CUSHION = 'purple-square-cushion',
  RAW_BERYL = 'raw-beryl',
  RAW_CITRINE = 'raw-citrine',
  RED_DIAMOND = 'red-diamond',
  RED_SPINEL_SQUARE_EMERALD_CUT = 'red-spinel-square-emerald-cut',
  RHODONITE = 'rhodonite',
  ROCK_QUARTZ = 'rock-quartz',
  ROSE_QUARTZ = 'rose-quartz',
  RUBY_DIAMOND_PROFILE = 'ruby-diamond-profile',
  RUBY = 'ruby',
  SPHALERITE = 'sphalerite',
  SPINEL = 'spinel',
  STAR_CABOCHON = 'star-cabochon',
  STILBITE = 'stilbite',
  SUNSTONE = 'sunstone',
  SUPER_SEVEN = 'super-seven',
  TANZANITE_TRILLION = 'tanzanite-trillion',
  TIGERS_EYE = 'tigers-eye',
  TOURMALINE_LASER_CUT = 'tourmaline-laser-cut',
  TOURMALINE = 'tourmaline',
  UNAKITE = 'unakite',
  WHITE_SQUARE = 'white-square',
  YELLOW_BAGUETTE = 'yellow-baguette',
  YELLOW_BERYL_OVAL = 'yellow-beryl-oval',
  YELLOW_HEART = 'yellow-heart',
  YELLOW_JASPER = 'yellow-jasper',
  ZIRCON = 'zircon',
  ZOISITE = 'zoisite'
}
