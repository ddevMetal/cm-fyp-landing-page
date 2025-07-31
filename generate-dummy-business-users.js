const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// and place it in the same directory as this script
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'fyp-25-s2-09'
});

const db = admin.firestore();

// Helper function to generate random phone number (8 digits starting with 8 or 9)
function generatePhoneNumber() {
  const firstDigit = Math.random() < 0.5 ? '8' : '9';
  const remainingDigits = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return firstDigit + remainingDigits;
}

// Helper function to generate random date between two dates
function generateRandomDate(start, end) {
  const startTime = new Date(start).getTime();
  const endTime = new Date(end).getTime();
  const randomTime = startTime + Math.random() * (endTime - startTime);
  return new Date(randomTime).toISOString();
}

// Helper function to generate random UEN (9 digits + " C")
function generateUEN() {
  const nineDigits = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  return nineDigits + ' C';
}

// Helper function to generate review data
function generateReviewData() {
  const reviewTypes = ['', 'good', 'bad'];
  const randomReview = reviewTypes[Math.floor(Math.random() * reviewTypes.length)];
  
  let starsRating = 0;
  let isComplete = false;
  
  if (randomReview === '') {
    starsRating = 0;
    isComplete = false;
  } else if (randomReview === 'bad') {
    starsRating = Math.floor(Math.random() * 2) + 1; // 1-2 stars
    isComplete = true;
  } else if (randomReview === 'good') {
    starsRating = Math.floor(Math.random() * 3) + 3; // 3-5 stars
    isComplete = true;
  }
  
  return { review: randomReview, starsRating, isComplete };
}

// Helper function to generate services description
function generateServicesDescription() {
  const descriptions = [
    "We offer personal training and cardio classes.",
    "Professional fitness coaching with modern equipment.",
    "Complete gym facility with group fitness programs.",
    "Expert trainers providing customized workout plans.",
    "State-of-the-art gym with 24/7 access.",
    "Comprehensive fitness solutions for all levels.",
    "Premium gym services with personal training.",
    "Modern fitness center with diverse class schedules.",
    "Full-service gym with nutrition guidance.",
    "Professional fitness facility with expert coaching."
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Function to convert number to ordinal words
function numberToOrdinalWord(num) {
  const ordinals = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 
    'Eighteen', 'Nineteen', 'Twenty'
  ];
  return ordinals[num];
}

// Main function to create dummy business users
async function createDummyBusinessUsers() {
  console.log('🚀 Starting to create 20 dummy business users...\n');
  
  try {
    for (let i = 1; i <= 20; i++) {
      const ordinalWord = numberToOrdinalWord(i);
      const businessName = `newBusinessName-${ordinalWord}`;
      const email = `${businessName}@company.com`;
      
      // Generate registration date
      const registeredAt = generateRandomDate('2024-01-01', '2025-07-31');
      
      // Generate review data
      const { review, starsRating, isComplete } = generateReviewData();
      
      // Generate reviewSubmittedOn based on isComplete
      let reviewSubmittedOn = null;
      if (isComplete) {
        // Generate a date after registeredAt
        const registeredDate = new Date(registeredAt);
        const maxDate = new Date('2025-07-31');
        reviewSubmittedOn = generateRandomDate(
          registeredDate.toISOString(),
          maxDate.toISOString()
        );
      }
      
      // Create the business user document
      const businessUserData = {
        businessName: businessName,
        email: email,
        phone: generatePhoneNumber(),
        registeredAt: registeredAt,
        review: review,
        starsRating: starsRating,
        isComplete: isComplete,
        reviewSubmittedOn: reviewSubmittedOn,
        servicesDescription: generateServicesDescription(),
        servicesOffered: ['Gym'],
        uen: generateUEN(),
        verified: false
      };
      
      // Generate a unique document ID
      const docId = `business_user_${i.toString().padStart(2, '0')}`;
      
      // Save to Firestore
      await db.collection('businessUsers').doc(docId).set(businessUserData);
      
      // Log the created document
      console.log(`✅ Created business user ${i}/20:`);
      console.log(`   📧 Email: ${email}`);
      console.log(`   🆔 Document ID: ${docId}`);
      console.log(`   ⭐ Review: "${review}" (${starsRating} stars, Complete: ${isComplete})`);
      console.log(`   📅 Registered: ${registeredAt.split('T')[0]}`);
      if (reviewSubmittedOn) {
        console.log(`   📝 Review Submitted: ${reviewSubmittedOn.split('T')[0]}`);
      }
      console.log('');
    }
    
    console.log('🎉 Successfully created all 20 dummy business users!');
    console.log('\n📊 Summary:');
    console.log('   • 20 business users created');
    console.log('   • Each with unique business name, email, and UEN');
    console.log('   • Random review data with proper completion logic');
    console.log('   • Random registration dates between 2024-2025');
    console.log('   • All users set as unverified (verified: false)');
    
  } catch (error) {
    console.error('❌ Error creating dummy business users:', error);
  } finally {
    // Close the Firebase connection
    admin.app().delete();
    console.log('\n🔚 Firebase connection closed.');
  }
}

// Run the script
createDummyBusinessUsers();
