// Unit of Measurement enum based on API documentation
export enum UnitOfMeasurementEnum {
    // Weight units
    GRAM = "Gram",
    KILOGRAM = "Kilogram",

    // Volume units
    MILLILITER = "Milliliter",
    LITER = "Liter",
    TABLESPOON = "Tablespoon",
    TEASPOON = "Teaspoon",

    // Count units
    PIECE = "Piece",
    WHOLE = "Whole",

    // Approximate units
    PINCH = "Pinch",
    HANDFUL = "Handful",

    // Contextual units
    CLOVE = "Clove", // for garlic
    SLICE = "Slice", // for bread, tomatoes
    STRIP = "Strip", // for bacon
    HEAD = "Head", // for lettuce, cabbage
    BUNCH = "Bunch", // for herbs

    // Flexible
    TO_TASTE = "To taste",
    AS_NEEDED = "As needed",

    // Beverage based
    SHOT = "Shot",
    DASH = "Dash",
    DROP = "Drop",
    SPLASH = "Splash",
    SCOOP = "Scoop",
    DRIZZLE = "Drizzle",
}

// Food Item interfaces based on API schemas
export interface CreateFoodItemRequest {
    foodItemName: string
    categoryHierarchy?: string[]
}

export interface FoodItem {
    id: string
    userId: string
    name: string
    categoryHierarchy?: string[]
    unitCount?: number
    hasUnits?: boolean
}

export interface NutritionInfo {
    calories: number
    proteinInGrams?: number
    carbohydratesInGrams?: number
    fatInGrams?: number
    fiberInGrams?: number
    sugarInGrams?: number
    sodiumInMilligrams?: number
}

export interface FoodItemUnit {
    id: string
    unitOfMeasurement: UnitOfMeasurementEnum
    unitDescription?: string
    nutritionPerOfThisUnit: NutritionInfo
    source: "user_measured" | "package_label" | "database" | "estimated"
}

export interface CreateFoodItemUnitRequest {
    foodItemName: string
    units: Array<{
        unitOfMeasurement: UnitOfMeasurementEnum
        unitDescription?: string
        nutritionPerOfThisUnit: NutritionInfo
        source: "user_measured" | "package_label" | "database" | "estimated"
    }>
}

export interface FoodItemWithUnits extends FoodItem {
    units: FoodItemUnit[]
}

// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean
    message: string
    data?: T
    errors?: unknown
}

export interface ListFoodItemsResponse {
    data: FoodItem[]
}

export interface CreateFoodItemResponse {
    data: FoodItem
}

export interface CreateFoodItemUnitsResponse {
    data: {
        foodItemId: string
        units: FoodItemUnit[]
    }
}
