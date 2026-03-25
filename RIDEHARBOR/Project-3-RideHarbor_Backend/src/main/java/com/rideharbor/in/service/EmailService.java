package com.rideharbor.in.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.rideharbor.in.entity.PaymentEntity;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendBookingMail(PaymentEntity payment) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("rideharbor.bookings@gmail.com");
        message.setTo(payment.getEmail());
        message.setSubject("Ride Harbor | Luxury Car Booking Confirmation");

        message.setText(
                "Dear " + payment.getName() + ",\n\n" +

                        "Thank you for choosing Ride Harbor.\n" +
                        "Your luxury car booking has been successfully confirmed.\n\n" +

                        "----------- BOOKING DETAILS -----------\n" +
                        "Car Model        : " + payment.getCar() + "\n" +
                        "Pickup Time      : " + payment.getPickupTime() + "\n" +
                        "Return Time      : " + payment.getReturnTime() + "\n" +
                        "Rental Duration  : " + payment.getDuration() + "\n" +
                        "Transaction ID   : " + payment.getTransactionId() + "\n" +
                        "Booking Amount   : ₹" + payment.getAmount() + "\n\n" +

                        "IMPORTANT INSTRUCTIONS\n" +
                        "• Please return the vehicle before the return time mentioned above.\n" +
                        "• Late returns may incur additional charges.\n\n" +

                        "Warm Regards,\n" +
                        "Ride Harbor Team\n" +
                        "Luxury Car Rentals | Hyderabad"
                    );
        mailSender.send(message);
    }

}