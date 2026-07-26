<?php
require_once 'db.php';

sendJson(['loggedIn' => isAuthenticated()]);
?>
