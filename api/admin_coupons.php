<?php
header("Content-Type: application/json");
require_once '../db.php';

session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Admin access required.']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->query("SELECT * FROM coupons ORDER BY created_at DESC");
        $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $coupons]);
    } catch (Throwable $e) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch coupons: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['code'], $data['type'], $data['value'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid parameters.']);
        exit;
    }

    $code = strtoupper(trim($data['code']));
    $type = $data['type']; // 'percent' or 'flat'
    $value = intval($data['value']);
    $min_order = isset($data['min_order_amount']) ? intval($data['min_order_amount']) : 0;
    $active = isset($data['active']) ? intval($data['active']) : 1;
    $id = isset($data['id']) ? intval($data['id']) : 0;

    if (!in_array($type, ['percent', 'flat'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid coupon type.']);
        exit;
    }

    try {
        if ($id > 0) {
            $stmt = $pdo->prepare("UPDATE coupons SET code = :code, type = :type, value = :value, min_order_amount = :min_order, active = :active WHERE id = :id");
            $stmt->execute([
                ':code' => $code,
                ':type' => $type,
                ':value' => $value,
                ':min_order' => $min_order,
                ':active' => $active,
                ':id' => $id
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Coupon updated successfully.']);
        } else {
            $stmt = $pdo->prepare("INSERT INTO coupons (code, type, value, min_order_amount, active) VALUES (:code, :type, :value, :min_order, :active)");
            $stmt->execute([
                ':code' => $code,
                ':type' => $type,
                ':value' => $value,
                ':min_order' => $min_order,
                ':active' => $active
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Coupon created successfully.']);
        }
    } catch (Throwable $e) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save coupon: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    if ($id <= 0) {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        $id = isset($data['id']) ? intval($data['id']) : 0;
    }

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid coupon ID.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM coupons WHERE id = :id");
        $stmt->execute([':id' => $id]);
        echo json_encode(['status' => 'success', 'message' => 'Coupon deleted successfully.']);
    } catch (Throwable $e) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete coupon: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
