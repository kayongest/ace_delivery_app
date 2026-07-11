<?php
header("Content-Type: application/json");
require_once '../db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized. Login required.']);
    exit;
}

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT * FROM addresses WHERE user_id = :user_id ORDER BY created_at DESC");
        $stmt->execute([':user_id' => $userId]);
        $addresses = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $addresses]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch addresses: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['address_text'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid parameters.']);
        exit;
    }

    $id = isset($data['id']) ? intval($data['id']) : 0;
    $label = isset($data['label']) ? trim($data['label']) : 'Home';
    $addressText = trim($data['address_text']);
    $lat = isset($data['latitude']) && $data['latitude'] !== '' ? floatval($data['latitude']) : null;
    $lng = isset($data['longitude']) && $data['longitude'] !== '' ? floatval($data['longitude']) : null;

    try {
        if ($id > 0) {
            // Update
            $stmt = $pdo->prepare("UPDATE addresses SET label = :label, address_text = :address_text, latitude = :lat, longitude = :lng WHERE id = :id AND user_id = :user_id");
            $stmt->execute([
                ':label' => $label,
                ':address_text' => $addressText,
                ':lat' => $lat,
                ':lng' => $lng,
                ':id' => $id,
                ':user_id' => $userId
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Address updated successfully.']);
        } else {
            // Insert
            $stmt = $pdo->prepare("INSERT INTO addresses (user_id, label, address_text, latitude, longitude) VALUES (:user_id, :label, :address_text, :lat, :lng)");
            $stmt->execute([
                ':user_id' => $userId,
                ':label' => $label,
                ':address_text' => $addressText,
                ':lat' => $lat,
                ':lng' => $lng
            ]);
            echo json_encode(['status' => 'success', 'message' => 'Address saved successfully.']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save address: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    $id = isset($data['id']) ? intval($data['id']) : 0;

    if ($id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid ID.']);
        exit;
    }

    try {
        $stmt = $pdo->prepare("DELETE FROM addresses WHERE id = :id AND user_id = :user_id");
        $stmt->execute([
            ':id' => $id,
            ':user_id' => $userId
        ]);
        echo json_encode(['status' => 'success', 'message' => 'Address deleted successfully.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete address: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
