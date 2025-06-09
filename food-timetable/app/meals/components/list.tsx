"use client";
import React, { use, useEffect, useState } from "react";
import { ListItemData, Column , FilterConfig} from "@/components/common/list/enhanced-reusable-list";
import { EnhancedReusableList } from "@/components/common/list/enhanced-reusable-list";
import { useRouter } from "next/navigation";
import { Meal } from "@/types";
import { se } from "date-fns/locale";
import { ListProps } from "@/components/common/list/enhanced-reusable-list";
import { on } from "events";

interface MealsListProps extends Partial<ListProps> {
    meals: Meal[];
    isLoading?: boolean;
    refetch?: () => void;
    setMealModalVisible: (value: boolean) => void;
    handleDelete?: (id: string) => void;
    setMealToEdit: (meal: Meal | undefined) => void;
    searchTerm?: string;
    onSearchChange?: (term: string) => void;
    sortConfig?: { column: string; direction: "ascending" | "descending" } | null;
    onSortChange?: (sortConfig: { column: string; direction: "ascending" | "descending" } | null) => void;
    filters?: Record<string, string | string[]>;
    onFiltersChange?: (filters: Record<string, string | string[]>) => void;
}


export function MealsList({ 
    meals, isLoading, refetch, setMealModalVisible, handleDelete, setMealToEdit, searchTerm, onSearchChange,
     sortConfig, onSortChange, filters, onFiltersChange,page,pageSize,onPageChange,onPageSizeChange,totalItems }: MealsListProps) {
    const router = useRouter();
    const [data, setData] = useState<ListItemData[]>([]);    
    const filterConfigs:FilterConfig[] = [
        {
            id: 'name',
            label: 'Name',
            type: 'text',
            placeholder: 'Filter by meal name...'
        }
    ];
    useEffect(() => {
        if (meals && meals.length > 0) {
            const listData: ListItemData[] = meals.map((meal) => ({
                id: meal.id,
                title: meal.name.length > 30 ? meal.name.slice(0, 30) + "..." : meal.name,
                description: meal.description && meal.description.length > 50
                    ? meal.description.slice(0, 50) + "..."
                    : meal.description || "No description provided",
                icon: "🍽️",
                image: '', // Placeholder for image if needed
                metadata: {
                    name: meal.name // Add name to metadata for filtering
                },
                actions: [
                   <div className="flex space-x-2" key={meal.id}>
                        <button
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                setMealToEdit(meal);
                                setMealModalVisible(true);
                            }}
                        >
                            Edit
                        </button>
                        <button
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete && handleDelete(meal.id);
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ],
                onClick: () => {
                    router.push(`/meals/${meal.id}`);
                }
            }));
            setData(listData);
        } else {
            setData([]);
        }
    }, [meals]);

    const columns: Column[] = [
        { id: "name", header: "Meal Name", accessorKey: "title", sortable: true },
        { id: "description", header: "Description", accessorKey: "description", sortable: true },
        { id: "actions", header: "Actions", accessorKey: "actions" }
    ];
    

    const handleSortChange = (newSortConfig: { column: string; direction: "ascending" | "descending" } | null) => {
        if (onSortChange) {
            onSortChange(newSortConfig);
        }
    };

    const handleFiltersChange = (newFilters: Record<string, string | string[]>) => {
        if (onFiltersChange) {
            onFiltersChange(newFilters);
        }
    };

    return (
        <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Meals</h1>
                <button
                    onClick={() => {setMealToEdit(undefined); setMealModalVisible(true)}}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                    Create Meal
                </button>
            </header>
            <EnhancedReusableList 
                data={data} 
                columns={columns} 
                variant="table" 
                searchable={true} 
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                filterable={true}
                filters={filters}
                filterConfigs={filterConfigs}
                onFiltersChange={handleFiltersChange}
                isLoading={isLoading}
                sortable={true}
                sortConfig={sortConfig}
                onSortChange={handleSortChange}
                page={page}
                pageSize={pageSize}
                paginated={true}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
                totalItems={totalItems}
            />
        </section>
    );
}