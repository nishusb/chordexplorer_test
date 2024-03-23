<script setup lang="ts">
import '@/assets/main.css'
import { ref, computed } from 'vue'
import Note from './note'
import { notes, scales, formatRomanNumeralChord, diatonicSemitoneValues } from './utils'

function generateScaleFromNote(note: Note, musicalMode = 'major'): Note[] {
  const startIndex = notes.indexOf(note.name)
  const totalNotes = notes.length
  const scale = []

  scale.push(note.setInterval(1))

  let scaleToUse = scales[musicalMode]

  for (let i = 1; i < totalNotes; i++) {
    let currentNote = new Note(notes[(startIndex + i) % totalNotes]).setInterval(i + 1)

    if (scale.length > 0) {
      let expectedJump = scaleToUse[(totalNotes + i - 1) % totalNotes]
      let pureJump =
        scales.major[(totalNotes + i + startIndex - 1) % totalNotes] - scale[i - 1].semitoneChange

      currentNote.modify(expectedJump - pureJump)
    }

    currentNote
    scale.push(currentNote)
  }

  return scale
}

const chordTypes = ref([
  {
    name: 'major',
    changes: []
  },
  {
    name: 'minor',
    changes: [
      { interval: 3, mod: -1 },
      { interval: 7, mod: -1 }
    ]
  },
  {
    name: 'augmented',
    changes: [{ interval: 5, mod: 1 }],
    compatibleIntervals: ['3']
  },
  {
    name: 'diminished',
    changes: [
      { interval: 3, mod: -1 },
      { interval: 5, mod: -1 }
    ],
    compatibleIntervals: ['3']
  },
  {
    name: 'minor ♭6',
    changes: [
      { interval: 3, mod: -1 },
      { interval: 6, mod: -1 }
    ],
    compatibleIntervals: ['6']
  },
  {
    name: 'dominant',
    changes: [{ interval: 7, mod: -1 }],
    compatibleIntervals: ['7', '9']
  }
])
const romanNumeralsConst = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii']
const romanNumerals = computed(() => {
  return romanNumeralsConst.map((numeral, interval) => {
    const chord = [
      scale.value[(0 + 7 + interval) % 7],
      scale.value[(2 + 7 + interval) % 7],
      scale.value[(4 + 7 + interval) % 7]
    ]

    const offset = getSemitoneValueOfNoteHack(chord[0])
    const chordSemitones = [chord[0], chord[1], chord[2]].map((note) => {
      return (getSemitoneValueOfNoteHack(note) + 12 - offset) % 12
    })
    return formatRomanNumeralChord(numeral, chordSemitones)
  })
})

function getSemitoneValueOfNoteHack(note: Note): number {
  const noteIndex = Note.letterNotes.indexOf(note.name)
  return diatonicSemitoneValues[noteIndex] + note.semitoneChange
}

const accidentals = [
  { name: 'flat', mod: -1 },
  { name: 'natural', mod: 0 },
  { name: 'sharp', mod: 1 }
]
const extraNotes = [
  { name: '3', intervals: [1, 3, 5] },
  { name: '6', intervals: [1, 3, 5, 6] },
  { name: '7', intervals: [1, 3, 5, 7] },
  { name: '9', intervals: [1, 3, 5, 7, 9] }
]

const modes = ['chords', 'scales']
const musicalModes = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian']
const selectedMusicalMode = ref('major')
const selectedExtraNotes = ref('3')
const selectedAccidental = ref(0)
const selectedNote = ref('C')
const selectedChordType = ref('major')
const selectedMode = ref('chords')
const selectedRomanNumeral = ref(0)

const selectNote = (note: string) => {
  selectedNote.value = note
  selectedAccidental.value = 0
}

const selectAccidental = (accidental: number) => {
  selectedAccidental.value = accidental
}

const selectChordType = (chordType: string) => {
  selectedChordType.value = chordType
}

const selectChordIntervals = (intervals: string) => {
  selectedExtraNotes.value = intervals
  const selectedChordTypeObj = chordTypes.value.find(
    (chordType) => chordType.name === selectedChordType.value
  )
  if (
    selectedChordTypeObj?.compatibleIntervals &&
    !selectedChordTypeObj.compatibleIntervals.includes(intervals)
  ) {
    selectedChordType.value = 'major'
  }
}

const getColorForIndex = (index: number) => {
  const hue = (index / notes.length) * 360
  const color = `hsl(${hue}, 20%, 30%)`
  return color
}

const getHoverColorForIndex = (index: number) => {
  const hue = (index / notes.length) * 360
  const color = `hsl(${hue}, 60%, 50%)`
  return color
}

const compatibleChordTypes = computed(() => {
  return chordTypes.value.filter(
    (chordType) =>
      chordType.compatibleIntervals === undefined ||
      chordType.compatibleIntervals.includes(selectedExtraNotes.value)
  )
})

const scale = computed(() => {
  const scale = generateScaleFromNote(
    new Note(selectedNote.value).modifier(selectedAccidental.value),
    selectedMode.value === 'scales' ? selectedMusicalMode.value : undefined
  )
  return scale
})

const currentScaleChord = computed(() => {
  const offset = selectedRomanNumeral.value + 7

  return [scale.value[offset % 7], scale.value[(offset + 2) % 7], scale.value[(offset + 4) % 7]]
})

const displayIntervals = computed(() => {
  let scaleCopy = scale.value.map((note) =>
    new Note(note.name).modify(note.semitoneChange).setInterval(note.interval)
  )
  if (selectedMode.value === 'scales') {
    return scaleCopy
  }
  const chordIntervals = extraNotes.find(
    (extra) => extra.name === selectedExtraNotes.value
  )?.intervals
  const chordType = chordTypes.value.find((type) => type.name === selectedChordType.value)
  const chordNotes = chordIntervals?.map((interval) => {
    let change = chordType?.changes.find((change) => change.interval === interval)?.mod
    return scaleCopy[(interval - 1 + 7) % 7].modify(change ?? 0).setInterval(interval)
  })
  return chordNotes ? chordNotes : []
})
</script>

<template>
  <div id="app" class="user-select-none">
    <div class="container-fluid container-lg text-bg-light text-center rounded-0 px-3 px-md-5">
      <div class="py-3 py-md-5">
        <div class="row g-0 gap-3 gap-md-5">
          <div
            class="col-12 col-md row justify-content-center gx-0 gap-2 gap-md-3 p-2 p-md-3 rounded-4 text-bg-dark"
          >
            <div class="col-auto" v-for="note in displayIntervals" :key="note.name">
              <div class="p-0 px-1 fs-1 fw-bold">
                {{ note.getFullName() }}
              </div>
              <div class="fs-5">{{ note.interval }}</div>
            </div>
            <div class="fw-bold fs-3" v-if="selectedMode === 'scales'">
              {{ displayIntervals[0].getFullName() }} {{ selectedMusicalMode }}
            </div>
          </div>
          <div
            class="col-12 col-md text-bg-dark rounded-4 p-3 d-flex justify-content-center align-items-center"
            v-if="selectedMode === 'scales'"
          >
            <div class="row justify-content-center">
              <div
                class="col-auto fs-2 fw-bold"
                v-for="(note, index) in currentScaleChord"
                :key="index"
              >
                {{ note.getFullName() }}
              </div>
              <div class="fs-5">
                {{ romanNumerals[selectedRomanNumeral].display }} /
                {{ displayIntervals[selectedRomanNumeral].getFullName() }}
                {{ romanNumerals[selectedRomanNumeral].chord.altName }}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-4 bg-dark overflow-hidden">
        <div class="row g-0">
          <div class="col p-0" v-for="(note, index) in notes" :key="note">
            <button
              class="note-button btn btn-dark btn-block p-3 fs-2 border-0 rounded-0 w-100"
              :class="{ active: selectedNote === note }"
              @click="selectNote(note)"
              :style="{
                '--button-bg-color': getColorForIndex(index),
                '--button-hover-bg-color': getHoverColorForIndex(index)
              }"
              :key="note"
            >
              {{ note }}
            </button>
          </div>
        </div>
        <div class="row g-0">
          <div class="col p-0" v-for="accidental in accidentals" :key="accidental.name">
            <button
              class="fs-5 btn btn-secondary btn-block w-100 border-0 rounded-0 p-3"
              :key="accidental.mod"
              :class="{ active: selectedAccidental === accidental.mod }"
              @click="selectAccidental(accidental.mod)"
            >
              {{ accidental.name }}
            </button>
          </div>
        </div>
        <div>
          <div class="row g-0" v-if="selectedMode === 'chords'">
            <div class="col p-0" v-for="extra in extraNotes" :key="extra.name">
              <button
                class="btn btn-dark btn-block w-100 p-2 rounded-0 fs-5 border-0 p-3"
                :class="{ active: selectedExtraNotes === extra.name }"
                @click="selectChordIntervals(extra.name)"
              >
                {{ extra.name }}
              </button>
            </div>
          </div>
        </div>
        <div class="row g-0 bg-dark" v-if="selectedMode === 'scales'">
          <div class="col-lg col-3 p-0" v-for="mode in musicalModes" :key="mode">
            <button
              class="btn btn-dark btn-block w-100 p-3 rounded-0 border-0"
              :class="{ active: mode === selectedMusicalMode }"
              @click="selectedMusicalMode = mode"
              v-text="mode"
            ></button>
          </div>
        </div>
      </div>

      <div v-if="selectedMode === 'chords'">
        <div class="py-3 py-md-4">
          <div class="row g-0">
            <div
              class="col-6 col-sm-3 p-0"
              v-for="chordType in compatibleChordTypes"
              :key="chordType.name"
            >
              <button
                class="btn fs-5 btn-light btn-block w-100 p-3 rounded-0 border-0"
                :key="chordType.name"
                :class="{ active: selectedChordType === chordType.name }"
                @click="selectChordType(chordType.name)"
              >
                {{ chordType.name }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="selectedMode === 'scales'">
        <div class="py-3 py-md-4">
          <div class="row g-0">
            <div
              class="col-3 col-md"
              v-for="(numeral, index) in romanNumerals"
              :key="index"
            >
              <button
                class="btn fs-5 btn-light btn-block w-100 p-3 rounded-0 border-0"
                :class="{ active: selectedRomanNumeral === index }"
                @click="selectedRomanNumeral = index"
              >
                {{ numeral.display }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="container-fluid container-lg">
      <div class="row text-center width-0">
        <button
          class="btn col-auto fs-3 rounded-0 rounded-bottom-4 border-0"
          v-for="mode in modes"
          :class="[mode === selectedMode ? 'btn-light pe-none' : 'btn-dark']"
          @click="selectedMode = mode"
          :key="mode"
        >
          {{ mode }}
        </button>
      </div>
    </div>
  </div>
</template>
