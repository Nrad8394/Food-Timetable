"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MealsList } from "./components/list";
import { useApi } from "@/hooks/useApi";
import { handleApiError } from "@/utils/formHelpers";
import ApiService from "@/handler/ApiService";
import { Meal,Ingredient } from "@/types";
import { toast } from "sonner";
import { MealsFormModal } from "./components/form";

export default function ViewMealsPage() {
    const { useFetchData:fetchIngredients } = useApi<Ingredient, Ingredient>(ApiService.INGREDIENT_URL, 10);
    const { data: ingredientsData, error: ingredientsError, isFetching: isIngredientsFetching } = fetchIngredients(1, {});
    const ingredientsList = ingredientsData?.results || [];

    // pagination 
    const [page, setPage] = useState<number>(1);
    const [pageSize, setPageSize] = useState<number>(10);
    // state for search, sort and filters
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<{ column: string; direction: "ascending" | "descending" } | null>(null);
    const [filters, setFilters] = useState<Record<string, string | string[]>>({});

    const {useFetchData, useDeleteItem, useAddItem, useUpdateItem} = useApi<Meal, Meal>(ApiService.MEAL_URL, pageSize)
    const [mealModalVisible, setMealModalVisible] = useState<boolean>(false);
    const { data, error, isFetching, refetch } = useFetchData(page, {
        search: searchTerm,
        ordering: sortConfig ? `${sortConfig.direction === 'descending' ? '-' : ''}${sortConfig.column}` : undefined,
        ...filters, // This will pass type and any other filters to the API
    });

    const { mutate:createMeal, isPending } = useAddItem;
    const { mutate: updateMeal } = useUpdateItem;
    const { mutate: useDeleteMeal } = useDeleteItem;
    const [mealToEdit, setMealToEdit] = useState<Meal | undefined>(undefined);
    const meals = data?.results || [];
    const router = useRouter();

    function handleAddMeal( meal: Partial<Meal>) {
        try {
            if (!meal) {
                throw new Error("Meal data is required");
            }
            createMeal({item:meal},{
                onSuccess: () => {
                    toast.success("Meal added successfully");
                    refetch();
                },
                onError: (error) => {
                    handleApiError(error);
                }
            })
        } catch (error) {
            toast.error("Failed to add meal: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    }

    function handleUpdateMeal(id: string, meal: Partial<Meal>) {
        try {
            if (!id || !meal) {
                throw new Error("Meal ID and data are required for update");
            }
            updateMeal({id:id, item:meal}, {
                onSuccess: () => {
                    toast.success("Meal updated successfully");
                    refetch();
                    setMealToEdit(undefined); // Clear the meal to edit after successful update
                    setMealModalVisible(false); // Close the modal after update
                },
                onError: (error) => {
                    handleApiError(error);
                }
            });
        } catch (error) {
            toast.error("Failed to update meal: " + (error instanceof Error ? error.message : "Unknown error"));
        }
    }

    function deleteMeal(id: string) {
        try {
            if (!id) {
                throw new Error("Meal ID is required for deletion");
            }
            useDeleteMeal({id:id}, {
                onSuccess: () => {
                    toast.success("Meal deleted successfully");
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
    if (ingredientsError) {
        handleApiError(ingredientsError);
    }

    return (
        <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
        <header className="flex justify-between items-center mb-6">
        </header>
    
        <MealsList 
            meals={meals} 
            isLoading={isFetching} 
            refetch={refetch}
            setMealModalVisible={setMealModalVisible}
            handleDelete={deleteMeal}
            setMealToEdit={setMealToEdit}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortConfig={sortConfig}
            onSortChange={setSortConfig}
            filters={filters}
            onFiltersChange={setFilters}
            page={page}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalItems={ data?.count || 0}
        />

        <MealsFormModal 
            open={mealModalVisible} 
            onClose={() => setMealModalVisible(false)} 
            ingredientsList={ingredientsList} 
            handleAddMeal={handleAddMeal}
            meal={mealToEdit}
            handleUpdateMeal={handleUpdateMeal}
        />
        </section>
    );
}