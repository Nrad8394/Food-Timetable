# ViewDetailsModal Component Documentation

A highly flexible and reusable component for displaying detailed information about any object instance in a modal dialog. The component follows the established patterns in the codebase and provides extensive customization options.

## Features

- **Generic Type Support**: Works with any object type using TypeScript generics
- **Multiple Layout Options**: Tabs, sections, or accordion layouts
- **Field Type Support**: Text, email, phone, URLs, dates, badges, avatars, lists, booleans, numbers, and custom rendering
- **Sensitive Data Handling**: Built-in show/hide functionality for sensitive information
- **Copy to Clipboard**: Easy copying of field values
- **Responsive Design**: Adapts to different screen sizes
- **Customizable Actions**: Support for edit, delete, export, and custom actions
- **Icon Integration**: Support for Lucide React icons
- **Accessible**: Following WCAG guidelines with proper ARIA labels

## Basic Usage

```tsx
import { ViewDetailsModal, createSection, createField, CommonFields } from '@/components/common/view-details-modal'

// Define your sections
const sections = [
  createSection(
    'basic',
    'Basic Information',
    [
      CommonFields.id(),
      CommonFields.name(),
      CommonFields.email(),
      CommonFields.phone()
    ]
  )
]

// Use in your component
<ViewDetailsModal
  open={isOpen}
  onOpenChange={setIsOpen}
  item={yourDataObject}
  title="Item Details"
  sections={sections}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Field Types

### Text Field
```tsx
createField('name', 'Name', { icon: User })
```

### Email Field
```tsx
createField('email', 'Email', { 
  type: 'email', 
  icon: Mail, 
  copyable: true 
})
```

### Phone Field
```tsx
createField('phone', 'Phone', { 
  type: 'phone', 
  icon: Phone, 
  copyable: true,
  sensitive: true // Can be hidden/shown
})
```

### Date/DateTime Fields
```tsx
createField('created_at', 'Created', { 
  type: 'datetime', 
  icon: Calendar 
})
createField('birth_date', 'Date of Birth', { 
  type: 'date',
  sensitive: true 
})
```

### Badge Field
```tsx
createField('status', 'Status', { type: 'badge' })
```

### Boolean Field
```tsx
createField('is_active', 'Active', { type: 'boolean' })
```

### List Field
```tsx
createField('tags', 'Tags', { 
  type: 'list' // Displays array items as badges
})
```

### Avatar Field
```tsx
createField('profile_picture', 'Avatar', { type: 'avatar' })
```

### Custom Rendering
```tsx
createField('full_name', 'Full Name', {
  render: (value, item) => `${item.first_name} ${item.last_name}`
})
```

### Nested Object Access
```tsx
createField('address.street', 'Street Address', { icon: MapPin })
createField('profile.contact.phone', 'Phone', { type: 'phone' })
```

## Section Layouts

### Single Column
```tsx
createSection('details', 'Details', fields, { layout: 'single' })
```

### Double Column (Default)
```tsx
createSection('details', 'Details', fields, { layout: 'double' })
```

### Triple Column
```tsx
createSection('details', 'Details', fields, { layout: 'triple' })
```

### Grid Layout
```tsx
createSection('details', 'Details', fields, { layout: 'grid' })
```

## Modal Layouts

### Tabs Layout (Default for multiple sections)
```tsx
<ViewDetailsModal
  layout="tabs"
  sections={sections}
  // ... other props
/>
```

### Sections Layout
```tsx
<ViewDetailsModal
  layout="sections"
  sections={sections}
  // ... other props
/>
```

## Customization Options

### Custom Header
```tsx
const customHeader = (item) => (
  <div className="flex items-center gap-4">
    <Avatar className="h-16 w-16">
      <AvatarImage src={item.avatar} />
      <AvatarFallback>{item.initials}</AvatarFallback>
    </Avatar>
    <div>
      <h2 className="text-2xl font-bold">{item.name}</h2>
      <p className="text-muted-foreground">{item.title}</p>
    </div>
  </div>
)

<ViewDetailsModal
  renderHeader={customHeader}
  // ... other props
/>
```

### Custom Footer
```tsx
const customFooter = (item) => (
  <div className="flex justify-between w-full">
    <p className="text-sm text-muted-foreground">
      Last updated: {new Date(item.updated_at).toLocaleDateString()}
    </p>
    <div className="flex gap-2">
      <Button variant="outline">Custom Action</Button>
      <Button>Primary Action</Button>
    </div>
  </div>
)

<ViewDetailsModal
  renderFooter={customFooter}
  // ... other props
/>
```

### Modal Size Options
```tsx
<ViewDetailsModal
  maxWidth="7xl" // sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, 6xl, 7xl
  // ... other props
/>
```

## Pre-built Field Configurations

The component includes common field configurations:

```tsx
import { CommonFields } from '@/components/common/view-details-modal'

CommonFields.id() // ID field with copy functionality
CommonFields.name() // Name field with User icon
CommonFields.email() // Email field with Mail icon and copy
CommonFields.phone() // Phone field with Phone icon and copy
CommonFields.address() // Address field with MapPin icon
CommonFields.building() // Building field with Building icon
CommonFields.status() // Status field as badge
CommonFields.createdAt() // Created at datetime with Calendar icon
CommonFields.updatedAt() // Updated at datetime with Calendar icon
```

## Complete Example

```tsx
import React, { useState } from "react"
import { ViewDetailsModal, createSection, createField, CommonFields } from "@/components/common/view-details-modal"
import { Room } from "@/types/timetables"
import { Building, Users, Settings } from "lucide-react"

export function RoomDetailsExample({ room }: { room: Room }) {
  const [isOpen, setIsOpen] = useState(false)

  const sections = [
    createSection(
      'basic',
      'Basic Information',
      [
        CommonFields.id(),
        createField('name', 'Room Name', { icon: Building }),
        createField('capacity', 'Capacity', { 
          type: 'number', 
          icon: Users,
          format: (value) => `${value} people`
        }),
        createField('room_type', 'Type', { type: 'badge' })
      ],
      {
        icon: Building,
        description: 'Core room information'
      }
    ),

    createSection(
      'features',
      'Features & Equipment',
      [
        createField('features.projector', 'Projector', { type: 'boolean' }),
        createField('features.wifi', 'WiFi', { type: 'boolean' }),
        createField('equipment', 'Equipment', { type: 'list' })
      ],
      {
        icon: Settings,
        layout: 'triple'
      }
    )
  ]

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        View Room Details
      </Button>

      <ViewDetailsModal
        open={isOpen}
        onOpenChange={setIsOpen}
        item={room}
        title={room?.name}
        subtitle={`${room?.building} - ${room?.room_type}`}
        sections={sections}
        layout="tabs"
        maxWidth="5xl"
        onEdit={(room) => console.log('Edit', room)}
        onDelete={(room) => console.log('Delete', room)}
        onExport={(room) => console.log('Export', room)}
      />
    </>
  )
}
```

## Integration with Existing Modal Patterns

This component is designed to work alongside your existing modal components like `ViewRoomDetailsModal` and `ViewClassGroupScheduleModal`. You can gradually migrate existing modals or use this for new features.

### Replacing Existing Modals

Instead of:
```tsx
<ViewRoomDetailsModal 
  open={isOpen} 
  onOpenChange={setIsOpen} 
  room={room} 
/>
```

Use:
```tsx
<ViewDetailsModal
  open={isOpen}
  onOpenChange={setIsOpen}
  item={room}
  title={room?.name}
  sections={roomSections}
/>
```

## TypeScript Support

The component is fully typed with generics:

```tsx
interface MyDataType {
  id: string
  name: string
  // ... other properties
}

const MyComponent = () => {
  const [item, setItem] = useState<MyDataType | null>(null)
  
  return (
    <ViewDetailsModal<MyDataType>
      item={item}
      // TypeScript will provide full intellisense
      onEdit={(item) => {
        // item is properly typed as MyDataType
      }}
      // ... other props
    />
  )
}
```

## Accessibility Features

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast support
- Responsive design for mobile devices

## Performance Considerations

- Lazy rendering of tab content
- Optimized re-renders with React.memo where appropriate
- Efficient field value extraction
- Minimal DOM manipulation

This component provides a powerful and flexible foundation for displaying detailed information about any data object in your application while maintaining consistency with your existing design patterns.
