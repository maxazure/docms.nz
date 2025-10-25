<template>
  <div class="login-container">
    <n-card class="login-card" :bordered="false">
      <div class="login-header">
        <h1>Docms 管理后台</h1>
        <p>企业展示型 CMS 管理系统</p>
      </div>

      <n-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        size="large"
        label-placement="top"
      >
        <n-form-item label="邮箱" path="email">
          <n-input
            v-model:value="formData.email"
            placeholder="请输入邮箱"
            :input-props="{ autocomplete: 'username' }"
            @keydown.enter="handleLogin"
          >
            <template #prefix>
              <n-icon :component="MailOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item label="密码" path="password">
          <n-input
            v-model:value="formData.password"
            type="password"
            show-password-on="click"
            placeholder="请输入密码"
            :input-props="{ autocomplete: 'current-password' }"
            @keydown.enter="handleLogin"
          >
            <template #prefix>
              <n-icon :component="LockClosedOutline" />
            </template>
          </n-input>
        </n-form-item>

        <n-form-item>
          <div class="login-options">
            <n-checkbox v-model:checked="formData.rememberMe">
              记住我
            </n-checkbox>
            <n-button text type="primary" size="small">
              忘记密码？
            </n-button>
          </div>
        </n-form-item>

        <n-button
          type="primary"
          size="large"
          :loading="loading"
          :block="true"
          @click="handleLogin"
        >
          登录
        </n-button>
      </n-form>

      <div class="login-footer">
        <n-text depth="3" style="font-size: 12px;">
          © 2025 Docms. All rights reserved.
        </n-text>
      </div>
    </n-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { MailOutline, LockClosedOutline } from '@vicons/ionicons5'
import { useAuthStore, useMenuStore } from '@/stores'
import type { FormInst, FormRules } from 'naive-ui'

const router = useRouter()
const route = useRoute()
const message = useMessage()
const authStore = useAuthStore()
const menuStore = useMenuStore()

const formRef = ref<FormInst>()
const loading = ref(false)

const formData = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    {
      type: 'email',
      message: '请输入有效的邮箱地址',
      trigger: ['blur', 'change']
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少 6 个字符', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  try {
    await formRef.value?.validate()
    loading.value = true

    await authStore.login({
      email: formData.email,
      password: formData.password
    })

    // 登录成功后初始化菜单
    await menuStore.init()

    message.success('登录成功')

    // 跳转到目标页面或首页
    const redirect = (route.query.redirect as string) || '/dashboard'
    await router.push(redirect)
  } catch (error: any) {
    if (error?.message) {
      message.error(error.message || '登录失败，请检查邮箱和密码')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 480px;
  padding: 48px 40px;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  background: var(--n-color);
}

@media (max-width: 640px) {
  .login-card {
    max-width: 400px;
    padding: 32px 24px;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
}

.login-header h1 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: var(--n-title-text-color);
  letter-spacing: -0.5px;
}

.login-header p {
  font-size: 15px;
  margin: 0;
  color: var(--n-text-color-3);
  font-weight: 400;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.login-footer {
  margin-top: 32px;
  text-align: center;
}
</style>
