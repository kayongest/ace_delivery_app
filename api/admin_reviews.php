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
        $stmt = $pdo->query("
            SELECT r.id, r.rating, r.review_text, r.created_at, 
                   u.full_name as customer_name, u.email as customer_email, 
                   m.name as menu_item_name 
            FROM reviews r 
            LEFT JOIN users u ON r.user_id = u.id 
            LEFT JOIN menu m ON r.menu_id = m.id 
            ORDER BY r.created_at DESC
        ");
        $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['status' => 'success', 'data' => $reviews]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to fetch reviews: ' . $e->getMessage()]);
    }
} elseif ($method === 'DELETE') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    if (!isset($data['id'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Missing review id.']);
        exit;
    }
    
    try {
        $stmt = $pdo->prepare("DELETE FROM reviews WHERE id = :id");
        $stmt->execute([':id' => $data['id']]);
        echo json_encode(['status' => 'success', 'message' => 'Review deleted successfully.']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to delete review: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
