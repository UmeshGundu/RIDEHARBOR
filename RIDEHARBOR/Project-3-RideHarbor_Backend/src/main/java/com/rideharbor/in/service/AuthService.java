package com.rideharbor.in.service;

import java.util.List;
import java.util.Random;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.rideharbor.in.entity.User;
import com.rideharbor.in.repository.UserRepository;

@Service
public class AuthService {

    @Autowired
    private UserRepository repo;

    @Autowired
    private TwilioService twilioService;

    public String generateOtp() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public String sendOtp(String username, String mobile) {

        String otp = generateOtp();

        // Send OTP via Twilio
        twilioService.sendOtp(mobile, otp);

        // Save to DB
        User user = repo.findByMobileNumber(mobile);
        if (user == null) {
            user = new User();
            user.setUsername(username);
            user.setMobileNumber(mobile);
        }

        user.setOtp(otp);
        repo.save(user);

        return otp;
    }

    public boolean verifyOtp(String mobile, String otp) {
        User user = repo.findByMobileNumber(mobile);
        if (user == null)
            return false;
        return user.getOtp().equals(otp);
    }

    public User findByMobile(String mobile) {
        return repo.findByMobileNumber(mobile);
    }

    public List<User> getAllUsers() {
        return repo.findAll();
    }
}