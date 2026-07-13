<?php
require_once 'db.php';

try {
    // 1. Check and add cost_per_unit column on inventory_items table
    $stmt = $pdo->query("SHOW COLUMNS FROM inventory_items");
    $columns = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    if (!in_array('cost_per_unit', $columns)) {
        $pdo->exec("ALTER TABLE inventory_items ADD COLUMN cost_per_unit DECIMAL(10,2) DEFAULT 0.00;");
        echo "Added 'cost_per_unit' column to inventory_items table.\n";
    } else {
        echo "'cost_per_unit' column already exists in inventory_items.\n";
    }

    // 2. Cleanup existing Meat unit typo ('40' -> 'KG')
    $pdo->exec("UPDATE inventory_items SET unit = 'KG' WHERE name = 'Meat' AND unit = '40';");
    echo "Cleaned up unit typo for 'Meat'.\n";

    // 3. Set default costs for existing items
    $existingCosts = [
        'Rice' => 1500.00,
        'Flour' => 1200.00,
        'Meat' => 4500.00,
        'Cooking Oil' => 2200.00
    ];
    
    $updateCostStmt = $pdo->prepare("UPDATE inventory_items SET cost_per_unit = :cost WHERE name = :name AND cost_per_unit = 0.00");
    foreach ($existingCosts as $name => $cost) {
        $updateCostStmt->execute([
            ':cost' => $cost,
            ':name' => $name
        ]);
    }
    echo "Seeded default costs for existing ingredients.\n";

    // 4. Seed new core items if not present
    $newItems = [
        [
            'name' => 'Potatoes',
            'category' => 'perishable',
            'current_quantity' => 0.00,
            'unit' => 'KG',
            'reorder_level' => 10.00,
            'target_quantity' => 50.00,
            'cost_per_unit' => 800.00
        ],
        [
            'name' => 'Salt',
            'category' => 'non_perishable',
            'current_quantity' => 0.00,
            'unit' => 'KG',
            'reorder_level' => 2.00,
            'target_quantity' => 10.00,
            'cost_per_unit' => 500.00
        ],
        [
            'name' => 'Sugar',
            'category' => 'non_perishable',
            'current_quantity' => 0.00,
            'unit' => 'KG',
            'reorder_level' => 5.00,
            'target_quantity' => 25.00,
            'cost_per_unit' => 1200.00
        ]
    ];

    $checkItemStmt = $pdo->prepare("SELECT COUNT(*) FROM inventory_items WHERE name = :name");
    $insertItemStmt = $pdo->prepare("
        INSERT INTO inventory_items (name, category, current_quantity, unit, reorder_level, target_quantity, cost_per_unit)
        VALUES (:name, :category, :current_quantity, :unit, :reorder_level, :target_quantity, :cost_per_unit)
    ");

    foreach ($newItems as $item) {
        $checkItemStmt->execute([':name' => $item['name']]);
        if ($checkItemStmt->fetchColumn() == 0) {
            $insertItemStmt->execute([
                ':name' => $item['name'],
                ':category' => $item['category'],
                ':current_quantity' => $item['current_quantity'],
                ':unit' => $item['unit'],
                ':reorder_level' => $item['reorder_level'],
                ':target_quantity' => $item['target_quantity'],
                ':cost_per_unit' => $item['cost_per_unit']
            ]);
            echo "Seeded ingredient: {$item['name']}.\n";
        } else {
            echo "Ingredient '{$item['name']}' already exists, skipping.\n";
        }
    }

    echo "Database updated successfully.\n";
} catch (PDOException $e) {
    die("DB Alteration Failed: " . $e->getMessage() . "\n");
}
?>
