export interface Category {
    id: number;
    name: string;
    description? : string
}



export interface CreateCategoryInput
    extends Omit<Category, 'id'> { } // reuse User but omit `id` for create

