<?php
require_once 'db.php';
$stmt = $pdo->query('SELECT name FROM menu ORDER BY name');
while ($row = $stmt->fetch()) {
    echo "- " . $row['name'] . "\n";
}
?>
