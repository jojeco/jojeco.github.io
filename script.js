var CINOSdescription =
  "This project is being built for a manager at a hotel, \
it utilizes a web application integrated with a database to create an automated solution. \
The application will allow the manager to create, edit, and delete employee accounts. \
The name CINOS stands for Clock In N Out System. The application will allow employees \
to clock in and out of work, and will also allow the manager to view the hours worked \
by each employee. The application will also allow the manager to generate reports. \
This will replace the current paper based system that the hotel is using. It will \
include an NFC card reader to further simplify the process for multilingual employees. \
The application is going to be built using HTML, CSS, JavaScript, PHP, and MySQL with a \
cloud-based server.";

var CODEdescription =
  "This sample is from an assignment I worked on for my web programming \
class. It is a simple web application that allows users to create an account and login. \
Once logged in, admins can edit, and delete users. The application is built using \
HTML, CSS, JavaScript, PHP, and MySQL. Below is the code for the registration page.";

var phpCode = `<?php
session_start();

if (isset($_SESSION['user'])) {
    header("Location: dashboard.php");
        exit();
}

include 'config.php';

$backgroundImages = [
    '1.jpg' => 'Image 1',
    '2.jpg' => 'Image 2',
    '3.jpg' => 'Image 3',
];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = $_POST['username'];
    $password = password_hash($_POST['password'], PASSWORD_BCRYPT);
    $background = $_POST['background'];

    // Check if the username is already taken
    $sql = "SELECT username FROM users WHERE username = '$username'";
    $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            echo "<script> alert('This username is already taken.') </script>";
            header("refresh:0; url=index.php");
            die();
        }

    // If the username is not taken, proceed with the registration
    $sql = "INSERT INTO users (username, password, background) VALUES ('$username', '$password', '$background')";

        if ($conn->query($sql) === TRUE) {
            echo "<script> alert('Registration successful. Click OK to redirect to the login page.') </script>";
            header("refresh:0; url=login.php");
        } else {
            echo "Error: " . $sql . "<br>" . $conn->error;
        }
    }
?>`;

var HTMLcode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Registration</title>
    <style>
        body {
            background-size: cover;
            background-position: center;
            height: 100vh;dmin
            margin: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Arial,sans-serif;
            background-image: url('1.jpg');
            font-weight: bold;
        }
    </style>
</head>
<body>
    <script src="https://code.jquery.com/jquery-3.6.4.min.js"></script>
    <form action="index.php" method="post">
    <center><h2>Register an Account</h2></center>
        Username: <input type="text" name="username" required><br \><br \>
        Password: <input type="password" name="password" required><br \><br \>
        Background:
        <select name="background" id="background" onchange="previewBackground()">
            <?php foreach ($backgroundImages as $imagePath => $imageName): ?>
                <option value="<?php echo $imagePath; ?>"><?php echo $imageName; ?></option>
            <?php endforeach; ?>
        </select>     
        <div id="preview"></div>
            </br>
        <center><input type="submit" value="Register"></center>
        <p>Already have an account? <a href="login.php">Log in</a></p>
    </form>

    <script>
        function previewBackground() {
            var selectedImage = $("#background").val();
            $("body").css("background-image","url('" + selectedImage + "')");
        }
    </script>
</body>
</html>`;

document.addEventListener("DOMContentLoaded", function () {
  const projects = [
    {
      name: "CINOS",
      description: CINOSdescription,
      image: "images/penta.png",
      subtext: "<em>Our Group/Company Logo</em>",
    },
    {
      name: "Web Application",
      description: CODEdescription,
      image: "",
      subtext: "<em>Code Snippet</em>",
      code1: phpCode,
      code2: HTMLcode,
    },
  ];

  // Add the projects to the page
  const projectList = document.getElementById("project-list");
  projects.forEach((project) => {
    const projectDiv = document.createElement("div");
    projectDiv.className = "project";
    if (project.image === "") {
      projectDiv.innerHTML = `<h3>${project.name}</h3><p>${
        project.description
      }</p>
          <pre><code class="language-php">${escapeHtml(
            project.code1
          )}</code></pre>
          <pre><code class="language-html">${escapeHtml(
            project.code2
          )}</code></pre>
          <p>${project.subtext}</p>`;
    } else {
      projectDiv.innerHTML = `<h3>${project.name}</h3><p>${project.description}</p>
          <img src="${project.image}" alt="${project.name}"><p>${project.subtext}</p><hr>`;
    }
    projectList.appendChild(projectDiv);

    // Highlights the code snippets
    Prism.highlightAll();

    // Toggle the navigation menu on mobile
    const menuToggle = document.querySelector(".menu-toggle");
    const navList = document.getElementById("main-nav");

    menuToggle.addEventListener("click", function () {
      console.log("Menu button clicked");
      navList.classList.toggle("show");
    });

    // Ensure the navigation reappears if the screen size is increased
    window.addEventListener("resize", function () {
      console.log("Window resized");
      if (window.innerWidth > 768) {
        navList.classList.add("show");
      } else {
        navList.classList.remove("show");
      }
    });

    // Check if the browser supports smooth scrolling
    if ("scrollBehavior" in document.documentElement.style) {
      // Smooth scrolling for anchor links
      document.querySelectorAll('nav a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener("click", function (e) {
          e.preventDefault();

          const target = document.querySelector(this.getAttribute("href"));
          if (target) {
            target.scrollIntoView({
              behavior: "smooth",
            });
          }
        });
      });
    }
  });

  function escapeHtml(html) {
    // Replace special characters with their HTML entities
    return html.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
});