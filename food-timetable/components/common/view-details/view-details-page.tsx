"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  ArrowLeft,
  Download,
  Edit,
  Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { SectionConfig, FieldConfig } from "./view-details-modal"

// Import the field display components from the modal
import { FieldDisplay, SectionDisplay } from "./view-details-modal"

export interface ViewDetailsPageProps<T = any> {
  item: T | null
  title?: string
  subtitle?: string
  description?: string
  sections: SectionConfig[]
  
  // Layout options
  layout?: 'tabs' | 'sections'
  
  // Actions
  actions?: React.ReactNode
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onExport?: (item: T) => void
  onBack?: () => void
  
  // Customization
  renderHeader?: (item: T) => React.ReactNode
  renderFooter?: (item: T) => React.ReactNode
  className?: string
  
  // Page-specific props
  breadcrumb?: string
  loading?: boolean
  error?: string
}

export function ViewDetailsPage<T = any>({
  item,
  title,
  subtitle,
  description,
  sections,
  layout = 'tabs',
  actions,
  onEdit,
  onDelete,
  onExport,
  onBack,
  renderHeader,
  renderFooter,
  className,
  breadcrumb,
  loading,
  error
}: ViewDetailsPageProps<T>) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-muted rounded"></div>
          </div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-destructive">Error</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold">Not Found</h3>
              <p className="text-muted-foreground">The requested item could not be found.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const renderContent = () => {
    if (layout === 'tabs' && sections.length > 1) {
      return (
        <Tabs defaultValue={sections[0]?.id} className="w-full">
          <TabsList>
            {sections.map((section) => (
              <TabsTrigger 
                key={section.id} 
                value={section.id}
                className="flex items-center gap-2"
              >
                {section.icon && <section.icon className="h-4 w-4" />}
                {section.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {sections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="mt-6">
              <Card>
                <CardContent className="pt-6">
                  <SectionDisplay section={section} item={item} />
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      )
    }

    // Default sections layout
    return (
      <div className="space-y-6">
        {sections.map((section, index) => (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex items-center gap-2">
                {section.icon && <section.icon className="h-5 w-5 text-muted-foreground" />}
                <div>
                  <CardTitle>{section.title}</CardTitle>
                  {section.description && (
                    <CardDescription>{section.description}</CardDescription>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SectionDisplay section={section} item={item} />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            {breadcrumb || "Back"}
          </Button>
          <div>
            {renderHeader ? (
              renderHeader(item)
            ) : (
              <>
                <h1 className="text-2xl font-bold tracking-tight">
                  {title || "Details"}
                </h1>
                {subtitle && (
                  <p className="text-muted-foreground">{subtitle}</p>
                )}
                {description && (
                  <p className="text-sm text-muted-foreground mt-1">{description}</p>
                )}
              </>
            )}
          </div>
        </div>
        
        <div className="flex gap-2">
          {onExport && (
            <Button variant="outline" onClick={() => onExport(item)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}
          {actions}
          {onEdit && (
            <Button variant="outline" onClick={() => onEdit(item)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="destructive" onClick={() => onDelete(item)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {renderContent()}

      {/* Footer */}
      {renderFooter && (
        <Card>
          <CardContent className="pt-6">
            {renderFooter(item)}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Utility to create page props from modal props
export const createPageFromModal = <T,>(
  modalProps: any,
  pageOptions: {
    breadcrumb?: string
    loading?: boolean
    error?: string
  } = {}
) => ({
  ...modalProps,
  ...pageOptions,
  layout: modalProps.layout === 'accordion' ? 'sections' : modalProps.layout
})