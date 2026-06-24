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
    
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['menu_id'], $data['rating']) || $data['rating'] < 1 || $data['rating'] > 5) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid rating or menu_id.']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("INSERT INTO reviews (user_id, menu_id, rating, review_text) VALUES (:user_id, :menu_id, :rating, :review_text) ON DUPLICATE KEY UPDATE rating = VALUES(rating), review_text = VALUES(review_text), created_at = CURRENT_TIMESTAMP");
        $stmt->execute([
            ':user_id' => $_SESSION['user_id'],
            ':menu_id' => $data['menu_id'],
            ':rating' => $data['rating'],
            ':review_text' => isset($data['review_text']) ? trim($data['review_text']) : null
        ]);
        
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
