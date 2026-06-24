<?php
header("Content-Type: application/json");
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");
require_once '../db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("
            SELECT m.*, 
                   COALESCE(AVG(r.rating), 0) as avg_rating, 
                   COUNT(r.id) as review_count 
            FROM menu m 
            LEFT JOIN reviews r ON m.id = r.menu_id 
            GROUP BY m.id
        ");
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        break;
        
    case 'POST':
        // Handle both Add new item and Update existing item because of FormData
        $id = isset($_POST['id']) ? $_POST['id'] : null;
        $name = $_POST['name'] ?? '';
        $category = $_POST['category'] ?? '';
        $price = $_POST['price'] ?? 0;
        $description = $_POST['description'] ?? '';
        
        $imagePath = null;
        
        // Handle file upload
        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = '../images/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            
            $fileExtension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            if (empty($fileExtension)) {
                $mimeType = mime_content_type($_FILES['image']['tmp_name']);
                $extensions = [
                    'image/jpeg' => 'jpg',
                    'image/png'  => 'png',
                    'image/gif'  => 'gif',
                    'image/webp' => 'webp'
                ];
                $fileExtension = isset($extensions[$mimeType]) ? $extensions[$mimeType] : 'png';
            }
            // Securely generate a unique filename
            $newFileName = uniqid('menu_item_') . '.' . $fileExtension;
            $destination = $uploadDir . $newFileName;
            
            if (move_uploaded_file($_FILES['image']['tmp_name'], $destination)) {
                $imagePath = 'images/' . $newFileName;
            } else {
                http_response_code(500);
                echo json_encode(['status' => 'error', 'message' => 'Failed to move uploaded file']);
                exit;
            }
        }
        
        if ($id) {
            // Update an existing item
            if ($imagePath) {
                // If a new image was uploaded, update the image field too
                $stmt = $pdo->prepare("UPDATE menu SET name=:name, price=:price, category=:category, description=:description, image=:image WHERE id=:id");
                $params = [
                    ':name' => $name,
                    ':price' => $price,
                    ':category' => $category,
                    ':description' => $description,
                    ':image' => $imagePath,
                    ':id' => $id
                ];
            } else {
                // Update without changing the existing image
                $stmt = $pdo->prepare("UPDATE menu SET name=:name, price=:price, category=:category, description=:description WHERE id=:id");
                $params = [
                    ':name' => $name,
                    ':price' => $price,
                    ':category' => $category,
                    ':description' => $description,
                    ':id' => $id
                ];
            }
            $updated = $stmt->execute($params);
            
            if ($updated) {
                echo json_encode(['status' => 'success']);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Item not found or no changes made']);
            }
        } else {
            // Insert a new item
            if (!$imagePath) {
                $imagePath = 'images/ace_cafe.png'; // fallback default
            }
            
            $stmt = $pdo->prepare("INSERT INTO menu (name, price, category, description, image) VALUES (:name, :price, :category, :description, :image)");
            $stmt->execute([
                ':name' => $name,
                ':price' => $price,
                ':category' => $category,
                ':description' => $description,
                ':image' => $imagePath
            ]);
            
            echo json_encode(['status' => 'success', 'id' => $pdo->lastInsertId()]);
        }
        break;
        
    case 'DELETE':
        // Delete an item
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM menu WHERE id=:id");
            $stmt->execute([':id' => $id]);
            if ($stmt->rowCount() > 0) {
                echo json_encode(['status' => 'success']);
            } else {
                http_response_code(404);
                echo json_encode(['status' => 'error', 'message' => 'Item not found']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['status' => 'error', 'message' => 'ID not provided']);
        }
        break;
}
?>
