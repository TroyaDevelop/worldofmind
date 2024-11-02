<?php

    $dbadress = "localhost";
    $dbuser = "root";
    $dbpass = "root";
    $dbname = "worldofmind";

    $conn = mysqli_connect($dbhost, $dbuser, $dbpass, $dbname);

    if(!$conn){
        echo "Ошибка подключения к базе данных!";
    }

?>