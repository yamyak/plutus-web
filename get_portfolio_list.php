<?php
$user = $_GET['user'];

$ini_array = parse_ini_file("db.ini");

$conn = mysqli_connect($ini_array['hostname'], $ini_array['username'], $ini_array['password'], $ini_array['database']);
if (mysqli_connect_errno()) 
{
  return;
}

$sql = "SELECT `name` FROM `portfolios` WHERE `accountKey`=(SELECT `accountID` FROM `accounts` WHERE `username`='".$user."')";
$res = mysqli_query($conn, $sql);
if (mysqli_connect_errno()) 
{
  return;
}

if(mysqli_num_rows($res) > 0)
{
  $a = array();
  while($row = mysqli_fetch_assoc($res))
  {
    $cmd = '<li><a id="' . $row["name"] . '" onclick="displayPortfolio(\'' . $row["name"] . '\')" class="dropdown-item">' . $row["name"] . '</a></li>';
    array_push($a, array($row["name"], $cmd));
  }
}

echo json_encode($a);

mysqli_close($conn);
?>