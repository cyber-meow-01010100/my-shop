<?php
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$id = $_GET['id'] ?? null;

if ($method === 'GET') {
    if ($id) {
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        if (!$row) sendJson(['error' => 'Not found'], 404);
        
        $row['featured'] = $row['featured'] == 1;
        $row['new_arrival'] = $row['new_arrival'] == 1;
        $row['best_seller'] = $row['best_seller'] == 1;
        $row['active'] = $row['status'] === 'published';
        $row['images'] = $row['images'] ? json_decode($row['images'], true) : [];
        
        sendJson($row);
    } else {
        $stmt = $db->query("SELECT * FROM products");
        $products = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $row['featured'] = $row['featured'] == 1;
            $row['new_arrival'] = $row['new_arrival'] == 1;
            $row['best_seller'] = $row['best_seller'] == 1;
            $row['active'] = $row['status'] === 'published';
            $row['images'] = $row['images'] ? json_decode($row['images'], true) : [];
            $products[] = $row;
        }
        sendJson($products);
    }
}

// Authentication required for POST, PUT, DELETE
if (!isAuthenticated()) {
    sendJson(['error' => 'Unauthorized'], 401);
}

$data = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    if (empty($data['name']) || !isset($data['price'])) {
        sendJson(['error' => 'Name and price are required'], 400);
    }
    
    $new_id = 'p' . uniqid();
    $status = isset($data['active']) && $data['active'] ? 'published' : 'draft';
    if (isset($data['status'])) $status = $data['status'];
    
    $stmt = $db->prepare("INSERT INTO products (
        id, name, category, price, discount_price, stock, sku, unit, origin, 
        description, details, status, images, featured, new_arrival, best_seller
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    
    $stmt->execute([
        $new_id,
        $data['name'],
        $data['category'] ?? null,
        $data['price'],
        $data['discount_price'] ?? null,
        $data['stock'] ?? 0,
        $data['sku'] ?? null,
        $data['unit'] ?? null,
        $data['origin'] ?? null,
        $data['description'] ?? null,
        $data['details'] ?? null,
        $status,
        isset($data['images']) ? json_encode($data['images']) : '[]',
        isset($data['featured']) && $data['featured'] ? 1 : 0,
        isset($data['new_arrival']) && $data['new_arrival'] ? 1 : 0,
        isset($data['best_seller']) && $data['best_seller'] ? 1 : 0
    ]);
    
    sendJson(['success' => true, 'id' => $new_id]);
}

if ($method === 'PUT') {
    if (!$id) sendJson(['error' => 'ID required'], 400);
    
    // Check if exists
    $stmt = $db->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->execute([$id]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row) sendJson(['error' => 'Not found'], 404);
    
    $updates = [];
    $params = [];
    
    // Explicit mappings for all updatable fields
    $fields = [
        'name', 'category', 'price', 'discount_price', 'stock', 'sku', 'unit', 
        'origin', 'description', 'details'
    ];
    
    foreach ($fields as $field) {
        if (array_key_exists($field, $data)) {
            $updates[] = "$field = ?";
            $params[] = $data[$field];
        }
    }
    
    if (array_key_exists('active', $data)) {
        $updates[] = "status = ?";
        $params[] = $data['active'] ? 'published' : 'draft';
    }
    if (array_key_exists('status', $data)) {
        $updates[] = "status = ?";
        $params[] = $data['status'];
    }
    if (array_key_exists('images', $data)) {
        $updates[] = "images = ?";
        $params[] = json_encode($data['images']);
    }
    if (array_key_exists('featured', $data)) {
        $updates[] = "featured = ?";
        $params[] = $data['featured'] ? 1 : 0;
    }
    
    if (empty($updates)) {
        sendJson(['success' => true]);
    }
    
    $params[] = $id;
    $sql = "UPDATE products SET " . implode(', ', $updates) . " WHERE id = ?";
    $db->prepare($sql)->execute($params);
    
    sendJson(['success' => true]);
}

if ($method === 'DELETE') {
    if (!$id) sendJson(['error' => 'ID required'], 400);
    $stmt = $db->prepare("DELETE FROM products WHERE id = ?");
    $stmt->execute([$id]);
    sendJson(['success' => true]);
}

sendJson(['error' => 'Method not allowed'], 405);
?>
