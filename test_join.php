<?php
require_once 'db.php';

try {
    $ordersStmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC LIMIT 5");
    $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch items for orders
    $orderIds = array_column($orders, 'id');
    if (!empty($orderIds)) {
        $inQuery = implode(',', array_fill(0, count($orderIds), '?'));
        $itemStmt = $pdo->prepare("SELECT oi.*, m.name as item_name FROM order_items oi JOIN menu m ON oi.menu_id = m.id WHERE oi.order_id IN ($inQuery)");
        $itemStmt->execute($orderIds);
        $allItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        echo "Successfully fetched items\n";
    }
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
?>
