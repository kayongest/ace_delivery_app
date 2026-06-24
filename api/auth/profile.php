<?php
require_once '../../db.php';
session_start();

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['status' => 'error', 'message' => 'Not logged in']);
    exit;
}

$userId = $_SESSION['user_id'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = $_POST['name'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $address = $_POST['address'] ?? '';

    // Handle Image Upload
    $imagePath = null;
    if (isset($_FILES['profile_image']) && $_FILES['profile_image']['error'] === UPLOAD_ERR_OK) {
        $uploadDir = '../../images/profiles/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0777, true);
        }

        $fileName = time() . '_' . basename($_FILES['profile_image']['name']);
        $targetFile = $uploadDir . $fileName;

        if (move_uploaded_file($_FILES['profile_image']['tmp_name'], $targetFile)) {
            $imagePath = 'images/profiles/' . $fileName;
        }
    }

    try {
        if ($imagePath) {
            $stmt = $pdo->prepare("UPDATE users SET full_name = :name, phone = :phone, address = :address, profile_image = :image WHERE id = :id");
            $stmt->execute([
                ':name' => $name,
                ':phone' => $phone,
                ':address' => $address,
                ':image' => $imagePath,
                ':id' => $userId
            ]);
            // Update session
            $_SESSION['profile_image'] = $imagePath;
        } else {
            $stmt = $pdo->prepare("UPDATE users SET full_name = :name, phone = :phone, address = :address WHERE id = :id");
            $stmt->execute([
                ':name' => $name,
                ':phone' => $phone,
                ':address' => $address,
                ':id' => $userId
            ]);
        }

        // Update session
        $_SESSION['name'] = $name;

        echo json_encode(['status' => 'success', 'message' => 'Profile updated']);
    } catch (PDOException $e) {
        echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
    }
} else {
    // GET request, just return data if needed (though me.php already does this)
    echo json_encode(['status' => 'error', 'message' => 'Invalid method']);
}
?>
