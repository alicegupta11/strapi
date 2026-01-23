const crypto = require('crypto');
const fs = require('fs');

// Function to generate a random string of specified length
function generateRandomString(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Generate secure random values
const secrets = {
  APP_KEYS: `"${generateRandomString(32)},${generateRandomString(32)}"`,
  API_TOKEN_SALT: generateRandomString(32),
  ADMIN_JWT_SECRET: generateRandomString(32),
  TRANSFER_TOKEN_SALT: generateRandomString(32),
  JWT_SECRET: generateRandomString(32),
  ENCRYPTION_KEY: generateRandomString(32)
};

// Read the .env file
let envContent = fs.readFileSync('.env', 'utf8');

// Replace the placeholder values
envContent = envContent.replace(
  /APP_KEYS="toBeModified1,toBeModified2"/,
  `APP_KEYS=${secrets.APP_KEYS}`
);
envContent = envContent.replace(
  /API_TOKEN_SALT=tobemodified/,
  `API_TOKEN_SALT=${secrets.API_TOKEN_SALT}`
);
envContent = envContent.replace(
  /ADMIN_JWT_SECRET=tobemodified/,
  `ADMIN_JWT_SECRET=${secrets.ADMIN_JWT_SECRET}`
);
envContent = envContent.replace(
  /TRANSFER_TOKEN_SALT=tobemodified/,
  `TRANSFER_TOKEN_SALT=${secrets.TRANSFER_TOKEN_SALT}`
);
envContent = envContent.replace(
  /JWT_SECRET=tobemodified/,
  `JWT_SECRET=${secrets.JWT_SECRET}`
);
envContent = envContent.replace(
  /ENCRYPTION_KEY=tobemodified/,
  `ENCRYPTION_KEY=${secrets.ENCRYPTION_KEY}`
);

// Write the updated content back to .env
fs.writeFileSync('.env', envContent, 'utf8');

console.log('✅ Successfully generated and updated all secrets in .env file');
console.log('\nGenerated secrets:');
console.log('  - APP_KEYS:', secrets.APP_KEYS.substring(0, 30) + '...');
console.log('  - API_TOKEN_SALT:', secrets.API_TOKEN_SALT.substring(0, 20) + '...');
console.log('  - ADMIN_JWT_SECRET:', secrets.ADMIN_JWT_SECRET.substring(0, 20) + '...');
console.log('  - TRANSFER_TOKEN_SALT:', secrets.TRANSFER_TOKEN_SALT.substring(0, 20) + '...');
console.log('  - JWT_SECRET:', secrets.JWT_SECRET.substring(0, 20) + '...');
console.log('  - ENCRYPTION_KEY:', secrets.ENCRYPTION_KEY.substring(0, 20) + '...');
console.log('\nAll secrets are now secure and ready to use! 🔐');
