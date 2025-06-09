"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4 w-full",
        caption: "flex justify-between items-center px-2",
        caption_label: "text-sm font-medium text-center w-full",
        nav: "flex items-center space-x-2",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse",
        head_row: "table-row",
        row: "table-row",        
        head_cell:
          "text-muted-foreground w-9 h-9 font-normal text-[0.8rem] text-center align-middle table-cell",
        cell:
          "h-9 w-9 text-sm p-0 relative text-center align-middle table-cell " +
          "transition-all " +
          "[&:has([aria-selected].day-range-end)]:rounded-r-md " +
          "[&:has([aria-selected].day-outside)]:bg-accent/40 " +
          "[&:has([aria-selected])]:bg-accent " +
          "first:[&:has([aria-selected])]:rounded-l-md " +
          "last:[&:has([aria-selected])]:rounded-r-md " +
          "focus-within:relative focus-within:z-10",
        day: "aria-selected:bg-accent aria-selected:text-accent-foreground w-9",
        // day: cn(
        //   buttonVariants({ variant: "ghost" }),
        //   "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        // ),
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary focus:bg-primary",
        day_today: "border border-primary text-primary rounded-md",
        day_outside:
          "text-muted-foreground opacity-70 aria-selected:bg-accent/40",
        day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
        day_range_middle: "bg-accent/50 text-accent-foreground",
        day_range_end: "day-range-end",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          ),
      }}
      {...props}
    />

  )
}
Calendar.displayName = "Calendar"

export { Calendar }
