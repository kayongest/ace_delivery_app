<?php
// optimize_images.php

// Increase execution time and memory limit since image processing is heavy
ini_set('memory_limit', '512M');
set_time_limit(300);

$dir = __DIR__ . '/images/';
$backupDir = $dir . 'original_backup/';

if (!file_exists($backupDir)) {
    mkdir($backupDir, 0777, true);
}

$files = scandir($dir);
$optimizedCount = 0;
$skippedCount = 0;
$totalSavedBytes = 0;

echo "Starting image optimization...\n\n";

foreach ($files as $file) {
    if ($file === '.' || $file === '..' || is_dir($dir . $file)) {
        continue;
    }

    $filePath = $dir . $file;
    $backupPath = $backupDir . $file;
    $fileSize = filesize($filePath);
    $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));

    if (!in_array($ext, ['jpg', 'jpeg', 'png'])) {
        $skippedCount++;
        continue;
    }

    // Only optimize if file is larger than 150 KB
    if ($fileSize < 150 * 1024) {
        echo "Skipping $file (already small: " . round($fileSize / 1024, 2) . " KB)\n";
        $skippedCount++;
        continue;
    }

    echo "Optimizing $file (" . round($fileSize / 1024 / 1024, 2) . " MB)...\n";

    // Backup first if not already backed up
    if (!file_exists($backupPath)) {
        copy($filePath, $backupPath);
    }

    // Try to load image
    $srcImg = null;
    if ($ext === 'jpg' || $ext === 'jpeg') {
        $srcImg = @imagecreatefromjpeg($backupPath);
    } elseif ($ext === 'png') {
        $srcImg = @imagecreatefrompng($backupPath);
    }

    if (!$srcImg) {
        echo "Error: Could not load image $file. Skipping.\n";
        $skippedCount++;
        continue;
    }

    $width = imagesx($srcImg);
    $height = imagesy($srcImg);

    // Determine target dimensions (max width 800px)
    $maxWidth = 800;
    $newWidth = $width;
    $newHeight = $height;

    if ($width > $maxWidth) {
        $newWidth = $maxWidth;
        $newHeight = round(($height / $width) * $maxWidth);
    }

    // Create new image
    $dstImg = imagecreatetruecolor($newWidth, $newHeight);

    // Preserve transparency for PNGs
    if ($ext === 'png') {
        imagealphablending($dstImg, false);
        imagesavealpha($dstImg, true);
        $transparent = imagecolorallocatealpha($dstImg, 255, 255, 255, 127);
        imagefilledrectangle($dstImg, 0, 0, $newWidth, $newHeight, $transparent);
    }

    // Resize
    imagecopyresampled($dstImg, $srcImg, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

    // Save image back
    $success = false;
    if ($ext === 'jpg' || $ext === 'jpeg') {
        $success = imagejpeg($dstImg, $filePath, 75); // 75% quality
    } elseif ($ext === 'png') {
        $success = imagepng($dstImg, $filePath, 8); // Compression level 8 (0-9)
    }

    imagedestroy($srcImg);
    imagedestroy($dstImg);

    if ($success) {
        clearstatcache();
        $newSize = filesize($filePath);
        $saved = $fileSize - $newSize;
        $totalSavedBytes += $saved;
        $optimizedCount++;
        echo "Successfully optimized $file! Reduced from " . round($fileSize / 1024, 2) . " KB to " . round($newSize / 1024, 2) . " KB (Saved " . round($saved / 1024, 2) . " KB / " . round(($saved / $fileSize) * 100, 1) . "%)\n";
    } else {
        echo "Error saving optimized image $file.\n";
    }
}

echo "\nOptimization complete!\n";
echo "Optimized files: $optimizedCount\n";
echo "Skipped/Already optimized files: $skippedCount\n";
echo "Total bandwidth saved: " . round($totalSavedBytes / 1024 / 1024, 2) . " MB\n";
?>
