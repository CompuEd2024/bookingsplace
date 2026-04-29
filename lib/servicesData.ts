import { Building2, UtensilsCrossed, Camera, Flower2, Heart, Music, Shirt } from 'lucide-react';

export interface BookingItem {
  id: string;
  name: string;
  location?: string;
  rating: number;
  reviews: number;
  price: string;
  image: string;
  tags: string[];
}

export const categoryDetails: Record<string, BookingItem[]> = {
  'Resorts': [
    { id: 'r1', name: 'Al Maha Desert Resort', location: 'Dubai, UAE', rating: 4.9, reviews: 1240, price: '$550', image: 'https://picsum.photos/seed/resort1/800/600', tags: ['Luxury', 'Private Pool', 'Desert View'] },
    { id: 'r2', name: 'Zaya Nurai Island', location: 'Abu Dhabi', rating: 4.8, reviews: 890, price: '$720', image: 'https://picsum.photos/seed/resort2/800/600', tags: ['Beachfront', 'Ultra-Private', 'Speedboat Access'] },
    { id: 'r3', name: 'Anantara Qasr Al Sarab', location: 'Liwa Desert', rating: 4.7, reviews: 1560, price: '$480', image: 'https://picsum.photos/seed/resort3/800/600', tags: ['Historic', 'Majestic', 'Sand Dunes'] }
  ],
  'Wedding Halls': [
    { id: 'wh1', name: 'The Imperial Ballroom', location: 'Downtown Hotel', rating: 5.0, reviews: 450, price: '$1,500', image: 'https://picsum.photos/seed/hall1/800/600', tags: ['Grand', 'Chandeliers', 'Max 1000 Guests'] },
    { id: 'wh2', name: 'Crystal Pavilion', location: 'Marina Side', rating: 4.9, reviews: 320, price: '$1,100', image: 'https://picsum.photos/seed/hall2/800/600', tags: ['Modern', 'Glass Walls', 'Sunset View'] },
    { id: 'wh3', name: 'Garden Atrium', location: 'Palace Grounds', rating: 4.6, reviews: 210, price: '$900', image: 'https://picsum.photos/seed/hall3/800/600', tags: ['Outdoor', 'Floral', 'Intimate'] }
  ],
  'Camp & Tents': [
    { id: 'ct1', name: 'Desert Starlight Camp', location: 'Liwa Desert', rating: 4.9, reviews: 560, price: '$250', image: 'https://picsum.photos/seed/camp1/800/600', tags: ['Glamping', 'Bonfire', 'Stargazing'] },
    { id: 'ct2', name: 'Royal Bedouin Experience', location: 'Dubai Conservation Reserve', rating: 4.8, reviews: 420, price: '$350', image: 'https://picsum.photos/seed/camp2/800/600', tags: ['Traditional', 'Luxury', 'Authentic'] },
    { id: 'ct3', name: 'Coastal Escape Tents', location: 'Ras Al Khaimah', rating: 4.5, reviews: 180, price: '$180', image: 'https://picsum.photos/seed/camp3/800/600', tags: ['Breeze', 'Modern', 'Sea View'] }
  ],
  'Catering': [
    { id: 'c1', name: 'Royal Gastronomy', rating: 4.9, reviews: 780, price: '$45/person', image: 'https://picsum.photos/seed/food1/800/600', tags: ['Fine Dining', 'Middle Eastern', 'Server Staff'] },
    { id: 'c2', name: 'Modern Bites', rating: 4.7, reviews: 540, price: '$25/person', image: 'https://picsum.photos/seed/food2/800/600', tags: ['Fusion', 'Buffet', 'Themed Stations'] },
    { id: 'c3', name: 'Elegant Platters', rating: 4.8, reviews: 390, price: '$35/person', image: 'https://picsum.photos/seed/food3/800/600', tags: ['Artisanal', 'Desserts', 'Custom Menu'] }
  ],
  'Photography': [
    { id: 'p1', name: 'Luminous Frames', rating: 5.0, reviews: 2400, price: '$600', image: 'https://picsum.photos/seed/photo1/800/600', tags: ['Cinematic', 'Drone', 'Fast Delivery'] },
    { id: 'p2', name: 'Heritage Clicks', rating: 4.9, reviews: 1800, price: '$400', image: 'https://picsum.photos/seed/photo2/800/600', tags: ['Classic', 'Portrait', 'Albums'] }
  ]
};

// Arabic versions (Simplified for demo)
export const arCategoryDetails: Record<string, BookingItem[]> = {
  'قصور الأفراح': [
    { id: 'wh1_ar', name: 'قاعة الإمبراطور الملكية', location: 'وسط المدينة', rating: 5.0, reviews: 450, price: '5,500 ر.س', image: 'https://picsum.photos/seed/hall1/800/600', tags: ['فاخرة', 'ثريات', '1000 ضيف'] },
    { id: 'wh2_ar', name: 'جناح الكريستال', location: 'مارينا', rating: 4.9, reviews: 320, price: '4,100 ر.س', image: 'https://picsum.photos/seed/hall2/800/600', tags: ['عصري', 'إطلالة بحرية', 'غروب الشمس'] }
  ],
  'تموين الحفلات': [
    { id: 'c1_ar', name: 'الضيافة الملكية', rating: 4.9, reviews: 780, price: '150 ر.س/للشخص', image: 'https://picsum.photos/seed/food1/800/600', tags: ['عربي', 'بوفيه', 'خدمة كاملة'] }
  ],
  'مخيمات وخيام': [
    { id: 'ct1_ar', name: 'مخيم أضواء الصحراء', location: 'صحراء ليوا', rating: 4.9, reviews: 560, price: '950 ر.س', image: 'https://picsum.photos/seed/camp1/800/600', tags: ['تخييم فاخر', 'نار', 'مشاهدة النجوم'] }
  ]
};
