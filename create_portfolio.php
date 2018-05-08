<?php
$user = $_GET['user'];
$name = $_GET['name'];

$ini_array = parse_ini_file("db.ini");

$conn = mysqli_connect($ini_array['hostname'], $ini_array['username'], $ini_array['password'], $ini_array['database']);
if (mysqli_connect_errno()) 
{
  echo 'NO_CONNECTION';
  return;
}

$sql = "SELECT * FROM `portfolios` WHERE `name`='".$name."'";
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

$sql_select = "SELECT `accountID` FROM `accounts` WHERE `username`='".$user."'";
$sql = "INSERT INTO `portfolios` (`portfolioID`, `name`, `accountKey`) VALUES ('0', '".$name."', (".$sql_select."))";
$res = mysqli_query($conn, $sql);
if (mysqli_connect_errno()) 
{
  echo 'QUERY_FAILED';
  return;
}

mysqli_close($conn);

echo 'SUCCESS';
?>