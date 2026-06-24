<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=cafe_delivery", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $columns = $pdo->query("SHOW COLUMNS FROM users")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('email', $columns)) {
        $pdo->exec("ALTER TABLE users CHANGE username email VARCHAR(100) NOT NULL UNIQUE");
        $pdo->exec("UPDATE users SET email = 'admin@acecafe.com' WHERE email = 'admin'");
    }
    if (!in_array('full_name', $columns)) {
        $pdo->exec("ALTER TABLE users ADD COLUMN full_name VARCHAR(100) NULL AFTER password");
        $pdo->exec("ALTER TABLE users ADD COLUMN phone VARCHAR(20) NULL AFTER full_name");
        $pdo->exec("ALTER TABLE users ADD COLUMN address TEXT NULL AFTER phone");
    }
    
    $orderColumns = $pdo->query("SHOW COLUMNS FROM orders")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('user_id', $orderColumns)) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN user_id INT NULL AFTER id");
        $pdo->exec("ALTER TABLE orders ADD CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL");
    }

    echo "Database auth schema updated successfully.";
} catch (PDOException $e) {
    die("DB Update Failed: " . $e->getMessage());
}
?>
