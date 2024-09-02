<script setup lang="ts">
import { reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { FormInstance, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import { useAuthStore } from '../../stores/auth';
import router from "../../router";


const authStore = useAuthStore();
const ruleFormRef = ref<FormInstance>();

const validateApiKey = (rule: any, value: any, callback: any) => {
  // Проверка API Key (например, по длине или формату)
  if (value.length < 10) {
    callback(new Error('API Key должен быть не менее 10 символов'));
  } else {
    callback();
  }
};

const loginRules = reactive({
  apiKey: [
    { required: true, message: 'Пожалуйста, введите API Key', trigger: 'blur' },
    { validator: validateApiKey, trigger: 'blur' },
  ],
});

const ruleForm = reactive({
  apiKey: '',
});

const handleLogin = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.validate(async (valid) => {
    if (valid) {
      await authStore.login(ruleForm.apiKey);

      if (authStore.isLoggedIn) {
        ElMessage({
          message: 'Авторизация успешна!',
          type: 'success',
        });
        await router.push('/panel');
      } else {
        ElMessage.error(authStore.errorMessage || 'Ошибка авторизации. Проверьте API Key.');
      }
    } else {
      return false;
    }
  });
};
</script>

<template>
  <div class="login-container">
    <div class="login-form">
      <h1>Авторизация</h1>
        <ElForm ref="ruleFormRef" :model="ruleForm" :rules="loginRules" label-width="120px" class="demo-ruleForm">
          <ElFormItem label="API Key" prop="apiKey">
            <ElInput v-model="ruleForm.apiKey" />
          </ElFormItem>
          <ElFormItem>
            <ElButton type="primary" @click="handleLogin(ruleFormRef)" :loading="authStore.isLoading">Войти</ElButton>
          </ElFormItem>
        </ElForm>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f2f5;
}

.login-form {
  background-color: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>