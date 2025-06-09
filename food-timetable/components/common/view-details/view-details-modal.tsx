"use client"

import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Building, 
  Clock, 
  Copy, 
  ExternalLink,
  Download,
  Eye,
  EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

// Type definitions for the generic view details component
export interface FieldConfig {
  key: string
  label: string
  type?: 'text' | 'email' | 'phone' | 'url' | 'date' | 'datetime' | 'badge' | 'avatar' | 'list' | 'boolean' | 'number' | 'custom'
  icon?: React.ComponentType<{ className?: string }>
  format?: (value: any) => string
  render?: (value: any, item: any) => React.ReactNode
  copyable?: boolean
  sensitive?: boolean // For fields that should be hideable
  className?: string
  hidden?: boolean
}

export interface SectionConfig {
  id: string
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  fields: FieldConfig[]
  layout?: 'single' | 'double' | 'triple' | 'grid'
  className?: string
}

export interface ViewDetailsModalProps<T = any> {
  open: boolean
  onOpenChange: (open: boolean) => void
  item: T | null
  title?: string
  subtitle?: string
  description?: string
  sections: SectionConfig[]
  
  // Layout options
  layout?: 'tabs' | 'sections' | 'accordion'
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl'
  
  // Actions
  actions?: React.ReactNode
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onExport?: (item: T) => void
  
  // Customization
  renderHeader?: (item: T) => React.ReactNode
  renderFooter?: (item: T) => React.ReactNode
  className?: string
}

// Helper function to get nested value from object
const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => current?.[key], obj)
}

// Helper function to format different field types
const formatFieldValue = (value: any, field: FieldConfig, item: any): React.ReactNode => {
  if (value === null || value === undefined || value === '') {
    return <span className="text-muted-foreground italic">Not specified</span>
  }

  // Custom render function takes precedence
  if (field.render) {
    return field.render(value, item)
  }

  // Format function
  if (field.format) {
    return field.format(value)
  }

  // Type-based formatting
  switch (field.type) {
    case 'email':
      return (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a 
            href={`mailto:${value}`} 
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        </div>
      )
    
    case 'phone':
      return (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <a 
            href={`tel:${value}`} 
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        </div>
      )
    
    case 'url':
      return (
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-muted-foreground" />
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {value}
          </a>
        </div>
      )
    
    case 'date':
      const date = new Date(value)
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{date.toLocaleDateString()}</span>
        </div>
      )
    
    case 'datetime':
      const datetime = new Date(value)
      return (
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>{datetime.toLocaleString()}</span>
        </div>
      )
    
    case 'badge':
      return (
        <Badge variant="secondary" className="capitalize">
          {value.toString()}
        </Badge>
      )
    
    case 'avatar':
      return (
        <Avatar className="h-10 w-10">
          <AvatarImage src={value} />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )
    
    case 'list':
      if (Array.isArray(value)) {
        return (
          <div className="flex flex-wrap gap-1">
            {value.map((item, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {item.toString()}
              </Badge>
            ))}
          </div>
        )
      }
      return value.toString()
    
    case 'boolean':
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      )
    
    case 'number':
      return <span className="font-mono">{value.toLocaleString()}</span>
    
    default:
      return <span>{value.toString()}</span>
  }
}

// Field component with copy functionality and sensitive data handling
export  const FieldDisplay: React.FC<{
  field: FieldConfig
  value: any
  item: any
}> = ({ field, value, item }) => {
  const [isHidden, setIsHidden] = useState(field.sensitive || false)
  
  const handleCopy = async (textToCopy: string) => {
    try {
      await navigator.clipboard.writeText(textToCopy)
      toast.success("Copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const displayValue = isHidden ? '••••••••' : formatFieldValue(value, field, item)

  return (
    <div className={cn("space-y-1", field.className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {field.icon && <field.icon className="h-4 w-4 text-muted-foreground" />}
          <label className="text-sm font-medium text-muted-foreground">
            {field.label}
          </label>
        </div>
        <div className="flex items-center gap-1">
          {field.sensitive && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setIsHidden(!isHidden)}
            >
              {isHidden ? (
                <Eye className="h-3 w-3" />
              ) : (
                <EyeOff className="h-3 w-3" />
              )}
            </Button>
          )}
          {field.copyable && value && !isHidden && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleCopy(value.toString())}
            >
              <Copy className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      <div className="text-sm">
        {displayValue}
      </div>
    </div>
  )
}

// Section component
export const SectionDisplay: React.FC<{
  section: SectionConfig
  item: any
}> = ({ section, item }) => {
  const visibleFields = section.fields.filter(field => !field.hidden)
  
  const getGridCols = (layout: string) => {
    switch (layout) {
      case 'single': return 'grid-cols-1'
      case 'double': return 'grid-cols-1 md:grid-cols-2'
      case 'triple': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      case 'grid': return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      default: return 'grid-cols-1 md:grid-cols-2'
    }
  }

  return (
    <div className={cn("space-y-4", section.className)}>
      <div className="flex items-center gap-2">
        {section.icon && <section.icon className="h-5 w-5 text-muted-foreground" />}
        <div>
          {/* <h3 className="text-lg font-semibold">{section.title}</h3> */}
          {section.description && (
            <p className="text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>
      </div>
      
      <div className={cn("grid gap-4", getGridCols(section.layout || 'double'))}>
        {visibleFields.map((field) => {
          const value = getNestedValue(item, field.key)
          return (
            <FieldDisplay
              key={field.key}
              field={field}
              value={value}
              item={item}
            />
          )
        })}
      </div>
    </div>
  )
}

// Main component
export function ViewDetailsModal<T = any>({
  open,
  onOpenChange,
  item,
  title,
  subtitle,
  description,
  sections,
  layout = 'tabs',
  maxWidth = '4xl',
  actions,
  onEdit,
  onDelete,
  onExport,
  renderHeader,
  renderFooter,
  className
}: ViewDetailsModalProps<T>) {
  if (!item) return null

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  }[maxWidth]

  const renderContent = () => {
    if (layout === 'tabs' && sections.length > 1) {
      return (
        <Tabs defaultValue={sections[0]?.id} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            {sections.map((section) => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="flex items-center gap-2"
              >
                {section.icon && <section.icon className="h-4 w-4" />}
                <span className="hidden sm:inline">{section.title}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="mt-6">
              <ScrollArea className="max-h-[60vh]">
                <SectionDisplay section={section} item={item} />
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      )
    }

    // Default sections layout
    return (
      <ScrollArea className="max-h-[70vh]">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.id}>
              <SectionDisplay section={section} item={item} />
              {index < sections.length - 1 && <Separator className="mt-8" />}
            </div>
          ))}
        </div>
      </ScrollArea>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(maxWidthClass, "max-h-[90vh] overflow-hidden", className)}>
        <DialogHeader className="space-y-4">
          {renderHeader ? (
            renderHeader(item)
          ) : (
            <>
              <DialogTitle className="text-xl font-semibold">
                {title || "Details"}
              </DialogTitle>
              {subtitle && (
                <DialogDescription className="text-base">
                  {subtitle}
                </DialogDescription>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">
                  {description}
                </p>
              )}
            </>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>

        {(actions || onEdit || onDelete || onExport || renderFooter) && (
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex items-center gap-2">
              {onExport && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onExport(item)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {renderFooter ? (
                renderFooter(item)
              ) : (
                <>
                  {actions}
                  {onEdit && (
                    <Button
                      variant="outline"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      variant="destructive"
                      onClick={() => onDelete(item)}
                    >
                      Delete
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Utility function to create field configurations
export const createField = (
  key: string,
  label: string,
  options: Partial<FieldConfig> = {}
): FieldConfig => ({
  key,
  label,
  type: 'text',
  ...options
})

// Utility function to create section configurations
export const createSection = (
  id: string,
  title: string,
  fields: FieldConfig[],
  options: Partial<SectionConfig> = {}
): SectionConfig => ({
  id,
  title,
  fields,
  layout: 'double',
  ...options
})

// Pre-built field configurations for common use cases
export const CommonFields = {
  id: (key = 'id') => createField(key, 'ID', { type: 'text', copyable: true }),
  name: (key = 'name') => createField(key, 'Name', { icon: User }),
  email: (key = 'email') => createField(key, 'Email', { type: 'email', icon: Mail, copyable: true }),
  phone: (key = 'phone') => createField(key, 'Phone', { type: 'phone', icon: Phone, copyable: true }),
  address: (key = 'address') => createField(key, 'Address', { icon: MapPin }),
  building: (key = 'building') => createField(key, 'Building', { icon: Building }),
  status: (key = 'status') => createField(key, 'Status', { type: 'badge' }),
  createdAt: (key = 'created_at') => createField(key, 'Created At', { type: 'datetime', icon: Calendar }),
  updatedAt: (key = 'updated_at') => createField(key, 'Updated At', { type: 'datetime', icon: Calendar }),
}
