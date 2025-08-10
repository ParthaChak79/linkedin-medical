import { minioClient } from "~/server/minio";
import { db } from "~/server/db";

async function seedDatabase() {
  console.log("Seeding database...");

  // Create sample organizations
  const organizations = await Promise.all([
    db.organization.upsert({
      where: { name: "City General Hospital" },
      update: {},
      create: {
        name: "City General Hospital",
        type: "Hospital",
        description: "A leading healthcare provider serving the community for over 50 years. We specialize in emergency care, surgery, and comprehensive medical services.",
        location: "New York, NY",
        website: "https://citygeneral.example.com",
      },
    }),
    db.organization.upsert({
      where: { name: "Metropolitan Medical Center" },
      update: {},
      create: {
        name: "Metropolitan Medical Center",
        type: "Hospital",
        description: "State-of-the-art medical facility with cutting-edge technology and compassionate care. We offer specialized services in cardiology, oncology, and neurology.",
        location: "Los Angeles, CA",
        website: "https://metromedical.example.com",
      },
    }),
    db.organization.upsert({
      where: { name: "Sunshine Family Clinic" },
      update: {},
      create: {
        name: "Sunshine Family Clinic",
        type: "Clinic",
        description: "Community-focused family practice providing comprehensive primary care services. We believe in building long-term relationships with our patients.",
        location: "Miami, FL",
        website: "https://sunshineclinic.example.com",
      },
    }),
    db.organization.upsert({
      where: { name: "Advanced Research Institute" },
      update: {},
      create: {
        name: "Advanced Research Institute",
        type: "Research",
        description: "Leading medical research facility focused on breakthrough treatments and innovative healthcare solutions. Join our team of world-class researchers.",
        location: "Boston, MA",
        website: "https://advancedresearch.example.com",
      },
    }),
  ]);

  // Create sample job postings
  const jobPostings = [
    {
      title: "Emergency Medicine Physician",
      description: "We are seeking a board-certified Emergency Medicine physician to join our busy emergency department. The ideal candidate will have experience in trauma care, critical care, and emergency procedures. This is a full-time position with competitive compensation and excellent benefits.",
      requirements: "MD degree, Board certification in Emergency Medicine, BLS/ACLS certification, 2+ years of emergency medicine experience preferred. Strong communication skills and ability to work in a fast-paced environment required.",
      salary: "$280,000 - $350,000",
      location: "New York, NY",
      jobType: "Full-time",
      specialty: "Emergency Medicine",
      organizationId: organizations[0].id,
    },
    {
      title: "Registered Nurse - ICU",
      description: "Join our critical care team as an ICU Registered Nurse. You will provide direct patient care to critically ill patients, collaborate with multidisciplinary teams, and support patients and families during challenging times. We offer excellent training and career development opportunities.",
      requirements: "BSN degree, Current RN license, BLS and ACLS certification, 1+ years of ICU experience preferred. Critical thinking skills and ability to work under pressure essential.",
      salary: "$75,000 - $95,000",
      location: "New York, NY",
      jobType: "Full-time",
      specialty: "Nursing",
      organizationId: organizations[0].id,
    },
    {
      title: "Cardiologist",
      description: "Seeking an experienced Cardiologist to join our growing cardiology department. The position involves both inpatient and outpatient care, including diagnostic procedures, treatment planning, and patient education. We offer state-of-the-art facilities and comprehensive support staff.",
      requirements: "MD degree, Board certification in Cardiology, Fellowship training preferred, 3+ years of clinical experience. Excellent interpersonal skills and commitment to patient-centered care required.",
      salary: "$400,000 - $500,000",
      location: "Los Angeles, CA",
      jobType: "Full-time",
      specialty: "Cardiology",
      organizationId: organizations[1].id,
    },
    {
      title: "Pediatric Nurse Practitioner",
      description: "We are looking for a compassionate Pediatric Nurse Practitioner to provide comprehensive care to children from infancy through adolescence. This role includes routine check-ups, immunizations, illness management, and family education in our friendly clinic environment.",
      requirements: "MSN degree, Pediatric Nurse Practitioner certification, Current RN license, 2+ years of pediatric experience preferred. Strong communication skills with children and families essential.",
      salary: "$95,000 - $115,000",
      location: "Miami, FL",
      jobType: "Full-time",
      specialty: "Pediatrics",
      organizationId: organizations[2].id,
    },
    {
      title: "Family Medicine Physician",
      description: "Join our family practice team to provide comprehensive primary care services to patients of all ages. This position offers the opportunity to build long-term relationships with patients and families while providing continuity of care in a supportive environment.",
      requirements: "MD or DO degree, Board certification in Family Medicine, 1+ years of family practice experience preferred. Commitment to preventive care and patient education required.",
      salary: "$220,000 - $280,000",
      location: "Miami, FL",
      jobType: "Full-time",
      specialty: "Family Medicine",
      organizationId: organizations[2].id,
    },
    {
      title: "Clinical Research Coordinator",
      description: "Exciting opportunity to join our research team as a Clinical Research Coordinator. You will manage clinical trials, coordinate with research teams, ensure regulatory compliance, and work directly with study participants. This role offers exposure to cutting-edge medical research.",
      requirements: "Bachelor's degree in life sciences or related field, 2+ years of clinical research experience, Knowledge of GCP and FDA regulations, Strong organizational and communication skills required.",
      salary: "$55,000 - $70,000",
      location: "Boston, MA",
      jobType: "Full-time",
      specialty: "Other",
      organizationId: organizations[3].id,
    },
    {
      title: "Neurologist",
      description: "We are seeking a board-certified Neurologist to join our neurology department. The position involves diagnosing and treating neurological disorders, conducting specialized procedures, and collaborating with our multidisciplinary team to provide comprehensive patient care.",
      requirements: "MD degree, Board certification in Neurology, Fellowship training preferred, 2+ years of clinical neurology experience. Strong diagnostic skills and commitment to evidence-based medicine required.",
      salary: "$320,000 - $420,000",
      location: "Boston, MA",
      jobType: "Full-time",
      specialty: "Neurology",
      organizationId: organizations[3].id,
    },
    {
      title: "Operating Room Nurse",
      description: "Join our surgical team as an experienced Operating Room Nurse. You will assist surgeons during procedures, maintain sterile environments, and provide pre and post-operative patient care. We offer excellent training and opportunities for professional growth.",
      requirements: "BSN degree, Current RN license, CNOR certification preferred, 2+ years of OR experience required. Strong attention to detail and ability to work in high-stress situations essential.",
      salary: "$80,000 - $100,000",
      location: "Los Angeles, CA",
      jobType: "Full-time",
      specialty: "Nursing",
      organizationId: organizations[1].id,
    },
  ];

  for (const job of jobPostings) {
    const existingJob = await db.jobPosting.findFirst({
      where: {
        title: job.title,
        organizationId: job.organizationId,
      },
    });

    if (!existingJob) {
      await db.jobPosting.create({ data: job });
    }
  }

  console.log("Database seeded successfully!");
  console.log(`Created/verified ${organizations.length} organizations`);
  console.log(`Created/verified ${jobPostings.length} job postings`);
}

async function setup() {
  // Create Minio buckets
  const buckets = ["profile-pictures", "post-images", "resumes"];
  
  for (const bucketName of buckets) {
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
      console.log(`Created bucket: ${bucketName}`);
      
      // Set public policy for profile pictures and post images
      if (bucketName === "profile-pictures" || bucketName === "post-images") {
        const policy = {
          Version: "2012-10-17",
          Statement: [
            {
              Effect: "Allow",
              Principal: "*",
              Action: ["s3:GetObject"],
              Resource: [`arn:aws:s3:::${bucketName}/public/*`],
            },
          ],
        };
        await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
        console.log(`Set public policy for bucket: ${bucketName}`);
      }
    }
  }

  // Seed the database
  await seedDatabase();
}

setup()
  .then(() => {
    console.log("setup.ts complete");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
