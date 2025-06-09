"use client"

import * as React from "react"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Clock } from "lucide-react"

interface TimePickerInputProps {
  value: string
  onChange: (time: string) => void
  disabled?: boolean
  className?: string
}

export function TimePickerInput({
  value,
  onChange,
  disabled = false,
  className,
}: TimePickerInputProps) {
  // Parse the input value (HH:MM format)
  const [hours, minutes] = value?.split(':').map(Number) || [0, 0]
  
  // Ensure valid hours and minutes
  const validHours = !isNaN(hours) ? Math.max(0, Math.min(23, hours)) : 0
  const validMinutes = !isNaN(minutes) ? Math.max(0, Math.min(59, minutes)) : 0
  
  // Format time as HH:MM
  const formatTime = (h: number, m: number) => 
    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  
  // Update time when changed
  const handleTimeChange = (newHours: number, newMinutes: number) => {
    onChange(formatTime(newHours, newMinutes))
  }
  
  // Handle direct input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow typing but validate on blur
    if (inputValue.length <= 5) {
      onChange(inputValue)
    }
  }
  
  // Validate input on blur
  const handleBlur = () => {
    // Try to parse the current value
    const timeParts = value.split(':')
    
    if (timeParts.length !== 2) {
      // Invalid format, reset to 00:00
      onChange("00:00")
      return
    }
    
    const h = parseInt(timeParts[0], 10)
    const m = parseInt(timeParts[1], 10)
    
    // Validate and correct values if needed
    const validH = !isNaN(h) ? Math.max(0, Math.min(23, h)) : 0
    const validM = !isNaN(m) ? Math.max(0, Math.min(59, m)) : 0
    
    onChange(formatTime(validH, validM))
  }
  
  // Hour options (0-23)
  const hourOptions = Array.from({ length: 24 }, (_, i) => i)
  
  // Minute options (0, 15, 30, 45)
  const minuteOptions = [0, 15, 30, 45]
  
  // Predefined time slots organized by time of day
  const morningSlots = [
    { label: "7:00 AM", value: "07:00" },
    { label: "7:30 AM", value: "07:30" },
    { label: "8:00 AM", value: "08:00" },
    { label: "8:30 AM", value: "08:30" },
    { label: "9:00 AM", value: "09:00" },
    { label: "9:30 AM", value: "09:30" },
    { label: "10:00 AM", value: "10:00" },
    { label: "10:30 AM", value: "10:30" },
    { label: "11:00 AM", value: "11:00" },
    { label: "11:30 AM", value: "11:30" },
  ]
  
  const afternoonSlots = [
    { label: "12:00 PM", value: "12:00" },
    { label: "12:30 PM", value: "12:30" },
    { label: "1:00 PM", value: "13:00" },
    { label: "1:30 PM", value: "13:30" },
    { label: "2:00 PM", value: "14:00" },
    { label: "2:30 PM", value: "14:30" },
    { label: "3:00 PM", value: "15:00" },
    { label: "3:30 PM", value: "15:30" },
  ]
  
  const eveningSlots = [
    { label: "4:00 PM", value: "16:00" },
    { label: "4:30 PM", value: "16:30" },
    { label: "5:00 PM", value: "17:00" },
    { label: "5:30 PM", value: "17:30" },
    { label: "6:00 PM", value: "18:00" },
    { label: "6:30 PM", value: "18:30" },
    { label: "7:00 PM", value: "19:00" },
    { label: "7:30 PM", value: "19:30" },
    { label: "8:00 PM", value: "20:00" },
    { label: "8:30 PM", value: "20:30" },
  ]
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative">
          <Input
            value={value}
            onChange={handleInputChange}
            onBlur={handleBlur}
            placeholder="HH:MM"
            className={cn("pr-10", className)}
            disabled={disabled}
          />
          <Button
            type="button"
            variant="ghost"
            disabled={disabled}
            className={cn(
              "absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent",
              "text-muted-foreground"
            )}
          >
            <Clock className="h-4 w-4" />
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3" align="end">
        <div className="space-y-4">
          {/* Predefined time slots organized by time of day */}
          <div className="space-y-2">
            <div className="text-sm font-semibold text-muted-foreground">Common Time Slots</div>
            
            <div>
              <h4 className="mb-1 text-xs font-medium text-muted-foreground">Morning</h4>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {morningSlots.map((slot) => (
                  <Button
                    key={slot.value}
                    type="button"
                    variant={value === slot.value ? "default" : "outline"}
                    size="sm"
                    className="h-8 p-0 font-normal text-xs"
                    onClick={() => onChange(slot.value)}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="mb-1 text-xs font-medium text-muted-foreground">Afternoon</h4>
              <div className="grid grid-cols-4 gap-1 mb-2">
                {afternoonSlots.map((slot) => (
                  <Button
                    key={slot.value}
                    type="button"
                    variant={value === slot.value ? "default" : "outline"}
                    size="sm"
                    className="h-8 p-0 font-normal text-xs"
                    onClick={() => onChange(slot.value)}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="mb-1 text-xs font-medium text-muted-foreground">Evening</h4>
              <div className="grid grid-cols-4 gap-1">
                {eveningSlots.map((slot) => (
                  <Button
                    key={slot.value}
                    type="button"
                    variant={value === slot.value ? "default" : "outline"}
                    size="sm"
                    className="h-8 p-0 font-normal text-xs"
                    onClick={() => onChange(slot.value)}
                  >
                    {slot.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="border-t pt-2">
            <div className="text-sm font-semibold text-muted-foreground mb-2">Custom Time</div>
            <div className="space-y-2">
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Hours</div>
                <div className="grid grid-cols-6 gap-1">
                  {hourOptions.map((hour) => (
                    <Button
                      key={hour}
                      type="button"
                      variant={hour === validHours ? "default" : "outline"}
                      size="sm"
                      className="h-7 w-7 p-0 font-normal text-xs"
                      onClick={() => handleTimeChange(hour, validMinutes)}
                    >
                      {hour.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">Minutes</div>
                <div className="grid grid-cols-4 gap-1">
                  {minuteOptions.map((minute) => (
                    <Button
                      key={minute}
                      type="button"
                      variant={minute === validMinutes ? "default" : "outline"}
                      size="sm"
                      className="h-7 w-12 p-0 font-normal text-xs"
                      onClick={() => handleTimeChange(validHours, minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
