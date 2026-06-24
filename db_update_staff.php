<?php
require_once 'db.php';

try {
    $pdo->exec("ALTER TABLE users MODIFY COLUMN role ENUM('admin', 'staff', 'customer') DEFAULT 'customer'");
    echo "Users table updated to support 'staff' role.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
