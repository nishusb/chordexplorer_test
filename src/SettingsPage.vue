<script setup lang="ts">
import * as settings from './settings'

const changeBackgroundColor = (hue: number, saturation: number, lightness: number) => {
  let color = `hsl(${hue}, ${saturation}%, ${lightness}%)`

  localStorage.setItem('selectedColor', color)
  document.body.style.backgroundColor = color
}
</script>

<template>
  <div class="p-4">
    <h1>Settings</h1>
    <h2>background color</h2>
    <div
      class="row g-0 gap-2 py-1"
      v-for="(lightness, index) in settings.lightnessValues"
      :key="index"
    >
      <div class="col-auto p-0" v-for="(hue, index) in settings.hues" :key="index">
        <button
          class="btn border-0 rounded-pill p-4"
          :style="`background: hsl(${hue}, ${settings.saturationValue}%, ${lightness}%)`"
          @click="changeBackgroundColor(hue, settings.saturationValue, lightness)"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
