<?php

    if($_SERVER["REQUEST_METHOD"] == "POST") {
        include "dbconnect.php";
        $username = $_POST["username"];
        $password = $_POST["password"];

        $sql = "SELECT * FROM users WHERE username = '$username'";
        $result = mysqli_query($conn, $sql);

        if(mysqli_num_rows($result) > 0) {
            $row = mysqli_fetch_assoc($result);
            $pass = $row["password"];
            if($pass == $password) {
                session_start();
                $_SESSION["id"] = $row["id"];
                $_SESSION["username"] = $row["username"];
                $_SESSION["password"] = $row["password"];
                header("Location: index.php");
                exit;
            } else {
                echo "Неверный пароль!";
            }
        } else {
            echo "Пользователя не существует!";
        }
    }

?>