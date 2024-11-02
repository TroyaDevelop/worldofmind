<?php

    if($_SERVER["REQUEST_METHOD"] == "POST"){
        include "dbconnect.php";
        session_start();
        $userId = $_SESSION["id"];
        $article = $_POST["article"];
        $category = $_POST["category"];
        $description = $_POST["description"];

        if(!empty($article) && !empty($category) && !empty($description)){
            $sql = "INSERT INTO skills (userId, article, category, description) VALUES ('$userId', '$article', '$category', '$description')";
            if(mysqli_query($conn, $sql)){
                echo "Навык успешно добавлен!";
            } else {
                echo "Ошибка!" . mysqli_error($conn);
            } 
        }   else {
            echo "Поля пустые!";
        }
    }

?>