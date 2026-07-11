<?php
header("Content-Type: application/json");
require_once '../db.php';
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['code'], $data['subtotal'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid parameters.']);
        exit;
    }

    $code = strtoupper(trim($data['code']));
    $subtotal = floatval($data['subtotal']);

    try {
        $stmt = $pdo->prepare("SELECT * FROM coupons WHERE UPPER(code) = :code AND active = 1");
        $stmt->execute([':code' => $code]);
        $coupon = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$coupon) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid or expired coupon code.']);
            exit;
        }

        if ($subtotal < floatval($coupon['min_order_amount'])) {
            echo json_encode([
                'status' => 'error', 
                'message' => 'Minimum order amount of RWF ' . $coupon['min_order_amount'] . ' is required for this coupon.'
            ]);
            exit;
        }

        $discount = 0;
        if ($coupon['type'] === 'flat') {
            $discount = intval($coupon['value']);
        } elseif ($coupon['type'] === 'percent') {
            $discount = floor($subtotal * (intval($coupon['value']) / 100));
        }

        // Limit discount to subtotal
        if ($discount > $subtotal) {
            $discount = $subtotal;
        }

        // Securely store in session
        $_SESSION['applied_coupon'] = [
            'code' => $coupon['code'],
            'type' => $coupon['type'],
            'value' => $coupon['value'],
            'min_order_amount' => $coupon['min_order_amount'],
            'discount' => $discount
        ];

        echo json_encode([
            'status' => 'success',
            'code' => $coupon['code'],
            'type' => $coupon['type'],
            'value' => $coupon['value'],
            'min_order_amount' => $coupon['min_order_amount'],
            'discount' => $discount,
            'message' => 'Coupon applied successfully!'
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to apply coupon: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
