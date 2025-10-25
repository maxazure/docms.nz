<script setup lang="ts">
const props = defineProps<{
  heading?: string;
  subheading?: string;
  formCode?: string;
  fields?: Array<{
    name: string;
    type: 'text' | 'email' | 'tel' | 'textarea' | 'select';
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
  submitButtonText?: string;
  successMessage?: string;
}>();

const api = useApi();
const formData = ref<Record<string, string>>({});
const isSubmitting = ref(false);
const isSuccess = ref(false);
const errorMessage = ref('');

const handleSubmit = async () => {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  errorMessage.value = '';

  try {
    await api.submitForm(props.formCode || 'contact', formData.value);
    isSuccess.value = true;
    formData.value = {};
  } catch (error) {
    errorMessage.value = '提交失败，请稍后重试';
    console.error('Form submission error:', error);
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <section class="block-form">
    <div class="container">
      <div class="form-header">
        <h2 v-if="heading">{{ heading }}</h2>
        <p v-if="subheading" class="subheading">{{ subheading }}</p>
      </div>

      <div v-if="isSuccess" class="success-message">
        {{ successMessage || '提交成功！我们会尽快与您联系。' }}
      </div>

      <form v-else @submit.prevent="handleSubmit" class="contact-form">
        <div
          v-for="field in fields"
          :key="field.name"
          class="form-field"
        >
          <label :for="field.name">
            {{ field.label }}
            <span v-if="field.required" class="required">*</span>
          </label>

          <input
            v-if="field.type !== 'textarea' && field.type !== 'select'"
            :id="field.name"
            v-model="formData[field.name]"
            :type="field.type"
            :placeholder="field.placeholder"
            :required="field.required"
          />

          <textarea
            v-else-if="field.type === 'textarea'"
            :id="field.name"
            v-model="formData[field.name]"
            :placeholder="field.placeholder"
            :required="field.required"
            rows="5"
          ></textarea>

          <select
            v-else
            :id="field.name"
            v-model="formData[field.name]"
            :required="field.required"
          >
            <option value="">请选择</option>
            <option
              v-for="option in field.options"
              :key="option"
              :value="option"
            >
              {{ option }}
            </option>
          </select>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="submit-button" :disabled="isSubmitting">
          {{ isSubmitting ? '提交中...' : (submitButtonText || '提交') }}
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped>
.block-form {
  padding: 4rem 0;
  background-color: #f9fafb;
}

.form-header {
  text-align: center;
  margin-bottom: 3rem;
}

.form-header h2 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subheading {
  color: var(--text-light);
  font-size: 1.125rem;
}

.contact-form {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  padding: 2rem;
  border-radius: var(--border-radius);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.form-field {
  margin-bottom: 1.5rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-color);
}

.required {
  color: #ef4444;
}

.form-field input,
.form-field textarea,
.form-field select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: inherit;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.form-field input:focus,
.form-field textarea:focus,
.form-field select:focus {
  outline: none;
  border-color: var(--primary-color);
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1.125rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background-color: var(--primary-color);
  opacity: 0.9;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.success-message {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #d1fae5;
  border: 1px solid #6ee7b7;
  border-radius: var(--border-radius);
  color: #065f46;
  text-align: center;
  font-size: 1.125rem;
}

.error-message {
  padding: 1rem;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: var(--border-radius);
  color: #991b1b;
  margin-bottom: 1rem;
}
</style>
