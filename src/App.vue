<script setup lang="ts">
import '@/assets/main.css'
import { ref, computed, watch } from 'vue'
import Note from './note'
import { notes, scales, formatRomanNumeralChord, diatonicSemitoneValues } from './utils'
import ButtonGroup from './ButtonGroup.vue'
import SettingsPage from './SettingsPage.vue'

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
  const scaleFromMode = scales[selectedMusicalMode.value]

  const chordSemitoneValues: number[] = []
  let runningSemitoneTotal = 0

  for (let i = 0; i < 7; i++) {
    chordSemitoneValues.push(runningSemitoneTotal)
    runningSemitoneTotal += scaleFromMode[i]
  }

  return romanNumeralsConst.map((numeral, interval) => {
    const semitoneOffset = chordSemitoneValues[interval % 7]
    const chordIntervals = [0, 2, 4, 6].slice(0, selectedChordLength.value)
    console.log(chordIntervals)

    return formatRomanNumeralChord(
      numeral,
      chordIntervals.map(
        (semitoneInterval) =>
          (chordSemitoneValues[(semitoneInterval + interval) % 7] + 12 - semitoneOffset) % 12
      )
    )
  })
})

function getSemitoneValueOfNoteHack(note: Note): number {
  const noteIndex = Note.letterNotes.indexOf(note.name)
  return diatonicSemitoneValues[noteIndex] + note.semitoneChange
}

const extraNotes = [
  { name: '3', intervals: [1, 3, 5] },
  { name: '6', intervals: [1, 3, 5, 6] },
  { name: '7', intervals: [1, 3, 5, 7] },
  { name: '9', intervals: [1, 3, 5, 7, 9] }
]

const modes = ['chords', 'scales', 'settings']
const musicalModes = ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian']
const selectedMusicalMode = ref('major')
const selectedExtraNotes = ref('3')
const selectedAccidental = ref('natural')
const selectedNote = ref('C')
const selectedChordType = ref('major')
const selectedMode = ref('chords')
const selectedRomanNumeral = ref(0)
const selectedChordLength = ref(3)

export type Accidental = 'flat' | 'natural' | 'sharp'

const accidentals: Accidental[] = ['flat', 'natural', 'sharp']
const selectedAccidentalSemitoneValue = computed(() => {
  switch (selectedAccidental.value) {
    case 'sharp':
      return 1
    case 'flat':
      return -1
    case 'natural':
    default:
      return 0
  }
})

watch(selectedNote, () => {
  selectedAccidental.value = 'natural'
})

const selectChordIntervals = () => {
  const selectedChordTypeObj = chordTypes.value.find(
    (chordType) => chordType.name === selectedChordType.value
  )
  if (
    selectedChordTypeObj?.compatibleIntervals &&
    !selectedChordTypeObj.compatibleIntervals.includes(selectedExtraNotes.value)
  ) {
    selectedChordType.value = 'major'
  }
}

watch(selectedExtraNotes, selectChordIntervals)

const noteColorFunction = (index: number) => {
  const hue = (index / 7) * 360

  return {
    color: `hsl(${hue}, 20%, 30%)`,
    hoverColor: `hsl(${hue}, 60%, 50%)`
  }
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
    new Note(selectedNote.value).modifier(selectedAccidentalSemitoneValue.value),
    selectedMode.value === 'scales' ? selectedMusicalMode.value : undefined
  )
  return scale
})

const currentScaleChord = computed(() => {
  const offset = selectedRomanNumeral.value + 7

  return [
    scale.value[offset % 7],
    scale.value[(offset + 2) % 7],
    scale.value[(offset + 4) % 7],
    scale.value[(offset + 6) % 7]
  ].slice(0, selectedChordLength.value)
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
    <div class="container-fluid container-lg text-bg-light rounded-0 px-3 px-md-5">
      <div v-if="selectedMode === 'settings'">
        <SettingsPage />
      </div>
      <div v-if="['scales', 'chords'].includes(selectedMode)" class="text-center">
        <div class="pt-3 pt-md-5 pb-3 pb-md-4">
          <div class="row g-0 gap-3 gap-md-4">
            <div
              class="col-12 col-lg row justify-content-center gx-0 gap-2 gap-md-3 p-2 p-md-3 rounded-4 text-bg-dark"
            >
              <div class="col-auto" v-for="(note, index) in displayIntervals" :key="index">
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
              class="col-12 col-lg text-bg-dark rounded-4 p-3 row g-0"
              v-if="selectedMode === 'scales'"
            >
              <div class="col d-flex align-items-center justify-content-center">
                <div>
                  <div class="row g-0">
                    <div
                      class="col fs-2 fw-bold"
                      v-for="(note, index) in currentScaleChord"
                      :key="index"
                    >
                      {{ note.getFullName() }}
                    </div>
                  </div>
                  <div class="fs-5">
                    {{ romanNumerals[selectedRomanNumeral].name }} /
                    {{
                      displayIntervals[selectedRomanNumeral].getFullName() +
                      romanNumerals[selectedRomanNumeral].chord.altName
                    }}
                  </div>
                </div>
              </div>
              <div class="col-auto d-flex flex-column justify-content-center">
                <button
                  class="btn btn-secondary border-0 rounded-4 mb-2"
                  :class="{ active: selectedChordLength === 3 }"
                  @click="selectedChordLength = 3"
                >
                  3
                </button>
                <button
                  class="btn btn-secondary border-0 rounded-4"
                  :class="{ active: selectedChordLength === 4 }"
                  @click="selectedChordLength = 4"
                >
                  7
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="rounded-4 bg-dark overflow-hidden">
          <ButtonGroup
            :custom-color-function="noteColorFunction"
            font-size="2"
            :items="notes"
            v-model:selected-item="selectedNote"
          />
          <ButtonGroup v-model:selected-item="selectedAccidental" :items="accidentals" />
          <div>
            <div v-if="selectedMode === 'chords'">
              <ButtonGroup
                color="secondary"
                :items="extraNotes"
                v-model:selectedItem="selectedExtraNotes"
              />
            </div>
          </div>
          <div v-if="selectedMode === 'scales'">
            <ButtonGroup
              color="secondary"
              column-classes="col-3 col-md"
              font-size="6"
              :items="musicalModes"
              v-model:selectedItem="selectedMusicalMode"
            />
          </div>
        </div>

        <div class="pt-3 pt-md-4 pb-3 pb-md-5">
          <div v-if="selectedMode === 'chords'">
            <ButtonGroup
              column-classes="col-6 col-md"
              color="light"
              :items="compatibleChordTypes"
              v-model:selectedItem="selectedChordType"
            />
          </div>
          <div v-if="selectedMode === 'scales'">
            <ButtonGroup
              column-classes="col-3 col-md"
              use-index
              color="light"
              :items="romanNumerals"
              v-model:selectedItem="selectedRomanNumeral"
            />
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
