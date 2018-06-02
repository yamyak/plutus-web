<?php
$id = $_GET['id'];
$time = $_GET['time'];
$price = $_GET['price'];

# parse ini file for database information
$ini_array = parse_ini_file("db.ini");

# connect to database
$conn = mysqli_connect($ini_array['hostname'], $ini_array['username'], $ini_array['password'], $ini_array['database']);
if (mysqli_connect_errno()) 
{
  echo 'NO_CONNECTION';
  return;
}

# update holding entry to database
$sql = "UPDATE `holdings` SET `oldTime`='".$time."', `oldPrice`='".$price."' WHERE `holdingID`='".$id."'";
$res = mysqli_query($conn, $sql);
if (mysqli_connect_errno()) 
{
  echo 'QUERY_FAILED';
  return;
}

# close database connection
mysqli_close($conn);

echo 'SUCCESS';
?>