import Link from "next/link";
import { ViewDetailsPage } from "@/components/common/view-details/view-details-page";
import { createSection, createField } from "@/components/common/view-details/view-details-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ViewMealsComponentProps {
    meals: any; // Define the type of meal as needed
    handleDelete: (id: number) => void; // Function to handle deletion
}

const mealSections = [
    createSection('details', 'Meal Details', [
        createField('name', 'Name'),
        createField('description', 'Description'),
    
    ]),
    
];

export default function ViewMealsComponent({ meals, handleDelete }: ViewMealsComponentProps) {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-semibold">Meals</h1>
            <div className="grid gap-4">
                {meals.length === 0 ? (
                    <p className="text-gray-600">No meals found. Create your first meal!</p>
                ) : (
                    meals.map((meal: any) => (
                        <Card key={meal.id} className="hover:bg-gray-50 transition">
                            <Link href={`/meals/${meal.id}`} className="block">
                                <CardHeader>
                                    <CardTitle>{meal.name}</CardTitle>
                                    {meal.description && (
                                        <CardDescription>{meal.description}</CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="flex justify-between items-center">
                                    <div className="flex gap-2">
                                        {meal.preparationTime && (
                                            <Badge variant="outline">Prep: {meal.preparationTime}</Badge>
                                        )}
                                        {meal.cookingTime && (
                                            <Badge variant="outline">Cook: {meal.cookingTime}</Badge>
                                        )}
                                    </div>
                                    <div className="space-x-2">
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={`/meals/${meal.id}`}>View</Link>
                                        </Button>
                                        <Button 
                                            variant="destructive" 
                                            size="sm"
                                            onClick={(e: React.MouseEvent) => {
                                                e.preventDefault();
                                                handleDelete(meal.id);
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Link>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}