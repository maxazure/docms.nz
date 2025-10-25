<template>
  <div class="site-settings">
    <n-space vertical :size="16">
      <h2>站点设置</h2>

      <n-spin :show="loading">
        <n-tabs type="line" animated>
          <!-- 基本设置 -->
          <n-tab-pane name="basic" tab="基本设置">
            <n-card>
              <n-form
                ref="basicFormRef"
                :model="basicForm"
                :rules="basicRules"
                label-placement="left"
                label-width="120"
              >
                <n-form-item label="站点名称" path="name">
                  <n-input
                    v-model:value="basicForm.name"
                    placeholder="请输入站点名称"
                  />
                </n-form-item>

                <n-form-item label="站点域名" path="domain">
                  <n-input
                    v-model:value="basicForm.domain"
                    placeholder="https://example.com"
                  />
                </n-form-item>

                <n-form-item label="语言" path="locale">
                  <n-select
                    v-model:value="basicForm.locale"
                    :options="localeOptions"
                    placeholder="选择语言"
                  />
                </n-form-item>

                <n-form-item label="站点描述" path="settings.description">
                  <n-input
                    v-model:value="basicForm.settings.description"
                    type="textarea"
                    :rows="3"
                    placeholder="请输入站点描述"
                  />
                </n-form-item>

                <n-form-item label="关键词" path="settings.keywords">
                  <n-dynamic-tags
                    v-model:value="basicForm.settings.keywords"
                    placeholder="添加关键词"
                  />
                </n-form-item>

                <n-form-item label="作者" path="settings.author">
                  <n-input
                    v-model:value="basicForm.settings.author"
                    placeholder="请输入作者信息"
                  />
                </n-form-item>

                <n-form-item>
                  <n-button type="primary" @click="handleSaveBasic">
                    保存基本设置
                  </n-button>
                </n-form-item>
              </n-form>
            </n-card>
          </n-tab-pane>

          <!-- 主题设置 -->
          <n-tab-pane name="theme" tab="主题设置">
            <n-card>
              <n-form
                ref="themeFormRef"
                :model="themeForm"
                label-placement="left"
                label-width="120"
              >
                <n-form-item label="主色调">
                  <n-color-picker
                    v-model:value="themeForm.primaryColor"
                    :show-alpha="false"
                  />
                  <span style="margin-left: 12px">{{ themeForm.primaryColor }}</span>
                </n-form-item>

                <n-form-item label="次要色">
                  <n-color-picker
                    v-model:value="themeForm.secondaryColor"
                    :show-alpha="false"
                  />
                  <span style="margin-left: 12px">{{ themeForm.secondaryColor }}</span>
                </n-form-item>

                <n-form-item label="强调色">
                  <n-color-picker
                    v-model:value="themeForm.accentColor"
                    :show-alpha="false"
                  />
                  <span style="margin-left: 12px">{{ themeForm.accentColor }}</span>
                </n-form-item>

                <n-form-item>
                  <n-space>
                    <n-button type="primary" @click="handleSaveTheme">
                      保存主题设置
                    </n-button>
                    <n-button @click="handleResetTheme">
                      恢复默认
                    </n-button>
                  </n-space>
                </n-form-item>
              </n-form>
            </n-card>
          </n-tab-pane>

          <!-- SEO 设置 -->
          <n-tab-pane name="seo" tab="SEO 设置">
            <n-card>
              <n-form
                ref="seoFormRef"
                :model="basicForm.settings"
                label-placement="left"
                label-width="120"
              >
                <n-form-item label="Logo URL">
                  <n-input
                    v-model:value="basicForm.settings.logo"
                    placeholder="/uploads/logo.png"
                  />
                </n-form-item>

                <n-form-item label="Favicon URL">
                  <n-input
                    v-model:value="basicForm.settings.favicon"
                    placeholder="/uploads/favicon.ico"
                  />
                </n-form-item>

                <n-form-item label="OG Image">
                  <n-input
                    v-model:value="basicForm.settings.ogImage"
                    placeholder="/uploads/og-image.jpg"
                  />
                </n-form-item>

                <n-form-item>
                  <n-button type="primary" @click="handleSaveBasic">
                    保存 SEO 设置
                  </n-button>
                </n-form-item>
              </n-form>
            </n-card>
          </n-tab-pane>
        </n-tabs>
      </n-spin>
    </n-space>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage, type FormInst, type FormRules } from 'naive-ui'
import { getSite, updateSite, updateTheme, type Site, type UpdateSiteDto, type ThemeTokenDto } from '@/api/site'

const message = useMessage()
const loading = ref(false)

// Form refs
const basicFormRef = ref<FormInst | null>(null)
const themeFormRef = ref<FormInst | null>(null)
const seoFormRef = ref<FormInst | null>(null)

// Basic form data
const basicForm = ref<UpdateSiteDto & { settings: Record<string, any> }>({
  name: '',
  domain: '',
  locale: 'zh-CN',
  settings: {
    description: '',
    keywords: [],
    author: '',
    logo: '',
    favicon: '',
    ogImage: ''
  }
})

// Theme form data
const themeForm = ref<ThemeTokenDto>({
  primaryColor: '#10B981',
  secondaryColor: '#059669',
  accentColor: '#34D399'
})

// Options
const localeOptions = [
  { label: '简体中文', value: 'zh-CN' },
  { label: 'English', value: 'en-US' },
  { label: '繁體中文', value: 'zh-TW' }
]

// Validation rules
const basicRules: FormRules = {
  name: [
    { required: true, message: '请输入站点名称', trigger: 'blur' }
  ],
  domain: [
    { required: true, message: '请输入站点域名', trigger: 'blur' },
    {
      pattern: /^https?:\/\/.+/,
      message: '请输入有效的URL（以http://或https://开头）',
      trigger: 'blur'
    }
  ],
  locale: [
    { required: true, message: '请选择语言', trigger: 'change' }
  ]
}

// Load site settings
async function loadSiteSettings() {
  loading.value = true
  try {
    const site: Site = await getSite()

    basicForm.value = {
      name: site.name,
      domain: site.domain,
      locale: site.locale,
      settings: {
        description: site.settings?.description || '',
        keywords: site.settings?.keywords || [],
        author: site.settings?.author || '',
        logo: site.settings?.logo || '',
        favicon: site.settings?.favicon || '',
        ogImage: site.settings?.ogImage || ''
      }
    }

    themeForm.value = {
      primaryColor: site.themeTokens?.primaryColor || '#10B981',
      secondaryColor: site.themeTokens?.secondaryColor || '#059669',
      accentColor: site.themeTokens?.accentColor || '#34D399'
    }
  } catch (error: any) {
    message.error(error.message || '加载站点设置失败')
  } finally {
    loading.value = false
  }
}

// Save basic settings
async function handleSaveBasic() {
  if (!basicFormRef.value) return

  try {
    await basicFormRef.value.validate()
    loading.value = true

    await updateSite(basicForm.value)
    message.success('基本设置保存成功')
  } catch (error: any) {
    if (error.message) {
      message.error(error.message || '保存失败')
    }
  } finally {
    loading.value = false
  }
}

// Save theme settings
async function handleSaveTheme() {
  loading.value = true
  try {
    await updateTheme(themeForm.value)
    message.success('主题设置保存成功')
  } catch (error: any) {
    message.error(error.message || '保存失败')
  } finally {
    loading.value = false
  }
}

// Reset theme to default
function handleResetTheme() {
  themeForm.value = {
    primaryColor: '#10B981',
    secondaryColor: '#059669',
    accentColor: '#34D399'
  }
  message.info('已恢复默认主题')
}

// Lifecycle
onMounted(() => {
  loadSiteSettings()
})
</script>

<style scoped>
.site-settings {
  padding: 20px;
}

h2 {
  margin-top: 0;
}

:deep(.n-form-item) {
  margin-bottom: 24px;
}

:deep(.n-color-picker) {
  width: 200px;
}
</style>
