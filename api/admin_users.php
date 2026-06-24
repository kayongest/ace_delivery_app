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
        $stmt = $pdo->query("SELECT id, email, full_name, phone, address, role, profile_image, created_at FROM users ORDER BY created_at DESC");
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $users]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch users: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing user id.']);
        exit;
    }
    
    // Prevent admin from deleting themselves
    if ($data['id'] == $_SESSION['user_id']) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'You cannot delete your own account.']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = :id");
        $stmt->execute([':id' => $data['id']]);
        echo json_encode(['status' => 'success', 'message' => 'User deleted successfully.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete user: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    $id = isset($_POST['id']) ? intval($_POST['id']) : 0;

    $email = trim($_POST['email'] ?? '');
    $fullName = trim($_POST['full_name'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $role = $_POST['role'] ?? 'customer';
    $password = $_POST['password'] ?? '';

    if ($id == 0 && empty($password)) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Password is required for new users.']);
        exit;
    }
    
    // Admin cannot downgrade themselves
    if ($id > 0 && $id == $_SESSION['user_id'] && $role !== 'admin') {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'You cannot change your own role from admin.']);
        exit;
    }

    $imagePath = null;
    
    // Handle profile image upload
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../images/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }
        
        $fileExtension = pathinfo($_FILES['profile_image']['name'], PATHINFO_EXTENSION);
        if (empty($fileExtension)) {
            $mimeType = mime_content_type($_FILES['profile_image']['tmp_name']);
            $extensions = [
                'image/jpeg' => 'jpg',
                'image/png'  => 'png',
                'image/gif'  => 'gif',
                'image/webp' => 'webp'
            ];
            $fileExtension = isset($extensions[$mimeType]) ? $extensions[$mimeType] : 'png';
        }
        
        $newFileName = uniqid('user_profile_') . '.' . $fileExtension;
        $destination = $uploadDir . $newFileName;
        
        if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $destination)) {
            $imagePath = 'images/' . $newFileName;
        }
    }
    
    try {
        if ($id == 0) {
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (email, password, full_name, phone, address, role, profile_image) VALUES (:email, :password, :full_name, :phone, :address, :role, :profile_image)");
            $stmt->execute([
                ':email' => $email,
                ':password' => $hash,
                ':full_name' => $fullName,
                ':phone' => $phone,
                ':address' => $address,
                ':role' => $role,
                ':profile_image' => $imagePath
            ]);
            echo json_encode(['status' => 'success', 'message' => 'User added successfully.', 'profile_image' => $imagePath]);
        } else {
            if ($password !== '') {
                // If admin provided a new password while updating
                $hash = password_hash($password, PASSWORD_DEFAULT);
                if ($imagePath) {
                    $stmt = $pdo->prepare("UPDATE users SET email = :email, password = :password, full_name = :full_name, phone = :phone, address = :address, role = :role, profile_image = :profile_image WHERE id = :id");
                    $stmt->execute([':email' => $email, ':password' => $hash, ':full_name' => $fullName, ':phone' => $phone, ':address' => $address, ':role' => $role, ':profile_image' => $imagePath, ':id' => $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE users SET email = :email, password = :password, full_name = :full_name, phone = :phone, address = :address, role = :role WHERE id = :id");
                    $stmt->execute([':email' => $email, ':password' => $hash, ':full_name' => $fullName, ':phone' => $phone, ':address' => $address, ':role' => $role, ':id' => $id]);
                }
            } else {
                if ($imagePath) {
                    $stmt = $pdo->prepare("UPDATE users SET email = :email, full_name = :full_name, phone = :phone, address = :address, role = :role, profile_image = :profile_image WHERE id = :id");
                    $stmt->execute([':email' => $email, ':full_name' => $fullName, ':phone' => $phone, ':address' => $address, ':role' => $role, ':profile_image' => $imagePath, ':id' => $id]);
                } else {
                    $stmt = $pdo->prepare("UPDATE users SET email = :email, full_name = :full_name, phone = :phone, address = :address, role = :role WHERE id = :id");
                    $stmt->execute([':email' => $email, ':full_name' => $fullName, ':phone' => $phone, ':address' => $address, ':role' => $role, ':id' => $id]);
                }
            }
            echo json_encode(['status' => 'success', 'message' => 'User updated successfully.', 'profile_image' => $imagePath]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to save user: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
