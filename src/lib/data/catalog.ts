export type CatalogVideo = {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  rating: number;
  year: string;
  category: string;
  isNew?: boolean;
  views: number;
  language: "Bangla" | "English" | "Hindi";
};

export const catalogVideos: CatalogVideo[] = [
  {
    id: "1",
    title: "The Dark Knight Returns",
    thumbnail:
      "https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "2h 45m",
    rating: 8.9,
    year: "2024",
    category: "Action",
    isNew: true,
    views: 12500,
    language: "English",
  },
  {
    id: "2",
    title: "Mystery at Midnight",
    thumbnail:
      "https://images.unsplash.com/photo-1595171694538-beb81da39d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "1h 58m",
    rating: 8.5,
    year: "2024",
    category: "Thriller",
    isNew: true,
    views: 8300,
    language: "English",
  },
  {
    id: "3",
    title: "Cinema Paradiso",
    thumbnail:
      "https://images.unsplash.com/photo-1616527546362-bf6b7f80a751?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "2h 15m",
    rating: 9.2,
    year: "2024",
    category: "Drama",
    views: 7200,
    language: "English",
  },
  {
    id: "4",
    title: "Portrait of Shadows",
    thumbnail:
      "https://images.unsplash.com/photo-1590707642683-8a2e8d713c60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "1h 42m",
    rating: 8.1,
    year: "2023",
    category: "Mystery",
    views: 5100,
    language: "English",
  },
  {
    id: "5",
    title: "The Last Mission",
    thumbnail:
      "https://images.unsplash.com/photo-1739891251370-05b62a54697b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "2h 20m",
    rating: 8.7,
    year: "2024",
    category: "Action",
    isNew: true,
    views: 9800,
    language: "English",
  },
  {
    id: "6",
    title: "Night Whispers",
    thumbnail:
      "https://images.unsplash.com/photo-1595171694538-beb81da39d3e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "1h 55m",
    rating: 7.9,
    year: "2023",
    category: "Horror",
    views: 4600,
    language: "English",
  },
  {
    id: "7",
    title: "Dhaka After Dark",
    thumbnail:
      "https://images.unsplash.com/photo-1529548070131-eda9f3cde7d6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "2h 05m",
    rating: 8.3,
    year: "2024",
    category: "Bangla",
    isNew: true,
    views: 11100,
    language: "Bangla",
  },
  {
    id: "8",
    title: "Monsoon Letters",
    thumbnail:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "1h 48m",
    rating: 8.0,
    year: "2023",
    category: "Romance",
    views: 6400,
    language: "Bangla",
  },
  {
    id: "9",
    title: "Code of Silence",
    thumbnail:
      "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "2h 07m",
    rating: 8.4,
    year: "2022",
    category: "Crime",
    views: 5900,
    language: "Hindi",
  },
  {
    id: "10",
    title: "Final Over",
    thumbnail:
      "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "2h 00m",
    rating: 7.8,
    year: "2024",
    category: "Sports",
    views: 8400,
    language: "Bangla",
  },
  {
    id: "11",
    title: "The Last Frequency",
    thumbnail:
      "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "1h 52m",
    rating: 8.2,
    year: "2021",
    category: "Sci-Fi",
    views: 5300,
    language: "English",
  },
  {
    id: "12",
    title: "Borderline Truth",
    thumbnail:
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    duration: "2h 11m",
    rating: 8.6,
    year: "2024",
    category: "Thriller",
    isNew: true,
    views: 9100,
    language: "Hindi",
  },
];
