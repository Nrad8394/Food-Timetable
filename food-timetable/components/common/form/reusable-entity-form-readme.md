# Reusable Entity Form Component

A flexible, feature-rich form component for creating and editing entities with support for mass registration via Excel templates. This component is designed to work seamlessly with the NNP Smart Roster application and provides a consistent interface for managing various entities like users, courses, departments, etc.

## Features

- **Single Entity Creation/Editing**
  - Dynamic field rendering based on field type
  - Conditional fields that appear based on other field values
  - Comprehensive validation with Zod schema
  - Support for all common field types (text, select, date, checkbox, etc.)
  
- **Mass Registration via Excel**
  - Template generation based on field configuration
  - Template download with example data
  - File upload and parsing
  - Validation with detailed error reporting
  - Preview capabilities for uploaded data
  - Bulk import with progress tracking
  
- **Responsive Design**
  - Adapts to different screen sizes
  - Customizable layout with grid span control
  - Consistent styling across the application

## Usage

```tsx
import { ReusableEntityForm } from "@/components/common/reusable-entity-form"

export default function UserManagementPage() {
  // Define field configuration
  const userFields = [
    {
      key: "firstName",
      label: "First Name",
      type: "string",
      required: true,
      placeholder: "Enter first name"
    },
    {
      key: "email",
      label: "Email",
      type: "string",
      required: true,
      validationFn: (value) => /\S+@\S+\.\S+/.test(value) || "Invalid email"
    },
    {
      key: "role",
      label: "Role",
      type: "select",
      options: [
        { value: "trainer", label: "Trainer" },
        { value: "trainee", label: "Trainee" }
      ]
    },
    // More fields...
  ]
  
  return (
    <ReusableEntityForm
      title="Create New User"
      description="Enter user details below"
      fields={userFields}
      onSubmit={async (data) => {
        // Handle form submission
        await createUser(data)
      }}
      excelSupport={{
        enabled: true,
        template: {
          entityName: "Users",
          fields: userFields,
          examples: sampleUserData
        },
        onBulkSubmit: async (data) => {
          // Handle bulk import
          const results = await bulkImportUsers(data)
          return { success: results.success, failed: results.failed }
        }
      }}
    />
  )
}
```

## Props

### Form Configuration

| Prop | Type | Description |
|------|------|-------------|
| `title` | string | Form title displayed at the top |
| `description` | string | Optional description text |
| `fields` | FormFieldConfig[] | Array of field configurations |
| `submitLabel` | string | Text for the submit button (default: "Submit") |
| `cancelLabel` | string | Text for the cancel button (default: "Cancel") |
| `onSubmit` | function | Async function that handles form submission |
| `onCancel` | function | Optional function to handle cancellation |
| `defaultValues` | object | Default values for the form (for edit mode) |
| `excelSupport` | object | Configuration for Excel import functionality |
| `maxWidth` | string | Maximum width of the form (default: "800px") |

### Field Configuration

Each field in the `fields` array accepts the following properties:

| Prop | Type | Description |
|------|------|-------------|
| `key` | string | Unique identifier for the field (used as form field name) |
| `label` | string | Display label for the field |
| `type` | 'string' \| 'number' \| 'date' \| 'boolean' \| 'select' | Data type of the field |
| `fieldType` | 'input' \| 'textarea' \| 'select' \| 'date' \| 'radio' \| 'checkbox' \| 'switch' \| 'custom' | UI component to render |
| `required` | boolean | Whether the field is required |
| `placeholder` | string | Placeholder text for input fields |
| `description` | string | Help text displayed below the field |
| `helpText` | string | Tooltip text displayed when hovering a help icon |
| `searchable` | boolean | For select fields, enables a searchable dropdown with filtering capabilities |
| `options` | { value: string \| number; label: string }[] | Options for select, radio, etc. |
| `defaultValue` | any | Default value for the field |
| `validationFn` | (value: any) => boolean \| string | Custom validation function |
| `gridSpan` | 'full' \| 'half' \| 'third' | How much horizontal space the field should occupy |
| `condition` | (formValues: Record<string, any>) => boolean | Function to determine if field should be displayed |
| `customRenderer` | (field: any, form: UseFormReturn<any>) => React.ReactNode | Custom render function for complex fields |

### Excel Support Configuration

The `excelSupport` prop accepts the following properties:

| Prop | Type | Description |
|------|------|-------------|
| `enabled` | boolean | Whether Excel import is enabled |
| `template` | TemplateConfig | Template configuration for Excel export |
| `onBulkSubmit` | function | Async function to handle bulk data import |

The `template` object accepts:

| Prop | Type | Description |
|------|------|-------------|
| `entityName` | string | Name of the entity (used in template filename) |
| `fields` | FieldDefinition[] | Fields to include in the template |
| `examples` | object[] | Example data rows to include in the template |

## Example

See the example implementation in:
`/app/dashboard/examples/form/page.tsx`

## Best Practices

1. **Field Organization**
   - Group related fields together
   - Use appropriate grid spans for field layout
   - Use conditional fields to simplify complex forms

2. **Validation**
   - Always provide helpful validation messages
   - Use both field-level and form-level validation when appropriate
   - Include validation for bulk imports

3. **Excel Templates**
   - Include clear examples in templates
   - Add helpful instructions in template rows
   - Provide proper data formatting guidance

4. **User Experience**
   - Show clear progress indicators for long operations
   - Provide detailed error reporting
   - Allow preview before bulk operations

5. **Performance**
   - Process large imports in chunks
   - Provide feedback during long operations
   - Handle errors gracefully without crashing the form
