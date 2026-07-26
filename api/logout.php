<?php
require_once 'db.php';

session_destroy();
sendJson(['success' => true]);
?>
