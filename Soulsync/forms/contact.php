<?php
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit('Method not allowed');
}

$receiving_email_address = 'riyamalik2019@gmail.com';

$name = isset($_POST['name']) ? trim(strip_tags($_POST['name'])) : '';
$email = isset($_POST['email']) ? trim(strip_tags($_POST['email'])) : '';
$phone = isset($_POST['phone']) ? trim(strip_tags($_POST['phone'])) : '';
$subject = isset($_POST['subject']) ? trim(strip_tags($_POST['subject'])) : 'Appointment Request';
$message = isset($_POST['message']) ? trim(strip_tags($_POST['message'])) : '';

if ($name === '' || $email === '' || $phone === '' || $message === '') {
  http_response_code(400);
  exit('Please fill in all required fields.');
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  exit('Please enter a valid email address.');
}

$phone_digits = preg_replace('/\D/', '', $phone);
if (strlen($phone_digits) === 12 && substr($phone_digits, 0, 2) === '91') {
  $phone_digits = substr($phone_digits, 2);
}
if (!preg_match('/^[6-9]\d{9}$/', $phone_digits)) {
  http_response_code(400);
  exit('Please enter a valid 10-digit Indian mobile number.');
}
$phone = $phone_digits;

$email_subject = 'Soulsync Appointment: ' . $subject;
$email_body = "You have received a new appointment request.\r\n\r\n";
$email_body .= "Name: $name\r\n";
$email_body .= "Email: $email\r\n";
$email_body .= "Contact Number: $phone\r\n";
$email_body .= "Subject: $subject\r\n\r\n";
$email_body .= "Message:\r\n$message\r\n";

$headers = "From: Soulsync Website <noreply@soulsync.local>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

if (mail($receiving_email_address, $email_subject, $email_body, $headers)) {
  echo 'OK';
} else {
  http_response_code(500);
  exit('Unable to send message. Please try again or call us directly.');
}
