package com.devflow.backend.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
@Service
public class EmailService {
    private final JavaMailSender mailSender;
    @Value("${spring.mail.username}")
    private String senderEmail;
    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }
    public void sendOtpEmail(String recipientEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(recipientEmail);
        message.setSubject("DevFlow - Your Login Verification Code");
        message.setText(
                "Hello,\n\n" +
                "Your DevFlow login verification code is: " + otp + "\n\n" +
                "This code expires in 5 minutes. Do not share it with anyone.\n\n" +
                "If you did not request this code, please ignore this email.\n\n" +
                "Regards,\nDevFlow Team"
        );

        mailSender.send(message);
    }
}
