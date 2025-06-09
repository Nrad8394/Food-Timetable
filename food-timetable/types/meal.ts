export interface Ingredient {
    id: string;
    name: string;
    description?: string;
    price?: number; 
}
export interface Meal {
    id: string;
    name: string;
    description?: string;
    ingredients: Ingredient[]; // Array of ingredient IDs

}