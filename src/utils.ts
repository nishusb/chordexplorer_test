export const scales: { [key: string]: number[] } = {
  major: [2, 2, 1, 2, 2, 2, 1],
  dorian: [2, 1, 2, 2, 2, 1, 2],
  phrygian: [1, 2, 2, 2, 1, 2, 2],
  lydian: [2, 2, 2, 1, 2, 2, 1],
  mixolydian: [2, 2, 1, 2, 2, 1, 2],
  aeolian: [2, 1, 2, 2, 1, 2, 2],
  minor: [2, 1, 2, 2, 1, 2, 2],
  locrian: [1, 2, 2, 1, 2, 2, 2]
}

export const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
export const diatonicSemitoneValues = [0, 2, 4, 5, 7, 9, 11]

export type TriadQuality =
  | 'major'
  | 'minor'
  | 'augmented'
  | 'diminished'
  | 'minor7'
  | 'major7'
  | 'dominant7'
  | 'halfdiminished7'
  | '?'
interface BasicChord {
  quality: TriadQuality
  symbol: string
  altName: string
}
const basicChords: { [key: string]: BasicChord } = {
  '047': { quality: 'major', symbol: '', altName: 'maj' },
  '037': { quality: 'minor', symbol: '', altName: 'min' },
  '048': { quality: 'augmented', symbol: '+', altName: 'aug' },
  '036': { quality: 'diminished', symbol: '°', altName: 'dim' },
  '04711': { quality: 'major7', symbol: 'M7', altName: 'maj7' },
  '03710': { quality: 'minor7', symbol: 'm7', altName: 'min7' },
  '04710': { quality: 'dominant7', symbol: '7', altName: 'dom7' },
  '03610': { quality: 'halfdiminished7', symbol: 'ø7', altName: 'min7b5' }
}

export function formatRomanNumeralChord(
  numeral: string,
  semitoneIntervals: number[]
): { name: string; chord: BasicChord } {
  const chordCode = semitoneIntervals.join('')

  if (chordCode in basicChords) {
    const basicChord = basicChords[chordCode]
    const notation =
      basicChord.quality === 'minor' ||
      basicChord.quality === 'diminished' ||
      basicChord.quality === 'minor7'
        ? numeral.toLowerCase()
        : numeral.toUpperCase()
    return {
      name: notation + basicChord.symbol,
      chord: basicChord
    }
  }

  return {
    name: '?',
    chord: {
      quality: '?',
      symbol: '?',
      altName: '?'
    }
  }
}
