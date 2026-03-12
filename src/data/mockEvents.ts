import helsinki1 from "@/assets/helsinki-1.jpg";
import helsinki2 from "@/assets/helsinki-2.jpg";
import helsinki3 from "@/assets/helsinki-3.jpg";
import helsinki4 from "@/assets/helsinki-4.jpg";
import helsinki5 from "@/assets/helsinki-5.jpg";

export interface CrowdDataPoint {
  time: string;
  people: number;
}

export interface EventData {
  id: string;
  title: string;
  location: string;
  city: string;
  date: string;
  time: string;
  price: number;
  currency: string;
  capacity: number;
  ticketsSold: number;
  going: number;
  comments: number;
  image: string;
  video?: string;
  genre: string;
  organizer: string;
  description: string;
  friendsGoing: string[];
  lat: number;
  lng: number;
  // Extended fields
  popularityScore: number;
  salesVelocity: number;
  viewCount: number;
  shareCount: number;
  revenue: number;
  crowdGrowth: CrowdDataPoint[];
  friendsHere: string[];
  studentEvent?: boolean;
}

// Helper: get today's date formatted
const today = new Date();
const todayStr = today.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
const tomorrowDate = new Date(today);
tomorrowDate.setDate(today.getDate() + 1);
const tomorrowStr = tomorrowDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

export const mockEvents: EventData[] = [
  {
    id: "hel-1",
    title: "Student Basement Party",
    location: "Kallio Underground, Vaasankatu 12",
    city: "Helsinki",
    date: todayStr,
    time: "22:00",
    price: 8,
    currency: "€",
    capacity: 150,
    ticketsSold: 124,
    going: 142,
    comments: 34,
    image: helsinki1,
    video: "https://cdn.pixabay.com/video/2024/08/01/224002_large.mp4",
    genre: "Techno / House",
    organizer: "Aalto Party Crew",
    description: "The legendary basement party returns. Three floors, four DJs, one unforgettable night. Student ID gets you €3 off at the door.",
    friendsGoing: ["Emilia", "Mikko", "Saara"],
    lat: 60.1841,
    lng: 24.9514,
    popularityScore: 82,
    salesVelocity: 14.2,
    viewCount: 3200,
    shareCount: 112,
    revenue: 992,
    crowdGrowth: [
      { time: "21:00", people: 15 },
      { time: "22:00", people: 56 },
      { time: "23:00", people: 98 },
      { time: "00:00", people: 132 },
      { time: "01:00", people: 142 },
    ],
    friendsHere: ["Emilia", "Mikko"],
    studentEvent: true,
  },
  {
    id: "hel-2",
    title: "Warehouse Techno Night",
    location: "Suvilahti, Sörnäisten rantatie 22",
    city: "Helsinki",
    date: todayStr,
    time: "23:00",
    price: 15,
    currency: "€",
    capacity: 400,
    ticketsSold: 332,
    going: 210,
    comments: 67,
    image: helsinki2,
    video: "https://cdn.pixabay.com/video/2020/10/29/54009-474818996_large.mp4",
    genre: "Industrial Techno",
    organizer: "VOID Helsinki",
    description: "Raw industrial techno in Suvilahti's iconic warehouse space. Two rooms. Relentless beats. No phones on the dancefloor.",
    friendsGoing: ["Aleksi", "Noora", "Lauri", "Saara", "Ville"],
    lat: 60.1873,
    lng: 24.9689,
    popularityScore: 91,
    salesVelocity: 22.5,
    viewCount: 5800,
    shareCount: 234,
    revenue: 4980,
    crowdGrowth: [
      { time: "22:00", people: 25 },
      { time: "23:00", people: 78 },
      { time: "00:00", people: 156 },
      { time: "01:00", people: 198 },
      { time: "02:00", people: 210 },
    ],
    friendsHere: ["Aleksi", "Noora", "Lauri"],
    studentEvent: false,
  },
  {
    id: "hel-3",
    title: "Rooftop House Party",
    location: "Allas Sea Pool, Katajanokanlaituri 2",
    city: "Helsinki",
    date: tomorrowStr,
    time: "20:00",
    price: 20,
    currency: "€",
    capacity: 200,
    ticketsSold: 167,
    going: 185,
    comments: 42,
    image: helsinki3,
    genre: "Deep House",
    organizer: "Elevation Finland",
    description: "Sunset vibes above Helsinki harbor. Deep house, cocktails, and panoramic views from the rooftop terrace at Allas Sea Pool.",
    friendsGoing: ["Emilia", "Aleksi"],
    lat: 60.1674,
    lng: 24.9578,
    popularityScore: 78,
    salesVelocity: 16.8,
    viewCount: 4100,
    shareCount: 167,
    revenue: 3340,
    crowdGrowth: [
      { time: "19:00", people: 20 },
      { time: "20:00", people: 65 },
      { time: "21:00", people: 120 },
      { time: "22:00", people: 170 },
      { time: "23:00", people: 185 },
    ],
    friendsHere: [],
    studentEvent: false,
  },
  {
    id: "hel-4",
    title: "Friday Student Rave",
    location: "Otaniemi Student Village, Espoo",
    city: "Helsinki",
    date: todayStr,
    time: "21:00",
    price: 5,
    currency: "€",
    capacity: 250,
    ticketsSold: 198,
    going: 220,
    comments: 56,
    image: helsinki4,
    video: "https://cdn.pixabay.com/video/2021/07/24/82253-579873498_large.mp4",
    genre: "EDM / Pop",
    organizer: "AYY Events",
    description: "Aalto University's biggest weekly party. Cheap drinks, massive sound system, and everyone from every faculty. Student ID required.",
    friendsGoing: ["Mikko", "Saara", "Ville", "Noora"],
    lat: 60.1867,
    lng: 24.8327,
    popularityScore: 88,
    salesVelocity: 19.3,
    viewCount: 4500,
    shareCount: 189,
    revenue: 990,
    crowdGrowth: [
      { time: "20:00", people: 30 },
      { time: "21:00", people: 85 },
      { time: "22:00", people: 160 },
      { time: "23:00", people: 205 },
      { time: "00:00", people: 220 },
    ],
    friendsHere: ["Mikko", "Saara"],
    studentEvent: true,
  },
  {
    id: "hel-5",
    title: "Underground Drum & Bass",
    location: "Ääniwalli, Telakkakatu 6",
    city: "Helsinki",
    date: todayStr,
    time: "23:30",
    price: 12,
    currency: "€",
    capacity: 180,
    ticketsSold: 145,
    going: 156,
    comments: 29,
    image: helsinki5,
    genre: "Drum & Bass",
    organizer: "Bass:Helsinki",
    description: "Helsinki's deepest DnB night. Liquid, neuro, and jump-up in the intimate Ääniwalli space. Bring earplugs — it's loud.",
    friendsGoing: ["Lauri", "Ville"],
    lat: 60.1612,
    lng: 24.9337,
    popularityScore: 72,
    salesVelocity: 11.4,
    viewCount: 2100,
    shareCount: 78,
    revenue: 1740,
    crowdGrowth: [
      { time: "23:00", people: 12 },
      { time: "00:00", people: 54 },
      { time: "01:00", people: 112 },
      { time: "02:00", people: 148 },
      { time: "03:00", people: 156 },
    ],
    friendsHere: ["Lauri"],
    studentEvent: false,
  },
];
