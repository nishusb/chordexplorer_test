<script setup lang="ts">
import { colors } from './utils'

const changeBackgroundColor = (index: number) => {
  let color = colors[index]

  localStorage.setItem('selectedColor', color)
  document.body.style.backgroundColor = color
}

</script>

<template>
  <div class="p-4">
    <h1>Settings</h1>
    <h2>background color</h2>
    <div class="row g-0 gap-4">
      <div class="col-auto p-0" v-for="(color, index) in colors" :key="index">
        <button
          class="btn border-0 rounded-pill p-4"
          :style="`background: ${color}`"
          @click="changeBackgroundColor(index)"
        ></button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
