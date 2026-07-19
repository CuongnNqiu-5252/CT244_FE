<template>
    <v-container>
        <div class="d-flex align-center justify-space-between mb-4">
            <h2>Công việc được giao</h2>
            <v-btn-toggle v-model="viewMode" mandatory density="compact" variant="outlined" color="primary">
                <v-btn value="table" size="small" title="Chế độ bảng">
                    <v-icon>mdi-view-list</v-icon>
                </v-btn>
                <v-btn value="kanban" size="small" title="Chế độ Kanban">
                    <v-icon>mdi-view-week</v-icon>
                </v-btn>
            </v-btn-toggle>
        </div>

        <v-data-table
            v-if="viewMode === 'table'"
            :headers="headers"
            :items="myTasks"
            :loading="loading"
            class="elevation-1"
            mobile-breakpoint="md"
            no-data-text="Bạn chưa được giao công việc nào"
        >
            <template v-slot:item.title="{ item }">
                <v-tooltip location="top" max-width="400">
                    <template v-slot:activator="{ props }">
                        <span v-bind="props" class="d-inline-block text-truncate" style="max-width: 200px;">
                            {{ item.title }}
                        </span>
                    </template>
                    <span>{{ item.title }}</span>
                </v-tooltip>
            </template>

            <template v-slot:item.projectId="{ item }">
                {{ getProjectName(item.projectId) }}
            </template>

            <template v-slot:item.status="{ item }">
                <v-menu location="bottom">
                    <template v-slot:activator="{ props }">
                        <v-chip v-bind="props" :color="getStatusColor(item.status)" size="small" link class="cursor-pointer font-weight-bold" style="min-width: 140px; justify-content: center;">
                            {{ getTaskStatusVN(item.status) }}
                            <v-icon end size="small">mdi-chevron-down</v-icon>
                        </v-chip>
                    </template>
                    <v-list density="compact">
                        <v-list-item v-for="opt in statusOptions" :key="opt.value" :value="opt.value" @click="handleUpdateStatus(item, opt.value)">
                            <v-list-item-title>
                                <v-chip size="x-small" :color="getStatusColor(opt.value)" class="mr-2"></v-chip>
                                {{ opt.title }}
                            </v-list-item-title>
                        </v-list-item>
                    </v-list>
                </v-menu>
            </template>

            <template v-slot:item.priority="{ item }">
                <v-chip :color="getPriorityColor(item.priority)" size="small" variant="outlined" style="min-width: 100px; justify-content: center;">
                    {{ getTaskPriorityVN(item.priority) }}
                </v-chip>
            </template>

            <template v-slot:item.deadline="{ item }">
                {{ item.deadline ? new Date(item.deadline).toLocaleDateString('vi-VN') : '' }}
            </template>

            <template v-slot:item.actions="{ item }">
                <v-icon size="small" @click="goDetail(item)">mdi-eye</v-icon>
            </template>
        </v-data-table>

        <TaskKanbanBoard
            v-if="viewMode === 'kanban'"
            :kanban-columns="kanbanColumns"
            :tasks="myTasks"
            :get-project-name="getProjectName"
            :get-priority-color="getPriorityColor"
            :get-task-priority-v-n="getTaskPriorityVN"
            :is-overdue="isOverdue"
            :current-user-id="authStore.user?.id"
            @drop-task="handleDropTask"
            @go-detail="goDetail"
        />
    </v-container>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/task'
import { useProjectStore } from '@/stores/project'
import { useAuthStore } from '@/stores/auth'
import Swal from 'sweetalert2'
import TaskKanbanBoard from '@/components/TaskKanbanBoard.vue'

const router = useRouter()
const taskStore = useTaskStore()
const authStore = useAuthStore()
const projectStore = useProjectStore()

const viewMode = ref('table')

// ===== KANBAN BOARD =====
const kanbanColumns = [
    { status: 'TO_DO',      label: 'Cần làm',    color: 'default' },
    { status: 'IN_PROGRESS', label: 'Đang làm',  color: 'info' },
    { status: 'DONE',       label: 'Hoàn thành',  color: 'success' },
    { status: 'CANCELLED',  label: 'Đã hủy',     color: 'error' },
]

const handleDropTask = async ({ task, newStatus }) => {
    if (task.status === newStatus) return
    try {
        await taskStore.updateStatus(task.id, newStatus, '')
        Swal.fire({ title: 'Thành công', text: `Đã chuyển sang "${kanbanColumns.find(c => c.status === newStatus)?.label}"`, icon: 'success', timer: 1500, showConfirmButton: false })
    } catch (err) {
        const msg = err.response?.status === 403
            ? 'Bạn không có quyền thay đổi trạng thái công việc này'
            : (err.response?.data?.message || err.message)
        Swal.fire('Lỗi', msg, 'error')
    }
}
// ========================

const statusOptions = [
  { title: 'Cần làm', value: 'TO_DO' },
  { title: 'Đang làm', value: 'IN_PROGRESS' },
  { title: 'Hoàn thành', value: 'DONE' },
  { title: 'Đã hủy', value: 'CANCELLED' }
]

const priorityOptions = [
  { title: 'Thấp', value: 'LOW' },
  { title: 'Trung bình', value: 'MEDIUM' },
  { title: 'Cao', value: 'HIGH' }
]

const getTaskStatusVN = (status) => {
  const found = statusOptions.find(o => o.value === status)
  return found ? found.title : status
}

const getTaskPriorityVN = (priority) => {
  const found = priorityOptions.find(o => o.value === priority)
  return found ? found.title : priority
}

const loading = computed(() => taskStore.loading)

// Lọc công việc theo ID người dùng hiện tại
const myTasks = computed(() => {
    const userId = authStore.user?.id
    if (!userId) return []
    // Lấy từ danh sách tất cả task của hệ thống, sau đó lọc ra những task được giao cho mình
    return taskStore.tasks.filter(t => t.assigneeId === userId)
})

const projects = computed(() => projectStore.projects)

const getProjectName = (projectId) => {
    const project = projects.value.find(p => p.id === projectId)
    return project ? project.name : projectId
}

const goDetail = (item) => {
    const realItem = item.raw || item
    router.push(`/member/tasks/${realItem.id}`)//
}

const headers = [
    { title: 'Tiêu đề', key: 'title', width: '16.66%' },
    { title: 'Dự án', key: 'projectId', width: '16.66%' },
    { title: 'Ưu tiên', key: 'priority', align: 'center', width: '16.66%' },
    { title: 'Trạng thái', key: 'status', align: 'center', width: '16.66%' },
    { title: 'Hạn chót', key: 'deadline', align: 'center', width: '16.66%' },
    { title: 'Hành động', key: 'actions', sortable: false, align: 'center', width: '16.66%' },
]

const getStatusColor = (status) => {
    if (status === 'DONE') return 'success'
    if (status === 'IN_PROGRESS') return 'info'
    if (status === 'CANCELLED') return 'error'
    return 'default'
}

const getPriorityColor = (priority) => {
    if (priority === 'HIGH') return 'red'
    if (priority === 'MEDIUM') return 'orange'
    return 'green'
}

const handleUpdateStatus = async (item, newStatus) => {
    const realItem = item.raw || item // Xử lý reactivity của Vuetify data table
    if (realItem.status === newStatus) return
    // Nếu chuyển sang CANCELLED hoặc DONE, có thể cần confirm hoặc nhập lý do (tạm thời để null)
    // Backend yêu cầu: updateStatus(id, status, cancelReason)
    try {
        await taskStore.updateStatus(realItem.id, newStatus, '')
        Swal.fire({ title: 'Thành công', text: 'Cập nhật trạng thái thành công!', icon: 'success', timer: 2000, showConfirmButton: false })
    } catch (err) {
        const msg = err.response?.status === 403 
            ? "Bạn không có quyền chỉnh sửa trạng thái của công việc này" 
            : (err.response?.data?.message || err.message)
        Swal.fire('Lỗi', "Lỗi cập nhật trạng thái: " + msg, 'error')
    }
}

const isOverdue = (task) => task.deadline && new Date(task.deadline) < new Date() && task.status !== 'DONE'

onMounted(() => {
    // Lấy tất cả task và project của hệ thống để đảm bảo có đủ dữ liệu
    // để lọc ra task của mình và hiển thị đúng tên dự án.
    taskStore.fetchAll()
    projectStore.fetchAll()
})
</script>

<style scoped>
.primary-gradient-btn {
  background: linear-gradient(45deg, #1976D2, #42A5F5) !important;
  color: white !important;
  text-transform: none !important;
  letter-spacing: 0.5px;
}

@keyframes pulse-primary {
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
}

.pulse-primary {
  animation: pulse-primary 2s infinite;
}

</style>