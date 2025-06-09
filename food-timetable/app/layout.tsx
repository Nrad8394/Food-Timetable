"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';
import { QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { Toaster } from "sonner";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

export default function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) {
  return (
    <html lang="en">
      <body className="bg-green-100 text-gray-900 min-h-screen flex flex-col">
        <nav className="bg-amber-200 shadow-md p-4 mt-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-black">🍴 Plate Plan</div>
          <div className="space-x-4">
            <Link href="/" className="text-gray-700 hover:text-blue-500">Home</Link>
            <Link href="/meals" className="text-gray-700 hover:text-blue-500">Meals</Link>
            <Link href="/timetable" className="text-gray-700 hover:text-blue-500">Timetable</Link>
          </div>
        </nav>
        <QueryClientProvider client={queryClient}>
          <main className="flex-grow container mx-auto px-4 py-8">{children}</main>
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
        <footer className="bg-amber-200 shadow-inner text-center p-4 text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} PlatePlan App. All rights reserved.</p>
          <p>Designed to make your meal planning simple and delicious.</p>
        </footer>
      </body>
    </html>
  );
}
