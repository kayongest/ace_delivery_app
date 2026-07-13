<?php
require_once 'db.php';

try {
    // Check existing columns on menu table
    $stmt = $pdo->query("SHOW COLUMNS FROM menu");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('track_stock', $columns)) {
        $pdo->exec("ALTER TABLE menu ADD COLUMN track_stock TINYINT(1) DEFAULT 0;");
        echo "Added track_stock column to menu.\n";
    } else {
        echo "track_stock column already exists.\n";
    }
    
    if (!in_array('stock_quantity', $columns)) {
        $pdo->exec("ALTER TABLE menu ADD COLUMN stock_quantity INT DEFAULT -1;");
        echo "Added stock_quantity column to menu.\n";
    } else {
        echo "stock_quantity column already exists.\n";
    }
    
    if (!in_array('is_available', $columns)) {
        $pdo->exec("ALTER TABLE menu ADD COLUMN is_available TINYINT(1) DEFAULT 1;");
        echo "Added is_available column to menu.\n";
    } else {
        echo "is_available column already exists.\n";
    }
    
    echo "Database updated successfully.\n";
} catch (PDOException $e) {
    die("DB Alteration Failed: " . $e->getMessage() . "\n");
}
?>
