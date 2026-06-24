<?php
require_once 'db.php';

try {
    // Add profile_image column if it doesn't exist
    $pdo->exec("ALTER TABLE users ADD COLUMN profile_image VARCHAR(255) NULL AFTER role");
    echo "Successfully added 'profile_image' to users table.<br>";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "'profile_image' already exists.<br>";
    } else {
        die("Error altering users table: " . $e->getMessage());
    }
}
?>
