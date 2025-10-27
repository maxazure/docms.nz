<template>
  <section class="map-block py-16">
    <div class="container mx-auto px-4">
      <div v-if="title || subtitle" class="text-center mb-12">
        <h2 v-if="title" class="text-3xl font-bold mb-4">{{ title }}</h2>
        <p v-if="subtitle" class="text-gray-600 text-lg">{{ subtitle }}</p>
      </div>

      <div class="max-w-6xl mx-auto">
        <!-- Map Container -->
        <div class="relative bg-gray-200 rounded-lg overflow-hidden shadow-lg"
          :style="{ height: height || '450px' }">

          <!-- Google Maps -->
          <iframe v-if="provider === 'google' && embedUrl"
            :src="embedUrl"
            class="w-full h-full border-0"
            allowfullscreen
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade">
          </iframe>

          <!-- Baidu Maps -->
          <iframe v-else-if="provider === 'baidu' && embedUrl"
            :src="embedUrl"
            class="w-full h-full border-0"
            scrolling="no">
          </iframe>

          <!-- Gaode (Amap) Maps -->
          <iframe v-else-if="provider === 'gaode' && embedUrl"
            :src="embedUrl"
            class="w-full h-full border-0"
            scrolling="no">
          </iframe>

          <!-- Fallback: Display coordinates and address -->
          <div v-else class="w-full h-full flex items-center justify-center bg-gray-100">
            <div class="text-center p-8">
              <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div v-if="address" class="text-gray-700 font-semibold mb-2">{{ address }}</div>
              <div v-if="latitude && longitude" class="text-gray-500 text-sm">
                坐标: {{ latitude }}, {{ longitude }}
              </div>
              <div v-else class="text-gray-500">未配置地图</div>
            </div>
          </div>
        </div>

        <!-- Location Info -->
        <div v-if="showLocationInfo && (address || phone || email)"
          class="mt-8 bg-white rounded-lg shadow-md p-6 md:flex md:items-start md:space-x-8">
          <div class="flex-1 space-y-4">
            <div v-if="address" class="flex items-start">
              <svg class="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <div class="font-semibold text-gray-900">地址</div>
                <div class="text-gray-600">{{ address }}</div>
              </div>
            </div>

            <div v-if="phone" class="flex items-start">
              <svg class="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <div class="font-semibold text-gray-900">电话</div>
                <a :href="`tel:${phone}`" class="text-primary hover:underline">{{ phone }}</a>
              </div>
            </div>

            <div v-if="email" class="flex items-start">
              <svg class="w-6 h-6 text-primary mr-3 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <div>
                <div class="font-semibold text-gray-900">邮箱</div>
                <a :href="`mailto:${email}`" class="text-primary hover:underline">{{ email }}</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  provider?: 'google' | 'baidu' | 'gaode'
  embedUrl?: string     // Direct embed URL from map provider
  latitude?: number     // Fallback coordinates
  longitude?: number
  address?: string      // Physical address
  phone?: string
  email?: string
  height?: string       // Map height (CSS value)
  zoom?: number         // Zoom level
  showLocationInfo?: boolean
}>(), {
  provider: 'google',
  height: '450px',
  zoom: 15,
  showLocationInfo: true
})

// Generate embed URL if not provided but coordinates are available
const embedUrl = computed(() => {
  if (props.embedUrl) {
    return props.embedUrl
  }

  if (props.latitude && props.longitude) {
    const lat = props.latitude
    const lng = props.longitude
    const zoom = props.zoom

    switch (props.provider) {
      case 'google':
        return `https://www.google.com/maps?q=${lat},${lng}&z=${zoom}&output=embed`
      case 'baidu':
        // Baidu Maps embed - requires conversion from WGS84 to BD09
        return `https://api.map.baidu.com/marker?location=${lat},${lng}&title=${encodeURIComponent(props.address || '位置')}&output=html&src=webapp.baidu.openAPIdemo`
      case 'gaode':
        // Gaode/Amap embed
        return `https://uri.amap.com/marker?position=${lng},${lat}&name=${encodeURIComponent(props.address || '位置')}`
      default:
        return null
    }
  }

  return null
})
</script>
