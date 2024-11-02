<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <title>Регистрация</title>
</head>
<body>
    <?php
    
    echo "<div class='registerWrapper'>";
        echo "<div class='registerBlock'>";
            echo "<form action='register.php' method='POST'>";
                echo "<label for='username'>Логин:</label>";
                echo "<input type='text' id='username' name='username' required><br><br>";
                echo "<label for='password'>Пароль:</label>";
                echo "<input type='password' id='password' name='password' required><br><br>";
                echo "<button type='submit'>Присоединится</button>";
            echo "</form>";
        echo "</div>";
    echo "</div>";
    
    ?>
</body>
</html>