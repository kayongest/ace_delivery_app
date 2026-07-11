<?php
header("Content-Type: application/json");
require_once '../db.php';

session_start();

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch reviews for a menu item
    $menu_id = isset($_GET['menu_id']) ? intval($_GET['menu_id']) : 0;
    
    if ($menu_id <= 0) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid menu_id']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("SELECT r.*, u.full_name as customer_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.menu_id = :menu_id ORDER BY r.created_at DESC");
        $stmt->execute([':menu_id' => $menu_id]);
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['status' => 'success', 'data' => $reviews]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch reviews: ' . $e->getMessage()]);
    }
} elseif ($method === 'POST') {
    // Add a new review (requires login)
    if (!isset($_SESSION['user_id'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'You must be logged in to leave a review.']);
        exit;
    }
    
    $menu_id = 0;
    $rating = 0;
    $review_text = null;
    
    // Handle both JSON and multipart form uploads
    if (isset($_POST['menu_id'])) {
        $menu_id = intval($_POST['menu_id']);
        $rating = intval($_POST['rating']);
        $review_text = isset($_POST['review_text']) ? trim($_POST['review_text']) : null;
    } else {
        $input = file_get_contents('php://input');
        $data = json_decode($input, true);
        if ($data) {
            $menu_id = isset($data['menu_id']) ? intval($data['menu_id']) : 0;
            $rating = isset($data['rating']) ? intval($data['rating']) : 0;
            $review_text = isset($data['review_text']) ? trim($data['review_text']) : null;
        }
    }
    
    if ($menu_id <= 0 || $rating < 1 || $rating > 5) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid rating or menu_id.']);
        exit;
    }
    
    // Handle photo upload
    $photoPath = null;
    if (isset($_FILES['photo']) && $_FILES['photo']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['photo']['tmp_name'];
        $fileName = $_FILES['photo']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (in_array($fileExtension, $allowedExtensions)) {
            $uploadFileDir = '../uploads/reviews/';
            if (!is_dir($uploadFileDir)) {
                mkdir($uploadFileDir, 0777, true);
            }
            
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadFileDir . $newFileName;
            
            if (move_uploaded_file($fileTmpPath, $dest_path)) {
                $photoPath = 'uploads/reviews/' . $newFileName;
            }
        }
    }
    
    try {
        if ($photoPath) {
            $stmt = $pdo->prepare("INSERT INTO reviews (user_id, menu_id, rating, review_text, photo) VALUES (:user_id, :menu_id, :rating, :review_text, :photo) ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text), photo = VALUES(photo), created_at = CURRENT_TIMESTAMP");
            $stmt->execute([
                ':user_id' => $_SESSION['user_id'],
                ':menu_id' => $menu_id,
                ':rating' => $rating,
                ':review_text' => $review_text,
                ':photo' => $photoPath
            ]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO reviews (user_id, menu_id, rating, review_text) VALUES (:user_id, :menu_id, :rating, :review_text) ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text), created_at = CURRENT_TIMESTAMP");
            $stmt->execute([
                ':user_id' => $_SESSION['user_id'],
                ':menu_id' => $menu_id,
                ':rating' => $rating,
                ':review_text' => $review_text
            ]);
        }
        
        echo json_encode(['status' => 'success', 'message' => 'Review submitted successfully.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to submit review: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
