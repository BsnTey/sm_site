<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {Select, CloseBold} from '@element-plus/icons-vue';
import {
  ElText,
  ElRadioGroup,
  ElRadioButton,
  ElButtonGroup,
  ElButton,
  ElCheckbox,
  ElInput,
  ElTooltip,
  ElMessage
} from 'element-plus';
import {ConcatZennoConfig, Course, ZennoConfig} from '../../interfaces/zennoConfig.interface.ts';
import axios from 'axios';
import {useAuthStore} from '../../stores/auth';
import {CourseList, CourseSM} from '../../interfaces/coursesResponse.interface.ts';
import { isEqualWith } from "lodash";

const authStore = useAuthStore();
const baseUrl = import.meta.env.VITE_ZENNO_API_URL;
const ZENNO_API_KEY = authStore.apiKey;

const zennoConfig = ref<ConcatZennoConfig[]>([]);
const originalZennoConfig = ref<ConcatZennoConfig[]>([]);
const listKeysArea = ref('');
const keys = ref<string[]>([]);
const accountInput = ref<string>('');
const courseList = ref<CourseSM[]>([]);

const getConfig = async (): Promise<ZennoConfig> => {
  const headers = {zenno: ZENNO_API_KEY};
  const {data} = await axios.get(baseUrl + 'zenno/config', {headers});
  return data;
};

const getCoursesFromAccount = async (accountId: string): Promise<CourseList> => {
  const headers = {zenno: ZENNO_API_KEY};
  const {data} = await axios.get(baseUrl + `account/${accountId}/courses`, {headers});
  return data;
};

onMounted(async () => {
  const config = await getConfig();
  //@ts-ignore
  zennoConfig.value = [...config.mobile.easy, ...config.mobile.heavy];
  originalZennoConfig.value = JSON.parse(JSON.stringify(zennoConfig.value));
});

const currentActiveConfig = computed(() => zennoConfig.value.find(todo => todo.active)?.todo);

const isChangedConfig = computed(() => {
  return !isEqualWith(zennoConfig.value, originalZennoConfig.value, (_value1, _value2, key) => {
    if (key === 'disabled') {
      return true;
    }
    return undefined;
  });
});

const groupedCourses = computed(() => {
  const groups: { [key: number]: Course[] } = {};
  const courses = zennoConfig.value.find(todo => todo.todo === 'course')?.courses;
  if (courses) {
    courses.forEach(course => {
      groups[course.count] = groups[course.count] || [];
      groups[course.count].push(course);
    });
  }
  return groups;
});

const selectTodo = (newTodoKey: string) => {
  zennoConfig.value.forEach(todo => (todo.active = newTodoKey === todo.todo));
};

const saveChanges = async () => {
  const payload = {
    mobile: {
      easy: zennoConfig.value.filter(item => !item.courses),
      heavy: zennoConfig.value.filter(item => item.courses)
    }
  };

  const headers = {zenno: ZENNO_API_KEY};
  const {data} = await axios.patch(baseUrl + 'zenno/config', payload, {headers});

  zennoConfig.value = [...data.mobile.easy, ...data.mobile.heavy];
  originalZennoConfig.value = JSON.parse(JSON.stringify(zennoConfig.value));

  return data;
};

const sumCourseBonus = computed(() => {
  const courses = zennoConfig.value.find(todo => todo.todo === 'course')?.courses;
  return courses?.reduce((sum, course) => sum + (course.active ? course.count : 0), 0) || 0;
});

const toggleAllCourses = (flag: boolean) => {
  const courses = zennoConfig.value.find(todo => todo.todo === 'course')?.courses;
  if (courses) {
    courses.forEach(course => (course.active = flag));
  }
};

const toggleGroupCourses = (flag: boolean, count: number) => {
  const courses = zennoConfig.value.find(todo => todo.todo === 'course')?.courses;
  if (courses) {
    courses.forEach(course => {
      if (course.count === count) {
        course.active = flag;
      }
    });
  }
};

watch(
    () => listKeysArea.value.split(/[\n\t]+/),
    newValue => {
      keys.value = newValue;
    }
);

const watchAccountId = async (accountInput: string) => {
  if (!accountInput) {
    courseList.value = [];
    return;
  }
  toggleAllCourses(false);

  try {
    const data = await getCoursesFromAccount(accountInput);
    courseList.value = data.list;
  } catch (err) {
    ElMessage.error('Ошибка при запросе курсов');
  }
};

watch(accountInput, watchAccountId);

const isDisabled = (courseFromCheckbox: Course) => {
  if (courseList.value.length === 0) return false;
  const findCourse = courseList.value.find(courseFromResp => courseFromCheckbox.id === courseFromResp.id);
  if (!findCourse) return false;
  return findCourse.status === 'FINISHED';
};
</script>


<template>
  <div class="container container__ZennoPanel">
    <div class="way__wrap">
      <div class="wayTodo">
        <div class="wayTodo__ways">
          <div class="wayTodo__ways-wrap">
            <el-text class="mx-1 wayTodo__ways-title">Выбор направления</el-text>
            <el-button type="success" :disabled="!isChangedConfig" class="wayTodo__save-btn reset-margin"
                       @click="saveChanges">Сохранить
            </el-button>
          </div>
          <el-radio-group class="wayToDo__radio-ways" size="large" v-model="currentActiveConfig">
              <el-radio-button
                  v-for="todo in zennoConfig"
                  :key="todo.todo"
                  class="wayToDo__way"
                  :label="todo.name"
                  :value="todo.todo"
                  @click="selectTodo(todo.todo)"
              />
          </el-radio-group>

        </div>
        <div v-if="currentActiveConfig === 'course'">
        <div class="wayTodo__bonusCount-wrap">
          <div class="wayTodo__bonusCount">
            <div class="wayTodo__bonus">
              <div v-for="(courses, count) in groupedCourses" :key="count" class="bonusCount-group">
                <el-button-group class="bonusCount-group__btns">
                  <el-button type="primary" color="#67C23A" :icon="Select" size="small"
                             @click="toggleGroupCourses(true, count)">
                  </el-button>
                  <el-button type="primary" color="#F56C6C" :icon="CloseBold" size="small"
                             @click="toggleGroupCourses(false, count)">
                  </el-button>
                </el-button-group>
                <div v-for="course in courses" :key="course.id" class="bonusCount-group__btn-count">
                  <el-tooltip
                      effect="dark"
                      :content="course.name"
                      :open-delay="1000"
                      placement="top"
                  >
                  <el-checkbox
                      class="reset-margin"
                      :label="course.count"
                      :disabled="isDisabled(course)"
                      v-model="course.active"
                  />
                  </el-tooltip>
                </div>
              </div>
            </div>
            <div class="do-course-btns">
              <div class="wayTodo__count">
                {{ sumCourseBonus }}
              </div>
              <el-button type="primary" class="wayTodo__save-btn reset-margin" @click="toggleAllCourses(true)">Все
              </el-button>
              <el-button type="primary" class="wayTodo__save-btn reset-margin" @click="toggleAllCourses(false)">Сбросить
              </el-button>

            </div>
          </div>
        </div>
          <el-input class="wayTodo__account-input" v-model="accountInput" placeholder="Введите аккаунт" clearable/>
        </div>

      </div>

    </div>
  </div>
</template>

<style scoped>

.container__ZennoPanel {
  margin-top: 50px;
  width: 800px;
  display: flex;
  gap: 30px;
  flex-direction: column;
}

.wayTodo {
  display: flex;
  gap: 60px;
  justify-content: space-between;
  height: max-content;
}

.way__wrap {
  width: 100%;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 30px 38px;
  display: flex;
  flex-direction: column;
}

.wayTodo__ways {
  display: flex;
  gap: 30px;
}

.wayTodo__ways-wrap {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.wayTodo__ways-title {
  align-self: start;
  padding-top: 10px;
  font-size: 16px;
}

.wayTodo__bonusCount {
  display: flex;
  gap: 20px;
}

.wayToDo__radio-ways {
  display: flex;
  flex-direction: column;
  align-items: start;
  gap: 5px;
  width: max-content;
}

.wayToDo__radio-ways label {
  display: flex;
  width: 100%;
}

.wayTodo__bonus {
  display: flex;
  gap: 10px;
}

.wayTodo__account-input {
  margin-top: 15px;
}

.bonusCount-group__btns {
  display: flex;
  margin-bottom: 10px;
}

.bonusCount-group__btn-count {
  padding: 0px 8px;
  border-radius: 5px;
}

.bonusCount-group__btn-count:hover {
  background-color: #E5EAF3;
}

.bonusCount-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.wayTodo__count {
  padding: 6px 14px;
  background-color: #53CC93;
  color: white;
  font-size: 20px;
  border-radius: 10px;
  height: fit-content;
  text-align: center;
  width: 70px;
}

.do-course-btns {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.wayTodo__save-btn {
  width: 100px;
  align-self: center;
}


</style>