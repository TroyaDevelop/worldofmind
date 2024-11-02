<?php
    session_start();
    echo "<div class='headerWrapper'>";
    echo "<div class='header'>";
    if($_SESSION["username"]){
        echo "<div class='header_wrapper'>";
            echo "<a href='index.php'>Главная</a>";
            echo "<a href='addSkillBlock.php'>&nbspДобавить навык</a>";
        echo "</div>";
        echo "<div class='header_wrapper'>";
            echo "Здравстуйте," . $_SESSION["username"];
            echo "<a href='logout.php'>&nbspВыйти</a>";
        echo "</div>";
    } else {
        echo "Добро пожаловать в вашу личную базу знаний!";
    }
    echo "</div>";
    echo "</div>";

?>