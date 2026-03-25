package com.rideharbor.in.service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class TwilioService {

    @Value("${twilio.phone.number}")
    private String fromNumber;

    public void sendOtp(String toMobileNumber, String otp) {
        // Twilio requires E.164 format: +91XXXXXXXXXX for India
        String formattedNumber = toMobileNumber.startsWith("+")
                ? toMobileNumber
                : "+91" + toMobileNumber;

        Message.creator(
                new PhoneNumber(formattedNumber),
                new PhoneNumber(fromNumber),
                "Your Ride Harbor OTP is: " + otp + ". Valid for 5 minutes. Do not share with anyone."
        ).create();
    }
}
