<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <title>Редактировать навык</title>
</head>
<body>
<div class="wrapper">
    <?php
    include "header.php";
    include "dbconnect.php";
    session_start();
    $_SESSION["articleId"] = $_GET["id"];
    $articleId = $_GET['id'];
    $sql = "SELECT * FROM skills WHERE id = '$articleId'";
    $result = mysqli_query($conn, $sql);
    $row = mysqli_fetch_assoc($result);
    echo "<div class='addSkillWrapper'>";
        echo "<div class='addSkillBlock'>";
            echo "<form action='editSkill.php' method='POST' enctype='multipart/form-data'>";
                echo "<label for='article'>Название:</label><br>";
                echo "<input type='text' id='article' name='article' value='" . $row["article"] . "'required><br><br>";
                echo "<label for='category'>Категория:</label><br>";
                echo "<input type='text' id='category' name='category' value='" . $row["category"] . "' required><br><br>";
                echo "<label for='description'>Краткое описание:</label><br>";
                echo "<textarea class='skillDesc'id='description' name='description' required>" . $row["description"] . "</textarea><br><br>";
                echo "<label for='text'>Текст навыка:</label><br>";
                echo "<textarea class='skillText'id='text' name='text' required>" . $row["text"] . "</textarea><br><br>";
                echo "<input type='file' name='image' id='image' accept='image/*'><br><br>";
                echo "<select id='status' name='status'>";
                echo "<option value='#FDFF73'>В процессе</option>";
                echo "<option value='#67E667'>Изучено</option>";
                echo "</select>";
                echo "<button type='submit'>Редактировать</button>";
            echo "</form>";
        echo "</div>";
    echo "</div>";
    ?>
    </div>
</body>
</html>