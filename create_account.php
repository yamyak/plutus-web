<?php
$user = $_GET['user'];
$key = $_GET['key'];

$ini_array = parse_ini_file("db.ini");

$conn = mysqli_connect($ini_array['hostname'], $ini_array['username'], $ini_array['password'], $ini_array['database']);
if (mysqli_connect_errno()) 
{
  echo 'NO_CONNECTION';
  return;
}

$sql = "SELECT * FROM `accounts` WHERE `username`='".$user."' OR `key`='".$key."'";
$res = mysqli_query($conn, $sql);
if (mysqli_connect_errno()) 
{
  echo 'QUERY_FAILED';
  return;
}

if(mysqli_num_rows($res) > 0)
{
  echo 'ACCOUNT_EXISTS';
  return;
}

$sql = "INSERT INTO `accounts` (`accountID`, `username`, `apiKey`) VALUES ('0', '".$user."', '".$key."')";
$res = mysqli_query($conn, $sql);
if (mysqli_connect_errno()) 
{
  echo 'QUERY_FAILED';
  return;
}

mysqli_close($conn);

echo 'SUCCESS';
?>