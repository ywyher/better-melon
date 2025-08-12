import { Activity } from "react-activity-calendar";

export const calculateActivityHistoryLevel = (count: number): number => {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 5) return 2;
  if (count <= 10) return 3;
  return 4;
};

export const padActivityHistory = (entries: Activity[]) => {
  const data = []
  const today = new Date()
  const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())
  
  // Create a map of existing entries
  const existingMap = new Map()
  entries.forEach(entry => {
    existingMap.set(entry.date, entry)
  })
  
  // Generate data for each day in chronological order
  for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
    const dateString = d.toISOString().split('T')[0]
    
    if (existingMap.has(dateString)) {
      data.push(existingMap.get(dateString))
    } else {
      data.push({
        date: dateString,
        count: 0,
        level: 0
      })
    }
  }
  
  // Sort by date to ensure chronological order (oldest to newest)
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}