const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit' })
export const todayCN = () => formatter.format(new Date())
export const formatCN = (value: string) => new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', month: 'long', day: 'numeric', weekday: 'short' }).format(new Date(`${value}T12:00:00+08:00`))
export const daysBetween = (from: string, to: string) => Math.round((Date.parse(`${to}T00:00:00+08:00`) - Date.parse(`${from}T00:00:00+08:00`)) / 86400000)
