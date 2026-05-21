// Seeder for Firestore projects collection using Firebase Web SDK.
// Usage:
//   Ensure `client/.env` contains the VITE_FIREBASE_* variables, then run:
//     npm run seed

import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load `.env` from the current working directory (the `client/` folder)
dotenv.config({ path: path.resolve(process.cwd(), ".env") });
// const sampleProjects = []
const sampleProjects = [
  {
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
    image: "https://picsum.photos/id/237/200/300",
    en: {
      title: "Youth Skills Workshop",
      subtitle: "Vocational training for 50 youths",
      description:
        "A two-week intensive vocational training program designed to empower unemployed and underprivileged youth with practical carpentry and basic electrical maintenance skills. Participants attended hands-on sessions led by experienced instructors, received safety training, and completed real-world projects to improve their employability and confidence. The program also included career counseling, teamwork activities, and guidance on starting small local businesses.",
      image: "https://picsum.photos/id/237/200/300",
    },
    bn: {
      title: "যুব দক্ষতা কর্মশালা",
      subtitle: "৫০ জন যুবকের জন্য পেশাগত প্রশিক্ষণ",
      description:
        "দুই সপ্তাহব্যাপী একটি নিবিড় পেশাগত প্রশিক্ষণ কর্মসূচি যেখানে বেকার ও সুবিধাবঞ্চিত যুবকদের কার্পেন্ট্রি এবং মৌলিক ইলেকট্রিক্যাল রক্ষণাবেক্ষণের ব্যবহারিক দক্ষতা শেখানো হয়। অংশগ্রহণকারীরা অভিজ্ঞ প্রশিক্ষকদের তত্ত্বাবধানে হাতে-কলমে কাজ শেখে, নিরাপত্তা প্রশিক্ষণ গ্রহণ করে এবং বাস্তবধর্মী প্রকল্প সম্পন্ন করে। কর্মসূচিতে ক্যারিয়ার কাউন্সেলিং, দলগত কার্যক্রম এবং ক্ষুদ্র ব্যবসা শুরু করার পরামর্শও অন্তর্ভুক্ত ছিল।",
      image: "https://picsum.photos/id/237/200/300",
    },
  },

  {
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 55).toISOString(),
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    image: "https://picsum.photos/id/1011/200/300",
    en: {
      title: "Community Health Camp",
      subtitle: "Free medical support for rural families",
      description:
        "This project organized a large-scale health camp in remote rural communities to provide free medical checkups, medicine distribution, and health awareness sessions. Volunteer doctors and nurses served over 700 patients, focusing on maternal health, child nutrition, diabetes screening, and preventive healthcare education. The initiative also distributed hygiene kits and created awareness about sanitation and safe drinking water practices.",
      image: "https://picsum.photos/id/1011/200/300",
    },
    bn: {
      title: "কমিউনিটি স্বাস্থ্য ক্যাম্প",
      subtitle: "গ্রামীণ পরিবারের জন্য বিনামূল্যে চিকিৎসা সহায়তা",
      description:
        "এই প্রকল্পের মাধ্যমে প্রত্যন্ত গ্রামীণ এলাকায় একটি বৃহৎ স্বাস্থ্য ক্যাম্পের আয়োজন করা হয় যেখানে বিনামূল্যে স্বাস্থ্য পরীক্ষা, ওষুধ বিতরণ এবং স্বাস্থ্য সচেতনতা কার্যক্রম পরিচালিত হয়। স্বেচ্ছাসেবী ডাক্তার ও নার্সরা ৭০০-এরও বেশি রোগীকে সেবা প্রদান করেন। মাতৃস্বাস্থ্য, শিশুপুষ্টি, ডায়াবেটিস পরীক্ষা এবং প্রতিরোধমূলক স্বাস্থ্যসেবার উপর বিশেষ গুরুত্ব দেওয়া হয়। পাশাপাশি স্বাস্থ্যবিধি ও নিরাপদ পানীয় জল ব্যবহারের সচেতনতাও বৃদ্ধি করা হয়।",
      image: "https://picsum.photos/id/1011/200/300",
    },
  },

  {
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString(),
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    image: "https://picsum.photos/id/1040/200/300",
    en: {
      title: "Tree Plantation Campaign",
      subtitle: "Planting 5,000 trees for a greener future",
      description:
        "The environmental awareness campaign focused on combating climate change and promoting sustainable living through mass tree plantation activities. More than 300 volunteers participated in planting over 5,000 fruit-bearing and medicinal trees across schools, roadsides, and public spaces. Educational workshops were also conducted to teach students and local residents about biodiversity, environmental conservation, and the importance of maintaining green spaces.",
      image: "https://picsum.photos/id/1040/200/300",
    },
    bn: {
      title: "বৃক্ষরোপণ অভিযান",
      subtitle: "সবুজ ভবিষ্যতের জন্য ৫,০০০ গাছ রোপণ",
      description:
        "পরিবেশ সংরক্ষণ ও জলবায়ু পরিবর্তনের প্রভাব মোকাবেলায় এই বৃক্ষরোপণ কর্মসূচি পরিচালিত হয়। ৩০০-এরও বেশি স্বেচ্ছাসেবক বিদ্যালয়, রাস্তার পাশ এবং জনসাধারণের স্থানে ৫,০০০-এর বেশি ফলজ ও ঔষধি গাছ রোপণ করেন। পাশাপাশি জীববৈচিত্র্য, পরিবেশ রক্ষা এবং সবুজায়নের গুরুত্ব সম্পর্কে শিক্ষার্থী ও স্থানীয় জনগণকে সচেতন করতে কর্মশালার আয়োজন করা হয়।",
      image: "https://picsum.photos/id/1040/200/300",
    },
  },

  {
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString(),
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    image: "https://picsum.photos/id/1062/200/300",
    en: {
      title: "Women Entrepreneurship Program",
      subtitle: "Empowering women through small business training",
      description:
        "This initiative supported women from low-income communities by providing entrepreneurship training, financial literacy education, and mentorship opportunities. Participants learned tailoring, handicraft production, digital marketing, and basic accounting to help them start and manage small businesses. The program also connected participants with local microfinance institutions and marketplaces to create sustainable income opportunities.",
      image: "https://picsum.photos/id/1062/200/300",
    },
    bn: {
      title: "নারী উদ্যোক্তা উন্নয়ন কর্মসূচি",
      subtitle: "ক্ষুদ্র ব্যবসা প্রশিক্ষণের মাধ্যমে নারীর ক্ষমতায়ন",
      description:
        "এই উদ্যোগের মাধ্যমে নিম্ন আয়ের নারীদের উদ্যোক্তা প্রশিক্ষণ, আর্থিক সচেতনতা শিক্ষা এবং মেন্টরশিপ প্রদান করা হয়। অংশগ্রহণকারীরা সেলাই, হস্তশিল্প উৎপাদন, ডিজিটাল মার্কেটিং এবং মৌলিক হিসাবরক্ষণ শিখে নিজেদের ক্ষুদ্র ব্যবসা শুরু করার দক্ষতা অর্জন করেন। এছাড়াও তাদের স্থানীয় ক্ষুদ্রঋণ প্রতিষ্ঠান ও বাজার ব্যবস্থার সঙ্গে সংযুক্ত করা হয় যাতে তারা টেকসই আয়ের সুযোগ তৈরি করতে পারেন।",
      image: "https://picsum.photos/id/1062/200/300",
    },
  },

  {
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15).toISOString(),
    image: "https://picsum.photos/id/1025/200/300",
    en: {
      title: "Flood Relief Distribution",
      subtitle: "Emergency support for affected families",
      description:
        "Following severe flooding in nearby regions, this emergency response project distributed food packages, clean drinking water, blankets, medicine, and hygiene products to hundreds of affected families. Volunteers worked directly with local communities to identify urgent needs and ensure fair distribution of relief materials. The initiative also included temporary shelter support and child-friendly activities to assist families during the recovery process.",
      image: "https://picsum.photos/id/1025/200/300",
    },
    bn: {
      title: "বন্যা ত্রাণ বিতরণ কর্মসূচি",
      subtitle: "ক্ষতিগ্রস্ত পরিবারের জন্য জরুরি সহায়তা",
      description:
        "ভয়াবহ বন্যার পর ক্ষতিগ্রস্ত এলাকায় খাদ্য সামগ্রী, বিশুদ্ধ পানি, কম্বল, ওষুধ এবং স্বাস্থ্যবিধি পণ্য বিতরণ করা হয়। স্বেচ্ছাসেবকরা স্থানীয় জনগণের সঙ্গে সমন্বয় করে জরুরি প্রয়োজন নির্ধারণ করেন এবং সুষ্ঠুভাবে ত্রাণ বিতরণ নিশ্চিত করেন। এই কর্মসূচির আওতায় অস্থায়ী আশ্রয় সহায়তা এবং শিশুদের জন্য মানসিক সহায়তামূলক কার্যক্রমও পরিচালিত হয়।",
      image: "https://picsum.photos/id/1025/200/300",
    },
  },
];

async function runClientSeed() {
  const { initializeApp } = await import("firebase/app");
  const { getFirestore, collection, addDoc } =
    await import("firebase/firestore");

  const cfg = {
    apiKey: process.env.VITE_FIREBASE_API_KEY,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.VITE_FIREBASE_DATABASE_URL,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
    measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
  };

  if (!cfg.projectId) {
    throw new Error(
      "No Firebase config found in client/.env (VITE_FIREBASE_PROJECT_ID).",
    );
  }

  const app = initializeApp(cfg);
  const db = getFirestore(app);

  console.log(
    "Using Firebase Web SDK in Node; seeding projects (requires permissive rules)...",
  );
  for (const p of sampleProjects) {
    const ref = await addDoc(collection(db, "projects"), p);
    console.log("Created", ref.id);
  }

  // Seed some media documents
  const mediaUrls = [];
  //     "https://picsum.photos/id/237/600/400",
  //     "https://picsum.photos/id/238/600/400",
  //     "https://picsum.photos/id/239/600/400",
  //     "https://picsum.photos/id/240/600/400",
  //   ];

  for (const url of mediaUrls) {
    const mref = await addDoc(collection(db, "media"), {
      image: url,
      caption: "Demo image",
      date: new Date().toISOString(),
    });
    console.log("Media created", mref.id);
  }
}

async function main() {
  try {
    await runClientSeed();
    console.log("Seeding complete.");
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exitCode = 1;
  }
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1].endsWith("seed.js")
) {
  main();
}
