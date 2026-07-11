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

        $subtotal = 0;
        foreach ($data['items'] as $item) {
            $price = isset($item['price']) ? floatval($item['price']) : 0;
            $qty = isset($item['quantity']) ? intval($item['quantity']) : 1;
            $subtotal += $price * $qty;
        }

        session_start();
        $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

        // 1. Process Coupon
        $couponCode = isset($data['coupon_code']) ? trim($data['coupon_code']) : null;
        $couponDiscount = 0;
        if ($couponCode) {
            $couponStmt = $pdo->prepare("SELECT * FROM coupons WHERE code = :code AND active = 1");
            $couponStmt->execute([':code' => $couponCode]);
            $coupon = $couponStmt->fetch(PDO::FETCH_ASSOC);
            if ($coupon && $subtotal >= floatval($coupon['min_order_amount'])) {
                if ($coupon['type'] === 'flat') {
                    $couponDiscount = intval($coupon['value']);
                } elseif ($coupon['type'] === 'percent') {
                    $couponDiscount = floor($subtotal * (intval($coupon['value']) / 100));
                }
            } else {
                $couponCode = null; // Invalidate if requirements not met
            }
        }

        // 2. Process Loyalty Points
        $redeemPoints = isset($data['redeem_points']) && intval($data['redeem_points']) === 1;
        $pointsRedeemed = 0;
        $loyaltyDiscount = 0;
        if ($redeemPoints && $userId) {
            $userStmt = $pdo->prepare("SELECT points FROM users WHERE id = :id");
            $userStmt->execute([':id' => $userId]);
            $userPoints = intval($userStmt->fetchColumn());

            if ($userPoints > 0) {
                $remainingTotal = max(0, $subtotal - $couponDiscount);
                $maxPointsRedeemable = ceil($remainingTotal / 10);
                $pointsRedeemed = min($userPoints, $maxPointsRedeemable);
                $loyaltyDiscount = $pointsRedeemed * 10;
            }
        }

        $totalDiscount = $couponDiscount + $loyaltyDiscount;
        $totalAmount = max(0, $subtotal - $totalDiscount);

        $paymentStatus = ($paymentMethod === 'card') ? 'paid' : 'pending';
        $pointsEarned = floor($totalAmount / 100);

        $lat = isset($data['latitude']) && $data['latitude'] !== '' ? floatval($data['latitude']) : null;
        $lng = isset($data['longitude']) && $data['longitude'] !== '' ? floatval($data['longitude']) : null;

        $stmt = $pdo->prepare("INSERT INTO orders (user_id, customer_name, phone, address, total_amount, payment_method, payment_status, points_earned, coupon_code, discount_amount, points_redeemed, latitude, longitude) VALUES (:user_id, :name, :phone, :address, :total, :payment_method, :payment_status, :points_earned, :coupon_code, :discount_amount, :points_redeemed, :latitude, :longitude)");
        $stmt->execute([
            ':user_id' => $userId,
            ':name' => $data['name'],
            ':phone' => $data['phone'],
            ':address' => $data['address'],
            ':total' => $totalAmount,
            ':payment_method' => $paymentMethod,
            ':payment_status' => $paymentStatus,
            ':points_earned' => $pointsEarned,
            ':coupon_code' => $couponCode,
            ':discount_amount' => $totalDiscount,
            ':points_redeemed' => $pointsRedeemed,
            ':latitude' => $lat,
            ':longitude' => $lng
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

        if ($userId) {
            $netPoints = $pointsEarned - $pointsRedeemed;
            if ($netPoints !== 0) {
                $updatePoints = $pdo->prepare("UPDATE users SET points = points + :points WHERE id = :id");
                $updatePoints->execute([':points' => $netPoints, ':id' => $userId]);
            }
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
