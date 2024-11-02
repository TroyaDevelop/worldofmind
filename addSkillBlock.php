<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <title>Добавить навык</title>
</head>
<body>
<div class="wrapper">
    <?php
    include "header.php";
    
    echo "<div class='addSkillWrapper'>";
        echo "<div class='addSkillBlock'>";
            echo "<form action='addskill.php' method='POST'>";
                echo "<label for='article'>Название:</label><br>";
                echo "<input type='text' id='article' name='article' required><br><br>";
                echo "<label for='category'>Категория:</label><br>";
                echo "<input type='text' id='category' name='category' required><br><br>";
                echo "<label for='description'>Краткое описание:</label><br>";
                echo "<textarea class='skillDesc'id='description' name='description' required></textarea><br><br>";
                echo "<button type='submit'>Добавить</button>";
            echo "</form>";
        echo "</div>";
    echo "</div>";
    
    ?>
    </div>
</body>
</html>