<script setup lang="ts">
import { ref, onMounted } from 'vue';
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
  ElOption
} from 'element-plus';

// Моковые данные с массивом объектов для истории изменения статусов
const mockApplications = [
  {
    id: 1,
    username: 'user1',
    amount: 500,
    status: 'create',
    statusHistory: [
      { status: 'create', date: '2024-09-10 12:30' }
    ],
    checkUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 2,
    username: 'user2',
    amount: 1000,
    status: 'waiting',
    statusHistory: [
      { status: 'create', date: '2024-09-11 09:15' },
      { status: 'waiting', date: '2024-09-11 10:00' }
    ],
    checkUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 3,
    username: 'user3',
    amount: 1500,
    status: 'transferred',
    statusHistory: [
      { status: 'create', date: '2024-09-12 08:00' },
      { status: 'waiting', date: '2024-09-12 10:30' },
      { status: 'transferred', date: '2024-09-12 16:45' }
    ],
    checkUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 4,
    username: 'user4',
    amount: 2000,
    status: 'confirmed',
    statusHistory: [
      {status: 'create', date: '2024-09-13 08:30'},
      {status: 'waiting', date: '2024-09-13 09:00'},
      {status: 'transferred', date: '2024-09-13 12:00'},
      {status: 'confirmed', date: '2024-09-13 14:30'}
    ],
    checkUrl: 'https://via.placeholder.com/150',
  },
  {
    id: 5,
    username: 'user5',
    amount: 2000,
    status: 'cancelled',
    statusHistory: [
      {status: 'create', date: '2024-09-14 08:00'},
      {status: 'waiting', date: '2024-09-14 10:30'},
      {status: 'cancelled', date: '2024-09-14 14:00'}
    ],
    checkUrl: 'https://via.placeholder.com/150',
  },
];

const applications = ref([]);
const dialogVisible = ref(false);
const checkUrl = ref('');

const statusDialogVisible = ref(false);
const selectedStatus = ref('');
const currentApplication = ref(null);
const statusOptions = ['create', 'waiting', 'transferred', 'confirmed', 'cancelled'];

const fetchApplications = async () => {
  //@ts-ignore
  applications.value = mockApplications;
};

const getStatusColor = (status: any) => {
  switch (status) {
    case 'create':
      return 'info';
    case 'waiting':
      return 'warning';
    case 'transferred':
      return 'success';
    case 'confirmed':
      return 'success';
    case 'cancelled':
      return 'danger';
    default:
      return 'info';
  }
};

const getStatusLabel = (status: any) => {
  switch (status) {
    case 'create':
      return 'Создана';
    case 'waiting':
      return 'Ожидает';
    case 'transferred':
      return 'Переведено';
    case 'confirmed':
      return 'Подтверждено';
    case 'cancelled':
      return 'Отменено';
    default:
      return 'Неизвестный статус';
  }
};

const formatDate = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}`;
};


const viewCheck = (url: any) => {
  checkUrl.value = url;
  dialogVisible.value = true;
};

const openStatusChangeDialog = (application: any) => {
  currentApplication.value = application;
  selectedStatus.value = application.status;
  statusDialogVisible.value = true;
};

const saveStatusChange = () => {
  if (currentApplication.value && selectedStatus.value) {
    const newStatus = {
      status: selectedStatus.value,
      date: formatDate()
    };
    console.log(newStatus)
    // Пушим новый статус в историю
    // currentApplication.value.statusHistory.push(newStatus);
    // currentApplication.value.status = selectedStatus.value;

    statusDialogVisible.value = false;
  }
};

const clearCurrentApplication = () => {
  currentApplication.value = null;
  selectedStatus.value = '';
};

onMounted(() => {
  fetchApplications();
});
</script>

<template>
  <el-container>
    <el-header>Заявки на пополнение</el-header>
    <el-main>
      <el-table :data="applications" style="width: 100%">
        <el-table-column prop="id" label="ID пользователя" width="180"/>
        <el-table-column prop="username" label="Username" width="180"/>
        <el-table-column prop="amount" label="Сумма пополнения" width="180"/>
        <el-table-column label="Статус">
          <template v-slot="scope">
            <!-- Popover для истории изменений статуса -->
            <el-popover
                placement="top"
                trigger="hover"
            >
              <el-timeline>
                <el-timeline-item
                    v-for="(entry, index) in scope.row.statusHistory"
                    :key="index"
                    :timestamp="entry.date"
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
        <el-table-column label="Чек">
          <template v-slot="scope">
            <el-button
                v-if="scope.row.checkUrl"
                @click="viewCheck(scope.row.checkUrl)"
                type="primary"
            >
              Посмотреть чек
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Диалог для просмотра чека -->
      <el-dialog v-model="dialogVisible">
        <img :src="checkUrl" alt="Чек" style="width: 100%"/>
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
