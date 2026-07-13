<?php
header("Content-Type: application/json");
require_once '../db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['name'], $data['phone'], $data['address'], $data['items']) || empty($data['items'])) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid order data.']);
        exit;
    }

    $paymentMethod = isset($data['payment_method']) ? $data['payment_method'] : 'cod';
    if (!in_array($paymentMethod, ['cod', 'card', 'mobile_money'])) {
        $paymentMethod = 'cod';
    }

    try {
        $pdo->beginTransaction();

        // Validate stock and availability
        $stockCheckStmt = $pdo->prepare("SELECT name, track_stock, stock_quantity, is_available FROM menu WHERE id = :id FOR UPDATE");
        $recipeStmt = $pdo->prepare("
            SELECT r.inventory_item_id, r.quantity_required, i.name, i.current_quantity, i.unit 
            FROM recipes r
            JOIN inventory_items i ON r.inventory_item_id = i.id
            WHERE r.menu_id = :menu_id FOR UPDATE
        ");

        $ingredientsRequired = [];

        foreach ($data['items'] as $item) {
            $itemId = intval($item['id']);
            $qtyOrdered = intval($item['quantity']);
            
            $stockCheckStmt->execute([':id' => $itemId]);
            $menuItem = $stockCheckStmt->fetch(PDO::FETCH_ASSOC);
            
            if (!$menuItem) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Item not found in menu.']);
                $pdo->rollBack();
                exit;
            }
            
            if ($menuItem['is_available'] == 0) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => "Sorry, '{$menuItem['name']}' is currently out of stock."]);
                $pdo->rollBack();
                exit;
            }
            
            if ($menuItem['track_stock'] == 1) {
                if ($menuItem['stock_quantity'] < $qtyOrdered) {
                    http_response_code(400);
                    echo json_encode(['status' => 'error', 'message' => "Sorry, only {$menuItem['stock_quantity']} of '{$menuItem['name']}' is left in stock."]);
                    $pdo->rollBack();
                    exit;
                }
            }

            // Aggregate ingredient requirements
            $recipeStmt->execute([':menu_id' => $itemId]);
            $recipeIngredients = $recipeStmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($recipeIngredients as $ri) {
                $invId = intval($ri['inventory_item_id']);
                if (!isset($ingredientsRequired[$invId])) {
                    $ingredientsRequired[$invId] = [
                        'id' => $invId,
                        'name' => $ri['name'],
                        'unit' => $ri['unit'],
                        'current_quantity' => floatval($ri['current_quantity']),
                        'total_required' => 0.00
                    ];
                }
                $ingredientsRequired[$invId]['total_required'] += floatval($ri['quantity_required']) * $qtyOrdered;
            }
        }

        // Validate recipe ingredient levels
        foreach ($ingredientsRequired as $invId => $ing) {
            if ($ing['current_quantity'] < $ing['total_required']) {
                http_response_code(400);
                echo json_encode([
                    'status' => 'error', 
                    'message' => "Sorry, we do not have enough ingredients ({$ing['name']}) to prepare this order. Required: {$ing['total_required']} {$ing['unit']}, in stock: {$ing['current_quantity']} {$ing['unit']}."
                ]);
                $pdo->rollBack();
                exit;
            }
        }

        $subtotal = 0;
        foreach ($data['items'] as $item) {
            $price = isset($item['price']) ? floatval($item['price']) : 0;
            $qty = isset($item['quantity']) ? intval($item['quantity']) : 1;
            $subtotal += $price * $qty;
        }

        session_start();
        $userId = isset($_SESSION['user_id']) ? $_SESSION['user_id'] : null;

        // 1. Process Coupon
        $couponCode = isset($data['coupon_code']) ? trim($data['coupon_code']) : null;
        $couponDiscount = 0;
        if ($couponCode) {
            $couponStmt = $pdo->prepare("SELECT * FROM coupons WHERE code = :code AND active = 1");
            $couponStmt->execute([':code' => $couponCode]);
            $coupon = $couponStmt->fetch(PDO::FETCH_ASSOC);
            if ($coupon && $subtotal >= floatval($coupon['min_order_amount'])) {
                if ($coupon['type'] === 'flat') {
                    $couponDiscount = intval($coupon['value']);
                } elseif ($coupon['type'] === 'percent') {
                    $couponDiscount = floor($subtotal * (intval($coupon['value']) / 100));
                }
            } else {
                $couponCode = null; // Invalidate if requirements not met
            }
        }

        // 2. Process Loyalty Points
        $redeemPoints = isset($data['redeem_points']) && intval($data['redeem_points']) === 1;
        $pointsRedeemed = 0;
        $loyaltyDiscount = 0;
        if ($redeemPoints && $userId) {
            $userStmt = $pdo->prepare("SELECT points FROM users WHERE id = :id");
            $userStmt->execute([':id' => $userId]);
            $userPoints = intval($userStmt->fetchColumn());

            if ($userPoints > 0) {
                $remainingTotal = max(0, $subtotal - $couponDiscount);
                $maxPointsRedeemable = ceil($remainingTotal / 10);
                $pointsRedeemed = min($userPoints, $maxPointsRedeemable);
                $loyaltyDiscount = $pointsRedeemed * 10;
            }
        }

        $totalDiscount = $couponDiscount + $loyaltyDiscount;
        $totalAmount = max(0, $subtotal - $totalDiscount);

        $paymentStatus = ($paymentMethod === 'card') ? 'paid' : 'pending';
        $pointsEarned = floor($totalAmount / 100);

        $lat = isset($data['latitude']) && $data['latitude'] !== '' ? floatval($data['latitude']) : null;
        $lng = isset($data['longitude']) && $data['longitude'] !== '' ? floatval($data['longitude']) : null;

        $stmt = $pdo->prepare("INSERT INTO orders (user_id, customer_name, phone, address, total_amount, payment_method, payment_status, points_earned, coupon_code, discount_amount, points_redeemed, latitude, longitude) VALUES (:user_id, :name, :phone, :address, :total, :payment_method, :payment_status, :points_earned, :coupon_code, :discount_amount, :points_redeemed, :latitude, :longitude)");
        $stmt->execute([
            ':user_id' => $userId,
            ':name' => $data['name'],
            ':phone' => $data['phone'],
            ':address' => $data['address'],
            ':total' => $totalAmount,
            ':payment_method' => $paymentMethod,
            ':payment_status' => $paymentStatus,
            ':points_earned' => $pointsEarned,
            ':coupon_code' => $couponCode,
            ':discount_amount' => $totalDiscount,
            ':points_redeemed' => $pointsRedeemed,
            ':latitude' => $lat,
            ':longitude' => $lng
        ]);
        
        $orderId = $pdo->lastInsertId();
        
        $itemStmt = $pdo->prepare("INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (:order_id, :menu_id, :quantity, :price)");
        $updateStockStmt = $pdo->prepare("UPDATE menu SET stock_quantity = stock_quantity - :qty WHERE id = :id AND track_stock = 1");
        
        foreach ($data['items'] as $item) {
            $itemId = intval($item['id']);
            $qtyOrdered = intval($item['quantity']);
            $itemStmt->execute([
                ':order_id' => $orderId,
                ':menu_id' => $itemId,
                ':quantity' => $qtyOrdered,
                ':price' => $item['price']
            ]);
            
            $updateStockStmt->execute([
                ':qty' => $qtyOrdered,
                ':id' => $itemId
            ]);
        }

        // Deduct recipe ingredients and apply FIFO batch consumption
        if (!empty($ingredientsRequired)) {
            $updateInvStmt = $pdo->prepare("UPDATE inventory_items SET current_quantity = current_quantity - :qty WHERE id = :id");
            $logTransStmt = $pdo->prepare("INSERT INTO inventory_transactions (inventory_item_id, type, quantity, note) VALUES (:id, 'sale', :qty, :note)");
            
            $batchSelectStmt = $pdo->prepare("SELECT id, quantity_remaining FROM inventory_batches WHERE inventory_item_id = :id AND quantity_remaining > 0 ORDER BY expiration_date ASC, received_date ASC FOR UPDATE");
            $batchUpdateStmt = $pdo->prepare("UPDATE inventory_batches SET quantity_remaining = :qty WHERE id = :id");

            foreach ($ingredientsRequired as $invId => $ing) {
                // Deduct from main inventory
                $updateInvStmt->execute([
                    ':qty' => $ing['total_required'],
                    ':id' => $invId
                ]);
                
                // Log transaction
                $logTransStmt->execute([
                    ':id' => $invId,
                    ':qty' => -$ing['total_required'],
                    ':note' => "Deducted for Order #$orderId"
                ]);
                
                // FIFO Batch deduction
                $batchSelectStmt->execute([':id' => $invId]);
                $batches = $batchSelectStmt->fetchAll(PDO::FETCH_ASSOC);
                
                $remainingToDeduct = $ing['total_required'];
                foreach ($batches as $batch) {
                    if ($remainingToDeduct <= 0) break;
                    
                    $batchId = intval($batch['id']);
                    $qtyRemaining = floatval($batch['quantity_remaining']);
                    
                    if ($qtyRemaining >= $remainingToDeduct) {
                        $batchUpdateStmt->execute([
                            ':qty' => $qtyRemaining - $remainingToDeduct,
                            ':id' => $batchId
                        ]);
                        $remainingToDeduct = 0;
                    } else {
                        $remainingToDeduct -= $qtyRemaining;
                        $batchUpdateStmt->execute([
                            ':qty' => 0.00,
                            ':id' => $batchId
                        ]);
                    }
                }
            }
        }

        if ($userId) {
            $netPoints = $pointsEarned - $pointsRedeemed;
            if ($netPoints !== 0) {
                $updatePoints = $pdo->prepare("UPDATE users SET points = points + :points WHERE id = :id");
                $updatePoints->execute([':points' => $netPoints, ':id' => $userId]);
            }
        }

        $pdo->commit();
        echo json_encode(['status' => 'success', 'order_id' => $orderId]);
    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Failed to process order: ' . $e->getMessage()]);
    }
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed.']);
}
?>
