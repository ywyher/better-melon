import { ActivityCalendar } from 'react-activity-calendar'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { cloneElement } from 'react'
import { format } from 'date-fns'
import 'react-tooltip/dist/react-tooltip.css'
import { ActivityHistoryEntry } from '@/types/history'

type ActivityCalendarWrapperProps = {
  entries: ActivityHistoryEntry[]
  isLoading: boolean
  onDateClick: (dateKey: string) => void
}

export default function ActivityCalendarWrapper({ 
  entries, 
  isLoading, 
  onDateClick 
}: ActivityCalendarWrapperProps) {
  return (
    <>
      <ActivityCalendar 
        data={entries || []}
        loading={isLoading}
        hideColorLegend={false}
        hideTotalCount={false}
        showWeekdayLabels={true}
        renderBlock={(block, { count, date }) =>
          cloneElement(block, {
            'data-tooltip-id': 'react-tooltip',
            'data-tooltip-html': `${count} activities on ${date}`,
            onClick: () => onDateClick(format(new Date(date), 'yyyy-MM-dd'))
          })
        }
      />
      <ReactTooltip id="react-tooltip" />
    </>
  )
}