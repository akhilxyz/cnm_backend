

export interface Ad {
  id: number; // optional because it's auto-incremented
  user_id: number;
  title: string;
  description?: string | null;
  price: number;
  condition?: string | null;
  category_id: number;
  location_name?: string | null;
  location_address?: string | null;
  location_latitude?: number | null;
  location_longitude?: number | null;
  posted_at?: Date; // optional because default is NOW
}



export interface CreateAdInput
  extends Omit<Ad, 'id'> { } // reuse User but omit `id` for create


export interface AdImage {
  id?: number; // optional because it's auto-incremented
  ad_id: number;
  image_url: string;
}


export interface CreateAdImageInput
  extends Omit<AdImage, 'id'> { } // reuse User but omit `id` for create
