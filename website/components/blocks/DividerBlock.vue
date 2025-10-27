<template>
  <section class="divider-block"
    :class="[
      thickness === 'thin' ? 'py-8' : thickness === 'medium' ? 'py-12' : 'py-16'
    ]">
    <div class="container mx-auto px-4">
      <!-- Simple Line -->
      <div v-if="style === 'line'" class="flex items-center justify-center">
        <div
          class="w-full"
          :class="{
            'border-t border-gray-300': thickness === 'thin',
            'border-t-2 border-gray-400': thickness === 'medium',
            'border-t-4 border-gray-500': thickness === 'thick'
          }"
          :style="{ maxWidth: width || '100%' }">
        </div>
      </div>

      <!-- Dotted Line -->
      <div v-else-if="style === 'dotted'" class="flex items-center justify-center">
        <div
          class="w-full border-t-2 border-dotted border-gray-400"
          :style="{ maxWidth: width || '100%' }">
        </div>
      </div>

      <!-- Dashed Line -->
      <div v-else-if="style === 'dashed'" class="flex items-center justify-center">
        <div
          class="w-full border-t-2 border-dashed border-gray-400"
          :style="{ maxWidth: width || '100%' }">
        </div>
      </div>

      <!-- Gradient -->
      <div v-else-if="style === 'gradient'" class="flex items-center justify-center">
        <div
          class="w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent"
          :style="{ maxWidth: width || '100%' }">
        </div>
      </div>

      <!-- Wave -->
      <div v-else-if="style === 'wave'" class="flex items-center justify-center">
        <svg class="w-full" :style="{ maxWidth: width || '100%' }" height="20" viewBox="0 0 200 20" preserveAspectRatio="none">
          <path d="M0 10 Q 25 0, 50 10 T 100 10 T 150 10 T 200 10"
            stroke="currentColor"
            :stroke-width="thickness === 'thin' ? 1 : thickness === 'medium' ? 2 : 3"
            fill="none"
            class="text-gray-400" />
        </svg>
      </div>

      <!-- Stars -->
      <div v-else-if="style === 'stars'" class="flex items-center justify-center space-x-4">
        <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
        <svg class="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      </div>

      <!-- Text with Line -->
      <div v-else-if="style === 'text' && text" class="flex items-center">
        <div class="flex-1 border-t border-gray-300"></div>
        <span class="px-4 text-gray-500 font-semibold">{{ text }}</span>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>

      <!-- Icon with Line -->
      <div v-else-if="style === 'icon'" class="flex items-center">
        <div class="flex-1 border-t border-gray-300"></div>
        <div class="px-4">
          <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
        </div>
        <div class="flex-1 border-t border-gray-300"></div>
      </div>

      <!-- Default: Simple Line -->
      <div v-else class="flex items-center justify-center">
        <div class="w-full border-t border-gray-300"
          :style="{ maxWidth: width || '100%' }">
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  style?: 'line' | 'dotted' | 'dashed' | 'gradient' | 'wave' | 'stars' | 'text' | 'icon'
  thickness?: 'thin' | 'medium' | 'thick'
  width?: string        // CSS width value (e.g., "50%", "600px")
  text?: string         // Text for 'text' style
}>(), {
  style: 'line',
  thickness: 'thin',
  width: '100%'
})
</script>
