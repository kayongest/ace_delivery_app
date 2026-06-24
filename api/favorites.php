<?php
header("Content-Type: application/json");
require_once '../db.php';

session_start();

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Not authenticated']);
    exit;
}

$user_id = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Return list of favorite menu IDs
    try {
        $stmt = $pdo->prepare("SELECT menu_id FROM favorites WHERE user_id = :uid");
        $stmt->execute([':uid' => $user_id]);
        $favs = $stmt->fetchAll(PDO::FETCH_COLUMN);
        echo json_encode(['status' => 'success', 'data' => $favs]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
} elseif ($method === 'POST') {
    // Toggle favorite status
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['menu_id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing menu_id']);
        exit;
    }
    
    $menu_id = (int)$data['menu_id'];
    
    try {
        // Check if exists
        $stmt = $pdo->prepare("SELECT id FROM favorites WHERE user_id = :uid AND menu_id = :mid");
        $stmt->execute([':uid' => $user_id, ':mid' => $menu_id]);
        
        if ($stmt->fetch()) {
            // Remove it
            $delStmt = $pdo->prepare("DELETE FROM favorites WHERE user_id = :uid AND menu_id = :mid");
            $delStmt->execute([':uid' => $user_id, ':mid' => $menu_id]);
            echo json_encode(['status' => 'success', 'action' => 'removed']);
        } else {
            // Add it
            $addStmt = $pdo->prepare("INSERT INTO favorites (user_id, menu_id) VALUES (:uid, :mid)");
            $addStmt->execute([':uid' => $user_id, ':mid' => $menu_id]);
            echo json_encode(['status' => 'success', 'action' => 'added']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Database error']);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>
