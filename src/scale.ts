import Note from './note'
import { notes, scales } from './utils'

export default class Scale {
  public notes: Note[] = []

  static fromNote(note: Note, musicalMode = 'major') {
    const startIndex = Note.letterNotes.indexOf(note.name)
    const totalNotes = Note.letterNotes.length
    const scale = []

    scale.push(note.setInterval(1))

    const scaleToUse = scales[musicalMode]

    for (let i = 1; i < totalNotes; i++) {
      const currentNote = new Note(notes[(startIndex + i) % totalNotes]).setInterval(i + 1)

      if (scale.length > 0) {
        const expectedJump = scaleToUse[(totalNotes + i - 1) % totalNotes]
        const pureJump =
          scales.major[(totalNotes + i + startIndex - 1) % totalNotes] - scale[i - 1].semitoneChange

        currentNote.modify(expectedJump - pureJump)
      }

      currentNote
      scale.push(currentNote)
    }

    return scale
  }
}
