<script setup lang="ts">
import { computed } from 'vue'

type HTMLElementWithStyle = HTMLElement & { style: CSSStyleDeclaration }

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  as: {
    type: String,
    default: 'div'
  },
  duration: {
    type: Number,
    default: 200
  }
})

const transitionStyle = computed(
  () => `height ${props.duration}ms cubic-bezier(0.4,0,0.2,1), opacity ${Math.max(props.duration - 50, 150)}ms ease`
)

const setBaseStyles = (el: HTMLElementWithStyle) => {
  el.style.willChange = 'height, opacity'
  el.style.overflow = 'hidden'
  el.style.transition = transitionStyle.value
}

const cleanupStyles = (el: HTMLElementWithStyle) => {
  el.style.removeProperty('height')
  el.style.removeProperty('opacity')
  el.style.removeProperty('overflow')
  el.style.removeProperty('transition')
  el.style.removeProperty('will-change')
}

const onEnter = (el: HTMLElementWithStyle, done: () => void) => {
  setBaseStyles(el)
  el.style.height = '0px'
  el.style.opacity = '0'

  requestAnimationFrame(() => {
    el.style.height = `${el.scrollHeight}px`
    el.style.opacity = '1'
  })

  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== el || event.propertyName !== 'height') return
    el.removeEventListener('transitionend', onTransitionEnd)
    cleanupStyles(el)
    el.style.height = 'auto'
    done()
  }

  el.addEventListener('transitionend', onTransitionEnd)
}

const onLeave = (el: HTMLElementWithStyle, done: () => void) => {
  setBaseStyles(el)
  el.style.height = `${el.scrollHeight}px`
  el.style.opacity = '1'

  requestAnimationFrame(() => {
    el.style.height = '0px'
    el.style.opacity = '0'
  })

  const onTransitionEnd = (event: TransitionEvent) => {
    if (event.target !== el || event.propertyName !== 'height') return
    el.removeEventListener('transitionend', onTransitionEnd)
    cleanupStyles(el)
    done()
  }

  el.addEventListener('transitionend', onTransitionEnd)
}
</script>

<template>
  <component :is="as" v-bind="$attrs">
    <Transition :css="false" @enter="onEnter" @leave="onLeave">
      <div v-show="modelValue">
        <slot />
      </div>
    </Transition>
  </component>
</template>
