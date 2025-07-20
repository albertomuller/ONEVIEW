-- Create Users table for authentication
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Users' AND xtype='U')
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) UNIQUE NOT NULL,
    password NVARCHAR(255) NOT NULL,
    name NVARCHAR(200) NOT NULL,
    email NVARCHAR(255),
    role NVARCHAR(50) DEFAULT 'user',
    isActive BIT DEFAULT 1,
    lastLogin DATETIME2,
    createdAt DATETIME2 DEFAULT GETDATE(),
    modifiedAt DATETIME2 DEFAULT GETDATE()
);

-- Insert default user
IF NOT EXISTS (SELECT * FROM Users WHERE username = 'VFSDITLATAM')
BEGIN
    INSERT INTO Users (username, password, name, email, role) 
    VALUES ('VFSDITLATAM', 'Vfsalberto2025', 'VFS DIT LATAM User', 'alberto.neto.2@volvo.com', 'admin');
END