<?php
session_start();

$db_file = __DIR__ . '/../database.sqlite';
$db = new PDO('sqlite:' . $db_file);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create admins table
$db->exec("CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
)");

// Create products table
$db->exec("CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    price REAL NOT NULL,
    discount_price REAL,
    stock INTEGER DEFAULT 0,
    sku TEXT,
    unit TEXT,
    origin TEXT,
    description TEXT,
    details TEXT,
    status TEXT DEFAULT 'draft',
    images TEXT,
    featured INTEGER DEFAULT 0,
    new_arrival INTEGER DEFAULT 0,
    best_seller INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)");

// Create default admin if not exists
$stmt = $db->prepare("SELECT COUNT(*) as count FROM admins WHERE username = 'admin'");
$stmt->execute();
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row['count'] == 0) {
    $password_hash = password_hash('@#$2003', PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO admins (username, password) VALUES ('admin', ?)");
    $stmt->execute([$password_hash]);
}

function isAuthenticated() {
    return isset($_SESSION['admin_logged_in']) && $_SESSION['admin_logged_in'] === true;
}

function sendJson($data, $status = 200) {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}
?>
