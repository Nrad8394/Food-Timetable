"use client"

import React, { useState, useMemo } from "react"
import { ReusableEntityForm, FormFieldConfig } from "./reusable-entity-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// Mock data
const mockOptions = [
  { value: "option1", label: "First Option - Computer Science" },
  { value: "option2", label: "Second Option - Electrical Engineering" },
  { value: "option3", label: "Third Option - Mechanical Engineering" },
  { value: "option4", label: "Fourth Option - Civil Engineering" },
  { value: "option5", label: "Fifth Option - Information Technology" },
  { value: "option6", label: "Sixth Option - Data Science" },
  { value: "option7", label: "Seventh Option - Artificial Intelligence" },
  { value: "option8", label: "Eighth Option - Cybersecurity" }
]

export function ReusableEntityFormComparisonTest() {
  // Parent-controlled search state
  const [searchTerm, setSearchTerm] = useState("")
  
  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return mockOptions
    return mockOptions.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  // Handle search changes
  const handleSearchChange = (newSearchTerm: string, fieldKey: string) => {
    console.log(`Search changed for ${fieldKey}: ${newSearchTerm}`)
    setSearchTerm(newSearchTerm)
  }

  // Base field configuration
  const baseFields: Omit<FormFieldConfig, 'searchTerm' | 'onSearchChange' | 'filteredOptions'>[] = [
    {
      key: "name",
      label: "Name",
      type: "string",
      required: true,
      placeholder: "Enter name"
    },
    {
      key: "searchableField",
      label: "Searchable Field",
      type: "select",
      required: true,
      searchable: true,
      placeholder: "Select an option",
      options: mockOptions
    },
    {
      key: "regularField",
      label: "Regular Select Field",
      type: "select",
      required: false,
      searchable: false,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
      ]
    }
  ]

  // Internal mode fields (default behavior)
  const internalModeFields: FormFieldConfig[] = baseFields

  // Parent-controlled mode fields
  const parentControlledFields: FormFieldConfig[] = baseFields.map(field => {
    if (field.key === "searchableField") {
      return {
        ...field,
        searchTerm,
        onSearchChange: handleSearchChange,
        filteredOptions
      }
    }
    return field
  })

  const handleSubmitInternal = async (data: Record<string, any>) => {
    console.log("Internal mode form submitted:", data)
    alert("Internal mode form submitted!")
  }

  const handleSubmitParentControlled = async (data: Record<string, any>) => {
    console.log("Parent-controlled mode form submitted:", data)
    alert("Parent-controlled mode form submitted!")
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>ReusableEntityForm Search Control Modes Comparison</CardTitle>
          <CardDescription>
            This example compares internal vs parent-controlled search functionality for searchable fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 mb-6">
            <div>
              <h4 className="font-medium mb-2">Parent-Controlled Search State:</h4>
              <div className="flex gap-2 flex-wrap items-center">
                <Badge variant="outline">
                  Search Term: "{searchTerm || "none"}"
                </Badge>
                <Badge variant="outline">
                  Filtered Results: {filteredOptions.length} of {mockOptions.length}
                </Badge>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSearchTerm("")}
                >
                  Clear Search
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSearchTerm("computer")}
                >
                  Search "computer"
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSearchTerm("data")}
                >
                  Search "data"
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="internal" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="internal">Internal Search Control</TabsTrigger>
              <TabsTrigger value="parent">Parent-Controlled Search</TabsTrigger>
            </TabsList>
            
            <TabsContent value="internal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Internal Search Control Mode</CardTitle>
                  <CardDescription>
                    Search functionality is managed internally by the CommandInput component. 
                    Parent has no control over search state or filtering.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReusableEntityForm
                    title="Internal Mode Form"
                    description="Searchable fields manage their own search state internally"
                    fields={internalModeFields}
                    searchControlMode="internal" // Default mode
                    onSubmit={handleSubmitInternal}
                    submitLabel="Submit (Internal)"
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="parent" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Parent-Controlled Search Mode</CardTitle>
                  <CardDescription>
                    Search functionality is controlled by the parent component. 
                    Parent can control search terms, handle search changes, and provide filtered options.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReusableEntityForm
                    title="Parent-Controlled Mode Form"
                    description="Searchable fields use parent-provided search state and filtered options"
                    fields={parentControlledFields}
                    searchControlMode="parent"
                    onSubmit={handleSubmitParentControlled}
                    submitLabel="Submit (Parent-Controlled)"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default ReusableEntityFormComparisonTest
