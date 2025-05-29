const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { body, validationResult } = require('express-validator');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'], // Allow all Vite ports
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'cwsms-secret-key-2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cwsms'
});

// Connect to database
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database: cwsms');
});

// Custom validation functions
const validateUsername = (username) => {
    // Username must contain only letters, start with letter, cannot be numbers only
    const letterOnlyRegex = /^[a-zA-Z]+$/;
    const startsWithLetterRegex = /^[a-zA-Z]/;
    const notNumbersOnlyRegex = /[a-zA-Z]/;

    return letterOnlyRegex.test(username) &&
           startsWithLetterRegex.test(username) &&
           notNumbersOnlyRegex.test(username);
};

const validatePassword = (password) => {
    // Password must be at least 6 characters, contain letters and numbers, at least one capital letter
    const minLengthRegex = /.{6,}/;
    const hasLetterRegex = /[a-zA-Z]/;
    const hasNumberRegex = /[0-9]/;
    const hasCapitalRegex = /[A-Z]/;

    return minLengthRegex.test(password) &&
           hasLetterRegex.test(password) &&
           hasNumberRegex.test(password) &&
           hasCapitalRegex.test(password);
};

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    } else {
        return res.status(401).json({
            success: false,
            message: 'Authentication required'
        });
    }
};

// Validation middleware
const registerValidation = [
    body('username')
        .custom((value) => {
            if (!validateUsername(value)) {
                throw new Error('Username must contain only letters, start with a letter, and cannot be numbers only');
            }
            return true;
        }),
    body('password')
        .custom((value) => {
            if (!validatePassword(value)) {
                throw new Error('Password must be at least 6 characters, contain letters and numbers, and have at least one capital letter');
            }
            return true;
        })
];

const loginValidation = [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required')
];

// AUTHENTICATION ROUTES

// Register route
app.post('/api/auth/register', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Check if user already exists
        const checkUserQuery = 'SELECT * FROM User WHERE Username = ?';
        db.query(checkUserQuery, [username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Insert new user
            const insertUserQuery = 'INSERT INTO User (Username, Password) VALUES (?, ?)';
            db.query(insertUserQuery, [username, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create user'
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'User registered successfully',
                    userId: result.insertId
                });
            });
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Login route
app.post('/api/auth/login', loginValidation, (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: errors.array()
            });
        }

        const { username, password } = req.body;

        // Find user
        const findUserQuery = 'SELECT * FROM User WHERE Username = ?';
        db.query(findUserQuery, [username], async (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            const user = results[0];

            // Compare password
            const passwordMatch = await bcrypt.compare(password, user.Password);
            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid username or password'
                });
            }

            // Create session
            req.session.userId = user.UserID;
            req.session.username = user.Username;

            res.json({
                success: true,
                message: 'Login successful',
                user: {
                    id: user.UserID,
                    username: user.Username
                }
            });
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

// Logout route
app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Could not log out'
            });
        }
        res.json({
            success: true,
            message: 'Logout successful'
        });
    });
});

// Check authentication status
app.get('/api/auth/status', (req, res) => {
    if (req.session && req.session.userId) {
        res.json({
            success: true,
            authenticated: true,
            user: {
                id: req.session.userId,
                username: req.session.username
            }
        });
    } else {
        res.json({
            success: true,
            authenticated: false
        });
    }
});

// PACKAGE ROUTES

// Get all packages
app.get('/api/packages', requireAuth, (req, res) => {
    const query = 'SELECT * FROM Package ORDER BY PackageNumber';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch packages'
            });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// Get package by ID
app.get('/api/packages/:id', requireAuth, (req, res) => {
    const packageId = req.params.id;
    const query = 'SELECT * FROM Package WHERE PackageNumber = ?';
    db.query(query, [packageId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch package'
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }
        res.json({
            success: true,
            data: results[0]
        });
    });
});

// Create new package
app.post('/api/packages', requireAuth, [
    body('packageName').notEmpty().withMessage('Package name is required'),
    body('packageDescription').notEmpty().withMessage('Package description is required'),
    body('packagePrice').isFloat({ min: 0 }).withMessage('Package price must be a positive number')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const { packageName, packageDescription, packagePrice } = req.body;
    const query = 'INSERT INTO Package (PackageName, PackageDescription, PackagePrice) VALUES (?, ?, ?)';

    db.query(query, [packageName, packageDescription, packagePrice], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to create package'
            });
        }
        res.status(201).json({
            success: true,
            message: 'Package created successfully',
            data: {
                packageNumber: result.insertId,
                packageName,
                packageDescription,
                packagePrice
            }
        });
    });
});

// Update package
app.put('/api/packages/:id', requireAuth, [
    body('packageName').notEmpty().withMessage('Package name is required'),
    body('packageDescription').notEmpty().withMessage('Package description is required'),
    body('packagePrice').isFloat({ min: 0 }).withMessage('Package price must be a positive number')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const packageId = req.params.id;
    const { packageName, packageDescription, packagePrice } = req.body;
    const query = 'UPDATE Package SET PackageName = ?, PackageDescription = ?, PackagePrice = ? WHERE PackageNumber = ?';

    db.query(query, [packageName, packageDescription, packagePrice, packageId], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update package'
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Package not found'
            });
        }
        res.json({
            success: true,
            message: 'Package updated successfully'
        });
    });
});

// Delete package
app.delete('/api/packages/:id', requireAuth, (req, res) => {
    const packageId = req.params.id;

    // Check if package is being used in any service
    const checkQuery = 'SELECT COUNT(*) as count FROM ServicePackage WHERE PackageNumber = ?';
    db.query(checkQuery, [packageId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to check package usage'
            });
        }

        if (results[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete package that is being used in services'
            });
        }

        // Delete package
        const deleteQuery = 'DELETE FROM Package WHERE PackageNumber = ?';
        db.query(deleteQuery, [packageId], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete package'
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Package not found'
                });
            }
            res.json({
                success: true,
                message: 'Package deleted successfully'
            });
        });
    });
});

// CAR ROUTES

// Get all cars
app.get('/api/cars', requireAuth, (req, res) => {
    const query = 'SELECT * FROM Car ORDER BY PlateNumber';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch cars'
            });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// Get car by plate number
app.get('/api/cars/:plateNumber', requireAuth, (req, res) => {
    const plateNumber = req.params.plateNumber;
    const query = 'SELECT * FROM Car WHERE PlateNumber = ?';
    db.query(query, [plateNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch car'
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }
        res.json({
            success: true,
            data: results[0]
        });
    });
});

// Create new car
app.post('/api/cars', requireAuth, [
    body('plateNumber').notEmpty().withMessage('Plate number is required'),
    body('carType').notEmpty().withMessage('Car type is required'),
    body('carSize').notEmpty().withMessage('Car size is required'),
    body('driverName').notEmpty().withMessage('Driver name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const { plateNumber, carType, carSize, driverName, phoneNumber } = req.body;
    const query = 'INSERT INTO Car (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES (?, ?, ?, ?, ?)';

    db.query(query, [plateNumber, carType, carSize, driverName, phoneNumber], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({
                    success: false,
                    message: 'Car with this plate number already exists'
                });
            }
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to create car'
            });
        }
        res.status(201).json({
            success: true,
            message: 'Car created successfully',
            data: {
                plateNumber,
                carType,
                carSize,
                driverName,
                phoneNumber
            }
        });
    });
});

// Update car
app.put('/api/cars/:plateNumber', requireAuth, [
    body('carType').notEmpty().withMessage('Car type is required'),
    body('carSize').notEmpty().withMessage('Car size is required'),
    body('driverName').notEmpty().withMessage('Driver name is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const plateNumber = req.params.plateNumber;
    const { carType, carSize, driverName, phoneNumber } = req.body;
    const query = 'UPDATE Car SET CarType = ?, CarSize = ?, DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?';

    db.query(query, [carType, carSize, driverName, phoneNumber, plateNumber], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update car'
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Car not found'
            });
        }
        res.json({
            success: true,
            message: 'Car updated successfully'
        });
    });
});

// Delete car
app.delete('/api/cars/:plateNumber', requireAuth, (req, res) => {
    const plateNumber = req.params.plateNumber;

    // Check if car has any services
    const checkQuery = 'SELECT COUNT(*) as count FROM ServicePackage WHERE PlateNumber = ?';
    db.query(checkQuery, [plateNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to check car usage'
            });
        }

        if (results[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete car that has service records'
            });
        }

        // Delete car
        const deleteQuery = 'DELETE FROM Car WHERE PlateNumber = ?';
        db.query(deleteQuery, [plateNumber], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete car'
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Car not found'
                });
            }
            res.json({
                success: true,
                message: 'Car deleted successfully'
            });
        });
    });
});

// SERVICE PACKAGE ROUTES

// Get all service packages with details
app.get('/api/services', requireAuth, (req, res) => {
    const query = `
        SELECT
            sp.RecordNumber,
            sp.ServiceDate,
            sp.PlateNumber,
            c.CarType,
            c.CarSize,
            c.DriverName,
            c.PhoneNumber,
            p.PackageNumber,
            p.PackageName,
            p.PackageDescription,
            p.PackagePrice,
            pay.PaymentNumber,
            pay.AmountPaid,
            pay.PaymentDate
        FROM ServicePackage sp
        LEFT JOIN Car c ON sp.PlateNumber = c.PlateNumber
        LEFT JOIN Package p ON sp.PackageNumber = p.PackageNumber
        LEFT JOIN Payment pay ON sp.RecordNumber = pay.RecordNumber
        ORDER BY sp.ServiceDate DESC, sp.RecordNumber DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch services'
            });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// Get service package by ID
app.get('/api/services/:id', requireAuth, (req, res) => {
    const recordNumber = req.params.id;
    const query = `
        SELECT
            sp.RecordNumber,
            sp.ServiceDate,
            sp.PlateNumber,
            c.CarType,
            c.CarSize,
            c.DriverName,
            c.PhoneNumber,
            p.PackageNumber,
            p.PackageName,
            p.PackageDescription,
            p.PackagePrice,
            pay.PaymentNumber,
            pay.AmountPaid,
            pay.PaymentDate
        FROM ServicePackage sp
        LEFT JOIN Car c ON sp.PlateNumber = c.PlateNumber
        LEFT JOIN Package p ON sp.PackageNumber = p.PackageNumber
        LEFT JOIN Payment pay ON sp.RecordNumber = pay.RecordNumber
        WHERE sp.RecordNumber = ?
    `;

    db.query(query, [recordNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch service'
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }
        res.json({
            success: true,
            data: results[0]
        });
    });
});

// Create new service package
app.post('/api/services', requireAuth, [
    body('serviceDate').isDate().withMessage('Valid service date is required'),
    body('plateNumber').notEmpty().withMessage('Plate number is required'),
    body('packageNumber').isInt({ min: 1 }).withMessage('Valid package number is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const { serviceDate, plateNumber, packageNumber } = req.body;

    // Check if car exists
    const checkCarQuery = 'SELECT * FROM Car WHERE PlateNumber = ?';
    db.query(checkCarQuery, [plateNumber], (err, carResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to verify car'
            });
        }

        if (carResults.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Car not found'
            });
        }

        // Check if package exists
        const checkPackageQuery = 'SELECT * FROM Package WHERE PackageNumber = ?';
        db.query(checkPackageQuery, [packageNumber], (err, packageResults) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to verify package'
                });
            }

            if (packageResults.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Package not found'
                });
            }

            // Create service package
            const insertQuery = 'INSERT INTO ServicePackage (ServiceDate, PlateNumber, PackageNumber) VALUES (?, ?, ?)';
            db.query(insertQuery, [serviceDate, plateNumber, packageNumber], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create service'
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Service created successfully',
                    data: {
                        recordNumber: result.insertId,
                        serviceDate,
                        plateNumber,
                        packageNumber,
                        car: carResults[0],
                        package: packageResults[0]
                    }
                });
            });
        });
    });
});

// Update service package
app.put('/api/services/:id', requireAuth, [
    body('serviceDate').isDate().withMessage('Valid service date is required'),
    body('plateNumber').notEmpty().withMessage('Plate number is required'),
    body('packageNumber').isInt({ min: 1 }).withMessage('Valid package number is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const recordNumber = req.params.id;
    const { serviceDate, plateNumber, packageNumber } = req.body;

    // Check if service exists
    const checkServiceQuery = 'SELECT * FROM ServicePackage WHERE RecordNumber = ?';
    db.query(checkServiceQuery, [recordNumber], (err, serviceResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to verify service'
            });
        }

        if (serviceResults.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Update service package
        const updateQuery = 'UPDATE ServicePackage SET ServiceDate = ?, PlateNumber = ?, PackageNumber = ? WHERE RecordNumber = ?';
        db.query(updateQuery, [serviceDate, plateNumber, packageNumber, recordNumber], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to update service'
                });
            }

            res.json({
                success: true,
                message: 'Service updated successfully'
            });
        });
    });
});

// Delete service package
app.delete('/api/services/:id', requireAuth, (req, res) => {
    const recordNumber = req.params.id;

    // Check if service has payment
    const checkPaymentQuery = 'SELECT COUNT(*) as count FROM Payment WHERE RecordNumber = ?';
    db.query(checkPaymentQuery, [recordNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to check payment'
            });
        }

        if (results[0].count > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete service that has payment records'
            });
        }

        // Delete service
        const deleteQuery = 'DELETE FROM ServicePackage WHERE RecordNumber = ?';
        db.query(deleteQuery, [recordNumber], (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to delete service'
                });
            }
            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Service not found'
                });
            }
            res.json({
                success: true,
                message: 'Service deleted successfully'
            });
        });
    });
});

// PAYMENT ROUTES

// Get all payments with details
app.get('/api/payments', requireAuth, (req, res) => {
    const query = `
        SELECT
            p.PaymentNumber,
            p.AmountPaid,
            p.PaymentDate,
            p.RecordNumber,
            sp.ServiceDate,
            sp.PlateNumber,
            c.CarType,
            c.DriverName,
            c.PhoneNumber,
            pkg.PackageName,
            pkg.PackagePrice,
            'Cash' as PaymentMethod,
            'Completed' as PaymentStatus
        FROM Payment p
        LEFT JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
        LEFT JOIN Car c ON sp.PlateNumber = c.PlateNumber
        LEFT JOIN Package pkg ON sp.PackageNumber = pkg.PackageNumber
        ORDER BY p.PaymentDate DESC, p.PaymentNumber DESC
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch payments'
            });
        }
        res.json({
            success: true,
            data: results
        });
    });
});

// Get payment by ID
app.get('/api/payments/:id', requireAuth, (req, res) => {
    const paymentNumber = req.params.id;
    const query = `
        SELECT
            p.PaymentNumber,
            p.AmountPaid,
            p.PaymentDate,
            p.RecordNumber,
            sp.ServiceDate,
            sp.PlateNumber,
            c.CarType,
            c.CarSize,
            c.DriverName,
            c.PhoneNumber,
            pkg.PackageNumber,
            pkg.PackageName,
            pkg.PackageDescription,
            pkg.PackagePrice
        FROM Payment p
        LEFT JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
        LEFT JOIN Car c ON sp.PlateNumber = c.PlateNumber
        LEFT JOIN Package pkg ON sp.PackageNumber = pkg.PackageNumber
        WHERE p.PaymentNumber = ?
    `;

    db.query(query, [paymentNumber], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch payment'
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        res.json({
            success: true,
            data: results[0]
        });
    });
});

// Create new payment
app.post('/api/payments', requireAuth, [
    body('amountPaid').isFloat({ min: 0 }).withMessage('Amount paid must be a positive number'),
    body('paymentDate').isDate().withMessage('Valid payment date is required'),
    body('recordNumber').isInt({ min: 1 }).withMessage('Valid record number is required'),
    body('paymentMethod').optional().isString().withMessage('Payment method must be a string'),
    body('paymentStatus').optional().isString().withMessage('Payment status must be a string')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const { amountPaid, paymentDate, recordNumber, paymentMethod = 'Cash', paymentStatus = 'Completed' } = req.body;
    console.log('Creating payment with:', { amountPaid, paymentDate, recordNumber, paymentMethod, paymentStatus });

    // Check if service exists
    const checkServiceQuery = 'SELECT * FROM ServicePackage WHERE RecordNumber = ?';
    db.query(checkServiceQuery, [recordNumber], (err, serviceResults) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to verify service'
            });
        }

        if (serviceResults.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Service not found'
            });
        }

        // Check if payment already exists for this service
        const checkPaymentQuery = 'SELECT * FROM Payment WHERE RecordNumber = ?';
        db.query(checkPaymentQuery, [recordNumber], (err, paymentResults) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check existing payment'
                });
            }

            if (paymentResults.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Payment already exists for this service'
                });
            }

            // Create payment
            const insertQuery = 'INSERT INTO Payment (AmountPaid, PaymentDate, RecordNumber) VALUES (?, ?, ?)';
            db.query(insertQuery, [amountPaid, paymentDate, recordNumber], (err, result) => {
                if (err) {
                    console.error('Database error:', err);
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to create payment'
                    });
                }

                res.status(201).json({
                    success: true,
                    message: 'Payment created successfully',
                    data: {
                        paymentNumber: result.insertId,
                        amountPaid,
                        paymentDate,
                        recordNumber
                    }
                });
            });
        });
    });
});

// Update payment
app.put('/api/payments/:id', requireAuth, [
    body('amountPaid').isFloat({ min: 0 }).withMessage('Amount paid must be a positive number'),
    body('paymentDate').isDate().withMessage('Valid payment date is required')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }

    const paymentNumber = req.params.id;
    const { amountPaid, paymentDate } = req.body;

    const updateQuery = 'UPDATE Payment SET AmountPaid = ?, PaymentDate = ? WHERE PaymentNumber = ?';
    db.query(updateQuery, [amountPaid, paymentDate, paymentNumber], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update payment'
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        res.json({
            success: true,
            message: 'Payment updated successfully'
        });
    });
});

// Delete payment
app.delete('/api/payments/:id', requireAuth, (req, res) => {
    const paymentNumber = req.params.id;

    const deleteQuery = 'DELETE FROM Payment WHERE PaymentNumber = ?';
    db.query(deleteQuery, [paymentNumber], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete payment'
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }
        res.json({
            success: true,
            message: 'Payment deleted successfully'
        });
    });
});

// BILL GENERATION

// Generate bill for a payment
app.get('/api/bill/:paymentId', requireAuth, (req, res) => {
    const paymentId = req.params.paymentId;
    const query = `
        SELECT
            p.PaymentNumber,
            p.AmountPaid,
            p.PaymentDate,
            sp.RecordNumber,
            sp.ServiceDate,
            sp.PlateNumber,
            c.CarType,
            c.CarSize,
            c.DriverName,
            c.PhoneNumber,
            pkg.PackageNumber,
            pkg.PackageName,
            pkg.PackageDescription,
            pkg.PackagePrice
        FROM Payment p
        JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
        JOIN Car c ON sp.PlateNumber = c.PlateNumber
        JOIN Package pkg ON sp.PackageNumber = pkg.PackageNumber
        WHERE p.PaymentNumber = ?
    `;

    db.query(query, [paymentId], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate bill'
            });
        }
        if (results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const billData = results[0];
        res.json({
            success: true,
            data: {
                billNumber: `BILL-${billData.PaymentNumber}`,
                date: new Date().toISOString().split('T')[0],
                car: {
                    plateNumber: billData.PlateNumber,
                    type: billData.CarType,
                    size: billData.CarSize,
                    driver: billData.DriverName,
                    phone: billData.PhoneNumber
                },
                service: {
                    recordNumber: billData.RecordNumber,
                    serviceDate: billData.ServiceDate,
                    packageName: billData.PackageName,
                    packageDescription: billData.PackageDescription,
                    packagePrice: billData.PackagePrice
                },
                payment: {
                    paymentNumber: billData.PaymentNumber,
                    amountPaid: billData.AmountPaid,
                    paymentDate: billData.PaymentDate
                }
            }
        });
    });
});

// REPORTS

// Dashboard statistics
app.get('/api/reports/dashboard', requireAuth, (req, res) => {
    // Get total users
    const usersQuery = 'SELECT COUNT(*) as totalUsers FROM User';

    // Get total cars
    const carsQuery = 'SELECT COUNT(*) as totalCars FROM Car';

    // Get total packages
    const packagesQuery = 'SELECT COUNT(*) as totalPackages FROM Package';

    // Get total services
    const servicesQuery = 'SELECT COUNT(*) as totalServices FROM ServicePackage';

    // Get total revenue
    const revenueQuery = 'SELECT SUM(AmountPaid) as totalRevenue FROM Payment';

    // Get today's services
    const todayQuery = 'SELECT COUNT(*) as todayServices FROM ServicePackage WHERE DATE(ServiceDate) = CURDATE()';

    // Get monthly revenue
    const monthlyQuery = 'SELECT SUM(AmountPaid) as monthlyRevenue FROM Payment WHERE YEAR(PaymentDate) = YEAR(CURDATE()) AND MONTH(PaymentDate) = MONTH(CURDATE())';

    // Get recent services
    const recentQuery = `
        SELECT
            sp.RecordNumber as ServiceID,
            sp.PlateNumber,
            sp.ServiceDate,
            c.DriverName,
            p.PackageName,
            p.PackagePrice
        FROM ServicePackage sp
        LEFT JOIN Car c ON sp.PlateNumber = c.PlateNumber
        LEFT JOIN Package p ON sp.PackageNumber = p.PackageNumber
        ORDER BY sp.ServiceDate DESC, sp.RecordNumber DESC
        LIMIT 10
    `;

    // Execute all queries
    Promise.all([
        new Promise((resolve, reject) => {
            db.query(usersQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results[0].totalUsers);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(carsQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results[0].totalCars);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(packagesQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results[0].totalPackages);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(servicesQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results[0].totalServices);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(revenueQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results[0].totalRevenue || 0);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(todayQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results[0].todayServices);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(monthlyQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results[0].monthlyRevenue || 0);
            });
        }),
        new Promise((resolve, reject) => {
            db.query(recentQuery, (err, results) => {
                if (err) reject(err);
                else resolve(results);
            });
        })
    ]).then(([totalUsers, totalCars, totalPackages, totalServices, totalRevenue, todayServices, monthlyRevenue, recentServices]) => {
        res.json({
            success: true,
            data: {
                totalUsers,
                totalCars,
                totalPackages,
                totalServices,
                totalRevenue,
                todayServices,
                monthlyRevenue,
                recentServices
            }
        });
    }).catch(err => {
        console.error('Dashboard query error:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard data'
        });
    });
});

// Daily report - get all services for a specific date
app.get('/api/reports/daily/:date', requireAuth, (req, res) => {
    const reportDate = req.params.date;
    const query = `
        SELECT
            sp.PlateNumber,
            p.PackageName,
            p.PackageDescription,
            pay.AmountPaid,
            pay.PaymentDate,
            c.DriverName,
            c.PhoneNumber,
            sp.ServiceDate
        FROM ServicePackage sp
        LEFT JOIN Package p ON sp.PackageNumber = p.PackageNumber
        LEFT JOIN Payment pay ON sp.RecordNumber = pay.RecordNumber
        LEFT JOIN Car c ON sp.PlateNumber = c.PlateNumber
        WHERE sp.ServiceDate = ?
        ORDER BY sp.RecordNumber
    `;

    db.query(query, [reportDate], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to generate daily report'
            });
        }

        // Calculate totals
        const totalServices = results.length;
        const totalRevenue = results.reduce((sum, record) => {
            return sum + (record.AmountPaid || 0);
        }, 0);

        res.json({
            success: true,
            data: {
                reportDate,
                totalServices,
                totalRevenue,
                services: results
            }
        });
    });
});


// Start server
app.listen(PORT, () => {
    console.log(`Car Wash Management System server running on port ${PORT}`);
});