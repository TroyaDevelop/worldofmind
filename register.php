<?php

    if($_SERVER["REQUEST_METHOD"] == "POST"){
        include "dbconnect.php";

        $username = $_POST["username"];
        $password = $_POST["password"];

        if(!empty($username) && !empty($password)){
        $sql = "INSERT INTO users (username, password) VALUES ('$username', '$password')";
        if(mysqli_query($conn, $sql)){
            echo "Регистрация успещна";
            } else {
                echo "Ошибка регистрации!" . mysqli_error($conn);
        }
    } else {
        echo "Поля пустые!";
    }
}
?>