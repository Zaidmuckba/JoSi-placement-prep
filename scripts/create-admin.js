const admin = require('firebase-admin');
const serviceAccount = require('../service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const email = process.env.ADMIN_EMAIL;        // set in .env.local
const password = process.env.ADMIN_PASSWORD;  // set in .env.local

async function createAdminUser() {
  try {
    // Create user in Authentication
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      emailVerified: true,
    });

    // Create user document in Firestore
    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      role: 'admin',
      name: 'Admin User',
    });

    console.log('Successfully created admin user:', userRecord.uid);
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
  process.exit();
}

createAdminUser();
