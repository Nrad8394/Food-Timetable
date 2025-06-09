"use client";
import React, { useState } from "react";
import { IngredientsList } from "./components/list";
import { IngredientsFormModal } from "./components/form";
import { useApi } from "@/hooks/useApi";
import ApiService from "@/handler/ApiService";
import { Ingredient } from "@/types";
import { toast } from "sonner";
import { handleApiError } from "@/utils/formHelpers";
import { se } from "date-fns/locale";

export default function ViewIngredientsPage() {
    // State for Pagination
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    // State for Search, Sort and Filters
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [filters, setFilters] = useState<Record<string, string | string[]>>({});
    const [sortConfig, setSortConfig] = useState<{ column: string; direction: "ascending" | "descending" } | null>(null);
    
    const { useFetchData, useAddItem, useDeleteItem, useFetchById, useUpdateItem } = useApi<Ingredient, Ingredient>(ApiService.INGREDIENT_URL, pageSize);
    const {data, error, isFetching, refetch} = useFetchData(page, {
        search: searchTerm,
        ordering: sortConfig ? `${sortConfig.direction === 'descending' ? '-' : ''}${sortConfig.column}` : undefined,
        ...filters, // This will pass type and any other filters to the API
    });

    const ingredients = data?.results || [];
    const { mutate: createIngredient, isPending } = useAddItem;
    const [ingredientModalVisible, setIngredientModalVisible] = useState<boolean>(false);

    const { mutate: updateIngredient } = useUpdateItem;
    const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | undefined>(undefined);

    const {mutate: usedeleteIngredient } = useDeleteItem;

    function handleAddIngredient(ingredient: Partial<Ingredient>) {
        try {
            if (!ingredient.name) {
                throw new Error("Ingredient name is required");
            }
            createIngredient({item:ingredient}, {
                onSuccess: () => {
                    toast.success("Ingredient added successfully");
                    refetch();
                },
                onError: (error) => {
                    handleApiError(error);
                }
            });
        } catch (error) {
            toast.error("Failed to add ingredient: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    }
    
    // Function to handle updating an ingredient
    function handleUpdateIngredient(id: string,  ingredient: Partial<Ingredient>) {
        try {
            if (!id) {
                throw new Error("Ingredient ID is required for update");
            }
            if (!ingredient.name) {
                throw new Error("Ingredient name is required for update");
            }
            updateIngredient({id: id, item: ingredient}, {
                onSuccess: () => {
                    toast.success("Ingredient updated successfully");
                    refetch();
                    setIngredientToEdit(undefined); // Clear the meal to edit after successful update
                    setIngredientModalVisible(false);
                },
                onError: (error) => {
                    handleApiError(error);
                }
            });
        } catch (error) {
            toast.error("Failed to update ingredient: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    }

    function deleteIngredient(id: string) {
        try {
            if (!id) {
                throw new Error("Ingredient ID is required for deletion");
            }
            usedeleteIngredient({id:id}, {
                onSuccess: () => {
                    toast.success("Ingredient deleted successfully");
                    refetch();
                },
                onError: (error) => {
                    handleApiError(error);
                }
            });
        }
        catch (error) {
            toast.error("Failed to delete meal: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    }
    if (error) {
        handleApiError(error);
    }

    return (
        <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <header className="flex justify-between items-center mb-6">
            </header>

            <IngredientsList 
                ingredients={ingredients} 
                isLoading={isFetching} 
                refetch={refetch}
                setIngredientModalVisible={setIngredientModalVisible}
                handleDelete={deleteIngredient}
                setIngredientToEdit={setIngredientToEdit}
                page={page}
                onPageChange={setPage}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={ data?.count || 0}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filters={filters}
                onFiltersChange={setFilters}
                sortConfig={sortConfig}
                onSortChange={setSortConfig}
            />
            <IngredientsFormModal 
                open={ingredientModalVisible} 
                onClose={() => setIngredientModalVisible(false)} 
                handleAddIngredient={handleAddIngredient}
                handleUpdateIngredient={handleUpdateIngredient}
                ingredient={ingredientToEdit}
            />
        </section>
    );
}