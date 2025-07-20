-- Create table if not exists
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Initiatives' AND xtype='U')
CREATE TABLE Initiatives (
    id NVARCHAR(50) PRIMARY KEY,
    market NVARCHAR(100),
    dpm NVARCHAR(100),
    businessOwner NVARCHAR(100),
    po NVARCHAR(100),
    tdpo NVARCHAR(100),
    architect NVARCHAR(100),
    cybersecurity NVARCHAR(100),
    strategicIntent NVARCHAR(MAX),
    keyResults NVARCHAR(MAX), -- JSON string array
    deadlineStatus NVARCHAR(20),
    extCost NVARCHAR(50),
    intRes NVARCHAR(50),
    lastModified DATETIME2 DEFAULT GETDATE(),
    modifiedBy NVARCHAR(100)
);

-- Insert sample data if table is empty
IF NOT EXISTS (SELECT * FROM Initiatives)
BEGIN
    INSERT INTO Initiatives VALUES 
    ('INIT-001', 'Brazil', 'John Silva', 'Maria Santos', 'Carlos Lima', 'Ana Costa', 'Pedro Oliveira', 'Julia Rocha',
     'Sample strategic initiative for demonstration', 
     '["Increase efficiency by 30%", "Reduce costs by 15%", "Improve customer satisfaction"]',
     'green', '100k', '5 FTEs', GETDATE(), 'system'),
    ('INIT-002', 'Argentina', 'Carlos Rodriguez', 'Sofia Martinez', 'Diego Lopez', 'Elena Fernandez', 'Miguel Torres', 'Isabella Garcia',
     'Digital transformation initiative',
     '["Modernize legacy systems", "Implement cloud solutions", "Enhance security protocols"]',
     'yellow', '150k', '8 FTEs', GETDATE(), 'system');
END