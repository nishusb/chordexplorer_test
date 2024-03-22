import { diatonicSemitoneValues } from './utils'

export default class Note {
  static letterNotes = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
  octave = 0

  constructor(
    public name: string,
    public semitoneChange: number = 0,
    public interval: number = 0
  ) {}

  setInterval(interval: number): Note {
    this.interval = interval
    return this
  }

  modifier(mod: number): Note {
    this.semitoneChange = mod
    return this
  }

  modify(mod: number): Note {
    this.semitoneChange += mod
    return this
  }

  getFullName(): string {
    const accidentalSymbols: Record<string, string> = {
      '-2': '𝄫',
      '-1': '♭',
      '0': '',
      '1': '♯',
      '2': '𝄪'
    }

    const semitoneChangeString = this.semitoneChange.toString()
    const accidentalSymbol = accidentalSymbols[semitoneChangeString]

    return this.name + (accidentalSymbol !== undefined ? accidentalSymbol : semitoneChangeString)
  }
}
