# ReusableEntityForm - Parent-Controlled Search Documentation

## Overview

The `ReusableEntityForm` component has been enhanced to support parent-controlled search functionality for searchable fields, similar to the pattern implemented in the `EnhancedReusableList` component.

## Changes Made

### 1. Enhanced Type Definitions

#### `FormFieldConfig` Interface
Added new optional properties for parent-controlled search:

```typescript
export type FormFieldConfig = FieldDefinition & {
  // ...existing props...
  searchable?: boolean // Enable searchable select dropdown
  
  // NEW: Parent-controlled search functionality for searchable fields
  searchTerm?: string // Current search term (parent-controlled)
  onSearchChange?: (searchTerm: string, fieldKey: string) => void // Callback when search term changes
  filteredOptions?: { value: string | number; label: string }[] // Pre-filtered options from parent
}
```

#### `FormConfig` Interface
Added new optional property for global search control:

```typescript
export type FormConfig = {
  // ...existing props...
  
  // NEW: Global search control for all searchable fields
  searchControlMode?: "internal" | "parent" // How search functionality should be managed
}
```

### 2. Updated Component Implementation

#### Function Signature
Updated to accept the new `searchControlMode` parameter:

```typescript
export function ReusableEntityForm({
  // ...existing params...
  searchControlMode = "internal" // Default to internal mode for backward compatibility
}: FormConfig)
```

#### Searchable Field Logic
Enhanced the searchable select field implementation to support both modes:

```typescript
case "select":
  if (field.searchable && field.options?.length) {
    const [open, setOpen] = React.useState(false)
    
    // Determine if using parent-controlled search
    const isParentControlled = searchControlMode === "parent" && 
      (field.searchTerm !== undefined || field.onSearchChange !== undefined)
    
    // Use parent-controlled search term if available, otherwise use CommandInput's internal state
    const searchTerm = isParentControlled ? field.searchTerm || "" : undefined
    
    // Use filtered options if provided by parent, otherwise use all options
    const optionsToDisplay = isParentControlled && field.filteredOptions 
      ? field.filteredOptions 
      : field.options
    
    return (
      <Popover open={open} onOpenChange={setOpen}>
        {/* ...popover content... */}
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
          <CommandGroup className="max-h-60 overflow-y-auto">
            {optionsToDisplay.map(option => (
              <CommandItem key={option.value.toString()} value={option.label}>
                {/* ...option content... */}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </Popover>
    )
  }
```

## Usage Patterns

### 1. Internal Search Control (Default/Backward Compatible)

This is the default behavior that maintains backward compatibility:

```typescript
const formFields: FormFieldConfig[] = [
  {
    key: "department",
    label: "Department",
    type: "select",
    searchable: true, // Enable searchable dropdown
    options: allDepartmentOptions,
    // No search control props = internal mode
  }
]

<ReusableEntityForm
  title="Create User"
  fields={formFields}
  // searchControlMode="internal" // Default value
  onSubmit={handleSubmit}
/>
```

### 2. Parent-Controlled Search

This allows the parent component to control search functionality:

```typescript
const [departmentSearchTerm, setDepartmentSearchTerm] = useState("")

// Filter options based on search term
const filteredDepartments = useMemo(() => {
  if (!departmentSearchTerm) return allDepartmentOptions
  return allDepartmentOptions.filter(dept => 
    dept.label.toLowerCase().includes(departmentSearchTerm.toLowerCase())
  )
}, [departmentSearchTerm])

// Handle search changes
const handleSearchChange = (searchTerm: string, fieldKey: string) => {
  if (fieldKey === "department") {
    setDepartmentSearchTerm(searchTerm)
  }
}

const formFields: FormFieldConfig[] = [
  {
    key: "department",
    label: "Department",
    type: "select",
    searchable: true,
    options: allDepartmentOptions, // Original options for fallback
    // Parent-controlled search props
    searchTerm: departmentSearchTerm,
    onSearchChange: handleSearchChange,
    filteredOptions: filteredDepartments,
  }
]

<ReusableEntityForm
  title="Create User"
  fields={formFields}
  searchControlMode="parent" // Enable parent-controlled mode
  onSubmit={handleSubmit}
/>
```

## Implementation Details

### Search Control Mode Detection

The component determines whether to use parent-controlled search based on:

1. `searchControlMode` prop is set to "parent"
2. AND either `searchTerm` or `onSearchChange` is provided in the field config

```typescript
const isParentControlled = searchControlMode === "parent" && 
  (field.searchTerm !== undefined || field.onSearchChange !== undefined)
```

### Option Display Logic

- **Parent-controlled mode**: Uses `filteredOptions` if provided, otherwise falls back to `options`
- **Internal mode**: Always uses `options` and relies on CommandInput's built-in filtering

### Search Term Handling

- **Parent-controlled mode**: 
  - Sets `value` prop on CommandInput to the parent-provided search term
  - Calls `onSearchChange` callback when search term changes
- **Internal mode**: 
  - Lets CommandInput manage its own internal search state
  - No `value` or `onValueChange` props are set

## Benefits

1. **Backward Compatibility**: Existing implementations continue to work without changes
2. **Flexible Control**: Parents can choose to control search functionality when needed
3. **Consistent Pattern**: Follows the same parent-controlled pattern as `EnhancedReusableList`
4. **Performance**: Parents can implement custom filtering logic, debouncing, or API calls
5. **State Management**: Parents can coordinate search across multiple fields or components

## Examples

- `reusable-entity-form-search-example.tsx` - Basic parent-controlled search usage
- `reusable-entity-form-comparison-test.tsx` - Side-by-side comparison of both modes

## Migration Guide

### From Internal to Parent-Controlled

1. Add state management for search terms:
```typescript
const [searchTerm, setSearchTerm] = useState("")
```

2. Implement filtering logic:
```typescript
const filteredOptions = useMemo(() => {
  return options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  )
}, [searchTerm, options])
```

3. Add search change handler:
```typescript
const handleSearchChange = (term: string, fieldKey: string) => {
  setSearchTerm(term)
}
```

4. Update field configuration:
```typescript
{
  // ...existing config...
  searchTerm,
  onSearchChange: handleSearchChange,
  filteredOptions
}
```

5. Set search control mode:
```typescript
<ReusableEntityForm
  // ...existing props...
  searchControlMode="parent"
/>
```

This enhancement provides powerful search control capabilities while maintaining full backward compatibility with existing implementations.
