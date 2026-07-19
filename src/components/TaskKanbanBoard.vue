<template>
    <div class="kanban-board mt-2">
        <div
            v-for="col in kanbanColumns" :key="col.status"
            class="kanban-col"
            :class="`kanban-col--${col.status.toLowerCase()}`"
            @dragover.prevent
            @drop="onDrop($event, col.status)"
        >
            <div class="kanban-col__header">
                <v-chip :color="col.color" size="small" class="font-weight-bold mr-2">{{ getTasksByStatus(col.status).length }}</v-chip>
                <span class="font-weight-bold text-subtitle-2">{{ col.label }}</span>
            </div>

            <div class="kanban-cards">
                <div
                    v-for="task in getTasksByStatus(col.status)" :key="task.id"
                    class="kanban-card"
                    :draggable="isDraggable(task)"
                    @dragstart="onDragStart($event, task)"
                    :class="{ 'kanban-card--draggable': isDraggable(task) }"
                >
                    <div class="kanban-card__title" @click="$emit('go-detail', task)">{{ task.title }}</div>
                    <div class="kanban-card__meta">
                        <v-chip :color="getPriorityColor(task.priority)" size="x-small" variant="tonal" class="mr-1">
                            {{ getTaskPriorityVN(task.priority) }}
                        </v-chip>
                    </div>
                    <div class="kanban-card__footer">
                        <span class="text-caption text-grey">
                            <v-icon size="12" class="mr-1">mdi-folder-outline</v-icon>
                            {{ getProjectName(task.projectId) }}
                        </span>
                        <span v-if="task.deadline" class="text-caption" :class="isOverdue(task) ? 'text-error font-weight-bold' : 'text-grey'">
                            <v-icon size="12" class="mr-1">mdi-clock-outline</v-icon>
                            {{ new Date(task.deadline).toLocaleDateString('vi-VN') }}
                        </span>
                    </div>
                </div>

                <div v-if="getTasksByStatus(col.status).length === 0" class="kanban-empty">
                    Không có công việc
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    kanbanColumns: {
        type: Array,
        required: true
    },
    tasks: {
        type: Array,
        required: true
    },
    getProjectName: {
        type: Function,
        required: true
    },
    getPriorityColor: {
        type: Function,
        required: true
    },
    getTaskPriorityVN: {
        type: Function,
        required: true
    },
    isOverdue: {
        type: Function,
        required: true
    },
    canManageTaskItem: {
        type: Function,
        default: () => false
    },
    currentUserId: {
        type: [String, Number],
        default: null
    }
})

const emit = defineEmits(['drop-task', 'go-detail'])

const getTasksByStatus = (status) => {
    return props.tasks.filter(t => t.status === status)
}

const isDraggable = (task) => {
    if (props.canManageTaskItem(task)) return true;
    if (props.currentUserId && task.assigneeId === props.currentUserId) return true;
    return false;
}

let draggedTask = null
const onDragStart = (event, task) => {
    draggedTask = task
    event.dataTransfer.effectAllowed = 'move'
}

const onDrop = (event, newStatus) => {
    if (!draggedTask) return
    emit('drop-task', { task: draggedTask, newStatus })
    draggedTask = null
}
</script>

<style scoped>
.kanban-board {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 16px;
  min-height: 500px;
  align-items: flex-start;
}

.kanban-col {
  flex: 1;
  min-width: 220px;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 12px;
  transition: background 0.2s;
}

.v-theme--dark .kanban-col {
  background: #252b36;
}

.kanban-col.dragover {
  background: #e3f2fd;
}

.kanban-col__header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(0,0,0,0.08);
}

.kanban-cards {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 80px;
}

.kanban-card {
  background: white;
  border-radius: 10px;
  padding: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s, transform 0.15s;
  border-left: 4px solid #e0e0e0;
}

.v-theme--dark .kanban-card {
  background: #1e222a;
}

.kanban-card--draggable {
  cursor: grab;
  border-left-color: #1976D2;
}

.kanban-card--draggable:hover {
  box-shadow: 0 4px 12px rgba(25,118,210,0.25);
  transform: translateY(-2px);
}

.kanban-card--draggable:active {
  cursor: grabbing;
  opacity: 0.7;
}

.kanban-card__title {
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 8px;
  cursor: pointer;
  color: #212121;
  word-break: break-word;
  line-height: 1.4;
}
.v-theme--dark .kanban-card__title {
  color: #e0e0e0;
}

.kanban-card__title:hover {
  color: #1976D2;
}

.kanban-card__meta {
  margin-bottom: 8px;
}

.kanban-card__footer {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding-top: 8px;
  border-top: 1px solid #f0f0f0;
}

.kanban-empty {
  text-align: center;
  color: #bdbdbd;
  font-size: 0.8rem;
  padding: 24px 8px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
}
</style>
