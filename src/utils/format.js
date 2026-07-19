export const formatDate = (date) => {
    if (!date) return '---'
    
    // Đã fix lỗi "Invalid Date"


    return new Date(date).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

export const formatPriority = (priority) => {
    const map = {
        LOW: 'Thấp',
        MEDIUM: 'Trung bình',
        HIGH: 'Cao',
        URGENT: 'Khẩn cấp'
    }
    return map[priority] || priority
}