<template>
  <section class="contact-form-block py-16">
    <div class="container mx-auto px-4 max-w-3xl">
      <div class="text-center mb-12">
        <h2 v-if="title" class="text-3xl font-bold mb-4">{{ title }}</h2>
        <p v-if="subtitle" class="text-gray-600 text-lg">{{ subtitle }}</p>
      </div>

      <!-- Success Message -->
      <div v-if="submitSuccess" class="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <p class="text-green-700 font-semibold">{{ successMessage || '提交成功!我们会尽快与您联系。' }}</p>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="submitError" class="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
        <div class="flex items-center">
          <svg class="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="text-red-700 font-semibold">{{ errorMessage || '提交失败,请稍后重试。' }}</p>
        </div>
      </div>

      <!-- Contact Form -->
      <form @submit.prevent="handleSubmit" class="bg-white rounded-lg shadow-md p-8">
        <div class="space-y-6">
          <!-- Dynamic Form Fields -->
          <div v-for="field in formFields" :key="field.name">
            <!-- Text/Email/Tel Input -->
            <div v-if="['text', 'email', 'tel'].includes(field.type)">
              <label :for="field.name" class="block text-sm font-semibold text-gray-700 mb-2">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
              <input
                :id="field.name"
                v-model="formData[field.name]"
                :type="field.type"
                :placeholder="field.placeholder"
                :required="field.required"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              />
            </div>

            <!-- Textarea -->
            <div v-else-if="field.type === 'textarea'">
              <label :for="field.name" class="block text-sm font-semibold text-gray-700 mb-2">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
              <textarea
                :id="field.name"
                v-model="formData[field.name]"
                :placeholder="field.placeholder"
                :required="field.required"
                :rows="field.rows || 5"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow resize-none"
              ></textarea>
            </div>

            <!-- Select -->
            <div v-else-if="field.type === 'select'">
              <label :for="field.name" class="block text-sm font-semibold text-gray-700 mb-2">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
              <select
                :id="field.name"
                v-model="formData[field.name]"
                :required="field.required"
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
              >
                <option value="">{{ field.placeholder || '请选择' }}</option>
                <option v-for="option in field.options" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>

            <!-- Checkbox -->
            <div v-else-if="field.type === 'checkbox'" class="flex items-start">
              <input
                :id="field.name"
                v-model="formData[field.name]"
                type="checkbox"
                :required="field.required"
                class="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
              />
              <label :for="field.name" class="ml-2 text-sm text-gray-700">
                {{ field.label }}
                <span v-if="field.required" class="text-red-500">*</span>
              </label>
            </div>
          </div>

          <!-- Submit Button -->
          <div class="pt-4">
            <button
              type="submit"
              :disabled="submitting"
              class="w-full bg-primary text-white py-4 px-8 rounded-lg font-semibold hover:bg-secondary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <span v-if="submitting">提交中...</span>
              <span v-else>{{ buttonText || '提交' }}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  subtitle?: string
  formId?: number  // Reference to Forms table
  formFields?: Array<{
    name: string
    label: string
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'checkbox'
    placeholder?: string
    required?: boolean
    options?: string[]  // For select type
    rows?: number       // For textarea
  }>
  buttonText?: string
  successMessage?: string
}>(), {
  formFields: () => [
    { name: 'name', label: '姓名', type: 'text', placeholder: '请输入您的姓名', required: true },
    { name: 'email', label: '邮箱', type: 'email', placeholder: '请输入您的邮箱', required: true },
    { name: 'phone', label: '电话', type: 'tel', placeholder: '请输入您的电话', required: false },
    { name: 'message', label: '留言', type: 'textarea', placeholder: '请输入您的留言', required: true, rows: 5 }
  ]
})

const api = useApi()

// Form state
const formData = ref<Record<string, any>>({})
const submitting = ref(false)
const submitSuccess = ref(false)
const submitError = ref(false)
const errorMessage = ref('')

// Initialize form data
onMounted(() => {
  props.formFields.forEach(field => {
    formData.value[field.name] = field.type === 'checkbox' ? false : ''
  })
})

// Handle form submission
const handleSubmit = async () => {
  submitting.value = true
  submitSuccess.value = false
  submitError.value = false
  errorMessage.value = ''

  try {
    // Submit to API
    await api.formSubmissions.create({
      formId: props.formId || null,
      data: formData.value,
      ipAddress: '', // Would be filled by server
      userAgent: navigator.userAgent
    })

    submitSuccess.value = true

    // Reset form
    props.formFields.forEach(field => {
      formData.value[field.name] = field.type === 'checkbox' ? false : ''
    })

    // Hide success message after 5 seconds
    setTimeout(() => {
      submitSuccess.value = false
    }, 5000)
  } catch (error: any) {
    submitError.value = true
    errorMessage.value = error?.message || '提交失败,请稍后重试。'

    // Hide error message after 5 seconds
    setTimeout(() => {
      submitError.value = false
    }, 5000)
  } finally {
    submitting.value = false
  }
}
</script>
