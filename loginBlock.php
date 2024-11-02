<?php
    echo "<div class='loginWrapper'>";
        echo "<div class='loginBlock'>";
            echo "<form action='login.php' method='POST'>";
                echo "<label for='username'>Логин:</label>";
                echo "<input type='text' id='username' name='username' required><br><br>";
                echo "<label for='password'>Пароль:</label>";
                echo "<input type='password' id='password' name='password' required><br><br>";
                echo "<a href='registerBlock.php'>Присоединится </a>";
                echo "<button type='submit'>Войти</button>";
            echo "</form>";
            echo "</div>";
    echo "</div>";
?>
