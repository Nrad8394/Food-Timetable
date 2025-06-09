"use client";
import { ReusableEntityForm, FormFieldConfig } from "@/components/common/form/reusable-entity-form";
import React, { useState, useEffect, use } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { Ingredient } from "@/types";
import * as z from "zod";

interface IngredientsFormModalProps {
  open: boolean;
  onClose: () => void;
  ingredient?: Ingredient;
  handleAddIngredient?: (ingredient: Partial<Ingredient>) => void;
  handleUpdateIngredient?: (id: string, ingredient: Partial<Ingredient>) => void;
}

export function IngredientsFormModal({ open, onClose, ingredient, handleAddIngredient, handleUpdateIngredient }: IngredientsFormModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [ingredientFields, setIngredientFields] = useState<FormFieldConfig[]>([]);

    const ingredientSchema = z.object({
        name: z.string().min(1, "Name is required"),
        description: z.string().optional(),
        price: z.preprocess(
            // First, convert the input to a number if it's a string
            (val) => (val === '' || val === undefined) ? undefined : Number(val),
            // Then validate it's a valid number
            z.number().min(0, "Price must be non-negative").optional()
        )
    });

    const handleSubmit = async (formData: Record<string, any>) => {
        try {
            setIsSubmitting(true);
            // Prepare the meal data
            const ingredientData = {
                ...formData,
            };
            // Parse and validate data
            const validatedData = await ingredientSchema.parseAsync({
                name: formData.name,
                description: formData.description,
                price: formData.price === "" ? undefined : Number(formData.price)
            });
            // Handle adding vs updating
            if (ingredient?.id) {
                if (handleUpdateIngredient) {
                    handleUpdateIngredient(ingredient.id, ingredientData);
                } else {
                    throw new Error("Update handler is not defined");
                }
            } else {
                if (handleAddIngredient) {
                    handleAddIngredient(ingredientData);
                } else {
                    throw new Error("Add handler is not defined");
                }
            }
            onClose();    } 
        catch (error) {
            console.error('Error submitting form:', error);
            if (error instanceof z.ZodError) {
                // Handle Zod validation errors
                const errorMessage = error.errors.map(e => e.message).join(', ');
                toast.error(errorMessage);
            } else {
                toast.error(error instanceof Error ? error.message : "Form submission failed");
            }
        } finally {
            setIsSubmitting(false);
        }
    };
        
    useEffect(() => {
        const fields: FormFieldConfig[] = [
            {
                key: "name",
                label: "Ingredient Name",
                type: "string",
                fieldType: "textarea",
                required: true,
                placeholder: "Enter ingredient name",
                gridSpan: "full"
            },
            {
                key: "description",
                label: "Ingredient Description",
                type: "string",
                fieldType: "textarea",
                required: false,
                placeholder: "Enter ingredient description",
                gridSpan: "full"
            },
            {
                key: "price",
                label: "Price",
                type: "string",
                required: false,
                placeholder: "Enter ingredient price",
                gridSpan: "full",
                defaultValue: undefined,
            }
        ];
        setIngredientFields(fields);
    }, [ingredient]);

    return (
    <Dialog  open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-5/6 overflow-y-auto m-2">
        <DialogTitle className="text-2xl font-semibold mb-4"> </DialogTitle>

        <ReusableEntityForm
          title={ingredient ? "Edit Ingredient" : "Add New Ingredient"}
          description={ingredient ? "Update Ingredient details below" : "Enter Ingredient details below"}
          fields={ingredientFields}
          defaultValues={ingredient || {}}
          submitLabel={isSubmitting ? "Saving..." : (ingredient ? "Update Ingredient" : "Create Ingredient")}          
          onSubmit={handleSubmit}          
        />
        
      </DialogContent>
    </Dialog>
  );
}
