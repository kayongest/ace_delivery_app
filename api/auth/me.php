<?php
header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
require_once '../../db.php';

session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT id, email, full_name, phone, address, role, profile_image, points FROM users WHERE id = :id");
    $stmt->execute([':id' => $_SESSION['user_id']]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        session_destroy();
        echo json_encode(['status' => 'error', 'message' => 'User not found']);
        exit;
    }
    
    // Fetch user's orders
    $ordersStmt = $pdo->prepare("SELECT * FROM orders WHERE user_id = :id ORDER BY created_at DESC");
    $ordersStmt->execute([':id' => $_SESSION['user_id']]);
    $orders = $ordersStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Fetch items for orders
    $orderIds = array_column($orders, 'id');
    if (!empty($orderIds)) {
        $inQuery = implode(',', array_fill(0, count($orderIds), '?'));
        $itemStmt = $pdo->prepare("SELECT oi.*, m.name as item_name FROM order_items oi JOIN menu m ON oi.menu_id = m.id WHERE oi.order_id IN ($inQuery)");
        $itemStmt->execute($orderIds);
        $allItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
        
        $itemsByOrder = [];
        foreach ($allItems as $item) {
            $itemsByOrder[$item['order_id']][] = $item;
        }
        
        foreach ($orders as &$order) {
            $order['items'] = $itemsByOrder[$order['id']] ?? [];
        }
    } else {
        foreach ($orders as &$order) {
            $order['items'] = [];
        }
    }

    echo json_encode([
        'status' => 'success', 
        'user' => $user,
        'orders' => $orders
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'DB error: ' . $e->getMessage()]);
}
?>
