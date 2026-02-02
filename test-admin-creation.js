const strapiLib = require('@strapi/strapi');

async function testUserCreation() {
    // Handle specific v5 factory or default export
    const createStrapi = strapiLib.createStrapi || strapiLib.default || strapiLib;
    // Tell Strapi to look in the 'dist' directory for compiled code
    const app = await createStrapi({ distDir: './dist' }).load();

    console.log('--------------------------------------------------');
    console.log('🧪 Testing Automatic Admin User Creation & Login');
    console.log('--------------------------------------------------');

    const randomId = Math.floor(Math.random() * 10000);
    const testEmail = `testadmin${randomId}@example.com`;
    const testUsername = `TestAdmin${randomId}`;
    const testPassword = 'Password123!';

    try {
        // 1. Create End User
        console.log(`1️⃣ Creating End User: ${testUsername} (${testEmail})`);

        await strapi.entityService.create('plugin::users-permissions.user', {
            data: {
                username: testUsername,
                email: testEmail,
                password: testPassword,
                confirmed: true,
                blocked: false,
                role: 1
            }
        });

        console.log(`   ✅ End User Created`);

        // Wait for lifecycle
        console.log('   ⏳ Waiting for admin creation...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 2. Check Admin User
        console.log('2️⃣ Checking for Admin User...');
        const adminUser = await strapi.db.query('admin::user').findOne({
            where: { email: testEmail },
            populate: ['roles']
        });

        if (!adminUser) {
            console.error('❌ FAILURE: Admin User was NOT created.');
            process.exit(1);
        }
        console.log(`   ✅ Admin User Found: ID ${adminUser.id}`);

        // 3. Simulate "Registration" (Setting the password)
        console.log('3️⃣ Simulating Registration (Setting Password)...');

        const passwordHash = await strapi.admin.services.auth.hashPassword(testPassword);

        await strapi.admin.services.user.update(adminUser.id, {
            password: passwordHash,
            isActive: true,
            registrationToken: null // Clear token as if used
        });
        console.log('   ✅ Password set and user activated manually.');

        // 4. Test Login (Internal Check)
        console.log('4️⃣ Testing Login Capability...');

        // We can use the admin auth service to check credentials
        const user = await strapi.admin.services.user.findOne({ where: { email: testEmail } });
        const validPassword = await strapi.admin.services.auth.validatePassword(testPassword, user.password);

        if (validPassword) {
            console.log('   🎉 SUCCESS: Login credentials are valid!');
            console.log('   ✅ This user CAN log in to the Dashboard.');
        } else {
            console.error('   ❌ FAILURE: Password validation failed.');
            process.exit(1);
        }

    } catch (error) {
        console.error('❌ Error during test script execution:', error);
        process.exit(1);
    }

    console.log('--------------------------------------------------');
    process.exit(0);
}

testUserCreation();
