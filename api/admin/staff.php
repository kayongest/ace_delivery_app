<?php
header("Content-Type: application/json");
require_once '../../db.php';
session_start();

if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    try {
        $stmt = $pdo->prepare("SELECT id, email, full_name, created_at, is_active FROM users WHERE role = 'staff' ORDER BY created_at DESC");
        $stmt->execute();
        $staff = $stmt->fetchAll();
        echo json_encode(['status' => 'success', 'data' => $staff]);
    } catch(PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => 'DB error']);
    }
} elseif ($method === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (isset($data['action']) && $data['action'] === 'toggle_status') {
        $id = (int)$data['id'];
        $status = (int)$data['status'];
        $stmt = $pdo->prepare("UPDATE users SET is_active = :status WHERE id = :id AND role = 'staff'");
        $stmt->execute([':status' => $status, ':id' => $id]);
        echo json_encode(['status' => 'success']);
    } elseif (isset($data['action']) && $data['action'] === 'delete') {
        $id = (int)$data['id'];
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id AND role = 'staff'");
        $stmt->execute([':id' => $id]);
        echo json_encode(['status' => 'success']);
    } else {
        // Create
        $email = trim($data['email']);
        $password = $data['password'];
        $full_name = trim($data['full_name']);
        
        $hash = password_hash($password, PASSWORD_DEFAULT);
        
        try {
            $stmt = $pdo->prepare("INSERT INTO users (email, password, full_name, role) VALUES (:e, :p, :f, 'staff')");
            $stmt->execute([':e' => $email, ':p' => $hash, ':f' => $full_name]);
            echo json_encode(['status' => 'success']);
        } catch(PDOException $e) {
            echo json_encode(['status' => 'error', 'message' => 'Email might already be taken.']);
        }
    }
}
?>
