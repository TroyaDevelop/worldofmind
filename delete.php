<?php

    include "dbconnect.php";

    if (isset($_GET['id'])) {
        $articleId = $_GET['id'];

        $sql = "DELETE FROM skills WHERE id = '$articleId'";
        if(mysqli_query($conn, $sql)) {
            header("Location: index.php");
            exit;
        }
    }

?>