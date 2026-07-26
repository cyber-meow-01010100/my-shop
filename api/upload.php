<?php
require_once 'db.php';

if (!isAuthenticated()) {
    sendJson(['error' => 'Unauthorized'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJson(['error' => 'Method not allowed'], 405);
}

if (empty($_FILES['images'])) {
    sendJson(['error' => 'No files uploaded.'], 400);
}

$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filePaths = [];

// $_FILES['images'] can be a single file or array of files
$files = $_FILES['images'];
if (is_array($files['name'])) {
    for ($i = 0; $i < count($files['name']); $i++) {
        if ($files['error'][$i] === UPLOAD_ERR_OK) {
            $tmpName = $files['tmp_name'][$i];
            $name = basename($files['name'][$i]);
            $uniqueName = uniqid() . '_' . $name;
            if (move_uploaded_file($tmpName, $uploadDir . $uniqueName)) {
                $filePaths[] = '/uploads/' . $uniqueName;
            }
        }
    }
} else {
    if ($files['error'] === UPLOAD_ERR_OK) {
        $tmpName = $files['tmp_name'];
        $name = basename($files['name']);
        $uniqueName = uniqid() . '_' . $name;
        if (move_uploaded_file($tmpName, $uploadDir . $uniqueName)) {
            $filePaths[] = '/uploads/' . $uniqueName;
        }
    }
}

if (empty($filePaths)) {
    sendJson(['error' => 'Failed to upload files.'], 500);
}

sendJson(['filePaths' => $filePaths]);
?>
