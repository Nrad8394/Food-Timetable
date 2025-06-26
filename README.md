# 🍽️ Plate Plan - Weekly Food Planner

**Start every day with a plan — organize your breakfast, lunch, and dinner effortlessly.**

Plate Plan is a modern, intuitive web application built with Next.js that helps you manage your weekly meal planning. Whether you're cooking solo or feeding a family, our app helps you keep meals exciting, balanced, and always on time.

## ✨ Features

- **📋 Meal Management**: Create, edit, and organize your meals with detailed descriptions
- **🥕 Ingredient Tracking**: Manage ingredients with pricing and descriptions
- **📅 Weekly Timetable**: Plan your meals for the entire week
- **🔍 Smart Search**: Find meals and ingredients quickly with built-in search functionality
- **📊 Data Tables**: View and manage your data with sortable, filterable tables
- **📱 Responsive Design**: Beautiful UI that works on desktop and mobile devices
- **📤 Export Features**: Export your meal plans and ingredient lists
- **🎨 Modern UI**: Built with shadcn/ui components and Tailwind CSS

## 🚀 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) with Radix UI primitives
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner
- **Export**: Excel export with XLSX

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Food-Timetable.git
   cd Food-Timetable/food-timetable
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 📁 Project Structure

```
food-timetable/
├── app/                    # Next.js App Router pages
│   ├── ingredients/        # Ingredient management pages
│   ├── meals/             # Meal management pages
│   ├── layout.tsx         # Root layout with navigation
│   └── page.tsx          # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── common/           # Common utility components
│   └── hero.tsx          # Landing page hero
├── handler/              # API configuration and services
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── utils/                # Helper functions
```

## 🎯 Key Components

### Meals Management
- Create and edit meals with ingredient associations
- View detailed meal information
- Search and filter meals
- Export meal data to Excel

### Ingredients Management
- Add ingredients with pricing information
- Organize ingredient inventory
- Track ingredient usage across meals
- Search and categorize ingredients

### Data Tables
- Sortable columns for easy organization
- Advanced filtering options
- Pagination for large datasets
- Responsive design for mobile viewing

## 🛠️ Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint for code quality

## 🔧 Configuration

The application uses several configuration files:
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration

## 🎨 UI Components

Built with a comprehensive set of shadcn/ui components including:
- Data tables with sorting and filtering
- Forms with validation
- Modals and dialogs
- Date pickers and selectors
- Navigation and layout components
- Toast notifications

## 📱 Responsive Design

The application is fully responsive and provides an optimal experience across:
- Desktop computers
- Tablets
- Mobile phones

## 🚀 Getting Started with Development

1. **Set up your environment**: Ensure you have Node.js 18+ installed
2. **Install dependencies**: Run `npm install` in the project directory
3. **Start development**: Use `npm run dev` to start the development server
4. **Begin coding**: The app will auto-reload as you make changes

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

If you have any questions or need help getting started, please open an issue in the GitHub repository.

---

**Happy meal planning! 🍽️**
