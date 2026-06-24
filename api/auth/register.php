<?php
header("Content-Type: application/json");
require_once '../../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!isset($data['email'], $data['password'], $data['full_name'], $data['phone'], $data['address'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing fields.']);
        exit;
    }

    $email = trim($data['email']);
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid email address.']);
        exit;
    }

    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
    $stmt->execute([':email' => $email]);
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Email already registered.']);
        exit;
    }

    $hash = password_hash($data['password'], PASSWORD_DEFAULT);
    
    try {
        $insert = $pdo->prepare("INSERT INTO users (email, password, role, full_name, phone, address) VALUES (:email, :pass, 'customer', :name, :phone, :address)");
        $insert->execute([
            ':email' => $email,
            ':pass' => $hash,
            ':name' => $data['full_name'],
            ':phone' => $data['phone'],
            ':address' => $data['address']
        ]);
        
        $userId = $pdo->lastInsertId();
        
        // Auto-login
        session_start();
        $_SESSION['user_id'] = $userId;
        $_SESSION['role'] = 'customer';
        $_SESSION['email'] = $email;
        
        echo json_encode(['status' => 'success', 'message' => 'Registered successfully.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
