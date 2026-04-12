import express, { Application } from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/errorHandler';
import { initialize } from './helpers/db';
import userRoute from './users/user.route';
import authRoute from './auth/auth.route';
import adminRoute from './admin/admin.route';
import departmentRoute from './departments/department.route';
import employeeRoute from './employees/employee.route';
import publicRoute from './public_feature/public.route';
import requestRoute from './requests/request.route';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.static("public"));


app.use('/api/users', userRoute);
app.use('/api/auth', authRoute);
app.use('/api/admin', adminRoute);
app.use('/api/department', departmentRoute);
app.use('/api/employee', employeeRoute);
app.use('/api/public', publicRoute);
app.use('/api/request', requestRoute);

app.use(errorHandler);

export default app;

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
    initialize().then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
            console.log('Test with: POST /users with {email, password, ...}');
        })
    }).catch((error) => {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    });
}
