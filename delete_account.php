<?php
$user = $_GET['user'];

$ini_array = parse_ini_file("db.ini");

$conn = mysqli_connect($ini_array['hostname'], $ini_array['username'], $ini_array['password'], $ini_array['database']);
if (mysqli_connect_errno()) 
{
  echo 'NO_CONNECTION';
  return;
}

$sql = "DELETE FROM `accounts` WHERE `username`='".$user."'";
$res = mysqli_query($conn, $sql);
if (mysqli_connect_errno()) 
{
  echo 'QUERY_FAILED';
  return;
}

mysqli_close($conn);

echo 'SUCCESS';
?>