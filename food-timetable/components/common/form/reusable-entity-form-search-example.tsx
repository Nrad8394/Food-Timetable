"use client"

import React, { useState, useMemo } from "react"
import { ReusableEntityForm, FormFieldConfig } from "./reusable-entity-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Mock data for demonstration
const allDepartments = [
  { value: "cs", label: "Computer Science" },
  { value: "ee", label: "Electrical Engineering" },
  { value: "me", label: "Mechanical Engineering" },
  { value: "ce", label: "Civil Engineering" },
  { value: "it", label: "Information Technology" },
  { value: "ec", label: "Electronics & Communication" },
  { value: "ai", label: "Artificial Intelligence" },
  { value: "ds", label: "Data Science" },
  { value: "cy", label: "Cybersecurity" },
  { value: "bt", label: "Biotechnology" }
]

const allCourses = [
  { value: "math101", label: "Mathematics 101" },
  { value: "phys101", label: "Physics 101" },
  { value: "chem101", label: "Chemistry 101" },
  { value: "bio101", label: "Biology 101" },
  { value: "eng101", label: "English 101" },
  { value: "hist101", label: "History 101" },
  { value: "cs101", label: "Computer Science 101" },
  { value: "stat101", label: "Statistics 101" },
  { value: "econ101", label: "Economics 101" },
  { value: "psyc101", label: "Psychology 101" }
]

export function ReusableEntityFormSearchExample() {
  // Parent-controlled search states
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState("")
  const [courseSearchTerm, setCourseSearchTerm] = useState("")
  
  // Filter options based on search terms
  const filteredDepartments = useMemo(() => {
    if (!departmentSearchTerm) return allDepartments
    return allDepartments.filter(dept => 
      dept.label.toLowerCase().includes(departmentSearchTerm.toLowerCase())
    )
  }, [departmentSearchTerm])

  const filteredCourses = useMemo(() => {
    if (!courseSearchTerm) return allCourses
    return allCourses.filter(course => 
      course.label.toLowerCase().includes(courseSearchTerm.toLowerCase())
    )
  }, [courseSearchTerm])

  // Handle search changes for different fields
  const handleSearchChange = (searchTerm: string, fieldKey: string) => {
    switch (fieldKey) {
      case "department":
        setDepartmentSearchTerm(searchTerm)
        break
      case "course":
        setCourseSearchTerm(searchTerm)
        break
      default:
        console.log(`Search for ${fieldKey}: ${searchTerm}`)
    }
  }

  // Form fields configuration with parent-controlled search
  const formFields: FormFieldConfig[] = [
    {
      key: "name",
      label: "Student Name",
      type: "string",
      required: true,
      placeholder: "Enter student name"
    },
    {
      key: "email",
      label: "Email",
      type: "string",
      required: true,
      placeholder: "Enter email address"
    },
    {
      key: "department",
      label: "Department",
      type: "select",
      required: true,
      searchable: true,
      placeholder: "Select department",
      options: allDepartments, // Original options for fallback
      // Parent-controlled search props
      searchTerm: departmentSearchTerm,
      onSearchChange: handleSearchChange,
      filteredOptions: filteredDepartments,
      gridSpan: "half"
    },
    {
      key: "course",
      label: "Course",
      type: "select",
      required: true,
      searchable: true,
      placeholder: "Select course",
      options: allCourses, // Original options for fallback
      // Parent-controlled search props
      searchTerm: courseSearchTerm,
      onSearchChange: handleSearchChange,
      filteredOptions: filteredCourses,
      gridSpan: "half"
    },
    {
      key: "year",
      label: "Academic Year",
      type: "select",
      required: true,
      searchable: false, // This field is not searchable
      options: [
        { value: "1", label: "First Year" },
        { value: "2", label: "Second Year" },
        { value: "3", label: "Third Year" },
        { value: "4", label: "Fourth Year" }
      ],
      gridSpan: "half"
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      required: true,
      searchable: false,
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "suspended", label: "Suspended" }
      ],
      gridSpan: "half"
    }
  ]

  const handleSubmit = async (data: Record<string, any>) => {
    console.log("Form submitted:", data)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert("Student created successfully!")
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Parent-Controlled Search Example</CardTitle>
          <CardDescription>
            This example demonstrates how the ReusableEntityForm component can use parent-controlled search functionality for searchable fields.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Current Search States:</h4>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline">
                  Department Search: "{departmentSearchTerm || "none"}"
                </Badge>
                <Badge variant="outline">
                  Course Search: "{courseSearchTerm || "none"}"
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Filtered Results:</h4>
              <div className="text-sm text-muted-foreground">
                <p>Departments: {filteredDepartments.length} of {allDepartments.length}</p>
                <p>Courses: {filteredCourses.length} of {allCourses.length}</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setDepartmentSearchTerm("")
                  setCourseSearchTerm("")
                }}
              >
                Clear All Searches
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setDepartmentSearchTerm("computer")}
              >
                Search "computer" in Departments
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setCourseSearchTerm("101")}
              >
                Search "101" in Courses
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <ReusableEntityForm
        title="Create Student (Parent-Controlled Search)"
        description="This form uses parent-controlled search for department and course fields"
        fields={formFields}
        searchControlMode="parent" // Enable parent-controlled search mode
        onSubmit={handleSubmit}
        submitLabel="Create Student"
      />
    </div>
  )
}

export default ReusableEntityFormSearchExample
