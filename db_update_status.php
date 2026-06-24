<?php
$host = '127.0.0.1';
$user = 'root';
$pass = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=cafe_delivery", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'preparing', 'out_for_delivery', 'complete_awaiting_pickup', 'delivered', 'cancelled') DEFAULT 'pending'");
    
    // Update any existing 'out_for_delivery' to something else if needed, but not strictly required.
    // The user requested: Pending, Preparing, Complete (Awaiting pickup) & Delivered
    
    echo "Done";
} catch (PDOException $e) {
    die("DB Update Failed: " . $e->getMessage());
}
?>
