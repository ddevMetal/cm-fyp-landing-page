// Node.js script for migrating testimonial structure in Firebase Firestore
// Run with: node migrate-testimonial-structure.js [--users|--business|--all] [--verify] [--cleanup]

const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp({
  projectId: 'fyp-25-s2-09'
});

const db = admin.firestore();

// Default testimonial structures
const defaultTestimonials = {
  "basic": {
    "review": null,
    "starsRating": 0,
    "surveyIsComplete": false,
    "reviewSubmittedOn": null
  },
  "premium": {
    "review": null,
    "starsRating": 0,
    "surveyIsComplete": false,
    "reviewSubmittedOn": null
  }
};

const defaultBusinessTestimonial = {
  "review": null,
  "starsRating": 0,
  "surveyIsComplete": false,
  "reviewSubmittedOn": null
};

// Helper function for logging with timestamp
function log(message) {
  const timestamp = new Date().toLocaleTimeString();
  console.log(`[${timestamp}] ${message}`);
}

// Analyze Users Collection
async function analyzeUsers() {
  log('🔍 Analyzing Users collection...');
  
  try {
    const snapshot = await db.collection('users').get();
    const totalUsers = snapshot.size;
    let usersWithTestimonials = 0;
    let usersNeedingMigration = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.testimonials) {
        usersWithTestimonials++;
      } else {
        usersNeedingMigration++;
      }
    });

    log(`📊 Users Analysis Results:`);
    log(`   • Total users: ${totalUsers}`);
    log(`   • Users with testimonials structure: ${usersWithTestimonials}`);
    log(`   • Users needing migration: ${usersNeedingMigration}`);
    
    return { totalUsers, usersWithTestimonials, usersNeedingMigration };
  } catch (error) {
    log(`❌ Error analyzing users: ${error.message}`);
    throw error;
  }
}

// Analyze Business Users Collection
async function analyzeBusinessUsers() {
  log('🔍 Analyzing Business Users collection...');
  
  try {
    const snapshot = await db.collection('businessUsers').get();
    const totalBusinessUsers = snapshot.size;
    let usersWithNewStructure = 0;
    let usersWithOldStructure = 0;
    let usersNeedingMigration = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      const hasOldFields = data.hasOwnProperty('review') || data.hasOwnProperty('starsRating') || 
                          data.hasOwnProperty('isComplete') || data.hasOwnProperty('reviewSubmittedOn');
      const hasNewStructure = data.testimonial;

      if (hasNewStructure) {
        usersWithNewStructure++;
      }
      if (hasOldFields) {
        usersWithOldStructure++;
        if (!hasNewStructure) {
          usersNeedingMigration++;
        }
      }
    });

    log(`📊 Business Users Analysis Results:`);
    log(`   • Total business users: ${totalBusinessUsers}`);
    log(`   • Users with new testimonial structure: ${usersWithNewStructure}`);
    log(`   • Users with old individual fields: ${usersWithOldStructure}`);
    log(`   • Users needing migration: ${usersNeedingMigration}`);
    
    return { totalBusinessUsers, usersWithNewStructure, usersWithOldStructure, usersNeedingMigration };
  } catch (error) {
    log(`❌ Error analyzing business users: ${error.message}`);
    throw error;
  }
}

// Migrate Users Collection
async function migrateUsers() {
  log('🔄 Starting Users testimonial structure migration...');
  
  try {
    const snapshot = await db.collection('users').get();
    const batch = db.batch();
    let migratedCount = 0;
    let skippedCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (!data.testimonials) {
        // Add testimonials structure
        batch.update(doc.ref, {
          testimonials: defaultTestimonials
        });
        migratedCount++;
        log(`✅ Queued migration for user: ${doc.id}`);
      } else {
        skippedCount++;
        log(`⏭️ Skipped user ${doc.id} (already has testimonials structure)`);
      }
    });

    if (migratedCount > 0) {
      await batch.commit();
      log(`🎉 Successfully migrated ${migratedCount} users!`);
      log(`⏭️ Skipped ${skippedCount} users (already migrated)`);
    } else {
      log(`ℹ️ No users needed migration`);
    }
    
    return { migratedCount, skippedCount };
  } catch (error) {
    log(`❌ Error migrating users: ${error.message}`);
    throw error;
  }
}

// Migrate Business Users Collection
async function migrateBusinessUsers() {
  log('🔄 Starting Business Users testimonial structure migration...');
  
  try {
    const snapshot = await db.collection('businessUsers').get();
    const batch = db.batch();
    let migratedCount = 0;
    let skippedCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Check if user has old structure and doesn't have new structure
      const hasOldFields = data.hasOwnProperty('review') || data.hasOwnProperty('starsRating') || 
                          data.hasOwnProperty('isComplete') || data.hasOwnProperty('reviewSubmittedOn');
      const hasNewStructure = data.testimonial;

      if (hasOldFields && !hasNewStructure) {
        // Migrate old fields to new structure
        const newTestimonial = {
          review: data.review || null,
          starsRating: data.starsRating || 0,
          surveyIsComplete: data.isComplete || false,
          reviewSubmittedOn: data.reviewSubmittedOn || null
        };

        batch.update(doc.ref, {
          testimonial: newTestimonial
        });
        
        migratedCount++;
        log(`✅ Queued migration for business user: ${doc.id}`);
        log(`   📝 Migrated: review="${newTestimonial.review}", stars=${newTestimonial.starsRating}, complete=${newTestimonial.surveyIsComplete}`);
      } else if (hasNewStructure) {
        skippedCount++;
        log(`⏭️ Skipped business user ${doc.id} (already has new testimonial structure)`);
      } else {
        // No old fields, add default testimonial structure
        batch.update(doc.ref, {
          testimonial: defaultBusinessTestimonial
        });
        migratedCount++;
        log(`✅ Queued default testimonial for business user: ${doc.id}`);
      }
    });

    if (migratedCount > 0) {
      await batch.commit();
      log(`🎉 Successfully migrated ${migratedCount} business users!`);
      log(`⏭️ Skipped ${skippedCount} business users (already migrated)`);
    } else {
      log(`ℹ️ No business users needed migration`);
    }
    
    return { migratedCount, skippedCount };
  } catch (error) {
    log(`❌ Error migrating business users: ${error.message}`);
    throw error;
  }
}

// Verify Users Migration
async function verifyUsers() {
  log('🔍 Verifying Users migration...');
  
  try {
    const snapshot = await db.collection('users').get();
    let successCount = 0;
    let errorCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (data.testimonials && 
          data.testimonials.basic && 
          data.testimonials.premium &&
          data.testimonials.basic.hasOwnProperty('surveyIsComplete') &&
          data.testimonials.premium.hasOwnProperty('surveyIsComplete')) {
        successCount++;
      } else {
        errorCount++;
        log(`❌ User ${doc.id} missing proper testimonials structure`);
      }
    });

    log(`📊 Users Verification Results:`);
    log(`   ✅ Successfully migrated: ${successCount}`);
    log(`   ❌ Migration issues: ${errorCount}`);
    
    return { successCount, errorCount };
  } catch (error) {
    log(`❌ Error verifying users: ${error.message}`);
    throw error;
  }
}

// Verify Business Users Migration
async function verifyBusinessUsers() {
  log('🔍 Verifying Business Users migration...');
  
  try {
    const snapshot = await db.collection('businessUsers').get();
    let successCount = 0;
    let errorCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (data.testimonial && 
          data.testimonial.hasOwnProperty('surveyIsComplete') &&
          data.testimonial.hasOwnProperty('reviewSubmittedOn')) {
        successCount++;
      } else {
        errorCount++;
        log(`❌ Business User ${doc.id} missing proper testimonial structure`);
      }
    });

    log(`📊 Business Users Verification Results:`);
    log(`   ✅ Successfully migrated: ${successCount}`);
    log(`   ❌ Migration issues: ${errorCount}`);
    
    return { successCount, errorCount };
  } catch (error) {
    log(`❌ Error verifying business users: ${error.message}`);
    throw error;
  }
}

// Cleanup Business Users Old Fields
async function cleanupBusinessUsers() {
  log('🧹 Starting Business Users field cleanup...');
  log('⚠️ WARNING: This will permanently remove old testimonial fields');
  
  try {
    const snapshot = await db.collection('businessUsers').get();
    const batch = db.batch();
    let cleanedCount = 0;

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Check if old fields exist
      const hasOldFields = data.hasOwnProperty('review') || data.hasOwnProperty('starsRating') || 
                          data.hasOwnProperty('isComplete') || data.hasOwnProperty('reviewSubmittedOn');
      
      if (hasOldFields && data.testimonial) {
        // Remove old fields
        batch.update(doc.ref, {
          review: admin.firestore.FieldValue.delete(),
          starsRating: admin.firestore.FieldValue.delete(),
          isComplete: admin.firestore.FieldValue.delete(),
          reviewSubmittedOn: admin.firestore.FieldValue.delete()
        });
        
        cleanedCount++;
        log(`🧹 Queued cleanup for business user: ${doc.id}`);
      }
    });

    if (cleanedCount > 0) {
      await batch.commit();
      log(`🎉 Successfully cleaned up ${cleanedCount} business users!`);
    } else {
      log(`ℹ️ No business users needed cleanup`);
    }
    
    return { cleanedCount };
  } catch (error) {
    log(`❌ Error during cleanup: ${error.message}`);
    throw error;
  }
}

// Main execution function
async function main() {
  const args = process.argv.slice(2);
  
  try {
    log('🔄 Testimonial Structure Migration Tool');
    log('=====================================');
    
    if (args.includes('--help') || args.includes('-h')) {
      console.log(`
📋 Usage:
  node migrate-testimonial-structure.js [options]

🔧 Options:
  --users          Migrate users collection only
  --business       Migrate business users collection only
  --all            Migrate both collections (default)
  --verify         Verify migration results
  --cleanup        Cleanup old fields from business users
  --analyze        Analyze current data structure
  --help, -h       Show this help

📝 Examples:
  node migrate-testimonial-structure.js --analyze
  node migrate-testimonial-structure.js --users
  node migrate-testimonial-structure.js --business --verify
  node migrate-testimonial-structure.js --all
  node migrate-testimonial-structure.js --cleanup
      `);
      process.exit(0);
    }

    if (args.includes('--analyze')) {
      await analyzeUsers();
      log(''); // Empty line
      await analyzeBusinessUsers();
    } else if (args.includes('--verify')) {
      if (args.includes('--users')) {
        await verifyUsers();
      } else if (args.includes('--business')) {
        await verifyBusinessUsers();
      } else {
        await verifyUsers();
        log(''); // Empty line
        await verifyBusinessUsers();
      }
    } else if (args.includes('--cleanup')) {
      await cleanupBusinessUsers();
    } else {
      // Migration mode
      if (args.includes('--users')) {
        await migrateUsers();
      } else if (args.includes('--business')) {
        await migrateBusinessUsers();
      } else {
        // Default: migrate all
        await migrateUsers();
        log(''); // Empty line
        await migrateBusinessUsers();
      }
    }
    
    log('✅ Operation completed successfully!');
    
  } catch (error) {
    log(`❌ Fatal error: ${error.message}`);
    process.exit(1);
  } finally {
    log('🔚 Closing Firebase connection...');
    process.exit(0);
  }
}

// Handle command line execution
if (require.main === module) {
  main();
}

module.exports = {
  analyzeUsers,
  analyzeBusinessUsers,
  migrateUsers,
  migrateBusinessUsers,
  verifyUsers,
  verifyBusinessUsers,
  cleanupBusinessUsers
};
