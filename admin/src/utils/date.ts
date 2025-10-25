/**
 * 格式化日期时间
 * @param date - 日期字符串或 Date 对象
 * @param format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: string | Date,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化相对时间（多久之前）
 * @param date - 日期字符串或 Date 对象
 * @returns 相对时间描述
 */
export function formatRelativeTime(date: string | Date): string {
  if (!date) return '-'

  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) return '-'

  const now = new Date()
  const diff = now.getTime() - d.getTime()

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (years > 0) return `${years}年前`
  if (months > 0) return `${months}个月前`
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  if (seconds > 0) return `${seconds}秒前`

  return '刚刚'
}

/**
 * 格式化日期范围
 * @param startDate - 开始日期
 * @param endDate - 结束日期
 * @returns 日期范围字符串
 */
export function formatDateRange(
  startDate: string | Date,
  endDate: string | Date
): string {
  const start = formatDate(startDate, 'YYYY-MM-DD')
  const end = formatDate(endDate, 'YYYY-MM-DD')

  if (start === '-' || end === '-') return '-'

  return `${start} ~ ${end}`
}
