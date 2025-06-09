// Example: How to use the simplified export functions for manual data control

import { 
  useSimpleExportHandler, 
  convertListItemDataToSimple,
  createSimpleSessionExportHandler 
} from './enhanced-export-handler'
import { exportSimpleData } from './export-utils'

// Example 1: Direct usage with simple data
const ExampleSimpleExport = () => {
  const { handleSimpleExport } = useSimpleExportHandler({
    defaultTitle: "My Custom Export",
    showLogo: true,
    enableToasts: true
  })

  const exportSessionData = () => {
    // Your raw data - you control exactly what gets exported
    const data = [
      {
        'Session Name': 'Math 101 - Algebra',
        'Course': 'Mathematics',
        'Trainer': 'John Doe',
        'Date': '2025-05-31',
        'Time': '09:00 - 11:00',
        'Venue': 'Room A101',
        'Students': 25,
        'Status': 'Completed'
      },
      {
        'Session Name': 'Physics 201 - Mechanics',
        'Course': 'Physics',
        'Trainer': 'Jane Smith',
        'Date': '2025-05-31',
        'Time': '14:00 - 16:00',
        'Venue': 'Lab B205',
        'Students': 18,
        'Status': 'Scheduled'
      }
    ]

    // Headers - you control the column order and names
    const headers = ['Session Name', 'Course', 'Trainer', 'Date', 'Time', 'Venue', 'Students', 'Status']

    // Export with manual control
    handleSimpleExport('excel', data, headers, {
      fileName: 'custom-sessions-export',
      title: 'Session Schedule Report',
      subtitle: 'Generated for Academic Year 2025'
    })
  }

  return (
    <button onClick={exportSessionData}>
      Export Custom Session Data
    </button>
  )
}

// Example 2: Converting from ListItemData format
const ExampleConvertAndExport = () => {
  const { handleSimpleExport } = useSimpleExportHandler()

  const exportConvertedData = (listItemData: any[]) => {
    // Define exactly how you want to map the ListItemData to your export format
    const fieldMapping = {
      'Session Title': 'title',
      'Course Name': (item: any) => item.metadata?.course || 'N/A',
      'Instructor': (item: any) => item.metadata?.trainer || 'Unknown',
      'Schedule': (item: any) => `${item.metadata?.date} ${item.metadata?.time}`,
      'Location': (item: any) => item.metadata?.venue || 'TBD',
      'Participants': (item: any) => item.metadata?.studentCount || 0,
      'Current Status': 'status'
    }

    // Convert to simple format with your custom mapping
    const simpleData = convertListItemDataToSimple(listItemData, fieldMapping)
    
    // Define headers in the exact order you want
    const headers = ['Session Title', 'Course Name', 'Instructor', 'Schedule', 'Location', 'Participants', 'Current Status']

    // Export with full control
    handleSimpleExport('pdf', simpleData, headers, {
      title: 'Academic Sessions Report',
      subtitle: 'Detailed session information',
      orientation: 'landscape'
    })
  }

  return (
    <button onClick={() => exportConvertedData([
      {
        id: 'SES001',
        title: 'Introduction to Programming',
        metadata: {
          course: 'Computer Science',
          trainer: 'Alice Johnson',
          date: '2025-06-01',
          time: '10:00 - 12:00',
          venue: 'Room 101',
          studentCount: 30
        },
        status: 'Completed'
      }
    ])}>
      Convert and Export
    </button>
  )
}

// Example 3: Direct function usage (without hooks)
const directExportExample = () => {
  const sessionData = [
    {
      'ID': 'SES001',
      'Title': 'Introduction to Programming',
      'Course': 'Computer Science',
      'Date': '2025-06-01',
      'Students': 30
    }
  ]

  const headers = ['ID', 'Title', 'Course', 'Date', 'Students']

  // Direct export without hooks
  exportSimpleData('csv', sessionData, headers, {
    fileName: 'programming-sessions',
    title: 'Programming Sessions Report'
  })
}

// Example 4: Using pre-configured handlers
interface SessionData {
  Session: string;
  Course: string;
  Trainer: string;
  Date: string;
}

const ExamplePreConfigured = () => {
  // This gives you a pre-configured export function
  const exportSessions = createSimpleSessionExportHandler()

  const handleQuickExport = () => {
    const data: SessionData[] = [/* your session data */]
    const headers = ['Session', 'Course', 'Trainer', 'Date']
    
    exportSessions('excel', data, headers)
  }

  return <button onClick={handleQuickExport}>Quick Export</button>
}

export { ExampleSimpleExport, ExampleConvertAndExport, directExportExample, ExamplePreConfigured }
