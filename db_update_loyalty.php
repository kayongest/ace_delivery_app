<?php
require_once 'db.php';
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN points INT DEFAULT 0;");
    echo "Added points column to users.\n";
} catch (PDOException $e) {
    echo "users.points: " . $e->getMessage() . "\n";
}

try {
    $pdo->exec("ALTER TABLE orders ADD COLUMN points_earned INT DEFAULT 0;");
    echo "Added points_earned column to orders.\n";
} catch (PDOException $e) {
    echo "orders.points_earned: " . $e->getMessage() . "\n";
}
?>
