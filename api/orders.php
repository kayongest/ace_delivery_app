<?php
header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
require_once '../db.php';

session_start();
if (!isset($_SESSION['user_id']) || !in_array($_SESSION['role'], ['admin', 'staff'])) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM orders ORDER BY created_at DESC");
        $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Fetch items for each order
        $orderIds = array_column($orders, 'id');
        if (!empty($orderIds)) {
            $inQuery = implode(',', array_fill(0, count($orderIds), '?'));
            $itemStmt = $pdo->prepare("SELECT oi.*, m.name as item_name, m.image as item_image, m.description as item_description FROM order_items oi JOIN menu m ON oi.menu_id = m.id WHERE oi.order_id IN ($inQuery)");
            $itemStmt->execute($orderIds);
            $allItems = $itemStmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Group items by order
            $itemsByOrder = [];
            foreach ($allItems as $item) {
                $itemsByOrder[$item['order_id']][] = $item;
            }
            
            foreach ($orders as &$order) {
                $order['items'] = $itemsByOrder[$order['id']] ?? [];
            }
        }

        echo json_encode(['status' => 'success', 'data' => $orders]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch orders: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    // Update order status
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['order_id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing order_id.']);
        exit;
    }
    
    try {
        if (isset($data['status'])) {
            $stmt = $pdo->prepare("UPDATE orders SET status = :status WHERE id = :id");
            $stmt->execute([
                ':status' => $data['status'],
                ':id' => $data['order_id']
            ]);
        } elseif (isset($data['payment_status'])) {
            $stmt = $pdo->prepare("UPDATE orders SET payment_status = :payment_status WHERE id = :id");
            $stmt->execute([
                ':payment_status' => $data['payment_status'],
                ':id' => $data['order_id']
            ]);
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'Missing status or payment_status.']);
            exit;
        }
        
        echo json_encode(['status' => 'success']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to update order: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
