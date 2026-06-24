<?php
header("Content-Type: application/json");
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['name'], $data['phone'], $data['address'], $data['items']) || empty($data['items'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid order data.']);
        exit;
    }

    $paymentMethod = isset($data['payment_method']) ? $data['payment_method'] : 'cod';
    if (!in_array($paymentMethod, ['cod', 'card', 'mobile_money'])) {
        $paymentMethod = 'cod';
    }

    try {
        $pdo->beginTransaction();

        $totalAmount = 0;
        foreach ($data['items'] as $item) {
            $price = isset($item['price']) ? floatval($item['price']) : 0;
            $qty = isset($item['quantity']) ? intval($item['quantity']) : 1;
            $totalAmount += $price * $qty;
        }

        session_start();
        $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

        $paymentStatus = ($paymentMethod === 'card') ? 'paid' : 'pending';

        $pointsEarned = floor($totalAmount / 100);

        $stmt = $pdo->prepare("INSERT INTO orders (user_id, customer_name, phone, address, total_amount, payment_method, payment_status, points_earned) VALUES (:user_id, :name, :phone, :address, :total, :payment_method, :payment_status, :points_earned)");
        $stmt->execute([
            ':user_id' => $userId,
            ':name' => $data['name'],
            ':phone' => $data['phone'],
            ':address' => $data['address'],
            ':total' => $totalAmount,
            ':payment_method' => $paymentMethod,
            ':payment_status' => $paymentStatus,
            ':points_earned' => $pointsEarned
        ]);
        
        $orderId = $pdo->lastInsertId();
        
        $itemStmt = $pdo->prepare("INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (:order_id, :menu_id, :quantity, :price)");
        
        foreach ($data['items'] as $item) {
            $itemStmt->execute([
                ':order_id' => $orderId,
                ':menu_id' => $item['id'],
                ':quantity' => $item['quantity'],
                ':price' => $item['price']
            ]);
        }

        if ($userId && $pointsEarned > 0) {
            $updatePoints = $pdo->prepare("UPDATE users SET points = points + :points WHERE id = :id");
            $updatePoints->execute([':points' => $pointsEarned, ':id' => $userId]);
        }

        $pdo->commit();
        echo json_encode(['status' => 'success', 'order_id' => $orderId]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to process order: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
