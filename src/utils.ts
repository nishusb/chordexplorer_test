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

export type TriadQuality = 'major' | 'minor' | 'augmented' | 'diminished' | '?'
interface BasicChord {
  quality: TriadQuality
  symbol: string
  altName: string
}
const basicChords: { [key: string]: BasicChord } = {
  '047': { quality: 'major', symbol: '', altName: 'maj' },
  '037': { quality: 'minor', symbol: '', altName: 'min' },
  '048': { quality: 'augmented', symbol: '+', altName: 'aug' },
  '036': { quality: 'diminished', symbol: '°', altName: 'dim' }
}

// export function getTriadQuality(semitoneIntervals: number[]): BasicChord {
//   return basicChords[semitoneIntervals.join('')]
// }

export function formatRomanNumeralChord(
  numeral: string,
  semitoneIntervals: number[]
): { display: string; chord: BasicChord } {
  const chordCode = semitoneIntervals.join('')

  if (chordCode in basicChords) {
    const basicChord = basicChords[chordCode]
    const notation =
      basicChord.quality === 'minor' || basicChord.quality === 'diminished'
        ? numeral.toLowerCase()
        : numeral.toUpperCase()
    return {
      display: notation + basicChord.symbol,
      chord: basicChord
    }
  }

  return {
    display: '?',
    chord: {
      quality: '?',
      symbol: '?',
      altName: '?'
    }
  }
}
