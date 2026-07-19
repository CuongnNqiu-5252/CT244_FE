<template>
    <v-container fluid class="py-6">
        <div class="mb-6">
            <h2 class="text-h4 font-weight-bold mb-1">Tổng quan hệ thống</h2>
            <p class="text-grey">Chào mừng trở lại, {{ authStore.user?.fullName || 'Admin' }}!</p>
        </div>

        <!-- Thẻ thống kê (Stats Cards) -->
        <v-row>
            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="rounded-lg pa-4 h-100 d-flex align-center bg-blue-lighten-5">
                    <v-avatar color="primary" size="50" class="mr-4 rounded-lg">
                        <v-icon color="white" size="30">mdi-account-group</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-h5 font-weight-bold text-primary">{{ userStore.users.length }}</div>
                        <div class="text-caption font-weight-bold text-grey-darken-1">Tổng người dùng</div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="rounded-lg pa-4 h-100 d-flex align-center bg-teal-lighten-5">
                    <v-avatar color="teal" size="50" class="mr-4 rounded-lg">
                        <v-icon color="white" size="30">mdi-folder-multiple</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-h5 font-weight-bold text-teal">{{ projectStore.allSystemProjects.length }}</div>
                        <div class="text-caption font-weight-bold text-grey-darken-1">Dự án hệ thống</div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="rounded-lg pa-4 h-100 d-flex align-center bg-orange-lighten-5">
                    <v-avatar color="orange-darken-1" size="50" class="mr-4 rounded-lg">
                        <v-icon color="white" size="30">mdi-clipboard-list</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-h5 font-weight-bold text-orange-darken-2">{{ taskStore.tasks.length }}</div>
                        <div class="text-caption font-weight-bold text-grey-darken-1">Tổng công việc</div>
                    </div>
                </v-card>
            </v-col>

            <v-col cols="12" sm="6" md="3">
                <v-card elevation="2" class="rounded-lg pa-4 h-100 d-flex align-center bg-red-lighten-5">
                    <v-avatar color="red" size="50" class="mr-4 rounded-lg">
                        <v-icon color="white" size="30">mdi-alert-circle</v-icon>
                    </v-avatar>
                    <div>
                        <div class="text-h5 font-weight-bold text-red">{{ lateTasksCount }}</div>
                        <div class="text-caption font-weight-bold text-grey-darken-1">Công việc quá hạn</div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Hàng 2: Biểu đồ Pie (Trạng thái công việc) + Biểu đồ Bar (Công việc theo dự án) -->
        <v-row class="mt-4">
            <!-- Pie Chart: Tỉ lệ trạng thái công việc -->
            <v-col cols="12" md="4">
                <v-card class="pa-5 h-100" elevation="2" border>
                    <h3 class="text-h6 font-weight-bold mb-4">
                        <v-icon class="mr-2" color="primary">mdi-chart-pie</v-icon>
                        Tỉ lệ trạng thái công việc
                    </h3>
                    <div style="position: relative; height: 240px;">
                        <Pie v-if="taskPieData.datasets[0].data.some(v => v > 0)" :data="taskPieData" :options="pieOptions" />
                        <div v-else class="d-flex align-center justify-center h-100 text-grey text-body-2">
                            Chưa có dữ liệu công việc
                        </div>
                    </div>
                    <div class="mt-3 d-flex flex-wrap gap-2 justify-center">
                        <v-chip
                            v-for="(label, i) in taskPieData.labels" :key="i"
                            size="x-small" class="font-weight-bold"
                            :style="{ backgroundColor: taskPieData.datasets[0].backgroundColor[i], color: 'white' }">
                            {{ label }}: {{ taskPieData.datasets[0].data[i] }}
                        </v-chip>
                    </div>
                </v-card>
            </v-col>

            <!-- Bar Chart: Số lượng công việc theo dự án (Top 5) -->
            <v-col cols="12" md="8">
                <v-card class="pa-5 h-100" elevation="2" border>
                    <h3 class="text-h6 font-weight-bold mb-4">
                        <v-icon class="mr-2" color="teal">mdi-chart-bar</v-icon>
                        Công việc theo dự án (Top 5)
                    </h3>
                    <div style="position: relative; height: 240px;">
                        <Bar v-if="taskBarData.labels.length > 0" :data="taskBarData" :options="barOptions" />
                        <div v-else class="d-flex align-center justify-center h-100 text-grey text-body-2">
                            Chưa có dữ liệu
                        </div>
                    </div>
                </v-card>
            </v-col>
        </v-row>

        <!-- Hàng 3: Dự án mới nhất -->
        <v-row class="mt-4">
            <v-col cols="12">
                <v-card elevation="2" border>
                    <v-card-title class="d-flex align-center py-4 px-5">
                        <v-icon class="mr-2" color="primary">mdi-folder-clock-outline</v-icon>
                        <span class="text-h6 font-weight-bold">Dự án mới nhất</span>
                        <v-spacer></v-spacer>
                        <v-btn variant="text" size="small" color="primary" to="/admin/projects">Xem tất cả</v-btn>
                    </v-card-title>
                    <v-divider></v-divider>
                    <v-table>
                        <thead>
                            <tr>
                                <th class="text-left font-weight-bold">Tên dự án</th>
                                <th class="text-left font-weight-bold">Chủ sở hữu</th>
                                <th class="text-left font-weight-bold">Ngày tạo</th>
                                <th class="text-center font-weight-bold">Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="item in recentProjects" :key="item.id">
                                <td class="font-weight-medium">{{ item.name }}</td>
                                <td>{{ getUserName(item.ownerId) }}</td>
                                <td>{{ new Date(item.createdAt).toLocaleDateString('vi-VN') }}</td>
                                <td class="text-center">
                                    <v-chip size="x-small" :color="item.status === 'ACTIVE' ? 'success' : 'grey'" label>{{ item.status }}</v-chip>
                                </td>
                            </tr>
                        </tbody>
                    </v-table>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>



<script setup>
import { onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { useProjectStore } from '@/stores/project'
import { useTaskStore } from '@/stores/task'
import { Pie, Bar } from 'vue-chartjs'
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
    BarElement,
    Title
} from 'chart.js'

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title)

const authStore = useAuthStore()
const userStore = useUserStore()
const projectStore = useProjectStore()
const taskStore = useTaskStore()

const recentProjects = computed(() => projectStore.allSystemProjects.slice(0, 5))
const lateTasksCount = computed(() => taskStore.tasks.filter(t => t.deadline && new Date(t.deadline) < new Date() && t.status !== 'DONE').length)

const getUserName = (id) => {
    const u = userStore.users.find(x => x.id === id)
    return u ? (u.fullName || u.username) : id
}

const projectStats = computed(() => {
    const all = projectStore.allSystemProjects
    const total = all.length || 1
    return {
        total,
        active: all.filter(p => p.status === 'ACTIVE').length,
        completed: all.filter(p => p.status === 'COMPLETED').length,
        other: all.filter(p => !['ACTIVE', 'COMPLETED'].includes(p.status)).length
    }
})

// ========== Pie Chart: Tỉ lệ trạng thái công việc ==========
const taskPieData = computed(() => {
    const tasks = taskStore.tasks
    return {
        labels: ['Chờ xử lý', 'Đang làm', 'Hoàn thành', 'Đã hủy'],
        datasets: [{
            data: [
                tasks.filter(t => t.status === 'TO_DO').length,
                tasks.filter(t => t.status === 'IN_PROGRESS').length,
                tasks.filter(t => t.status === 'DONE').length,
                tasks.filter(t => t.status === 'CANCELLED').length,
            ],
            backgroundColor: ['#64B5F6', '#FFB74D', '#81C784', '#EF9A9A'],
            borderColor: ['#1E88E5', '#FB8C00', '#43A047', '#E53935'],
            borderWidth: 2,
        }]
    }
})

const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx) => {
                    const total = ctx.dataset.data.reduce((a, b) => a + b, 0)
                    const pct = total ? Math.round(ctx.raw / total * 100) : 0
                    return ` ${ctx.label}: ${ctx.raw} (${pct}%)`
                }
            }
        }
    }
}

// ========== Bar Chart: Số công việc theo dự án (Top 5) ==========
const taskBarData = computed(() => {
    const tasks = taskStore.tasks
    const projects = projectStore.allSystemProjects

    const countMap = {}
    tasks.forEach(t => {
        if (t.projectId) {
            countMap[t.projectId] = (countMap[t.projectId] || 0) + 1
        }
    })

    const sorted = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)

    const labels = sorted.map(([pid]) => {
        const proj = projects.find(p => p.id === pid)
        const name = proj?.name || pid
        return name.length > 18 ? name.substring(0, 18) + '...' : name
    })

    return {
        labels,
        datasets: [{
            label: 'Số công việc',
            data: sorted.map(([, count]) => count),
            backgroundColor: [
                'rgba(66, 165, 245, 0.8)',
                'rgba(38, 198, 218, 0.8)',
                'rgba(102, 187, 106, 0.8)',
                'rgba(255, 167, 38, 0.8)',
                'rgba(239, 83, 80, 0.8)',
            ],
            borderColor: ['#1E88E5', '#00ACC1', '#43A047', '#FB8C00', '#E53935'],
            borderWidth: 2,
            borderRadius: 6,
        }]
    }
})

const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            callbacks: {
                label: (ctx) => ` ${ctx.raw} công việc`
            }
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { stepSize: 1 },
            grid: { color: 'rgba(0,0,0,0.05)' }
        },
        x: { grid: { display: false } }
    }
}

onMounted(async () => {
    await Promise.all([
        userStore.fetchAll(),
        projectStore.fetchAllSystem(),
        taskStore.fetchAll()
    ])
})
</script>