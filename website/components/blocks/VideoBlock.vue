<template>
  <section class="video-block py-16">
    <div class="container mx-auto px-4">
      <div v-if="title || subtitle" class="text-center mb-12">
        <h2 v-if="title" class="text-3xl font-bold mb-4">{{ title }}</h2>
        <p v-if="subtitle" class="text-gray-600 text-lg">{{ subtitle }}</p>
      </div>

      <div class="max-w-4xl mx-auto">
        <!-- Video Container -->
        <div class="relative bg-gray-900 rounded-lg overflow-hidden shadow-xl"
          :style="{ paddingBottom: aspectRatio }">
          <!-- Self-hosted video (from Media) -->
          <video v-if="mediaId && videoUrl"
            :controls="showControls"
            :autoplay="autoplay"
            :muted="autoplay"
            :loop="loop"
            :poster="coverImage"
            class="absolute inset-0 w-full h-full object-cover">
            <source :src="videoUrl" :type="mimeType || 'video/mp4'" />
            您的浏览器不支持视频播放。
          </video>

          <!-- YouTube Embed -->
          <iframe v-else-if="youtubeId"
            :src="`https://www.youtube.com/embed/${youtubeId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${showControls ? 1 : 0}`"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>

          <!-- Vimeo Embed -->
          <iframe v-else-if="vimeoId"
            :src="`https://player.vimeo.com/video/${vimeoId}?autoplay=${autoplay ? 1 : 0}&loop=${loop ? 1 : 0}&controls=${showControls ? 1 : 0}`"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowfullscreen>
          </iframe>

          <!-- Bilibili Embed -->
          <iframe v-else-if="bilibiliId"
            :src="`//player.bilibili.com/player.html?bvid=${bilibiliId}&autoplay=${autoplay ? 1 : 0}`"
            class="absolute inset-0 w-full h-full"
            frameborder="0"
            allowfullscreen>
          </iframe>

          <!-- Fallback: No video -->
          <div v-else class="absolute inset-0 flex items-center justify-center bg-gray-800 text-white">
            <div class="text-center">
              <svg class="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p class="text-gray-400">未配置视频源</p>
            </div>
          </div>
        </div>

        <!-- Video Caption -->
        <p v-if="caption" class="text-center text-gray-600 mt-4">{{ caption }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  mediaId?: number      // Self-hosted video from Media table
  youtubeId?: string    // YouTube video ID (e.g., "dQw4w9WgXcQ")
  vimeoId?: string      // Vimeo video ID
  bilibiliId?: string   // Bilibili BV ID
  coverImage?: string   // Cover/poster image URL
  caption?: string      // Video caption/description
  aspectRatio?: string  // CSS padding-bottom (e.g., "56.25%" for 16:9)
  autoplay?: boolean
  loop?: boolean
  showControls?: boolean
}>(), {
  aspectRatio: '56.25%',  // 16:9 default
  autoplay: false,
  loop: false,
  showControls: true
})

const config = useRuntimeConfig()
const api = useApi()

// Fetch self-hosted video if mediaId provided
const { data: media } = await useAsyncData(
  `video-media-${props.mediaId}`,
  async () => {
    if (props.mediaId) {
      return await api.media.getById(props.mediaId)
    }
    return null
  },
  { server: false }
)

// Compute video URL
const videoUrl = computed(() => {
  if (media.value) {
    const apiBase = config.public.apiBase as string
    const baseUrl = apiBase.replace('/api', '')
    return `${baseUrl}/uploads/${media.value.storageKey}`
  }
  return null
})

// Compute MIME type
const mimeType = computed(() => {
  return media.value?.mimeType || 'video/mp4'
})
</script>
