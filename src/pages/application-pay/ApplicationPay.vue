<script setup lang="ts">
import {ref, onMounted, watch} from 'vue';
import {
  ElContainer,
  ElHeader,
  ElMain,
  ElButton,
  ElTable,
  ElTableColumn,
  ElTimeline,
  ElTimelineItem,
  ElPopover,
  ElDialog,
  ElSelect,
  ElOption,
  ElBadge,
  ElRadioGroup,
  ElRadioButton,
  ElNotification
} from 'element-plus';
import axios from "axios";
import {useAuthStore} from "../../stores/auth.ts";
import {Payment} from "../../interfaces/payments.interface.ts";

const authStore = useAuthStore();
const ZENNO_API_KEY = authStore.apiKey;
const baseUrl = import.meta.env.VITE_ZENNO_API_URL;

const applications = ref<Payment[]>([]);
const viewApplications = ref<Payment[]>([]);
const selectedViewApplications = ref('Transfered');

const dialogVisible = ref(false);
const receiptUrl = ref('');
const paymentId = ref('');

const statusDialogVisible = ref(false);
const selectedStatus = ref('');
const currentApplication = ref<Payment | null>(null);
const statusOptions = ['Created', 'Proceedings', 'Transfered', 'Completed', 'Cancelled'];
const countTransferedBadge = ref(0);

const fetchApplications = async () => {
  const headers = {zenno: ZENNO_API_KEY};
  const {data} = await axios.get<Payment[]>(baseUrl + `payment`, {headers});
  applications.value = data;
};

const updateStatus = async () => {
  const headers = {zenno: ZENNO_API_KEY};
  const payload = {
    status: selectedStatus.value
  }
  const data = await axios.patch<Payment[]>(baseUrl + `payment/${paymentId.value}`, payload, {headers});
  applications.value = data.data;
  return data.status;
};

const getStatusColor = (status: any) => {
  switch (status) {
    case 'Created':
      return 'info';
    case 'Proceedings':
      return 'warning';
    case 'Transfered':
      return 'primary';
    case 'Completed':
      return 'success';
    case 'Cancelled':
      return 'danger';
    default:
      return 'info';
  }
};

const getStatusLabel = (status: any) => {
  switch (status) {
    case 'Created':
      return 'Создана';
    case 'Proceedings':
      return 'Разбирательство';
    case 'Transfered':
      return 'Переведено';
    case 'Completed':
      return 'Подтверждено';
    case 'Cancelled':
      return 'Отменено';
    default:
      return 'Неизвестный статус';
  }
};

const formatDate = (date: Date | null): string => {
  if (!date) return '—';

  const parsedDate = new Date(date);

  return parsedDate.toLocaleString('default', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const viewCheck = (url: any) => {
  receiptUrl.value = url;
  dialogVisible.value = true;
};

const openStatusChangeDialog = (application: Payment) => {
  currentApplication.value = application;
  selectedStatus.value = application.status;
  paymentId.value = application.id;
  statusDialogVisible.value = true;
};

const saveStatusChange = async () => {
  if (currentApplication.value && selectedStatus.value) {
    const status = await updateStatus();
    if (status == 200) {
      ElNotification({
        title: 'Сохранено',
        message: 'Статус изменен',
        type: 'success',
      })
      statusDialogVisible.value = false;
    }

  }
};

const clearCurrentApplication = () => {
  currentApplication.value = null;
  selectedStatus.value = '';
};

onMounted(() => {
  fetchApplications();
});

const filterPayments = () => {
  viewApplications.value = applications.value.filter(payment => {
    if (selectedViewApplications.value == "All") return true;
    return payment.status === selectedViewApplications.value
  });
  countTransferedBadge.value = applications.value.filter(payment => payment.status === 'Transfered').length;
}


watch([selectedViewApplications, applications], filterPayments);

</script>

<template>
  <el-container>
    <el-header>Заявки на пополнение</el-header>
    <el-radio-group v-model="selectedViewApplications">
      <el-radio-button label="Все" value="All" />
      <el-badge v-if="countTransferedBadge > 0" :value="countTransferedBadge" class="item" type="primary">
        <el-radio-button label="Переведеные" value="Transfered" />
      </el-badge>
      <el-radio-button v-else label="Переведеные" value="Transfered" />
      <el-radio-button label="Подтвержденые" value="Completed" />
      <el-radio-button label="Разбирательство" value="Proceedings" />
      <el-radio-button label="Созданные" value="Created" />
      <el-radio-button label="Отмененные" value="Cancelled" />
    </el-radio-group>
    <el-main>
      <el-table :data="viewApplications" style="width: 100%">
<!--        <el-table-column prop="id" label="ID пользователя" width="180"/>-->
        <el-table-column prop="userTelegramName" label="Username" width="180"/>
        <el-table-column prop="amount" label="Сумма пополнения" width="180"/>
        <el-table-column prop="amountCredited" label="К пополнению" width="180"/>
        <el-table-column label="Завершено" width="180">
          <template v-slot="scope">
            {{ formatDate(scope.row.completedAt) }}
          </template>
        </el-table-column>
        <el-table-column label="Статус" width="180">
          <template v-slot="scope">
            <el-popover
                placement="left"
                trigger="hover"
            >
              <el-timeline>
                <el-timeline-item
                    v-for="(entry, index) in scope.row.statusHistory"
                    :key="index"
                    :timestamp="formatDate(new Date(entry.date))"
                >
                  {{ getStatusLabel(entry.status) }}
                </el-timeline-item>
              </el-timeline>
              <template #reference>
                <el-button :type="getStatusColor(scope.row.status)" @click="openStatusChangeDialog(scope.row)">
                  {{ getStatusLabel(scope.row.status) }}
                </el-button>
              </template>
            </el-popover>
          </template>
        </el-table-column>
        <el-table-column label="Чек" width="180">
          <template v-slot="scope">
            <el-button
                v-if="scope.row.receiptUrl"
                @click="viewCheck(scope.row.receiptUrl)"
                type="primary"
            >
              Посмотреть чек
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Диалог для просмотра чека -->
      <el-dialog v-model="dialogVisible">
        <img :src="receiptUrl" alt="Чек" style="width: 100%"/>
      </el-dialog>

      <!-- Диалог для изменения статуса -->
      <el-dialog v-model="statusDialogVisible" title="Изменить статус заявки" width="30%"
                 @close="clearCurrentApplication">
        <el-select v-model="selectedStatus" placeholder="Выберите статус">
          <el-option v-for="status in statusOptions" :key="status" :label="getStatusLabel(status)" :value="status">
          </el-option>
        </el-select>
        <el-button @click="saveStatusChange" type="primary" style="margin-top: 20px;">Сохранить</el-button>
      </el-dialog>
    </el-main>
  </el-container>
</template>

<style>
.el-table {
  margin-top: 20px;
}
</style>
