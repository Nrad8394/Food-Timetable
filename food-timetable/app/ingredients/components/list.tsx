"use client";
import { EnhancedReusableList, ListItemData, Column, FilterConfig} from "@/components/common/list/enhanced-reusable-list";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Ingredient } from "@/types";
import { is } from "date-fns/locale";
import { set } from "date-fns";
import { ListProps } from "@/components/common/list/enhanced-reusable-list";

interface IngredientsListProps extends Partial <ListProps> {
    ingredients: Ingredient[];
    isLoading?: boolean;
    refetch?: () => void;
    setIngredientModalVisible: (value: boolean) => void;
    setIngredientToEdit: (ingredient: Ingredient | undefined) => void;
    handleDelete: (id: string) => void;
}

export function IngredientsList({ 
    ingredients, isLoading, refetch, setIngredientModalVisible, setIngredientToEdit, 
    handleDelete, page, pageSize, onPageChange, onPageSizeChange, totalItems, 
    searchTerm, onSearchChange, filters, onFiltersChange, sortConfig, onSortChange}: IngredientsListProps) {
    
    const router = useRouter();
    const [data, setData] = useState<ListItemData[]>([]);
    const filterConfigs:FilterConfig[] = [
            {
                id: 'name',
                label: 'Name',
                type: 'text',
                placeholder: 'Filter by ingredient name...'
            }
        ];
    useEffect(() => {
        if (ingredients && ingredients.length > 0) {
            const listData: ListItemData[] = ingredients.map((ingredient) => ({
                id: ingredient.id,
                title: ingredient.name.length > 30 ? ingredient.name.slice(0, 30) + "..." : ingredient.name,
                description: ingredient.description && ingredient.description.length > 50
                    ? ingredient.description.slice(0, 50) + "..."
                    : ingredient.description || "No description provided",
                icon: "🥕", // Placeholder icon
                image: '', // Placeholder for image if needed
                actions: [
                    <div className="flex space-x-2">
                        <button
                            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                setIngredientToEdit(ingredient);
                                setIngredientModalVisible(true);}}
                        >
                            Edit
                        </button>
                        <button
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(ingredient.id);
                            }}
                        >
                            Delete
                        </button>
                    </div>
                ],
                onClick: () => {
                    router.push(`/ingredients/${ingredient.id}`);
                }
            }))
            setData(listData);
        }
        else {
            setData([]);
        }
    }, [ingredients]);

    const columns: Column[] = [
        { id: "name", header: "Ingredient", accessorKey: "title", sortable: true },
        { id: "description", header: "Description", accessorKey: "description"},
        { id: "actions", header: "Actions", accessorKey: "actions" }
    ]

    const handleFiltersChange = (newFilters: Record<string, string | string[]>) => {
        if (onFiltersChange) {
            onFiltersChange(newFilters);
        }
    };

    const handleSortChange = (newSortConfig: { column: string; direction: "ascending" | "descending" } | null) => {
        if (onSortChange) {
            onSortChange(newSortConfig);
        }
    };

    return (
            <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
                <header className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Ingredients</h1>
                    <button
                        onClick={() => {
                            setIngredientModalVisible(true), setIngredientToEdit(undefined);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Create Ingredient
                    </button>
                </header>
                <EnhancedReusableList 
                        data={data} 
                        columns={columns} 
                        variant="table" 
                        searchable={true} 
                        searchTerm={searchTerm}
                        onSearchChange={onSearchChange} // Placeholder for search change handler
                        filterable={true}
                        filters={filters}
                        onFiltersChange={handleFiltersChange} // Placeholder for filters change handler
                        filterConfigs={filterConfigs}
                        sortable={true}
                        sortConfig={sortConfig} // Placeholder for sort config
                        onSortChange={handleSortChange}
                        isLoading={isLoading}
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

