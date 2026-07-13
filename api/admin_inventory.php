<?php
header("Content-Type: application/json");
require_once '../db.php';

session_start();

// Verify user is logged in and has appropriate role (admin/staff)
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'staff'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Admin or Staff access required.']);
    exit;
}

$action = isset($_GET['action']) ? trim($_GET['action']) : '';

try {
    switch ($action) {
        case 'get_items':
            $stmt = $pdo->query("SELECT * FROM inventory_items ORDER BY name ASC");
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $items]);
            break;

        case 'save_item':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception("Method not allowed.");
            }
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            if (!$data || !isset($data['name'], $data['category'], $data['unit'], $data['reorder_level'], $data['target_quantity'])) {
                throw new Exception("Invalid parameters.");
            }

            $id = isset($data['id']) ? intval($data['id']) : 0;
            $name = trim($data['name']);
            $category = $data['category']; // 'perishable' or 'non_perishable'
            $unit = trim($data['unit']);
            $reorder_level = floatval($data['reorder_level']);
            $target_quantity = floatval($data['target_quantity']);
            $current_quantity = isset($data['current_quantity']) ? floatval($data['current_quantity']) : 0.00;
            $cost_per_unit = isset($data['cost_per_unit']) ? floatval($data['cost_per_unit']) : 0.00;

            if (!in_array($category, ['perishable', 'non_perishable'])) {
                throw new Exception("Invalid category.");
            }

            $pdo->beginTransaction();
            if ($id > 0) {
                // Fetch old quantity for comparison
                $oldStmt = $pdo->prepare("SELECT current_quantity FROM inventory_items WHERE id = :id");
                $oldStmt->execute([':id' => $id]);
                $oldQty = floatval($oldStmt->fetchColumn());

                $stmt = $pdo->prepare("UPDATE inventory_items SET name = :name, category = :category, unit = :unit, reorder_level = :reorder_level, target_quantity = :target_quantity, current_quantity = :current_quantity, cost_per_unit = :cost_per_unit WHERE id = :id");
                $stmt->execute([
                    ':name' => $name,
                    ':category' => $category,
                    ':unit' => $unit,
                    ':reorder_level' => $reorder_level,
                    ':target_quantity' => $target_quantity,
                    ':current_quantity' => $current_quantity,
                    ':cost_per_unit' => $cost_per_unit,
                    ':id' => $id
                ]);

                // If quantity was adjusted manually, log a transaction
                if ($oldQty != $current_quantity) {
                    $diff = $current_quantity - $oldQty;
                    $logStmt = $pdo->prepare("INSERT INTO inventory_transactions (inventory_item_id, type, quantity, note) VALUES (:inv_id, 'adjustment', :qty, :note)");
                    $logStmt->execute([
                        ':inv_id' => $id,
                        ':qty' => $diff,
                        ':note' => "Manual quantity adjustment"
                    ]);
                }
                echo json_encode(['status' => 'success', 'message' => 'Inventory item updated successfully.']);
            } else {
                $stmt = $pdo->prepare("INSERT INTO inventory_items (name, category, unit, reorder_level, target_quantity, current_quantity, cost_per_unit) VALUES (:name, :category, :unit, :reorder_level, :target_quantity, :current_quantity, :cost_per_unit)");
                $stmt->execute([
                    ':name' => $name,
                    ':category' => $category,
                    ':unit' => $unit,
                    ':reorder_level' => $reorder_level,
                    ':target_quantity' => $target_quantity,
                    ':current_quantity' => $current_quantity,
                    ':cost_per_unit' => $cost_per_unit
                ]);
                $newItemId = $pdo->lastInsertId();

                if ($current_quantity > 0) {
                    $logStmt = $pdo->prepare("INSERT INTO inventory_transactions (inventory_item_id, type, quantity, note) VALUES (:inv_id, 'adjustment', :qty, :note)");
                    $logStmt->execute([
                        ':inv_id' => $newItemId,
                        ':qty' => $current_quantity,
                        ':note' => "Initial inventory creation"
                    ]);
                }
                echo json_encode(['status' => 'success', 'message' => 'Inventory item created successfully.']);
            }
            $pdo->commit();
            break;

        case 'delete_item':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
                throw new Exception("Method not allowed.");
            }
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            $id = isset($data['id']) ? intval($data['id']) : (isset($_GET['id']) ? intval($_GET['id']) : 0);

            if ($id <= 0) {
                throw new Exception("Invalid ID.");
            }

            $stmt = $pdo->prepare("DELETE FROM inventory_items WHERE id = :id");
            $stmt->execute([':id' => $id]);
            echo json_encode(['status' => 'success', 'message' => 'Inventory item deleted successfully.']);
            break;

        case 'get_batches':
            $itemId = isset($_GET['item_id']) ? intval($_GET['item_id']) : 0;
            if ($itemId <= 0) {
                throw new Exception("Invalid inventory item ID.");
            }
            $stmt = $pdo->prepare("SELECT * FROM inventory_batches WHERE inventory_item_id = :item_id ORDER BY expiration_date ASC, received_date DESC");
            $stmt->execute([':item_id' => $itemId]);
            $batches = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $batches]);
            break;

        case 'save_batch':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception("Method not allowed.");
            }
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            if (!$data || !isset($data['inventory_item_id'], $data['quantity_received'], $data['received_date'])) {
                throw new Exception("Invalid parameters.");
            }

            $itemId = intval($data['inventory_item_id']);
            $batchNum = isset($data['batch_number']) ? trim($data['batch_number']) : '';
            $qtyReceived = floatval($data['quantity_received']);
            $receivedDate = $data['received_date'];
            $expDate = !empty($data['expiration_date']) ? $data['expiration_date'] : null;

            $pdo->beginTransaction();

            // Insert new batch
            $stmt = $pdo->prepare("INSERT INTO inventory_batches (inventory_item_id, batch_number, quantity_received, quantity_remaining, received_date, expiration_date) VALUES (:item_id, :batch_number, :qty_received, :qty_remaining, :received_date, :exp_date)");
            $stmt->execute([
                ':item_id' => $itemId,
                ':batch_number' => $batchNum,
                ':qty_received' => $qtyReceived,
                ':qty_remaining' => $qtyReceived,
                ':received_date' => $receivedDate,
                ':exp_date' => $expDate
            ]);

            // Add quantity to main item
            $updateStmt = $pdo->prepare("UPDATE inventory_items SET current_quantity = current_quantity + :qty WHERE id = :id");
            $updateStmt->execute([':qty' => $qtyReceived, ':id' => $itemId]);

            // Log purchase transaction
            $logStmt = $pdo->prepare("INSERT INTO inventory_transactions (inventory_item_id, type, quantity, note) VALUES (:inv_id, 'purchase', :qty, :note)");
            $logStmt->execute([
                ':inv_id' => $itemId,
                ':qty' => $qtyReceived,
                ':note' => "Batch " . ($batchNum ? "#$batchNum" : "unlabeled") . " added"
            ]);

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Batch added successfully and stock updated.']);
            break;

        case 'spoil_batch':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception("Method not allowed.");
            }
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            $batchId = isset($data['id']) ? intval($data['id']) : 0;

            if ($batchId <= 0) {
                throw new Exception("Invalid batch ID.");
            }

            $pdo->beginTransaction();

            // Fetch batch details
            $batchStmt = $pdo->prepare("SELECT inventory_item_id, quantity_remaining, batch_number FROM inventory_batches WHERE id = :id");
            $batchStmt->execute([':id' => $batchId]);
            $batch = $batchStmt->fetch(PDO::FETCH_ASSOC);

            if (!$batch) {
                throw new Exception("Batch not found.");
            }

            $qtyRemaining = floatval($batch['quantity_remaining']);
            $itemId = intval($batch['inventory_item_id']);

            if ($qtyRemaining > 0) {
                // Update batch status to spoiled and clear remaining quantity
                $updateBatch = $pdo->prepare("UPDATE inventory_batches SET quantity_remaining = 0, status = 'spoiled' WHERE id = :id");
                $updateBatch->execute([':id' => $batchId]);

                // Subtract quantity from main item
                $updateItem = $pdo->prepare("UPDATE inventory_items SET current_quantity = GREATEST(0, current_quantity - :qty) WHERE id = :id");
                $updateItem->execute([':qty' => $qtyRemaining, ':id' => $itemId]);

                // Log waste transaction
                $logStmt = $pdo->prepare("INSERT INTO inventory_transactions (inventory_item_id, type, quantity, note) VALUES (:inv_id, 'waste', :qty, :note)");
                $logStmt->execute([
                    ':inv_id' => $itemId,
                    ':qty' => -$qtyRemaining,
                    ':note' => "Batch " . ($batch['batch_number'] ? "#{$batch['batch_number']}" : "unlabeled") . " marked as spoiled/wasted"
                ]);
            } else {
                // Just mark status
                $updateBatch = $pdo->prepare("UPDATE inventory_batches SET status = 'spoiled' WHERE id = :id");
                $updateBatch->execute([':id' => $batchId]);
            }

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Batch marked as spoiled and stock adjusted.']);
            break;

        case 'delete_batch':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
                throw new Exception("Method not allowed.");
            }
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            $batchId = isset($data['id']) ? intval($data['id']) : (isset($_GET['id']) ? intval($_GET['id']) : 0);

            if ($batchId <= 0) {
                throw new Exception("Invalid batch ID.");
            }

            $pdo->beginTransaction();

            // Fetch batch details
            $batchStmt = $pdo->prepare("SELECT inventory_item_id, quantity_remaining FROM inventory_batches WHERE id = :id");
            $batchStmt->execute([':id' => $batchId]);
            $batch = $batchStmt->fetch(PDO::FETCH_ASSOC);

            if ($batch) {
                $qtyRemaining = floatval($batch['quantity_remaining']);
                $itemId = intval($batch['inventory_item_id']);

                // Delete batch
                $delBatch = $pdo->prepare("DELETE FROM inventory_batches WHERE id = :id");
                $delBatch->execute([':id' => $batchId]);

                if ($qtyRemaining > 0) {
                    // Subtract remaining quantity from main item
                    $updateItem = $pdo->prepare("UPDATE inventory_items SET current_quantity = GREATEST(0, current_quantity - :qty) WHERE id = :id");
                    $updateItem->execute([':qty' => $qtyRemaining, ':id' => $itemId]);

                    // Log adjustment transaction
                    $logStmt = $pdo->prepare("INSERT INTO inventory_transactions (inventory_item_id, type, quantity, note) VALUES (:inv_id, 'adjustment', :qty, :note)");
                    $logStmt->execute([
                        ':inv_id' => $itemId,
                        ':qty' => -$qtyRemaining,
                        ':note' => "Batch deleted"
                    ]);
                }
            }

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Batch deleted successfully.']);
            break;

        case 'get_menu_recipes':
            // Fetch all menu items and a count of how many ingredients they have mapped
            $sql = "SELECT m.id, m.name, m.category, m.price, COUNT(r.inventory_item_id) AS ingredient_count 
                    FROM menu m
                    LEFT JOIN recipes r ON m.id = r.menu_id 
                    GROUP BY m.id 
                    ORDER BY m.category ASC, m.name ASC";
            $stmt = $pdo->query($sql);
            $recipes = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode(['status' => 'success', 'data' => $recipes]);
            break;

        case 'get_recipe':
            $menuId = isset($_GET['menu_id']) ? intval($_GET['menu_id']) : 0;
            if ($menuId <= 0) {
                throw new Exception("Invalid menu ID.");
            }
            
            // Get ingredients mapped
            $stmt = $pdo->prepare("SELECT r.inventory_item_id, r.quantity_required, i.name, i.unit 
                                   FROM recipes r 
                                   JOIN inventory_items i ON r.inventory_item_id = i.id 
                                   WHERE r.menu_id = :menu_id");
            $stmt->execute([':menu_id' => $menuId]);
            $ingredients = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode(['status' => 'success', 'data' => $ingredients]);
            break;

        case 'save_recipe':
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                throw new Exception("Method not allowed.");
            }
            $input = file_get_contents('php://input');
            $data = json_decode($input, true);
            if (!$data || !isset($data['menu_id']) || !isset($data['ingredients'])) {
                throw new Exception("Invalid parameters.");
            }

            $menuId = intval($data['menu_id']);
            $ingredients = $data['ingredients']; // array of ['inventory_item_id' => X, 'quantity_required' => Y]

            $pdo->beginTransaction();

            // 1. Delete existing recipe mappings
            $delStmt = $pdo->prepare("DELETE FROM recipes WHERE menu_id = :menu_id");
            $delStmt->execute([':menu_id' => $menuId]);

            // 2. Insert new mappings
            $insStmt = $pdo->prepare("INSERT INTO recipes (menu_id, inventory_item_id, quantity_required) VALUES (:menu_id, :inv_id, :qty)");
            foreach ($ingredients as $ing) {
                $invId = intval($ing['inventory_item_id']);
                $qty = floatval($ing['quantity_required']);
                if ($qty > 0 && $invId > 0) {
                    $insStmt->execute([
                        ':menu_id' => $menuId,
                        ':inv_id' => $invId,
                        ':qty' => $qty
                    ]);
                }
            }

            $pdo->commit();
            echo json_encode(['status' => 'success', 'message' => 'Recipe saved successfully.']);
            break;

        case 'get_report':
            // 1. Remaining Stock Report
            $stockSql = "SELECT 
                            i.id,
                            i.name,
                            i.category,
                            i.current_quantity,
                            i.unit,
                            i.reorder_level,
                            i.target_quantity,
                            CASE 
                                WHEN i.current_quantity = 0 THEN 'Out of Stock'
                                WHEN i.current_quantity <= i.reorder_level THEN 'Low Stock'
                                ELSE 'In Stock'
                            END AS stock_status,
                            COALESCE(
                                (SELECT SUM(quantity_remaining) 
                                 FROM inventory_batches 
                                 WHERE inventory_item_id = i.id 
                                   AND expiration_date IS NOT NULL 
                                   AND expiration_date <= DATE_ADD(CURDATE(), INTERVAL 3 DAY)
                                   AND expiration_date >= CURDATE()
                                   AND quantity_remaining > 0
                                ), 0
                            ) AS quantity_expiring_soon,
                            COALESCE(
                                (SELECT SUM(quantity_remaining) 
                                 FROM inventory_batches 
                                 WHERE inventory_item_id = i.id 
                                   AND expiration_date < CURDATE()
                                   AND quantity_remaining > 0
                                ), 0
                            ) AS quantity_expired
                        FROM inventory_items i
                        ORDER BY i.name ASC";
            $stmt1 = $pdo->query($stockSql);
            $stockReport = $stmt1->fetchAll(PDO::FETCH_ASSOC);

            // 2. restock Shopping List
            $purchaseSql = "SELECT 
                                id,
                                name,
                                category,
                                current_quantity AS in_stock,
                                reorder_level,
                                target_quantity,
                                (target_quantity - current_quantity) AS purchase_quantity,
                                unit,
                                CASE 
                                    WHEN current_quantity = 0 THEN 'CRITICAL (Out of Stock)'
                                    WHEN current_quantity <= reorder_level THEN 'URGENT (Below Threshold)'
                                    ELSE 'Optional'
                                END AS priority
                            FROM inventory_items
                            WHERE current_quantity <= reorder_level
                            ORDER BY FIELD(priority, 'CRITICAL (Out of Stock)', 'URGENT (Below Threshold)', 'Optional') ASC, name ASC";
            $stmt2 = $pdo->query($purchaseSql);
            $shoppingList = $stmt2->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode([
                'status' => 'success',
                'data' => [
                    'stock_report' => $stockReport,
                    'shopping_list' => $shoppingList
                ]
            ]);
            break;

        default:
            throw new Exception("Unknown action: " . $action);
    }
} catch (Throwable $e) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
?>
