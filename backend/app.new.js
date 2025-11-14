const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const connectDB = require('./conn/db');
const { auth } = require('./middleware/auth');
const logger = require('./modules/logger/logger');

connectDB();

const app = express();
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100,
    message: 'Túl sok kérés érkezett, próbáld újra később.'
});

const authRoutes = require('./routes/authRoutes');
const { router: hallOfFameRoutes } = require('./routes/hallOfFameRoutes');
const { router: userRoutes } = require('./routes/userRoutes');
const { router: quizRoutes } = require('./routes/quizRoutes');
const { router: profileRoutes } = require('./routes/profileRoutes');
const { router: passwordResetRoutes } = require('./routes/passwordResetRoutes');
const { router: resultRoutes } = require('./routes/resultRoutes');

app.use(express.json());
app.use(auth);
app.use(cors());
app.use(helmet());
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/passwordReset', passwordResetRoutes);
app.use('/api/hall-of-fame', hallOfFameRoutes);
app.use('/api/results', resultRoutes);

app.use((err, req, res, next) => {
    logger.error(`${err.message} - ${req.method} ${req.url}`);
    res.status(500).json({ error: 'Szerverhiba' });
});

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./modules/swagger/swagger_config');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
