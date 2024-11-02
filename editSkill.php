<?php
    include "dbconnect.php";
    session_start();

    if($_SERVER["REQUEST_METHOD"] == "POST"){
        $articleId = $_SESSION["articleId"];
        $editedArticle = $_POST["article"];
        $editedCategory = $_POST["category"];
        $editedDescription = $_POST["description"];
        $editedText = $_POST["text"];
        $editedColor = $_POST['status'];

        $sql = "SELECT image FROM skills WHERE id = '$articleId'";
        $result = mysqli_query($conn, $sql);
        $row = mysqli_fetch_assoc($result);
        $currentImage = $row['image'];

        if(!empty($_FILES['image']['name'])){
            $image = $_FILES['image'];
            $imageName = basename($image['name']);
            $targetDir = 'img/';
            $targetFile = $targetDir . uniqid() . $imageName;

            $imageType = strtolower(pathinfo($targetFile, PATHINFO_EXTENSION));
            $validExtensions = ['jpg', 'jpeg', 'png', 'gif'];
            if(in_array($imageType, $validExtensions) && move_uploaded_file($image['tmp_name'], $targetFile)){
                if($currentImage && file_exists($currentImage)){
                    unlink($currentImage);
                }
                $sql = "UPDATE skills SET article = '$editedArticle', category = '$editedCategory', description = '$editedDescription', text = '$editedText', color = '$editedColor', image = '$targetFile' WHERE id = '$articleId'";
            } else {
                echo "Ошибка при загрузке изображения.";
                exit;
            }
        } else {
            $sql = "UPDATE skills SET article = '$editedArticle', category = '$editedCategory', description = '$editedDescription', text = '$editedText', color = '$editedColor' WHERE id = '$articleId'";
        }

        if(mysqli_query($conn, $sql)){
            echo "Навык успешно изменен!";
        } else {
            echo "Ошибка!";
        }
    }

?>