<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="./css/style.css">
    <title>Document</title>
</head>
<body>
    <?php
    include "dbconnect.php";
    include "header.php";
    session_start();
    if(!isset($_SESSION["username"])){
        include "loginBlock.php";
    } else {
        $userId = $_SESSION['id'];
        echo "<form class='search' action='search.php' method='POST'>";
        echo "<input type='text' name='search' id='search'>";
        echo "<button type='submit'>Поиск</button>";
        echo "</form>";
        echo "<div class='skillsWrapper'>";
        echo "<div class='skillBlock'>";
        $sql = "SELECT * FROM skills WHERE userId = '$userId' AND category != 'Развлечения'";
        $result = mysqli_query($conn, $sql);
        if(mysqli_num_rows($result) > 0){
            for($i = 0; $i < mysqli_num_rows($result); $i++){
                $row = mysqli_fetch_assoc($result);
                echo "<div class='skill' style='background-color: " . $row['color'] . "'>";
                echo "<h4>" . $row["article"] . "</h4>";
                echo "<p>" . $row["category"] . "</p>";
                echo "<p>" . $row["description"] . "</p>";
                echo "<a href='article.php?id=" . $row["id"] . "'>Подробнее</a>";
                echo "</div>";
            }
        }
        echo "</div>";
    }
    echo "</div>";
    
    ?>
</body>
</html>