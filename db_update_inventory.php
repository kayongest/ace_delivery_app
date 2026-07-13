<?php
require_once 'db.php';

try {
    // 1. Create inventory_items table
    $pdo->exec("CREATE TABLE IF NOT EXISTS inventory_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        category ENUM('perishable', 'non_perishable') NOT NULL,
        current_quantity DECIMAL(10,2) DEFAULT 0.00,
        unit VARCHAR(20) NOT NULL,
        reorder_level DECIMAL(10,2) NOT NULL,
        target_quantity DECIMAL(10,2) NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'inventory_items' checked/created.\n";

    // 2. Create inventory_batches table
    $pdo->exec("CREATE TABLE IF NOT EXISTS inventory_batches (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inventory_item_id INT NOT NULL,
        batch_number VARCHAR(50),
        quantity_received DECIMAL(10,2) NOT NULL,
        quantity_remaining DECIMAL(10,2) NOT NULL,
        received_date DATE NOT NULL,
        expiration_date DATE NULL,
        status ENUM('fresh', 'expired', 'spoiled') DEFAULT 'fresh',
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'inventory_batches' checked/created.\n";

    // 3. Create recipes table
    $pdo->exec("CREATE TABLE IF NOT EXISTS recipes (
        menu_id INT NOT NULL,
        inventory_item_id INT NOT NULL,
        quantity_required DECIMAL(10,3) NOT NULL,
        PRIMARY KEY (menu_id, inventory_item_id),
        FOREIGN KEY (menu_id) REFERENCES menu(id) ON DELETE CASCADE,
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'recipes' checked/created.\n";

    // 4. Create inventory_transactions table
    $pdo->exec("CREATE TABLE IF NOT EXISTS inventory_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        inventory_item_id INT NOT NULL,
        type ENUM('purchase', 'sale', 'waste', 'adjustment') NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        note VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (inventory_item_id) REFERENCES inventory_items(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");
    echo "Table 'inventory_transactions' checked/created.\n";

    echo "Database updated with inventory tables successfully.\n";
} catch (PDOException $e) {
    die("DB Alteration Failed: " . $e->getMessage() . "\n");
}
?>
