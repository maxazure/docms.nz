<template>
  <div class="dashboard">
    <n-space vertical :size="24">
      <!-- 欢迎卡片 -->
      <n-card title="欢迎回来！">
        <n-space vertical>
          <n-text>
            欢迎使用 Docms 管理后台，{{ userName }}
          </n-text>
          <n-text depth="3" style="font-size: 14px;">
            这是一个现代化的企业展示型 CMS 系统，让内容管理变得简单高效。
          </n-text>
        </n-space>
      </n-card>

      <!-- 统计卡片 -->
      <n-grid :x-gap="16" :y-gap="16" :cols="4">
        <n-gi>
          <n-card :bordered="false" class="stat-card">
            <n-statistic label="总页面数" value="12">
              <template #prefix>
                <n-icon :component="DocumentTextOutline" size="24" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card :bordered="false" class="stat-card">
            <n-statistic label="总文章数" value="45">
              <template #prefix>
                <n-icon :component="NewspaperOutline" size="24" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card :bordered="false" class="stat-card">
            <n-statistic label="总产品数" value="28">
              <template #prefix>
                <n-icon :component="CubeOutline" size="24" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card :bordered="false" class="stat-card">
            <n-statistic label="媒体文件" value="156">
              <template #prefix>
                <n-icon :component="ImageOutline" size="24" />
              </template>
            </n-statistic>
          </n-card>
        </n-gi>
      </n-grid>

      <!-- 快速操作 -->
      <n-card title="快速操作">
        <n-space :size="16">
          <n-button type="primary" @click="router.push('/pages/home')">
            <template #icon>
              <n-icon :component="AddCircleOutline" />
            </template>
            编辑首页
          </n-button>
          <n-button @click="router.push('/posts')">
            <template #icon>
              <n-icon :component="CreateOutline" />
            </template>
            写文章
          </n-button>
          <n-button @click="router.push('/products')">
            <template #icon>
              <n-icon :component="AddOutline" />
            </template>
            添加产品
          </n-button>
          <n-button @click="router.push('/media')">
            <template #icon>
              <n-icon :component="CloudUploadOutline" />
            </template>
            上传媒体
          </n-button>
        </n-space>
      </n-card>

      <!-- 最近活动 -->
      <n-grid :x-gap="16" :y-gap="16" :cols="2">
        <n-gi>
          <n-card title="最近更新">
            <n-list hoverable clickable>
              <n-list-item>
                <n-thing title="首页内容更新" description="2小时前">
                  <template #avatar>
                    <n-avatar>
                      <n-icon :component="DocumentTextOutline" />
                    </n-avatar>
                  </template>
                </n-thing>
              </n-list-item>
              <n-list-item>
                <n-thing title="发布新文章：产品发布" description="5小时前">
                  <template #avatar>
                    <n-avatar>
                      <n-icon :component="NewspaperOutline" />
                    </n-avatar>
                  </template>
                </n-thing>
              </n-list-item>
              <n-list-item>
                <n-thing title="添加产品图片" description="1天前">
                  <template #avatar>
                    <n-avatar>
                      <n-icon :component="ImageOutline" />
                    </n-avatar>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-card>
        </n-gi>

        <n-gi>
          <n-card title="最新留言">
            <n-list hoverable clickable>
              <n-list-item>
                <n-thing title="客户咨询产品详情" description="1小时前">
                  <template #avatar>
                    <n-avatar>
                      <n-icon :component="ChatbubbleOutline" />
                    </n-avatar>
                  </template>
                </n-thing>
              </n-list-item>
              <n-list-item>
                <n-thing title="合作咨询" description="3小时前">
                  <template #avatar>
                    <n-avatar>
                      <n-icon :component="ChatbubbleOutline" />
                    </n-avatar>
                  </template>
                </n-thing>
              </n-list-item>
              <n-list-item>
                <n-thing title="技术支持请求" description="6小时前">
                  <template #avatar>
                    <n-avatar>
                      <n-icon :component="ChatbubbleOutline" />
                    </n-avatar>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-card>
        </n-gi>
      </n-grid>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  DocumentTextOutline,
  NewspaperOutline,
  CubeOutline,
  ImageOutline,
  AddCircleOutline,
  CreateOutline,
  AddOutline,
  CloudUploadOutline,
  ChatbubbleOutline
} from '@vicons/ionicons5'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.displayName || '管理员')
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.stat-card :deep(.n-statistic__label),
.stat-card :deep(.n-statistic__value) {
  color: white !important;
}
</style>
