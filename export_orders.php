<?php
require_once 'db.php';
$stmt = $pdo->query('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
