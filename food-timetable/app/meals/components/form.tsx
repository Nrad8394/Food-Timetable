"use client";
import { use, useEffect, useState } from "react";
import { ReusableEntityForm, FormFieldConfig } from "@/components/common/form/reusable-entity-form";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Meal, Ingredient } from "@/types";
import { DialogTitle } from "@radix-ui/react-dialog";
import * as z from "zod";

interface MealsFormModalProps {
  open: boolean;
  onClose: () => void;
  meal?: Meal;
  ingredientsList: Ingredient[];
  handleAddMeal?: (meal: Partial<Meal>) => void;
  handleUpdateMeal?: (id: string, meal: Partial<Meal>) => void;
}

export function MealsFormModal({open, onClose, ingredientsList, meal, handleAddMeal, handleUpdateMeal }: MealsFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mealFields, setMealFields] = useState<FormFieldConfig[]>([]);
  const [unSelectedIngredients, setUnselectedIngredients] = useState<Ingredient[]>([]);

  // Create form schema
  const formSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    ingredients: z.array(z.string()).min(1, "At least one ingredient is required")
  });

  useEffect(() => {
    if (ingredientsList && ingredientsList.length > 0) {
      const unselected = ingredientsList.filter(i => !meal?.ingredients?.some(m => m.id === i.id));
      setUnselectedIngredients(unselected);
    } else {
      setUnselectedIngredients([]);
    }
  }, [ingredientsList, meal]);

  useEffect(() => {
    const fields: FormFieldConfig[] = [
      {
        key: "name",
        label: "Meal Name",
        type: "string",
        required: true,
        placeholder: "Enter meal name",
        gridSpan: "full"
      },
      {
        key: "description",
        label: "Description",
        type: "string",
        fieldType: "textarea",
        placeholder: "Enter meal description",
        gridSpan: "full"
      },      {        key: "ingredients",
        label: "Ingredients",
        type: "array",
        fieldType: "multiselect",
        multiple: true,
        searchable: true,
        required: true,
        options: Array.isArray(ingredientsList) ? ingredientsList.map((i) => ({ value: i.id, label: i.name })) : [],
        placeholder: "Search and select ingredients",
        gridSpan: "full"
      },
    ];
    setMealFields(fields);
  }, [ingredientsList]);    
  const handleSubmit = async (formData: Record<string, any>) => {
    console.log("Form Data:", formData);
    console.log("Form validation:", formSchema.safeParse(formData));
    try {
      setIsSubmitting(true);
      // Prepare the meal data
      const mealData = {
        ...formData,
      };
      
      // Handle adding vs updating
      if (meal?.id) {
        if (handleUpdateMeal) {
          handleUpdateMeal(meal.id, mealData);
        } else {
          throw new Error("Update handler is not defined");
        }
      } else {
        if (handleAddMeal) {
          handleAddMeal(mealData);
        } else {
          throw new Error("Add handler is not defined");
        }
      }
      onClose();    } 
    catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : "Form submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog  open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-5/6 overflow-y-auto m-2">
        <DialogTitle className="text-2xl font-semibold mb-4"> </DialogTitle>
        <ReusableEntityForm
          title={meal ? "Edit Meal" : "Add New Meal"}
          description={meal ? "Update meal details below" : "Enter meal details below"}
          fields={mealFields}
          submitLabel={isSubmitting ? "Saving..." : (meal ? "Update Meal" : "Create Meal")}          
          onSubmit={handleSubmit}          
          defaultValues={meal ? {
            ...meal,
            ingredients: meal.ingredients?.map((i) => ({ value: i.id, label: i.name })) || []
          } : {}}
          excelSupport={{
            // enabled: !meal,
            enabled: false, // Disable Excel support for now
            template: {
              entityName: "Meals",
              fields: mealFields,
              examples: [{
                name: "Chicken Caesar Salad",
                description: "Fresh romaine lettuce with grilled chicken, croutons, and caesar dressing",
                type: "lunch",
                ingredients: [],
              }]
            },
            onBulkSubmit: async (data) => {
              try {
                const response = await fetch('/api/meals/bulk', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ meals: data }),
                });
                if (!response.ok) throw new Error('Failed to bulk import meals');

                const result = await response.json();
                return { success: result.successCount, failed: result.failedCount };
              } catch (error) {
                console.error('Error in bulk import:', error);
                throw error;
              }
            }
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
