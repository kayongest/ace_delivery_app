<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=cafe_delivery", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // 1. Add payment_method to orders table if it doesn't exist
    $stmt = $pdo->query("SHOW COLUMNS FROM orders LIKE 'payment_method'");
    if ($stmt->rowCount() == 0) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN payment_method ENUM('cod', 'card', 'momo', 'airtel') DEFAULT 'cod' AFTER status");
        echo "Added 'payment_method' column to 'orders' table.<br>";
    } else {
        // Update it just in case
        $pdo->exec("ALTER TABLE orders MODIFY COLUMN payment_method ENUM('cod', 'card', 'momo', 'airtel', 'mobile_money') DEFAULT 'cod'");
        echo "'payment_method' column already exists in 'orders' table. Modified ENUM to include momo/airtel.<br>";
    }

    // 2. Create reviews table
    $pdo->exec("CREATE TABLE IF NOT EXISTS reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        menu_id INT NOT NULL,
        rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
        review_text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_menu (user_id, menu_id)
    )");
    echo "Ensured 'reviews' table exists.<br>";
    
    echo "Database polish updates completed successfully.";
} catch (PDOException $e) {
    die("DB Polish Update Failed: " . $e->getMessage());
}
?>
