export const hues: number[] = []

const amountOfHues = 12
for (let h = 0; h < amountOfHues; h++) {
  hues.push(h * (360 / amountOfHues))
}

export const lightnessValues = [70, 50, 30]

export const saturationValue = 50

export const colors: string[] = []
for (let h = 0; h < amountOfHues; h++) {
  for (const l in lightnessValues) {
    colors.push(`hsl(${hues[h]}, ${saturationValue}%, ${lightnessValues[l]}%)`)
  }
}
