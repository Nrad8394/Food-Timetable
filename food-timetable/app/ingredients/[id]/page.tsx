"use client";

import { ViewDetailsPage } from "@/components/common/view-details/view-details-page";
import { createSection, createField } from "@/components/common/view-details/view-details-modal";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { useApi } from "@/hooks/useApi";
import ApiService from "@/handler/ApiService";
import { Ingredient } from "@/types";
import { toast } from "sonner";
import { IngredientsFormModal } from "@/app/ingredients/components/form";

const ingredientsections = [
        createSection('Details', 'Ingredient Details', [
            createField("name", "Name"),
            createField("description", "Description"),
            createField("price", "Price", { type: "number",}),
        ]),
    ];

export default function ViewIngredientPage() {
    const router = useRouter();
    const { id } = useParams();
    const { useFetchById:fetchIngredientById, useDeleteItem:deleteIngredient, useUpdateItem:updateIngredient } = useApi<any, any>(ApiService.INGREDIENT_URL, 10);
    const { data:ingredient , isFetching:isIngredientLoading, error:ingredientError } = id ? fetchIngredientById(id as string, {}) : { data: undefined, isFetching: false, error: undefined };
    const [ingredientModalVisible, setIngredientModalVisible] = useState<boolean>(false);
    const [ingredientToEdit, setIngredientToEdit] = useState<Ingredient | undefined>(undefined);
    
    function handleDelete(ingredient: Ingredient) {
        if (!id) {
            console.error("Ingredient ID is required for deletion");
            toast.error("Ingredient ID is required for deletion");
            return;
        }
        deleteIngredient.mutate({ id: ingredient.id }, {
            onSuccess: () => {
                toast.success("Ingredient deleted successfully");
                router.push('/ingredients');
            },
            onError: (error) => {
                console.error("Failed to delete ingredient:", error);
                toast.error("Failed to delete ingredient");
            }
        });
    }

    function handleUpdateIngredient(id: string,  ingredient: Partial<Ingredient>) {
        if (!id) {
            console.error("Ingredient ID is required for update");
            toast.error("Ingredient ID is required for update");
            return;
        }
        if (!ingredient.name) {
            console.error("Ingredient name is required for update");
            toast.error("Ingredient name is required for update");
            return;
        }
        updateIngredient.mutate({ id: id, item: ingredient }, {
            onSuccess: () => {
                toast.success("Ingredient updated successfully");
                router.push(`/ingredients/${id}`);
            },
            onError: (error) => {
                console.error("Failed to update ingredient:", error);
                toast.error("Failed to update ingredient");
            }
        });
    }

    return (
        <>
            <ViewDetailsPage
                item={ingredient}
                title="Ingredient Details"
                breadcrumb="Back to Ingredients"
                sections={ingredientsections}
                layout="sections"
                onDelete={handleDelete}
                onEdit={() => {
                    setIngredientToEdit(ingredient);
                    setIngredientModalVisible(true);
                }}
                onBack={() => router.back()}
                loading={isIngredientLoading}
                error={ingredientError?.message || undefined}
            />

            <IngredientsFormModal
                open={ingredientModalVisible} 
                onClose={() => setIngredientModalVisible(false)} 
                handleUpdateIngredient={handleUpdateIngredient}
                ingredient={ingredientToEdit}
            />
        </>
    );
}