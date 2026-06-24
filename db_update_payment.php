<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=cafe_delivery", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Check if payment_status column exists
    $columns = $pdo->query("SHOW COLUMNS FROM orders")->fetchAll(PDO::FETCH_COLUMN);
    if (!in_array('payment_status', $columns)) {
        $pdo->exec("ALTER TABLE orders ADD COLUMN payment_status ENUM('pending', 'paid') DEFAULT 'pending' AFTER payment_method");
        // Mark all existing 'card' payments as paid
        $pdo->exec("UPDATE orders SET payment_status = 'paid' WHERE payment_method = 'card'");
    }
    
    echo "Done";
} catch (PDOException $e) {
    die("DB Update Failed: " . $e->getMessage());
}
?>
