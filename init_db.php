<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create DB
    $pdo->exec("CREATE DATABASE IF NOT EXISTS cafe_delivery CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE cafe_delivery");
    
    // Create users table
    $pdo->exec("CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'customer') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Insert admin user if not exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = 'admin'");
    $stmt->execute();
    if ($stmt->rowCount() == 0) {
        $hash = password_hash('adminpassword', PASSWORD_DEFAULT);
        $pdo->exec("INSERT INTO users (username, password, role) VALUES ('admin', '$hash', 'admin')");
        echo "Admin user created (username: admin, password: adminpassword).<br>";
    }
    
    // Create menu table
    $pdo->exec("CREATE TABLE IF NOT EXISTS menu (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price INT NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Migrate data from JSON if table is empty
    $stmt = $pdo->query("SELECT COUNT(*) FROM menu");
    $count = $stmt->fetchColumn();
    
    if ($count == 0 && file_exists('data/menu.json')) {
        $json = file_get_contents('data/menu.json');
        $items = json_decode($json, true);
        
        $insertStmt = $pdo->prepare("INSERT INTO menu (id, name, price, category, description, image) VALUES (:id, :name, :price, :category, :description, :image)");
        
        foreach ($items as $item) {
            $insertStmt->execute([
                ':id' => $item['id'],
                ':name' => $item['name'],
                ':price' => $item['price'],
                ':category' => $item['category'],
                ':description' => $item['description'],
                ':image' => $item['image']
            ]);
        }
        echo "Migrated menu items from JSON to Database.<br>";
    } else {
        echo "Menu table already populated or JSON not found.<br>";
    }
    
    echo "Database initialized successfully.";
} catch (PDOException $e) {
    die("DB Setup Failed: " . $e->getMessage());
}
?>
