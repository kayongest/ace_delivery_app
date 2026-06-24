<?php
require_once 'db.php';
try {
    $pdo->exec("ALTER TABLE users ADD COLUMN is_active TINYINT(1) DEFAULT 1;");
    echo "Column added successfully.\n";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
?>
