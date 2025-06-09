"use client"

import React, { useState, useEffect, useCallback } from "react"
import { UseFormReturn, useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { X, HelpCircle, Upload, Download, AlertCircle, ArrowRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue, 
  SelectGroup 
} from "@/components/ui/select"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckIcon, ChevronsUpDown } from "lucide-react"
import { DatePicker } from "@/components/ui/date-picker"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

import { FieldDefinition, TemplateConfig, generateExcelTemplate, parseExcelFile } from "../excel-utils"
import { cn } from "@/lib/utils"

export type FormFieldConfig = FieldDefinition & {
  // Additional form-specific props
  placeholder?: string
  defaultValue?: any
  description?: string
  fieldType?: "input" | "textarea" | "select" | "date" | "radio" | "checkbox" | "switch" | "custom" | "multiselect"
  customRenderer?: (field: any, form: UseFormReturn<any>) => React.ReactNode
  gridSpan?: "full" | "half" | "third"
  condition?: (formValues: Record<string, any>) => boolean
  searchable?: boolean // Enable searchable select dropdown
  multiple?: boolean // Support multiple selections

  // Parent-controlled search functionality for searchable fields
  searchTerm?: string // Current search term (parent-controlled)
  onSearchChange?: (searchTerm: string, fieldKey: string) => void // Callback when search term changes
  filteredOptions?: { value: string | number; label: string }[] // Pre-filtered options from parent
}

export type FormConfig = {
  title: string
  description?: string
  fields: FormFieldConfig[]
  submitLabel?: string
  cancelLabel?: string
  onSubmit: (data: Record<string, any>) => Promise<void>
  onCancel?: () => void
  defaultValues?: Record<string, any>
  excelSupport?: {
    enabled: boolean
    template: TemplateConfig
    onBulkSubmit?: (data: Record<string, any>[]) => Promise<{ success: number; failed: number }>
  }
  maxWidth?: string
  
  // Global search control for all searchable fields
  searchControlMode?: "internal" | "parent" // How search functionality should be managed
}

const DEFAULT_SCHEMA_TYPES: Record<string, any> = {
  'string': z.string(),
  'number': z.number(),
  'date': z.date(),
  'boolean': z.boolean(),
  'select': (field: FormFieldConfig) => 
    field.fieldType === 'multiselect' ? 
      z.array(z.string()) : 
      z.string()
}

/**
 * Create a dynamic form schema based on field configs
 */
const createFormSchema = (fields: FormFieldConfig[]) => {
  const schemaFields: Record<string, any> = {}
    fields.forEach(field => {
    let schema = typeof DEFAULT_SCHEMA_TYPES[field.type] === 'function'
      ? DEFAULT_SCHEMA_TYPES[field.type](field)
      : DEFAULT_SCHEMA_TYPES[field.type] || z.any()
    
    // Add required validation
    if (field.required) {
      if (field.fieldType === 'multiselect') {
        schema = schema.refine((val: unknown) => Array.isArray(val) && val.length > 0, {
          message: `${field.label} is required`
        })
      } else {
        schema = schema.refine((val: unknown) => val !== undefined && val !== null && val !== '', {
          message: `${field.label} is required`
        })
      }
    } else {
      schema = schema.optional()
    }
    
    // Add custom validation
    if (field.validationFn) {
      schema = schema.refine(
        (value: unknown) => field.validationFn?.(value) === true, 
        { message: `Invalid ${field.label}` }
      )
    }
    
    schemaFields[field.key] = schema
  })
  
  return z.object(schemaFields)
}

/**
 * Reusable form component with Excel import/export support
 */
export function ReusableEntityForm({
  title,
  description,
  fields,
  submitLabel = "Submit",
  cancelLabel = "Cancel",
  onSubmit,
  onCancel,
  defaultValues = {},
  excelSupport,
  maxWidth = "800px",
  searchControlMode = "internal"
}: FormConfig) {
  const [activeTab, setActiveTab] = useState<"singleEntry" | "bulkImport">("singleEntry")
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [importedData, setImportedData] = useState<Record<string, any>[]>([])
  const [importErrors, setImportErrors] = useState<string[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importResults, setImportResults] = useState<{ success: number; failed: number } | null>(null)
  const [importProgress, setImportProgress] = useState(0)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)
  
  // Create zod schema from field configs
  const formSchema = createFormSchema(fields)

  
  // Create form with zod validation
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  
  // Update form values when defaultValues change
  useEffect(() => {
    if (Object.keys(defaultValues).length > 0) {
      form.reset(defaultValues)
    }
  }, [defaultValues, form])
  
  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !excelSupport?.template) return
    
    setUploadedFile(file)
    setImportedData([])
    setImportErrors([])
    setImportResults(null)
    
    try {
      setIsImporting(true)
      const { data, errors } = await parseExcelFile(file, excelSupport.template)
      setImportedData(data)
      setImportErrors(errors)
      
      if (errors.length > 0) {
        toast.error( "Import validation failed",
        {
          description: `Found ${errors.length} errors in your file`,
        })
      } else if (data.length === 0) {
        toast.info("No data found",
        {
          description: "Your file appears to be empty. Please check the format and try again.",
        })
      } else {
        toast.success( "File parsed successfully",
        {
          description: `Found ${data.length} records ready for import`,
        })
      }
    } catch (err) {
      console.error("Error parsing file:", err)
      toast.error( "Import failed",
      {
        description: "Failed to parse the file. Please check the format and try again."
      })
    } finally {
      setIsImporting(false)
    }
  }, [excelSupport?.template])
  
  // Handle download template
  const handleDownloadTemplate = useCallback(() => {
    if (!excelSupport?.template) return
    
    generateExcelTemplate(excelSupport.template)
    
    toast.info("Template downloaded",
    {
      description: `${excelSupport.template.entityName} template has been downloaded`,
    })
  }, [excelSupport?.template])
  
  // Handle bulk submit
  const handleBulkSubmit = async () => {
    if (!excelSupport?.onBulkSubmit || importedData.length === 0) return
    
    try {
      setIsImporting(true)
      setImportProgress(0)
      const totalItems = importedData.length
      
      // Process in chunks to show progress
      const results = await excelSupport.onBulkSubmit(importedData)
      setImportResults(results)
      
      if (results.failed === 0) {
        toast.success( "Import successful",
        {
          description: `Successfully imported all ${results.success} ${excelSupport.template.entityName} records`,
        })
      } else {
        toast( "Import partially successful",
        {
          description: `Imported ${results.success} records, ${results.failed} failed`
        })
      }
    } catch (err) {
      console.error("Bulk import error:", err)
      toast.error("Import failed",
      {
        description: "An error occurred during import. Please try again.",
      })
    } finally {
      setIsImporting(false)
      setImportProgress(100)
    }
  }
  
  // Single entry form submission handler
  const handleSingleFormSubmit = async (data: Record<string, any>) => {
    try {
      // Transform the data before submission
      const transformedData = Object.entries(data).reduce((acc, [key, value]) => {
        const field = fields.find(f => f.key === key)
        
        // For multiselect fields, transform to array of values
        if (field?.fieldType === 'multiselect' && Array.isArray(value)) {
          acc[key] = value.map(v => 
            typeof v === 'object' && 'value' in v ? Number(v.value) : Number(v)
          )
        } else {
          acc[key] = value
        }
        
        return acc
      }, {} as Record<string, any>)

      await onSubmit(transformedData)
    } catch (err) {
      console.error("Form submission error:", err)
    }
  }

  return (
    <Card className="shadow-md" style={{ maxWidth }}>
      <CardHeader>
        <CardTitle className="text-2xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
        
        {excelSupport?.enabled && (
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="singleEntry">Single Entry</TabsTrigger>
              <TabsTrigger value="bulkImport">Bulk Import</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      
      <CardContent>
        {activeTab === "singleEntry" && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSingleFormSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields
                  .filter(field => !field.condition || field.condition(form.getValues()))
                  .map((field) => (
                    <FormField
                      key={field.key}
                      control={form.control}
                      name={field.key as any}
                      render={({ field: formField }) => (
                        <FormItem className={cn(
                          field.gridSpan === "full" && "md:col-span-2",
                          field.gridSpan === "half" && "md:col-span-1",
                          field.gridSpan === "third" && "md:col-span-2 lg:col-span-1",
                          !field.gridSpan && "md:col-span-1"
                        )}>
                          <div className="flex items-center">
                            <FormLabel className="text-base">{field.label}</FormLabel>
                            {field.helpText && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <HelpCircle className="w-4 h-4 text-muted-foreground ml-1" />
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{field.helpText}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          
                          <FormControl>
                            {(() => {
                              // Custom field renderer takes precedence
                              if (field.customRenderer) {
                                return field.customRenderer(formField, form)
                              }
                              
                              // Use fieldType or infer from type if not specified
                              const type = field.fieldType || (
                                field.type === 'string' ? "input" :
                                field.type === 'number' ? "input" :
                                field.type === 'date' ? "date" :
                                field.type === 'boolean' ? "checkbox" :
                                field.type === 'select' ? "select" :
                                field.type === 'array' ? (field.fieldType === 'multiselect' ? "multiselect" : "select") :
                                "input"
                              )
                              
                              switch (type) {                                
                                case "textarea":
                                  return (
                                    <Textarea
                                      {...formField}
                                      placeholder={field.placeholder}
                                    />
                                  )
                                case "select":
                                case "multiselect":
                                  // Use searchable combobox when searchable is true or for multiselect
                                  if ((field.searchable || field.fieldType === "multiselect") && field.options?.length) {
                                    const [open, setOpen] = React.useState(false)
                                    const isMulti = field.fieldType === "multiselect" || field.multiple
                                    
                                    // Determine if using parent-controlled search
                                    const isParentControlled = searchControlMode === "parent" && 
                                      (field.searchTerm !== undefined || field.onSearchChange !== undefined)
                                    
                                    // Use parent-controlled search term if available, otherwise use CommandInput's internal state
                                    const searchTerm = isParentControlled ? field.searchTerm || "" : undefined
                                    
                                    // Use filtered options if provided by parent, otherwise use all options
                                    const optionsToDisplay = isParentControlled && field.filteredOptions 
                                      ? field.filteredOptions 
                                      : field.options

                                    // Handle array of selected values for multiselect
                                    const selectedValues = isMulti 
                                      ? (Array.isArray(formField.value) 
                                          ? formField.value 
                                          : formField.value 
                                            ? [formField.value] 
                                            : [])
                                      : formField.value 
                                        ? [formField.value]
                                        : []                                    // Get labels for selected values, handling both object and primitive values
                                    const selectedLabels = selectedValues
                                      .map(value => {
                                        // Handle when value is already an object with label/value
                                        if (value && typeof value === 'object' && 'label' in value) {
                                          return value.label
                                        }
                                        
                                        // Try to find in current options
                                        const option = optionsToDisplay.find(opt => 
                                          opt.value?.toString() === (
                                            typeof value === 'object' && 'value' in value 
                                              ? value.value?.toString() 
                                              : value?.toString()
                                          )
                                        )
                                        
                                        // If found in options use label, otherwise use value
                                        return option?.label || (
                                          typeof value === 'object' && 'value' in value 
                                            ? value.value?.toString() 
                                            : value?.toString()
                                        ) || ''
                                      })
                                      .filter(Boolean)
                                    
                                    return (
                                      <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                          <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
                                            className="w-full justify-between min-h-[2.5rem]"
                                          >
                                            <div className="flex flex-wrap gap-1 py-1">
                                              {selectedLabels.length > 0 ? (
                                                selectedLabels.map((label, i) => (
                                                  <Badge 
                                                    key={i}
                                                    variant="secondary"
                                                    className="mr-1"
                                                  >
                                                    {label}
                                                  </Badge>
                                                ))
                                              ) : (
                                                <span className="text-muted-foreground">
                                                  {field.placeholder || `Select ${field.label}`}
                                                </span>
                                              )}
                                            </div>
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                          </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-full p-0">
                                          <Command>
                                            <CommandInput 
                                              placeholder={`Search ${field.label.toLowerCase()}...`} 
                                              className="h-9"
                                              value={isParentControlled ? searchTerm : undefined}
                                              onValueChange={isParentControlled ? 
                                                (value: string) => field.onSearchChange?.(value, field.key) : 
                                                undefined
                                              }
                                            />
                                            <CommandEmpty>No {field.label.toLowerCase()} found.</CommandEmpty>
                                            <CommandGroup className="max-h-60 overflow-y-auto">                                              {optionsToDisplay.map(option => {
                                                const isSelected = selectedValues.some(v => {
                                                  const vStr = typeof v === 'object' && 'value' in v 
                                                    ? v.value?.toString() 
                                                    : v?.toString()
                                                  return vStr === option.value.toString()
                                                })
                                                return (
                                                  <CommandItem
                                                    key={option.value.toString()}
                                                    value={option.label}                                                onSelect={() => {
                                                      if (isMulti) {
                                                        const newValue = isSelected
                                                          ? selectedValues.filter(v => {
                                                              const vStr = typeof v === 'object' && 'value' in v 
                                                                ? v.value?.toString() 
                                                                : v?.toString()
                                                              return vStr !== option.value.toString()
                                                            })
                                                          : [...selectedValues, { value: option.value, label: option.label }]
                                                        formField.onChange(newValue)
                                                      } else {
                                                        formField.onChange({ value: option.value, label: option.label })
                                                        setOpen(false)
                                                      }
                                                    }}
                                                  >
                                                    <div className="flex items-center">
                                                      {isMulti && (
                                                        <Checkbox
                                                          checked={isSelected}
                                                          className="mr-2"
                                                        />
                                                      )}
                                                      {option.label}
                                                    </div>
                                                    {!isMulti && (
                                                      <CheckIcon
                                                        className={cn(
                                                          "ml-auto h-4 w-4",
                                                          isSelected ? "opacity-100" : "opacity-0"
                                                        )}
                                                      />
                                                    )}
                                                  </CommandItem>
                                                )
                                              })}
                                            </CommandGroup>
                                          </Command>
                                        </PopoverContent>
                                      </Popover>
                                    )
                                  }
                                  // Normal select for non-searchable fields
                                  return (
                                    <Select
                                      onValueChange={formField.onChange}
                                      value={Array.isArray(formField.value) ? formField.value[0] : formField.value}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {field.options?.map(option => (
                                          <SelectItem key={option.value.toString()} value={option.value.toString()}>
                                            {option.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )
                                
                                case "date":
                                  return (
                                    <DatePicker
                                      date={formField.value}
                                      onSelect={formField.onChange}
                                    />
                                  )
                                
                                case "checkbox":
                                  return (
                                    <div className="flex items-center space-x-2">
                                      <Checkbox
                                        checked={formField.value}
                                        onCheckedChange={formField.onChange}
                                        id={field.key}
                                      />
                                      <label htmlFor={field.key} className="text-sm font-normal">
                                        {field.placeholder || "Yes"}
                                      </label>
                                    </div>
                                  )
                                
                                case "switch":
                                  return (
                                    <Switch
                                      checked={formField.value}
                                      onCheckedChange={formField.onChange}
                                    />
                                  )
                                
                                case "radio":
                                  return (
                                    <RadioGroup
                                      onValueChange={formField.onChange}
                                      defaultValue={formField.value}
                                      className="flex flex-col space-y-1"
                                    >
                                      {field.options?.map(option => (
                                        <div key={option.value.toString()} className="flex items-center space-x-2">
                                          <RadioGroupItem value={option.value.toString()} id={`${field.key}-${option.value}`} />
                                          <Label htmlFor={`${field.key}-${option.value}`}>{option.label}</Label>
                                        </div>
                                      ))}
                                    </RadioGroup>
                                  )
                                
                                default: // Input
                                  return (
                                    <Input
                                      {...formField}
                                      type={field.type === 'number' ? 'number' : 'text'}
                                      placeholder={field.placeholder}
                                    />
                                  )
                              }
                            })()}
                          </FormControl>
                          
                          {field.description && (
                            <FormDescription>{field.description}</FormDescription>
                          )}
                          
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))
                }
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                  >
                    {cancelLabel}
                  </Button>
                )}
                
                <Button type="submit">
                  {submitLabel}
                </Button>
              </div>
            </form>
          </Form>
        )}
        
        {activeTab === "bulkImport" && excelSupport?.enabled && (
          <div className="space-y-6">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Quick Guide</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal ml-4 space-y-2">
                  <li>Download the template file below</li>
                  <li>Fill in your data following the format</li>
                  <li>Upload the completed file</li>
                  <li>Review and submit your data</li>
                </ol>
              </CardContent>
            </Card>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Template</h3>
                <Button 
                  variant="outline" 
                  onClick={handleDownloadTemplate}
                >
                  <Download className="w-4 h-4 mr-2" /> 
                  Download Template
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col">
                  <Label htmlFor="file-upload" className="mb-2">Upload File</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                    disabled={isImporting}
                  />
                </div>
                
                {uploadedFile && (
                  <div className="rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Upload className="w-5 h-5 text-blue-500" />
                        <span className="font-medium">{uploadedFile.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(uploadedFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setUploadedFile(null)}
                        disabled={isImporting}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {importedData.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">
                        {importedData.length} records found
                      </span>
                      
                      <div className="space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setPreviewDialogOpen(true)}
                          disabled={isImporting}
                        >
                          Preview Data
                        </Button>
                        
                        <Button
                          onClick={handleBulkSubmit}
                          disabled={importErrors.length > 0 || isImporting}
                        >
                          {isImporting ? "Importing..." : "Import All"}
                        </Button>
                      </div>
                    </div>
                    
                    {importErrors.length > 0 && (
                      <div className="bg-destructive/10 rounded-md p-3 mt-4">
                        <div className="flex items-center text-destructive mb-2">
                          <AlertCircle className="w-4 h-4 mr-2" />
                          <span className="font-medium">
                            {importErrors.length} validation {importErrors.length === 1 ? "error" : "errors"}
                          </span>
                        </div>
                        <ul className="text-sm space-y-1 max-h-40 overflow-y-auto pl-2">
                          {importErrors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {isImporting && (
                      <div className="space-y-2">
                        <Progress value={importProgress} className="h-2" />
                        <p className="text-sm text-center text-muted-foreground">
                          Processing, please wait...
                        </p>
                      </div>
                    )}
                    
                    {importResults && (
                      <div className={cn(
                        "p-3 rounded-md mt-2",
                        importResults.failed > 0 
                          ? "bg-amber-100 dark:bg-amber-950" 
                          : "bg-green-100 dark:bg-green-950"
                      )}>
                        <div className="flex items-center">
                          {importResults.failed > 0 ? (
                            <AlertCircle className="w-4 h-4 mr-2 text-amber-600 dark:text-amber-400" />
                          ) : (
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
                          )}
                          <span>
                            Imported {importResults.success} of {importResults.success + importResults.failed} records
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      {/* Data Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Data Preview</DialogTitle>
            <DialogDescription>
              Showing first 5 records from your import file
            </DialogDescription>
          </DialogHeader>
          
          <div className="overflow-auto max-h-96">
            <table className="w-full border-collapse">
              <thead className="bg-muted">
                <tr>
                  <th className="border p-2 text-left font-medium text-sm">#</th>
                  {excelSupport?.template.fields.map(field => (
                    <th key={field.key} className="border p-2 text-left font-medium text-sm">
                      {field.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {importedData.slice(0, 5).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td className="border p-2 text-sm">{rowIndex + 1}</td>
                    {excelSupport?.template.fields.map(field => (
                      <td key={field.key} className="border p-2 text-sm">
                        {row[field.key] !== undefined 
                          ? String(row[field.key]) 
                          : <span className="text-muted-foreground italic">empty</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            
            {importedData.length > 5 && (
              <p className="text-center text-sm text-muted-foreground mt-2">
                ... and {importedData.length - 5} more records
              </p>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setPreviewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
