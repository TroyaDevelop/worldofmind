<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <title>Статья</title>
</head>
<body>
    <div class="wrapper">
        <?php
        include "dbconnect.php";
        include "header.php";
        session_start();

        if (isset($_GET['id'])) {
            $articleId = $_GET['id'];
            $sql = "SELECT * FROM skills WHERE id = '$articleId'";
            $result = mysqli_query($conn, $sql);
            if (mysqli_num_rows($result) > 0) {
                $row = mysqli_fetch_assoc($result);
                echo "<div class='article'>";
                echo "<h1>" . $row["article"] . "</h1>";
                echo "<p>" . nl2br($row["text"]) . "</p>";
                if(!empty($row['image'])){
                    echo "<img src='" . $row["image"] . "'><br>";
                }
                echo "<a href='editSkillBlock.php?id=" . $articleId . "'>Редактировать</a><br>";
                echo "<a href='delete.php?id=" . $articleId . "'>Удалить</a>";
                echo "</div>";
            } else {
                echo "<p>Статья не найдена.</p>";
            }
        } else {
            echo "<p>No article ID provided.</p>";
        }
        ?>

    </div>
</body>
</html>