<?php
require_once '../db.php';
session_start();

// Admin check
if (!isset($_SESSION['user_id']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit;
}

$range = isset($_GET['range']) ? $_GET['range'] : 'today';

$dateCondition = "";
if ($range === 'today') {
    $dateCondition = "DATE(created_at) = CURDATE()";
} elseif ($range === '7days') {
    $dateCondition = "created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
} elseif ($range === 'month') {
    $dateCondition = "MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())";
} else {
    // alltime
    $dateCondition = "1=1";
}

$response = [
    'status' => 'success',
    'range' => $range,
    'metrics' => [
        'total_revenue' => 0,
        'total_orders' => 0,
        'average_order_value' => 0,
        'total_users' => 0,
        'new_users' => 0,
        'popular_category' => 'None'
    ],
    'top_items' => [],
    'chart_data' => []
];

try {
    // 1. Order Metrics
    $stmt = $pdo->prepare("SELECT COUNT(id) as total_orders, SUM(total_amount) as total_revenue FROM orders WHERE $dateCondition");
    $stmt->execute();
    $ordersData = $stmt->fetch();
    
    $response['metrics']['total_orders'] = (int)$ordersData['total_orders'];
    $response['metrics']['total_revenue'] = (int)$ordersData['total_revenue'];
    $response['metrics']['average_order_value'] = $response['metrics']['total_orders'] > 0 
        ? round($response['metrics']['total_revenue'] / $response['metrics']['total_orders']) 
        : 0;

    // 2. User Metrics
    $stmtUsers = $pdo->query("SELECT COUNT(id) as total FROM users");
    $response['metrics']['total_users'] = (int)$stmtUsers->fetch()['total'];

    $stmtNewUsers = $pdo->prepare("SELECT COUNT(id) as new_users FROM users WHERE $dateCondition");
    $stmtNewUsers->execute();
    $response['metrics']['new_users'] = (int)$stmtNewUsers->fetch()['new_users'];

    // 3. Top Selling Items
    $stmtItems = $pdo->prepare("
        SELECT m.name, SUM(oi.quantity) as qty, SUM(oi.price * oi.quantity) as rev 
        FROM order_items oi 
        JOIN menu m ON oi.menu_id = m.id 
        JOIN orders o ON oi.order_id = o.id 
        WHERE " . str_replace("created_at", "o.created_at", $dateCondition) . "
        GROUP BY m.id 
        ORDER BY qty DESC 
        LIMIT 5
    ");
    $stmtItems->execute();
    $response['top_items'] = $stmtItems->fetchAll(PDO::FETCH_ASSOC);

    // 4. Most Popular Category
    $stmtCategory = $pdo->prepare("
        SELECT m.category, SUM(oi.quantity) as qty 
        FROM order_items oi 
        JOIN menu m ON oi.menu_id = m.id 
        JOIN orders o ON oi.order_id = o.id 
        WHERE " . str_replace("created_at", "o.created_at", $dateCondition) . "
        GROUP BY m.category 
        ORDER BY qty DESC 
        LIMIT 1
    ");
    $stmtCategory->execute();
    $catData = $stmtCategory->fetch();
    if ($catData) {
        $response['metrics']['popular_category'] = $catData['category'];
    }

    // 5. Chart Data (Group by Date)
    $stmtChart = $pdo->prepare("
        SELECT DATE(created_at) as date, SUM(total_amount) as revenue, COUNT(id) as orders 
        FROM orders 
        WHERE $dateCondition 
        GROUP BY DATE(created_at) 
        ORDER BY date ASC
    ");
    $stmtChart->execute();
    $response['chart_data'] = $stmtChart->fetchAll(PDO::FETCH_ASSOC);

    // 6. Sales by Category
    $stmtCatSales = $pdo->prepare("
        SELECT m.category, SUM(oi.price * oi.quantity) as revenue
        FROM order_items oi
        JOIN menu m ON oi.menu_id = m.id
        JOIN orders o ON oi.order_id = o.id
        WHERE " . str_replace("created_at", "o.created_at", $dateCondition) . "
        GROUP BY m.category
    ");
    $stmtCatSales->execute();
    $response['category_sales'] = $stmtCatSales->fetchAll(PDO::FETCH_ASSOC);

    // 7. Peak Hours
    $stmtHours = $pdo->prepare("
        SELECT HOUR(created_at) as hour, COUNT(id) as orders
        FROM orders
        WHERE $dateCondition
        GROUP BY HOUR(created_at)
        ORDER BY hour ASC
    ");
    $stmtHours->execute();
    $response['peak_hours'] = $stmtHours->fetchAll(PDO::FETCH_ASSOC);

    // 8. Customer Retention
    $stmtRetention = $pdo->prepare("
        SELECT 
            CASE WHEN (SELECT COUNT(id) FROM orders o2 WHERE o2.user_id = orders.user_id AND o2.created_at < orders.created_at) > 0 
            THEN 'Returning' ELSE 'New' END as type,
            COUNT(id) as count
        FROM orders
        WHERE $dateCondition
        GROUP BY type
    ");
    $stmtRetention->execute();
    $response['retention'] = $stmtRetention->fetchAll(PDO::FETCH_ASSOC);

    // 9. Order Status Breakdown
    $stmtStatus = $pdo->prepare("
        SELECT status, COUNT(id) as count
        FROM orders
        WHERE $dateCondition
        GROUP BY status
    ");
    $stmtStatus->execute();
    $response['order_status'] = $stmtStatus->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($response);
} catch (PDOException $e) {
    echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
}
