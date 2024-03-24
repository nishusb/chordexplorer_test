<script setup lang="ts">
export interface Props {
  items: (string | { name: string })[]
  useIndex?: boolean
  color?: string
  customColorFunction?: CustomColorFunction
  fontSize?: string | number
  columnClasses?: string
}

export type CustomColorFunction = (index: number) => { color: string; hoverColor: string }

const props = withDefaults(defineProps<Props>(), {
  columnClasses: 'col',
  useIndex: false,
  color: 'dark',
  fontSize: 5
})

const backgroundClass = `bg-${props.color}`
const buttonBackgroundClass = `btn-${props.color}`

const selectedItem = defineModel('selectedItem', { required: true })

const selectItem = (index: number) => {
  if (props.useIndex) {
    selectedItem.value = index
  } else {
    const item = props.items[index]

    if (typeof item === 'object' && 'name' in item) {
      selectedItem.value = item.name
    } else if (typeof item === 'string') {
      selectedItem.value = item
    } else {
      console.error(`Invalid item type: ${item}`)
    }
  }
}
</script>

<template>
  <div class="row g-0" :class="backgroundClass">
    <div
      class="p-0 overflow-hidden"
      :class="columnClasses"
      v-for="(item, index) in items"
      :key="index"
    >
      <button
        class="btn btn-block w-100 border-0 rounded-0 p-3 border-0"
        :class="[
          {
            active: useIndex
              ? selectedItem === index
              : typeof item === 'object' && 'name' in item
                ? selectedItem === item.name
                : selectedItem === item
          },
          buttonBackgroundClass,
          'fs-' + fontSize,
          { 'note-button': customColorFunction }
        ]"
        :style="
          customColorFunction
            ? {
                '--button-bg-color': `${customColorFunction(index).color}`,
                '--button-hover-bg-color': `${customColorFunction(index).hoverColor}`
              }
            : ''
        "
        @click="selectItem(index)"
      >
        {{ typeof item === 'object' && 'name' in item ? item.name : item }}
      </button>
    </div>
  </div>
</template>

<style scoped></style>
