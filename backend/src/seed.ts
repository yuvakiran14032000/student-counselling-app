import { pool } from "./db.js";
const colleges = [
  { slug: "ashoka-university", name: "Ashoka University", city: "Sonipat" },
  { slug: "christ-university", name: "Christ University", city: "Bangalore" },
  { slug: "flame-university", name: "FLAME University", city: "Pune" },
  { slug: "krea-university", name: "Krea University", city: "Sri City" },
];
const names = [
  "Aarav Shah",
  "Diya Nair",
  "Ishaan Mehta",
  "Ananya Rao",
  "Kabir Sen",
  "Meera Kapoor",
  "Vihaan Das",
  "Saanvi Joshi",
  "Arjun Roy",
  "Tara Menon",
  "Rohan Patel",
  "Aisha Verma",
  "Dev Malhotra",
  "Nisha Iyer",
  "Aditya Bose",
  "Kavya Sethi",
  "Aryan Kulkarni",
  "Riya Bhat",
  "Neel Khanna",
  "Sara Dutta",
  "Rehan Gill",
  "Anika Jain",
  "Yash Arora",
  "Maya Pillai",
  "Dhruv Sinha",
];
const cities = [
  "Bangalore",
  "Delhi",
  "Bangalore",
  "Chennai",
  "Pune",
  "Bangalore",
  "Hyderabad",
];
for (const c of colleges)
  await pool.execute(
    "INSERT INTO colleges (slug,name,city) VALUES (?,?,?) ON DUPLICATE KEY UPDATE name=VALUES(name), city=VALUES(city)",
    [c.slug, c.name, c.city],
  );
const [collegeRows] = await pool.query("SELECT id, slug FROM colleges");
const ids = new Map(
  (collegeRows as { id: number; slug: string }[]).map((c) => [c.slug, c.id]),
);
for (let i = 0; i < names.length; i++) {
  const college = colleges[i % 3];
  const collegeId = ids.get(college.slug);
  if (collegeId === undefined)
    throw new Error(`Missing seeded college: ${college.slug}`);
  await pool.execute(
    "INSERT IGNORE INTO leads (name,phone,city,college_id,created_at,demo_key) VALUES (?,?,?,?,?,?)",
    [
      names[i],
      `00000${10001 + i}`,
      cities[i % cities.length],
      collegeId,
      new Date(Date.now() - (i < 7 ? i * 0.5 : i * 1.6) * 86400000),
      `pathway-demo-${i + 1}`,
    ],
  );
}
console.log("Seed ready: 4 colleges and 25 fictional leads.");
await pool.end();
