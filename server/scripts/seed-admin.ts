import { initialize, db } from '../src/helpers/db';
import { userService } from '../src/users/user.service';
import { Role } from '../src/helpers/role';

async function seed() {
    try {
        await initialize();
        
        const adminEmail = 'admin@example.com';
        const exists = await db.User.findOne({ where: { email: adminEmail } });
        
        if (exists) {
            console.log('Admin account already exists.');
            process.exit(0);
        }

        const success = await userService.create({
            firstName: 'Admin',
            middleName: 'Super',
            lastName: 'User',
            email: adminEmail,
            username: 'admin',
            password: 'Password123!',
            title: 'Administrator',
            role: Role.Admin,
            verified: true
        } as any);

        if (success) {
            console.log('Admin account created successfully!');
        } else {
            console.log('Failed to create admin account.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
}

seed();
