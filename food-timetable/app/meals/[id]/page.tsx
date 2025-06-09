"use client";

import { ViewDetailsPage } from "@/components/common/view-details/view-details-page";
import { createSection, createField } from "@/components/common/view-details/view-details-modal";
import { useState, useEffect, use } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { Meal, Ingredient } from "@/types";
import { useApi } from "@/hooks/useApi";
import ApiService from "@/handler/ApiService";
import { toast } from "sonner";
import { handleApiError } from "@/utils/formHelpers";
import { MealsFormModal } from "@/app/meals/components/form";

const mealSections = [
  createSection(
    'details',
    'Meal Details',
    [
      createField('name', 'Name'),
      createField('description', 'Description'),
      createField('ingredients', 'Ingredients', {
        type: 'list',
        format: (ingredients: Ingredient[]) => {
          if (!ingredients || ingredients.length === 0) return 'No ingredients';
          return ingredients.map(ingredient => ingredient.name).join(', ');
        }
      }),
    ]
  ),
];


export default function ViewMealsPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    const [mealModalVisible, setMealModalVisible] = useState<boolean>(false);
    const [mealToEdit, setMealToEdit] = useState<Meal | undefined>(undefined);

    const { useFetchData:fetchIngredients } = useApi<Ingredient, Ingredient>(ApiService.INGREDIENT_URL, 10);
    const { data: ingredientsData, error: ingredientsError, isFetching: isIngredientsFetching } = fetchIngredients(1, {});
    const ingredientsList = ingredientsData as unknown as Ingredient[];
    

    const { useFetchById:fetchMealById,useDeleteItem:deleteMeal,useUpdateItem:editMeal } = useApi<any, any>(ApiService.MEAL_URL, 10);
    const { data:meal , isFetching:isMealLoading,error:mealError } = id ? fetchMealById(id as string, {}) : { data: undefined, isFetching: false, error: undefined };
    const { mutate:updateMealMutate, isPending:isUpdateLoading } = editMeal;
    const { mutate:mealDeleteMutate, isPending:deleteLoading } = deleteMeal

    function handleDelete(meal:Meal) {
        if (!id) {
            console.error("Meal ID is required for deletion");
            toast.error("Meal ID is required for deletion");
            return;
        }
        setLoading(true);
        mealDeleteMutate({ id:meal.id }, {
            onSuccess: () => {
                toast.success("Meal deleted successfully");
                router.push('/meals');
            },
            onError: (error) => {
                console.error("Failed to delete meal:", error);
                handleApiError(error, "Failed to delete meal");
            },
            onSettled: () => {
                setLoading(false);
            }
        });
    }
    function handleEdit(id: string,  meal: Partial<Meal>) {
        if (!id) {
            console.error("Meal ID is required for update");
            toast.error("Meal ID is required for update");
            return;
        }
        if (!meal.name) {
            console.error("Meal name is required for update");
            toast.error("Meal name is required for update");
            return;
        }
        setLoading(true);
        updateMealMutate({ id: id, item: meal }, {
            onSuccess: () => {
                toast.success("Meal updated successfully");
                router.push(`/meals/${id}`);
            },
            onError: (error) => {
                handleApiError(error, "Failed to update meal");
            },
            onSettled: () => {
                setLoading(false);
            }
        });
        
    }
    return (
        <>
            <ViewDetailsPage
                item={meal}
                title="Meal Details"
                layout="sections"
                breadcrumb="Back to Meals"
                sections={mealSections}
                loading={isMealLoading || deleteLoading || isUpdateLoading}
                error={mealError?.message  || undefined}
                onDelete={handleDelete}
                onEdit={() => {
                    setMealToEdit(meal);
                    setMealModalVisible(true);
                }}                
                onBack={() => router.push('/meals')}
            />

            <MealsFormModal 
                open={mealModalVisible} 
                onClose={() => setMealModalVisible(false)} 
                ingredientsList={ingredientsList} 
                meal={mealToEdit}
                handleUpdateMeal={handleEdit}
            />
        </>
    );
}