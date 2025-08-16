import { format } from 'date-fns'
import { cloneElement } from 'react'
import { Tooltip as ReactTooltip } from 'react-tooltip'
import { Activity, ActivityCalendar } from 'react-activity-calendar'
import 'react-tooltip/dist/react-tooltip.css'

type ActivityCalendarWrapperProps = {
  entries: Activity[]
  isLoading: boolean
  className?: string;
  hideColorLegend?: boolean;
  hideTotalCount?: boolean;
  hideMonthLabels?: boolean;
  showWeekdayLabels?: boolean;
  onDateClick?: (dateKey: string) => void
}

export default function ActivityCalendarWrapper({ 
  entries,
  isLoading,
  className = "",
  hideColorLegend = false,
  hideTotalCount = false,
  hideMonthLabels = false,
  showWeekdayLabels = true,
  onDateClick
}: ActivityCalendarWrapperProps) {

  return (
    <div
      className={className}
    >
      <ActivityCalendar 
        data={entries || []}
        loading={isLoading}
        hideColorLegend={hideColorLegend}
        hideTotalCount={hideTotalCount}
        hideMonthLabels={hideMonthLabels}
        showWeekdayLabels={showWeekdayLabels}
        renderBlock={(block, { count, date }) =>
          cloneElement(block, {
            'data-tooltip-id': 'react-tooltip',
            'data-tooltip-html': `${count} activities on ${date}`,
            onClick: () => {
              if(onDateClick) {
                onDateClick(format(new Date(date), 'yyyy-MM-dd'))
              }
            }
          })
        }
      />
      <ReactTooltip id="react-tooltip" />
    </div>
  )
}